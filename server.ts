import "dotenv/config";
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./dev.db";
}
import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import apiRouterV1 from "./server/routes/v1/index.js";
import { seedDatabase } from "./server/db/seed.js";
import { kafkaService } from "./server/services/kafka.service.js";
import { 
  securityHeaders, 
  payloadSanitizer,
  antiReplayGuard,
  auditMiddleware, 
  requestLogger, 
  errorHandler 
} from "./server/middlewares/index.js";

async function startServer() {
  // Initialize multi-tenant database seed if required
  seedDatabase().catch((err) => console.error("[Server] Seed warning:", err));

  // Initialize Kafka Producer (Event Streaming)
  kafkaService.connect().catch(err => console.error("[Server] Kafka init error:", err));

  const app = express();

  const PORT = 3000;

  // 1. Chaîne de Middlewares de Défense & Zone Tampon
  app.use(securityHeaders);
  app.use(cookieParser());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use(payloadSanitizer);
  app.use(antiReplayGuard);
  app.use(requestLogger);
  app.use(auditMiddleware);

  // 2. Montage des APIs V1
  app.use("/api/v1", apiRouterV1);

  // In-memory simulation states for Spider CAFM Digital Twin
  const valveState = {
    id: 'VALVE-V14',
    name: 'HydroSync Main Loop Valve V-14',
    isOpen: true,
    pressureBar: 4.2,
    flowLpm: 142.6,
    acousticAnomalyIndex: 0.04,
    lastAction: 'Auto-balanced at 18:02 UTC',
  };

  const lightingState = {
    lux: 320,
    cctKelvin: 4200,
    circadianActive: true,
    daliZones: {
      atrium: { power: 85, state: 'ON' },
      offices: { power: 65, state: 'CIRCADIAN' },
      plantRoom: { power: 100, state: 'ON' },
      parking: { power: 30, state: 'ECO' },
    },
  };

  // Telemetry Snapshot for Digital Twin & Cockpit
  app.get(['/api/telemetry/snapshot', '/api/v1/telemetry/snapshot'], (_req, res) => {
    res.json({
      timestamp: Date.now(),
      metrics: {
        energyDeltaPercent: -34.8,
        ashraeBaselineKwh: 14820,
        currentLoadKwh: 9660,
        copFactor: 6.22,
        healthScore: 98.4,
        carbonAbatedTco2e: 4120,
        activeEdgeNodes: 14890,
        ingestionRps: 1420500,
        edgeLatencyMs: 0.4,
      },
      valve: valveState,
      lighting: lightingState,
      workOrdersCount: 3,
    });
  });

  // Fluid Control: HydroSync Motorized Valve
  app.post(['/api/controls/valve', '/api/v1/controls/valve'], (req, res) => {
    const { action } = req.body;
    if (action === 'TOGGLE') {
      valveState.isOpen = !valveState.isOpen;
      valveState.flowLpm = valveState.isOpen ? 142.6 : 0;
      valveState.pressureBar = valveState.isOpen ? 4.2 : 5.8;
      valveState.lastAction = `Manually ${valveState.isOpen ? 'Opened' : 'Isolated'} via HydroSync IoT at ${new Date().toLocaleTimeString()}`;
    } else if (action === 'EMERGENCY_SHUTOFF') {
      valveState.isOpen = false;
      valveState.flowLpm = 0;
      valveState.pressureBar = 6.1;
      valveState.lastAction = `Emergency acoustic leak protection triggered at ${new Date().toLocaleTimeString()}`;
    }
    res.json({ success: true, valve: valveState });
  });

  // DALI Lighting controls
  app.post(['/api/controls/lighting', '/api/v1/controls/lighting'], (req, res) => {
    const { lux, cctKelvin, circadianActive, zone, zonePower } = req.body;
    if (typeof lux === 'number') lightingState.lux = lux;
    if (typeof cctKelvin === 'number') lightingState.cctKelvin = cctKelvin;
    if (typeof circadianActive === 'boolean') lightingState.circadianActive = circadianActive;
    if (zone && typeof zonePower === 'number' && (lightingState.daliZones as any)[zone]) {
      (lightingState.daliZones as any)[zone].power = zonePower;
    }
    res.json({ success: true, lighting: lightingState });
  });

  // Gemini AI Mechanical & CVC Predictive Diagnostic
  app.post(['/api/gemini/diagnose', '/api/v1/gemini/diagnose'], async (req, res) => {
    const { assetId, telemetryData, customQuery } = req.body;
    const defaultTelemetry = {
      asset: assetId || 'York Chiller Loop B-02',
      refrigerant: 'R-1233zd(E) low-GWP',
      chilledWaterLeavingTempC: 7.4,
      chilledWaterReturnTempC: 12.1,
      evaporatorPressureBar: 3.8,
      condenserPressureBar: 10.4,
      motorVibrationMmSec: 3.12,
      harmonicRpmFrequencyHz: 49.8,
      compressorBearingTempC: 68.4,
      runningHours: 14280,
    };
    const payload = telemetryData || defaultTelemetry;
    const isVibHigh = (payload.motorVibrationMmSec || 3.12) > 3.0;

    const fallbackDiagnosis = {
      healthScore: isVibHigh ? 91.8 : 98.4,
      breakdownProbability30d: isVibHigh ? '5.4%' : '0.8%',
      copCurrent: 6.22,
      copExpected: 6.45,
      status: isVibHigh ? 'NOMINAL_WITH_ADVISORY' : 'OPTIMAL',
      anomalyDetected: isVibHigh,
      rootCauseAnalysis: isVibHigh
        ? 'Micro-vibration harmonics at 49.8 Hz detected on sleeve bearing #2. Lubricant film thickness margin reduced by 14% due to continuous high thermal loads.'
        : 'All operational thermal gradients within ASHRAE 90.1 Class A parameters. Minimal thermodynamic entropy.',
      prescriptiveActions: [
        'Perform acoustic grease replenishment on drive end bearing with synthetic ester PAO-68.',
        'Calibrate electronic expansion valve (EEV) step motor position offset by +2.5%.',
        'Verify water delta-T across shell-and-tube evaporator to maintain COP > 6.20.',
      ],
      estimatedEnergySavingsKwhPerMonth: 2450,
      workOrderRecommended: {
        title: 'Drive End Bearing Lubrication & Alignment Check - Chiller B-02',
        priority: isVibHigh ? 'MEDIUM' : 'LOW',
        suggestedParts: ['Synthetic Refrigeration Oil ISO VG 68', 'O-Ring Neoprene Seal 48mm'],
        requiredSkill: 'Certified Refrigeration F-Gas Category I Specialist',
      },
      summary:
        'Gemini Spatial AI evaluated 14 mechanical telemetry parameters. Chiller B-02 is operating at 91.8% thermodynamic efficiency. Prescriptive maintenance recommended before summer peak demand cycle.',
    };

    return res.json({
      success: true,
      source: 'edge-deterministic-engine',
      diagnosis: fallbackDiagnosis,
    });
  });

  // Fallback for previous API path (backward compatibility during migration)
  app.post("/api/ai/analyze", (req, res, next) => {
    req.url = "/ai/analyze";
    apiRouterV1(req, res, next);
  });

  // Public Privacy Policy route for Google Play & OAuth validation
  app.get("/privacy", (req, res) => {
    res.sendFile(path.join(process.cwd(), "public", "privacy.html"));
  });

  // Zero-Config Physical Edge Appliance Discovery & Healthcheck (sensorium.local)
  app.get(["/healthcheck", "/api/v1/healthcheck"], (req, res) => {
    res.json({
      status: "ok",
      appliance: "Sensorium Silicium X1 Edge Node",
      mode: process.env.APPLIANCE_MODE || "SOVEREIGN_EDGE",
      hostname: "sensorium.local",
      firmwareVersion: "2.4.0-sentry",
      npuActive: true,
      tops: 240,
      usbEthernetIp: "192.168.7.1",
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString()
    });
  });

  // Vite middleware for development or fallback if dist not built
  const distPath = path.join(process.cwd(), "dist");
  const distIndexHtml = path.join(distPath, "index.html");
  const isProduction = process.env.NODE_ENV === "production" && fs.existsSync(distIndexHtml);

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const publicPath = path.join(process.cwd(), "public");
    app.use(express.static(distPath));
    app.use(express.static(publicPath));
    app.get("*", (req: express.Request, res: express.Response) => {
      res.sendFile(distIndexHtml);
    });
  }

  // Global Error Handler
  app.use(errorHandler);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Jeton Edge API Platform running on port ${PORT}`);
    console.log(`[Server] Environment: ${process.env.NODE_ENV || "development"}`);
  });
}

startServer();
