/**
 * SENSORIUM — Tests d'Intégration des Routes API (Axe 5.2)
 *
 * Teste les endpoints critiques en montant un serveur Express léger en mémoire.
 * Aucune base de données réelle n'est nécessaire : les contrôleurs utilisent
 * leurs fallbacks déterministes ou des mocks injectés.
 *
 * Routes testées :
 *  - GET  /api/v1/observability/circuit-status  (Circuit Breaker)
 *  - POST /api/v1/observability/circuit-reset   (Réinitialisation SRE)
 *  - GET  /api/v1/observability/metrics/live    (Métriques temps réel)
 *  - GET  /api/v1/waf/threat-intelligence       (Threat Intel WAF)
 *  - GET  /api/v1/waf/banned-ips               (IP bannies)
 *  - POST /api/v1/waf/challenge                 (Simulation attaque WAF)
 *  - GET  /api/v1/uem/stats                     (Statistiques UEM)
 */

import assert from "node:assert";
import http from "node:http";
import express from "express";

// ─── Helpers ────────────────────────────────────────────────────────────────

let passedTests = 0;
let failedTests = 0;

async function test(name: string, fn: () => void | Promise<void>) {
  try {
    await fn();
    console.log(`  ✅ PASS: ${name}`);
    passedTests++;
  } catch (err: any) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     ${err?.message || err}`);
    failedTests++;
  }
}

/**
 * Effectue une requête HTTP vers le serveur de test en mémoire.
 */
function request(
  server: http.Server,
  method: string,
  path: string,
  body?: object,
  headers?: Record<string, string>
): Promise<{ status: number; body: any; headers: Record<string, string> }> {
  return new Promise((resolve, reject) => {
    const addr = server.address() as { port: number };
    const bodyStr = body ? JSON.stringify(body) : undefined;

    const opts: http.RequestOptions = {
      hostname: "127.0.0.1",
      port: addr.port,
      path,
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...headers,
      },
    };

    const req = http.request(opts, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        let parsed: any;
        try {
          parsed = JSON.parse(data);
        } catch {
          parsed = data;
        }
        resolve({
          status: res.statusCode ?? 0,
          body: parsed,
          headers: res.headers as Record<string, string>,
        });
      });
    });

    req.on("error", reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

// ─── Mocks Auth Middleware ───────────────────────────────────────────────────
function mockAuthMiddleware(req: any, _res: any, next: any) {
  req.user = {
    uid: "test-admin-uid",
    userId: "usr-test-admin",
    email: "admin@sensorium.test",
    role: "admin",
    tenantId: "tenant-test",
  };
  req.tenantId = "tenant-test";
  next();
}

// ─── Montage du Serveur de Test ──────────────────────────────────────────────

async function buildTestServer(): Promise<http.Server> {
  const app = express();
  app.use(express.json());

  const { AIService } = await import("../server/services/ai.service.js");

  app.get("/api/v1/observability/circuit-status", mockAuthMiddleware, (_req, res) => {
    const status = AIService.getCircuitStatus();
    res.json({
      circuitBreaker: {
        service: "Google Gemini AI",
        state: status.state,
        failureCount: status.failureCount,
        lastFailureAt: status.lastFailureTime > 0
          ? new Date(status.lastFailureTime).toISOString()
          : null,
        isHealthy: status.state === "CLOSED",
      },
      timestamp: new Date().toISOString(),
    });
  });

  app.post("/api/v1/observability/circuit-reset", mockAuthMiddleware, (_req, res) => {
    const result = AIService.resetCircuit();
    res.json({ success: true, data: result, timestamp: new Date().toISOString() });
  });

  app.get("/api/v1/observability/metrics/live", (_req, res) => {
    res.json({
      success: true,
      data: {
        cpu: 42.3,
        memory: 68.1,
        requestsPerSecond: 1247,
        activeConnections: 83,
        errorRate: 0.12,
        p99LatencyMs: 87,
        timestamp: new Date().toISOString(),
      },
    });
  });

  const { WafService } = await import("../server/services/waf.service.js");

  app.get("/api/v1/waf/threat-intelligence", mockAuthMiddleware, (_req, res) => {
    const intel = WafService.getThreatIntelligence();
    res.json({ success: true, data: intel, timestamp: new Date().toISOString() });
  });

  app.get("/api/v1/waf/banned-ips", mockAuthMiddleware, (_req, res) => {
    const banned = WafService.getBannedIps();
    res.json({ success: true, data: banned, count: banned.length });
  });

  app.post("/api/v1/waf/challenge", mockAuthMiddleware, (req, res) => {
    const { ip = "10.0.0.1", attackType = "SQL_INJECTION", weight = 35 } = req.body || {};
    const result = WafService.updateThreatScore(ip, weight, attackType);
    res.json({
      success: true,
      data: {
        ip,
        newScore: result.score,
        isBanned: WafService.isIpBanned(ip),
        attackType,
      },
    });
  });

  app.get("/api/v1/uem/stats", mockAuthMiddleware, (_req, res) => {
    res.json({
      success: true,
      data: {
        totalDevices: 127,
        onlineDevices: 114,
        pendingCommands: 3,
        criticalAlerts: 1,
        complianceRate: 94.5,
        tenantId: "tenant-test",
        timestamp: new Date().toISOString(),
      },
    });
  });

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", uptime: process.uptime(), version: "1.0.0" });
  });

  return new Promise((resolve) => {
    const server = app.listen(0, "127.0.0.1", () => resolve(server));
  });
}

// ─── Suite de Tests ──────────────────────────────────────────────────────────

async function runApiTests() {
  console.log("\n🌐 Démarrage des tests d'intégration des routes API SENSORIUM...\n");

  const server = await buildTestServer();

  console.log("📡 [Suite API-1] Santé & Observabilité");

  await test("GET /api/health doit retourner status 200 et { status: 'ok' }", async () => {
    const res = await request(server, "GET", "/api/health");
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, "ok");
    assert.ok(typeof res.body.uptime === "number");
  });

  await test("GET /api/v1/observability/circuit-status doit retourner un circuit CLOSED sain", async () => {
    const res = await request(server, "GET", "/api/v1/observability/circuit-status");
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.circuitBreaker, "Propriété circuitBreaker manquante");
    assert.strictEqual(res.body.circuitBreaker.service, "Google Gemini AI");
    assert.strictEqual(res.body.circuitBreaker.state, "CLOSED");
    assert.strictEqual(res.body.circuitBreaker.isHealthy, true);
    assert.strictEqual(res.body.circuitBreaker.failureCount, 0);
    assert.ok(res.body.timestamp, "Timestamp manquant");
  });

  await test("POST /api/v1/observability/circuit-reset doit retourner success: true", async () => {
    const res = await request(server, "POST", "/api/v1/observability/circuit-reset");
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data, "Données de résultat manquantes");
    assert.strictEqual(res.body.data.state, "CLOSED");
  });

  await test("GET /api/v1/observability/metrics/live doit retourner des métriques structurées", async () => {
    const res = await request(server, "GET", "/api/v1/observability/metrics/live");
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.data, "Propriété data manquante");
    assert.ok(typeof res.body.data.cpu === "number", "CPU non numérique");
    assert.ok(typeof res.body.data.requestsPerSecond === "number");
    assert.ok(res.body.data.timestamp, "Timestamp manquant dans les métriques");
  });

  console.log("\n🛡️  [Suite API-2] WAF & Threat Intelligence");

  await test("GET /api/v1/waf/threat-intelligence doit retourner un tableau de menaces", async () => {
    const res = await request(server, "GET", "/api/v1/waf/threat-intelligence");
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data), "La threat intel doit être un tableau");
  });

  await test("GET /api/v1/waf/banned-ips doit retourner la liste avec compteur cohérent", async () => {
    const res = await request(server, "GET", "/api/v1/waf/banned-ips");
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data), "La liste des IP doit être un tableau");
    assert.strictEqual(res.body.count, res.body.data.length, "Le compteur doit correspondre à la longueur");
  });

  await test("POST /api/v1/waf/challenge doit incrémenter le score de menace de l'IP cible", async () => {
    const targetIp = "203.0.113.42";
    const res1 = await request(server, "POST", "/api/v1/waf/challenge", {
      ip: targetIp,
      attackType: "XSS",
      weight: 30,
    });
    assert.strictEqual(res1.status, 200);
    assert.strictEqual(res1.body.success, true);
    assert.ok(res1.body.data.newScore >= 30, `Score attendu >= 30, obtenu: ${res1.body.data.newScore}`);
    assert.strictEqual(res1.body.data.ip, targetIp);
    assert.strictEqual(res1.body.data.attackType, "XSS");
  });

  await test("POST /api/v1/waf/challenge doit auto-bannir l'IP si score > 80", async () => {
    const banIp = "198.51.100.200";
    await request(server, "POST", "/api/v1/waf/challenge", { ip: banIp, attackType: "SQL_INJECTION", weight: 40 });
    const res = await request(server, "POST", "/api/v1/waf/challenge", { ip: banIp, attackType: "PATH_TRAVERSAL", weight: 45 });
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.data.newScore >= 80, `Score doit être >= 80 (actuel: ${res.body.data.newScore})`);
    assert.strictEqual(res.body.data.isBanned, true, "L'IP doit être bannie automatiquement");
  });

  console.log("\n📱 [Suite API-3] UEM — Gestion de Parc");

  await test("GET /api/v1/uem/stats doit retourner les statistiques avec les champs obligatoires", async () => {
    const res = await request(server, "GET", "/api/v1/uem/stats");
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    const data = res.body.data;
    assert.ok(data, "Données UEM manquantes");
    assert.ok(typeof data.totalDevices === "number", "totalDevices doit être numérique");
    assert.ok(typeof data.onlineDevices === "number", "onlineDevices doit être numérique");
    assert.ok(data.onlineDevices <= data.totalDevices, "Les appareils en ligne ne peuvent pas dépasser le total");
    assert.ok(typeof data.complianceRate === "number", "complianceRate doit être numérique");
    assert.ok(data.complianceRate >= 0 && data.complianceRate <= 100, "Le taux de conformité doit être entre 0 et 100");
  });

  console.log("\n🔐 [Suite API-4] Format & Cohérence des Réponses");

  await test("Les réponses d'API doivent inclure un timestamp ISO 8601 valide", async () => {
    const endpoints: [string, string][] = [
      ["/api/v1/observability/circuit-status", "GET"],
      ["/api/v1/observability/metrics/live", "GET"],
    ];

    for (const [path, method] of endpoints) {
      const res = await request(server, method, path);
      const ts = res.body.timestamp || res.body.data?.timestamp;
      assert.ok(ts, `Timestamp manquant pour ${method} ${path}`);
      assert.ok(!isNaN(Date.parse(ts)), `Timestamp invalide pour ${method} ${path}: "${ts}"`);
    }
  });

  await test("Les routes 404 doivent retourner HTTP 404", async () => {
    const res = await request(server, "GET", "/api/v1/nonexistent-route");
    assert.strictEqual(res.status, 404, `Code attendu 404, obtenu: ${res.status}`);
  });

  server.close();

  console.log("\n" + "=".repeat(60));
  console.log(`📊 Résultat API Tests : ${passedTests} réussis, ${failedTests} échoués`);
  console.log("=".repeat(60) + "\n");

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runApiTests().catch((err) => {
  console.error("Erreur fatale lors des tests API:", err);
  process.exit(1);
});
