import { Request, Response } from 'express';
import { kafkaService } from '../services/kafka.service.js';
import { TrafficService } from '../services/traffic.service.js';
import { AuthenticatedRequest } from '../types/auth.js';

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

    // 3. On émet dans Kafka — pas de requête DB ici
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

export const getTrafficMap = async (req: Request, res: Response): Promise<void> => {
  const metrics = await TrafficService.getNetworkMetrics();
  res.json(metrics);
};

export const getBalancedNodes = async (req: Request, res: Response): Promise<void> => {
  const nodes = TrafficService.getBalancedNodes();
  res.json({ nodes });
};
