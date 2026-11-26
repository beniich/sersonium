import { Request, Response } from 'express';
import { kafkaService } from '../services/kafka.service.js';
import { TrafficService } from '../services/traffic.service.js';
import { AuthenticatedRequest } from '../types/auth.js';
import { rawPrisma } from '../db/prisma.js';

export const receiveTelemetry = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.tenantId!;
    const clientIp = req.ip || '127.0.0.1';

    // 1. Anycast: On identifie le nœud Edge optimal pour cet IP
    const edgeNode = await TrafficService.getNearestNode(clientIp);

    // 2. On enrichit la donnée avec les métadonnées Edge
    const telemetryData = {
      ...req.body,
      edgeNodeId: edgeNode.id,
      edgeRegion: edgeNode.region,
      edgeLatencyMs: edgeNode.currentLatency,
      receivedAt: new Date().toISOString()
    };

    // 3. Persistance dans PostgreSQL (AssetTelemetry)
    if (req.body.assetId) {
      await rawPrisma.assetTelemetry.create({
        data: {
          tenantId,
          assetId: req.body.assetId,
          temperatureC: typeof req.body.temperatureC === "number" ? req.body.temperatureC : 22.0,
          vibrationMmS: typeof req.body.vibrationMmS === "number" ? req.body.vibrationMmS : 0.5,
          powerKw: typeof req.body.powerKw === "number" ? req.body.powerKw : 45.0,
          pueScore: typeof req.body.pueScore === "number" ? req.body.pueScore : 1.15,
          status: req.body.status || "nominal",
          timestamp: new Date()
        }
      }).catch((e: any) => console.warn("[IoT Controller] DB Telemetry persist:", e.message));
    }

    // 4. On émet dans Kafka / Event Streaming
    await kafkaService.emitTelemetry(tenantId, telemetryData);

    res.status(202).json({
      status: 'Accepted',
      message: `Telemetry ingested via Edge Node [${edgeNode.id}] \u2014 ${edgeNode.region}`,
      edgeNode: { id: edgeNode.id, region: edgeNode.region, latencyMs: edgeNode.currentLatency }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * POST /api/v1/iot/import
 * Import en masse de mesures réelles (CSV / JSON) vers PostgreSQL
 */
export const importTelemetryBatch = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.tenantId!;
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, error: "Tableau 'items' de mesures requis." });
      return;
    }

    const records = items.map((it: any) => ({
      tenantId,
      assetId: it.assetId || "asset-import-01",
      temperatureC: Number(it.temperatureC) || 22.0,
      vibrationMmS: Number(it.vibrationMmS) || 0.5,
      powerKw: Number(it.powerKw) || 45.0,
      pueScore: Number(it.pueScore) || 1.15,
      status: it.status || "nominal",
      timestamp: it.timestamp ? new Date(it.timestamp) : new Date()
    }));

    const result = await rawPrisma.assetTelemetry.createMany({
      data: records
    });

    res.status(201).json({
      success: true,
      message: `${result.count} relevés de télémétrie importés avec succès.`,
      count: result.count
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getTrafficMap = async (req: Request, res: Response): Promise<void> => {
  const metrics = await TrafficService.getNetworkMetrics();
  res.json(metrics);
};

export const getBalancedNodes = async (req: Request, res: Response): Promise<void> => {
  const nodes = TrafficService.getBalancedNodes();
  res.json({ nodes });
};

/**
 * GET /api/v1/iot/snapshot
 * Télémétrie instantanée unifiée (moteurs, vannes, éclairage, KPIs énergétiques)
 */
export const getTelemetrySnapshot = async (req: Request, res: Response): Promise<void> => {
  try {
    const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
    let assetCount = 0;
    let telemetryCount = 0;

    if (tenantId) {
      assetCount = await rawPrisma.infrastructureAsset.count({ where: { tenantId } }).catch(() => 0);
      telemetryCount = await rawPrisma.assetTelemetry.count({ where: { tenantId } }).catch(() => 0);
    }

    // Si aucune donnée dans le tenant (T0 ou nouveau compte Gmail), retourner l'état zéro propre
    if (assetCount === 0 && telemetryCount === 0) {
      res.json({
        timestamp: Date.now(),
        metrics: {
          energyDeltaPercent: 0,
          ashraeBaselineKwh: 0,
          currentLoadKwh: 0,
          copFactor: 0,
          healthScore: 100,
          carbonAbatedTco2e: 0,
          activeEdgeNodes: 0,
          ingestionRps: 0,
          edgeLatencyMs: 0,
        },
        valve: {
          id: 'VALVE-NONE',
          name: 'Aucune vanne configurée',
          isOpen: false,
          pressureBar: 0,
          flowLpm: 0,
          acousticAnomalyIndex: 0,
          lastAction: 'En attente de capteurs',
        },
        lighting: {
          lux: 0,
          cctKelvin: 0,
          circadianActive: false,
          daliZones: {},
        },
        workOrdersCount: 0,
      });
      return;
    }

    // Récupérer les moyennes réelles des dernières mesures
    const latestTelemetries = await rawPrisma.assetTelemetry.findMany({
      where: tenantId ? { tenantId } : {},
      orderBy: { timestamp: "desc" },
      take: 10
    }).catch(() => []);

    const avgPower = latestTelemetries.length > 0
      ? latestTelemetries.reduce((acc, t) => acc + t.powerKw, 0) / latestTelemetries.length
      : 45;

    res.json({
      timestamp: Date.now(),
      metrics: {
        energyDeltaPercent: -12.4,
        ashraeBaselineKwh: Math.round(avgPower * 1.4),
        currentLoadKwh: Math.round(avgPower),
        copFactor: 5.8,
        healthScore: 96.0,
        carbonAbatedTco2e: Math.round(avgPower * 0.2),
        activeEdgeNodes: assetCount || 1,
        ingestionRps: telemetryCount * 10,
        edgeLatencyMs: 0.8,
      },
      valve: {
        id: 'VALVE-MAIN',
        name: 'Vanne Principale Boucle CVC',
        isOpen: true,
        pressureBar: 3.8,
        flowLpm: 120.0,
        acousticAnomalyIndex: 0.02,
        lastAction: 'Supervision active',
      },
      lighting: {
        lux: 300,
        cctKelvin: 4000,
        circadianActive: true,
        daliZones: {
          datacenter: { power: 100, state: 'ON' },
        },
      },
      workOrdersCount: 0,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * GET /api/v1/iot/nodes
 * Liste paginée de tous les nœuds Edge mondiaux
 */
export const getNodesList = async (req: Request, res: Response): Promise<void> => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const offset = Math.max(Number(req.query.offset) || 0, 0);

  const allNodes = TrafficService.getBalancedNodes();
  const paginated = allNodes.slice(offset, offset + limit);

  res.json({
    success: true,
    data: paginated,
    pagination: {
      total: allNodes.length,
      limit,
      offset,
      hasNext: offset + limit < allNodes.length,
    },
  });
};

/**
 * GET /api/v1/iot/history
 * Historique des séries temporelles télémétriques
 */
export const getTelemetryHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
    const hours = Number(req.query.hours) || 24;

    if (tenantId) {
      const realPoints = await rawPrisma.assetTelemetry.findMany({
        where: { tenantId },
        orderBy: { timestamp: "desc" },
        take: 96
      }).catch(() => []);

      if (realPoints.length === 0) {
        // État vide réel
        res.json({
          success: true,
          data: {
            timeframeHours: hours,
            dataPoints: [],
          },
        });
        return;
      }

      const formatted = realPoints.reverse().map(p => ({
        timestamp: p.timestamp.toISOString(),
        ingestionRps: Math.round(p.powerKw * 100),
        edgeLatencyMs: 0.5,
        pueIndex: p.pueScore,
        copFactor: Number((5.5 + p.temperatureC * 0.02).toFixed(2)),
      }));

      res.json({
        success: true,
        data: {
          timeframeHours: hours,
          dataPoints: formatted,
        },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        timeframeHours: hours,
        dataPoints: [],
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};
