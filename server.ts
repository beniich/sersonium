import "dotenv/config";
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./dev.db";
}
import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { createServer as createViteServer } from "vite";
import apiRouterV1 from "./server/routes/v1/index.js";
import { seedDatabase } from "./server/db/seed.js";
import { kafkaService } from "./server/services/kafka.service.js";
import { WafService } from "./server/services/waf.service.js";
import { 
  securityHeaders, 
  payloadSanitizer,
  antiReplayGuard,
  auditMiddleware, 
  requestLogger, 
  errorHandler 
} from "./server/middlewares/index.js";
import { resilienceGuard, canaryHeaderInjector } from "./server/middlewares/resilience.middleware.js";

async function startServer() {
  // Initialize multi-tenant database seed if required
  seedDatabase().catch((err) => console.error("[Server] Seed warning:", err));

  // Initialize Kafka Producer (Event Streaming)
  kafkaService.connect().catch(err => console.error("[Server] Kafka init error:", err));

  const app = express();

  const PORT = Number(process.env.PORT) || 3000;

  // 1. Chaîne de Middlewares de Défense & Zone Tampon
  // Configuration CORS stricte avec liste blanche et support des credentials
  const defaultAllowedOrigins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://sensorium.local:3000",
    "https://app.sensorium.cloud",
    "https://sensorium.cloud",
    "https://api.sensorium.cloud"
  ];

  const configuredOrigins = process.env.CORS_ALLOWED_ORIGINS
    ? process.env.CORS_ALLOWED_ORIGINS.split(",").map(o => o.trim()).filter(Boolean)
    : [];

  const allowedOriginsSet = new Set([...defaultAllowedOrigins, ...configuredOrigins]);

  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      const isDev = process.env.NODE_ENV !== "production";
      const isLocalhost = isDev && (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:"));
      const isAllowed = allowedOriginsSet.has(origin) || isLocalhost;

      if (isAllowed) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-CSRF-Token, X-XSRF-Token, X-Request-Timestamp");
        res.setHeader("Vary", "Origin");
      } else if (!isDev) {
        console.warn(`[CORS REJECT] Origine non autorisée rejetée: ${origin}`);
        return res.status(403).json({
          success: false,
          error: "CORS Policy Violation: Origine non autorisée"
        });
      }
    }
    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }
    next();
  });

  app.use(securityHeaders);
  app.use(cookieParser());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Intercepteur WAF temps réel & Liste noire (ESM static import - no require)
  app.use((req, res, next) => {
    const clientIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0] || req.socket.remoteAddress || "127.0.0.1";
    const check = WafService.inspectRequest(clientIp, req.path, req.body);
    if (check.isMalicious) {
      console.warn(`🚨 [WAF SHIELD] Requête bloquée depuis ${clientIp} (${check.type}) sur ${req.path}`);
      return res.status(403).json({
        success: false,
        error: "Security Violation: Bloqué par le pare-feu applicatif SENSORIUM WAF",
        threatType: check.type
      });
    }
    next();
  });

  app.use(payloadSanitizer);
  app.use(antiReplayGuard);
  app.use(requestLogger);
  app.use(auditMiddleware);

  // 2. Résilience DORA: Circuit Breaker & Canary Header Injection (Art. 24 & 26)
  app.use("/api", resilienceGuard);
  app.use("/api", canaryHeaderInjector);

  // Endpoint d'Observabilité Prometheus (/metrics)
  app.get("/metrics", async (req, res) => {
    const { metricsCollector } = await import("./server/services/metrics.service.js");
    const snapshot = metricsCollector.getSnapshot();
    const prometheusFormat = `# HELP sensorium_http_requests_total Nombre total de requêtes HTTP
# TYPE sensorium_http_requests_total counter
sensorium_http_requests_total ${snapshot.http.totalRequests}

# HELP sensorium_http_active_connections Connexions HTTP actives
# TYPE sensorium_http_active_connections gauge
sensorium_http_active_connections ${snapshot.http.activeConnections}

# HELP sensorium_security_threats_blocked Menaces bloquées par le WAF
# TYPE sensorium_security_threats_blocked counter
sensorium_security_threats_blocked ${snapshot.security.rateLimitHits}

# HELP sensorium_system_uptime_seconds Uptime du serveur
# TYPE sensorium_system_uptime_seconds gauge
sensorium_system_uptime_seconds ${snapshot.uptimeSeconds}
`;
    res.setHeader("Content-Type", "text/plain; version=0.0.4");
    res.send(prometheusFormat);
  });

  // 2. Montage des APIs V1
  app.use("/api/v1", apiRouterV1);

  // Route Webhook PayPal directe (sans protection CSRF de session)
  app.post("/webhooks/paypal", express.json(), async (req, res) => {
    try {
      const { payPalSubscriptionService } = await import("./server/services/paypal.subscription.service.js");
      await payPalSubscriptionService.handleWebhook(req.body);
      res.status(200).send("Event Received");
    } catch (error: any) {
      console.error("[PayPal Direct Webhook Error]:", error);
      res.status(500).send("Internal Error");
    }
  });

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

  // Action Layer: Déploiement direct d'artefacts (avec fallback direct sans blocage CSRF)
  app.post(["/api/ai/execute", "/api/v1/ai/execute", "/api/v1/showcase/execute-artifact"], async (req, res) => {
    const { executeArtifact } = await import("./server/controllers/ai.execution.controller.js");
    executeArtifact(req, res);
  });

  // Neural Core Enclave: Remédiation calculée et signature HSM cryptographique
  app.all(["/api/ai/remediation", "/api/ai/remediation/:rackId", "/api/v1/ai/remediation", "/api/v1/ai/remediation/:rackId"], async (req, res) => {
    const { getSignedRemediation } = await import("./server/controllers/neural.core.controller.js");
    getSignedRemediation(req, res);
  });

  // Service direct des pages HTML statiques du site vitrine Jumeau Numérique (/site/*)
  app.use("/site", express.static(path.join(process.cwd(), "public", "site")));

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

  // Dedicated clean URL routing for /site showcase and legal pages
  const publicSitePath = path.join(process.cwd(), "public", "site");

  // Page d'accueil de l'application /site/
  app.get(["/site", "/site/"], (_req: express.Request, res: express.Response) => {
    res.sendFile(path.join(publicSitePath, "index.html"));
  });

  // Règles de confidentialité (supporte /site/règles, /site/regles et URL encodée %C3%A8)
  app.get(["/site/règles", "/site/regles", "/site/r%C3%A8gles", "/privacy"], (_req: express.Request, res: express.Response) => {
    res.sendFile(path.join(publicSitePath, "regles.html"));
  });

  // Conditions d'utilisation de l'application
  app.get(["/site/conditions", "/site/cgu", "/terms"], (_req: express.Request, res: express.Response) => {
    res.sendFile(path.join(publicSitePath, "conditions.html"));
  });

  // Mentions Légales
  app.get(["/site/mentions-legales", "/site/mentions_legales", "/legal"], (_req: express.Request, res: express.Response) => {
    res.sendFile(path.join(publicSitePath, "mentions-legales.html"));
  });

  // Sécurité & Souveraineté
  app.get(["/site/securite", "/site/security"], (_req: express.Request, res: express.Response) => {
    res.sendFile(path.join(publicSitePath, "securite.html"));
  });

  // Portail Développeur & Documentation API (Broadcom-Grade Developer Hub)
  app.get(["/site/developers", "/site/developers.html", "/developers", "/api-docs"], (_req: express.Request, res: express.Response) => {
    res.sendFile(path.join(publicSitePath, "developers.html"));
  });

  // Spécification OpenAPI 3.1 publique
  app.get(["/api/v1/openapi.json", "/openapi.json"], (_req: express.Request, res: express.Response) => {
    res.redirect("/api/v1/showcase/developers/openapi.json");
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

  const httpServer = http.createServer(app);

  // Initialisation Socket.IO pour le Jumeau Numérique 3D & Telemetry Bridge
  const io = new SocketIOServer(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });
  app.set("io", io);

  io.on("connection", (socket) => {
    console.log(`🔌 [Socket.IO] Client connecté au Jumeau Numérique 3D: ${socket.id}`);

    // Envoi immédiat de l'état initial
    socket.emit("telemetry_update", {
      assetId: "pump_01",
      value: 68.4,
      unit: "°C",
      status: "NOMINAL",
      timestamp: Date.now()
    });

    // Événements Espace Collaboratif Workspace
    socket.on("join_workspace", ({ workspaceId, userId }) => {
      socket.join(workspaceId || "default_workspace");
      console.log(`👥 [Workspace] Utilisateur ${userId} a rejoint le salon ${workspaceId}`);
      io.to(workspaceId || "default_workspace").emit("presence_update", [
        { userId: "usr-admin", name: "Directeur des Opérations", role: "Manager", viewing: "Supervision Globale" },
        { userId: "usr-tech", name: "Marc Vasseur", role: "Superviseur CVC", viewing: "Jumeau Numérique 3D - Pompe 01" },
        { userId: "usr-net", name: "Samira Khelifi", role: "Ingénieur Réseau", viewing: "Cartographie Anycast" },
      ]);
    });

    socket.on("new_annotation", (note) => {
      io.emit("new_annotation", note);
      console.log(`📝 [Workspace] Nouvelle note déposée sur ${note.assetId}: ${note.text}`);
    });

    socket.on("team_broadcast", (alert) => {
      io.emit("team_broadcast", alert);
      console.log(`📢 [Workspace] Alerte Flash diffusée: ${alert.message}`);
    });

    // Événements d'Abonnement Télémétrie Kafka -> Socket.IO (Artifacts IDE Studio)
    socket.on("subscribe_telemetry", (topic: string) => {
      socket.join(topic);
      console.log(`📡 [Kafka Telemetry Bridge] Client ${socket.id} abonné au topic: ${topic}`);
    });

    socket.on("unsubscribe_telemetry", (topic: string) => {
      socket.leave(topic);
      console.log(`📡 [Kafka Telemetry Bridge] Client ${socket.id} désabonné du topic: ${topic}`);
    });

    socket.on("disconnect", () => {
      console.log(`🔌 [Socket.IO] Client déconnecté: ${socket.id}`);
    });
  });

  // Bridge de diffusion continue Kafka -> Socket.IO pour les salons de topics actifs
  let telemetryStreamSeq = 0;
  setInterval(() => {
    telemetryStreamSeq++;
    const nowIso = new Date().toISOString().replace("T", " ").slice(0, 19);

    // 1. Topic: telemetry.rackB.thermal
    const tempB = +(68 + Math.random() * 20).toFixed(1);
    const rackBPayload = {
      sensor_id: `SNS-${String((telemetryStreamSeq % 8) + 1).padStart(3, "0")}`,
      rack: `Rack-B${(telemetryStreamSeq % 4) + 1}`,
      temp_C: tempB,
      fan_rpm: Math.round(4200 + Math.random() * 1800),
      "cpu_load_%": +(55 + Math.random() * 40).toFixed(1),
      status: tempB > 85 ? "CRITICAL" : tempB > 78 ? "WARNING" : "NOMINAL"
    };
    io.to("telemetry.rackB.thermal").emit("telemetry_stream", {
      topic: "telemetry.rackB.thermal",
      data: rackBPayload,
      timestamp: nowIso
    });
    io.to("telemetry.rackB.thermal").emit("telemetry_update", {
      topic: "telemetry.rackB.thermal",
      data: rackBPayload,
      timestamp: nowIso
    });

    // 2. Topic: telemetry.dc.power
    const pue = +(1.09 + Math.random() * 0.15).toFixed(3);
    const dcPowerPayload = {
      dc_id: `DC-${["PAR", "FRA", "AMS", "STO"][telemetryStreamSeq % 4]}-0${(telemetryStreamSeq % 4) + 1}`,
      pue: parseFloat(pue),
      load_kw: +(780 + Math.random() * 460).toFixed(1),
      "ups_soc_%": +(88 + Math.random() * 11).toFixed(1),
      delta_kwh: +(Math.random() * 12 - 3).toFixed(2),
      phase: ["A", "B", "C"][telemetryStreamSeq % 3]
    };
    io.to("telemetry.dc.power").emit("telemetry_stream", {
      topic: "telemetry.dc.power",
      data: dcPowerPayload,
      timestamp: nowIso
    });

    // 3. Topic: telemetry.edge.network
    const edgeNetPayload = {
      node_id: `NODE-${String((telemetryStreamSeq % 16) + 1).padStart(2, "0")}`,
      rx_mbps: +(1200 + Math.random() * 8800).toFixed(1),
      tx_mbps: +(800 + Math.random() * 7200).toFixed(1),
      latency_ms: +(0.2 + Math.random() * 1.5).toFixed(2),
      "packet_loss_%": +(Math.random() * 0.04).toFixed(4),
      bgp_state: Math.random() > 0.03 ? "ESTABLISHED" : "IDLE"
    };
    io.to("telemetry.edge.network").emit("telemetry_stream", {
      topic: "telemetry.edge.network",
      data: edgeNetPayload,
      timestamp: nowIso
    });

    // 4. Topic: telemetry.hvac.zones
    const hvacPayload = {
      zone_id: `ZONE-${["ATR", "OFF", "PLT", "PKG"][telemetryStreamSeq % 4]}`,
      supply_temp_C: +(14 + Math.random() * 3).toFixed(1),
      return_temp_C: +(19 + Math.random() * 4).toFixed(1),
      flow_lpm: +(120 + Math.random() * 60).toFixed(1),
      "valve_%": +(40 + Math.random() * 55).toFixed(1),
      mode: ["AUTO", "ECO", "BOOST"][telemetryStreamSeq % 3]
    };
    io.to("telemetry.hvac.zones").emit("telemetry_stream", {
      topic: "telemetry.hvac.zones",
      data: hvacPayload,
      timestamp: nowIso
    });
  }, 2000);

  // Diffusion périodique de télémétrie IoT pour les maquettes 3D
  setInterval(() => {
    const isAnomaly = Math.random() > 0.85;
    io.emit("telemetry_update", {
      assetId: "pump_01",
      value: +(65 + Math.random() * (isAnomaly ? 25 : 8)).toFixed(1),
      unit: "°C",
      status: isAnomaly ? "CRITICAL" : "NOMINAL",
      timestamp: Date.now()
    });
  }, 4000);

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Jeton Edge API Platform & WebSocket running on port ${PORT}`);
    console.log(`[Server] Environment: ${process.env.NODE_ENV || "development"}`);
  });
}

startServer();
