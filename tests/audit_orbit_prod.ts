/**
 * SENSORIUM — Audit de Production des 36 Agents IA Orbit
 *
 * Exécute un audit de bout en bout :
 * 1. Intégrité structurelle des 36 agents et 6 pôles
 * 2. Disponibilité et conformité des routes API de production
 * 3. Test d'exécution et génération de délivrables par pôle
 * 4. Gestion des erreurs et cas limites (404, 400)
 * 5. Test de concurrence multi-agents (race conditions & store locking)
 * 6. Audit des fichiers du bundle de production (Vite & esbuild)
 */

import assert from "node:assert";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import express from "express";
import { initialGroups } from "../src/data/initialGroups.js";
import orbitRoutes from "../server/routes/orbit.routes.js";
import { loadStore, findAgentContext } from "../server/services/orbit.service.js";

let passedTests = 0;
let failedTests = 0;
const auditResults: Array<{ section: string; name: string; status: 'PASS' | 'FAIL'; details?: string }> = [];

async function auditStep(section: string, name: string, fn: () => void | Promise<void>) {
  try {
    await fn();
    console.log(`  [PASS] ${section} -> ${name}`);
    passedTests++;
    auditResults.push({ section, name, status: 'PASS' });
  } catch (err: any) {
    console.error(`  [FAIL] ${section} -> ${name}`);
    console.error(`         ${err?.message || err}`);
    failedTests++;
    auditResults.push({ section, name, status: 'FAIL', details: err?.message || String(err) });
  }
}

function request(
  server: http.Server,
  method: string,
  urlPath: string,
  body?: object
): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const addr = server.address() as { port: number };
    const payload = body ? JSON.stringify(body) : undefined;
    const req = http.request(
      {
        host: "127.0.0.1",
        port: addr.port,
        path: urlPath,
        method,
        headers: {
          ...(payload ? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) } : {}),
        },
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => (raw += chunk));
        res.on("end", () => {
          let parsed: any = raw;
          try {
            parsed = JSON.parse(raw);
          } catch {}
          resolve({ status: res.statusCode || 500, body: parsed });
        });
      }
    );
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runFullProductionAudit() {
  console.log("================================================================================");
  console.log("🔍 AUDIT DE PRODUCTION — MODULE 36 AI AGENTS (SENSORIUM ORBIT)");
  console.log("================================================================================\n");

  // ---------------------------------------------------------------------------
  // SECTION 1 : Intégrité Structurelle & Données
  // ---------------------------------------------------------------------------
  console.log("📌 SECTION 1 : INTÉGRITÉ STRUCTURELLE & COHÉRENCE DES DONNÉES");

  await auditStep("Données", "6 Pôles Cognitifs Distincts", () => {
    assert.strictEqual(initialGroups.length, 6, "L'écosystème doit comporter exactement 6 pôles");
    const expectedIds = ["research", "content", "loop", "publish", "sales", "community"];
    const actualIds = initialGroups.map((g) => g.id);
    for (const exp of expectedIds) {
      assert.ok(actualIds.includes(exp), `Pôle manquant: ${exp}`);
    }
  });

  await auditStep("Données", "Exactement 36 Agents Déployés (6 par pôle)", () => {
    let totalAgents = 0;
    for (const g of initialGroups) {
      assert.strictEqual(g.agents.length, 6, `Le pôle "${g.title}" doit contenir exactement 6 agents`);
      totalAgents += g.agents.length;
    }
    assert.strictEqual(totalAgents, 36, "Le nombre total d'agents doit être strictement égal à 36");
  });

  await auditStep("Données", "Unicité absolue des Identifiants d'Agents", () => {
    const ids = new Set<string>();
    for (const g of initialGroups) {
      for (const a of g.agents) {
        assert.ok(!ids.has(a.id), `ID dupliqué détecté : ${a.id}`);
        ids.add(a.id);
        assert.ok(a.name.length > 0, `Nom manquant pour l'agent ${a.id}`);
        assert.ok(a.description.length > 10, `Description insuffisante pour ${a.id}`);
        assert.ok(["active", "idle", "running", "success", "error"].includes(a.status), `Statut invalide pour ${a.id}`);
      }
    }
    assert.strictEqual(ids.size, 36, "36 identifiants uniques vérifiés");
  });

  await auditStep("Données", "Agent Prioritaire surligné par pôle (Highlighted)", () => {
    for (const g of initialGroups) {
      const highlighted = g.agents.filter((a) => a.highlighted);
      assert.ok(highlighted.length >= 1, `Le pôle "${g.title}" doit avoir au moins un agent surligné`);
    }
  });

  // ---------------------------------------------------------------------------
  // SECTION 2 : Serveur API & Endpoints de Production
  // ---------------------------------------------------------------------------
  console.log("\n📌 SECTION 2 : VÉRIFICATION DES ROUTES API (EXPRESS)");

  const app = express();
  app.use(express.json());
  app.use("/api", orbitRoutes);

  const server = app.listen(0);

  try {
    await auditStep("API", "GET /api/health -> 200 & Métriques", async () => {
      const res = await request(server, "GET", "/api/health");
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.ok, true);
      assert.strictEqual(res.body.agentsCount, 36);
      assert.strictEqual(res.body.engine, "sensorium-orbit-ai");
      assert.ok(typeof res.body.uptimeSeconds === "number");
    });

    await auditStep("API", "GET /api/state -> 200 & 6 Groupes Persistés", async () => {
      const res = await request(server, "GET", "/api/state");
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.body.groups), "groups doit être un tableau");
      assert.strictEqual(res.body.groups.length, 6);
      assert.ok(Array.isArray(res.body.runHistory), "runHistory doit être un tableau");
    });

    // ---------------------------------------------------------------------------
    // SECTION 3 : Exécution d'Agents & Génération de Délivrables (Par Pôle)
    // ---------------------------------------------------------------------------
    console.log("\n📌 SECTION 3 : TEST D'EXÉCUTION (RUN AGENT) SUR LES 6 PÔLES");

    const poleAgents = [
      { id: "r1", name: "Trend Scout", pole: "Research", brief: "Analyser les tendances CVC et smart building" },
      { id: "c1", name: "Visual Designer", pole: "Content", brief: "Créer un visuel pour le jumeau numérique" },
      { id: "l1", name: "Post Analyst", pole: "The loop", brief: "Évaluer l'impact des alertes énergie" },
      { id: "p1", name: "Scheduler", pole: "Publish", brief: "Programmer la diffusion du bulletin métrique" },
      { id: "s1", name: "Lead Scorer", pole: "Sales", brief: "Qualifier 5 directeurs d'infrastructures" },
      { id: "cm1", name: "Comment Replier", pole: "Community", brief: "Répondre aux questions sur les certifications" },
    ];

    for (const pa of poleAgents) {
      await auditStep("Exécution", `Run ${pa.name} (${pa.pole})`, async () => {
        const t0 = Date.now();
        const res = await request(server, "POST", `/api/agents/${pa.id}/run`, { prompt: pa.brief });
        const latency = Date.now() - t0;

        assert.strictEqual(res.status, 200, `L'exécution de ${pa.name} doit renvoyer 200 OK`);
        assert.ok(res.body.run, "Le corps de réponse doit contenir un objet 'run'");
        assert.strictEqual(res.body.run.status, "success");
        assert.strictEqual(res.body.run.agentId, pa.id);
        assert.ok(res.body.run.durationMs > 0, "durationMs doit être positif");
        assert.ok(res.body.run.summary.length > 10, "Le résumé doit être non vide");
        assert.ok(Array.isArray(res.body.run.deliverables), "Les délivrables doivent être un tableau");
        assert.ok(res.body.run.deliverables.length >= 2, "Au moins 2 délivrables générés");
        assert.ok(Array.isArray(res.body.run.nextActions), "Les prochaines actions doivent être un tableau");
        assert.ok(res.body.run.nextActions.length >= 1, "Au moins 1 action suivante générée");
        assert.ok(Array.isArray(res.body.run.logs), "Les logs d'exécution doivent être un tableau");
        assert.ok(res.body.run.logs.some((l: string) => l.includes("200 OK")), "Les logs doivent mentionner 200 OK");
        assert.ok(latency < 3000, `Latence acceptable (<3s), mesurée: ${latency}ms`);
      });
    }

    // ---------------------------------------------------------------------------
    // SECTION 4 : Cas Limites & Robustesse (Error Handling)
    // ---------------------------------------------------------------------------
    console.log("\n📌 SECTION 4 : GESTION DES CAS LIMITES & ROBUSTESSE");

    await auditStep("Robustesse", "POST /api/agents/unknown-999/run -> 404 Not Found", async () => {
      const res = await request(server, "POST", "/api/agents/unknown-999/run", { prompt: "Test" });
      assert.strictEqual(res.status, 404);
      assert.ok(res.body.error, "Message d'erreur attendu");
    });

    await auditStep("Robustesse", "POST /api/agents (nom vide) -> 400 Bad Request", async () => {
      const res = await request(server, "POST", "/api/agents", { groupId: "research", name: "" });
      assert.strictEqual(res.status, 400);
      assert.ok(res.body.error, "Message d'erreur de validation attendu");
    });

    await auditStep("Robustesse", "PATCH /api/agents/unknown-999 -> 404 Not Found", async () => {
      const res = await request(server, "PATCH", "/api/agents/unknown-999", { name: "Nouveau" });
      assert.strictEqual(res.status, 404);
    });

    await auditStep("Robustesse", "DELETE /api/agents/unknown-999 -> 404 Not Found", async () => {
      const res = await request(server, "DELETE", "/api/agents/unknown-999");
      assert.strictEqual(res.status, 404);
    });

    await auditStep("Cycle de Vie", "Création, Modif, Exécution et Suppression d'un Agent Custom", async () => {
      // 1. Création
      const createRes = await request(server, "POST", "/api/agents", {
        groupId: "research",
        name: "Test Audit Agent",
        description: "Agent créé pour l'audit de production",
        icon: "spark",
        platform: "AuditBot",
        highlighted: false,
      });
      assert.strictEqual(createRes.status, 201);
      const newId = createRes.body.agent.id;
      assert.ok(newId, "Nouvel ID généré");

      // 2. Modification
      const patchRes = await request(server, "PATCH", `/api/agents/${newId}`, {
        name: "Test Audit Agent Renommé",
        highlighted: true,
      });
      assert.strictEqual(patchRes.status, 200);
      assert.strictEqual(patchRes.body.agent.name, "Test Audit Agent Renommé");
      assert.strictEqual(patchRes.body.agent.highlighted, true);

      // 3. Exécution
      const runRes = await request(server, "POST", `/api/agents/${newId}/run`, { prompt: "Run custom test" });
      assert.strictEqual(runRes.status, 200);
      assert.strictEqual(runRes.body.run.status, "success");

      // 4. Suppression
      const delRes = await request(server, "DELETE", `/api/agents/${newId}`);
      assert.strictEqual(delRes.status, 200);

      // 5. Vérification qu'il n'existe plus
      const checkRes = await request(server, "POST", `/api/agents/${newId}/run`);
      assert.strictEqual(checkRes.status, 404);
    });

    await auditStep("Cycle de Vie", "Reset Statut d'un Agent (POST /api/agents/:id/reset)", async () => {
      const resetRes = await request(server, "POST", "/api/agents/r1/reset");
      assert.strictEqual(resetRes.status, 200);
      const groupResearch = resetRes.body.groups.find((g: any) => g.id === "research");
      const agentR1 = groupResearch.agents.find((a: any) => a.id === "r1");
      assert.strictEqual(agentR1.status, "idle");
    });

    await auditStep("Historique", "Effacement de l'Historique (DELETE /api/runs)", async () => {
      const res = await request(server, "DELETE", "/api/runs");
      assert.strictEqual(res.status, 200);
      assert.deepStrictEqual(res.body.runHistory, []);
    });

    // ---------------------------------------------------------------------------
    // SECTION 5 : Test de Concurrence / Charge (Parallélisme)
    // ---------------------------------------------------------------------------
    console.log("\n📌 SECTION 5 : TEST DE CONCURRENCE & CHARGE SIMULTANÉE");

    await auditStep("Concurrence", "Exécution Simultanée de 6 Agents en Parallèle", async () => {
      const parallelRuns = ["r2", "c2", "l2", "p2", "s2", "cm2"].map((id) =>
        request(server, "POST", `/api/agents/${id}/run`, { prompt: `Test parallèle pour ${id}` })
      );
      const results = await Promise.all(parallelRuns);
      for (const res of results) {
        assert.strictEqual(res.status, 200, "Chaque run parallèle doit réussir avec 200 OK");
        assert.strictEqual(res.body.run.status, "success");
      }
      // Vérifier que l'historique contient bien les 6 runs
      const stateRes = await request(server, "GET", "/api/state");
      assert.strictEqual(stateRes.body.runHistory.length, 6, "L'historique doit contenir exactement 6 runs");
    });

  } finally {
    server.close();
  }

  // ---------------------------------------------------------------------------
  // SECTION 6 : Audit des Artéfacts de Production (Dist & Bundles)
  // ---------------------------------------------------------------------------
  console.log("\n📌 SECTION 6 : AUDIT DES ARTÉFACTS DE BUILD DE PRODUCTION");

  await auditStep("Build Dist", "Serveur Node compilé (dist/server.mjs)", () => {
    const serverMjsPath = path.resolve(process.cwd(), "dist/server.mjs");
    assert.ok(fs.existsSync(serverMjsPath), "Le fichier dist/server.mjs doit exister");
    const stat = fs.statSync(serverMjsPath);
    assert.ok(stat.size > 100000, `Taille valide (${Math.round(stat.size / 1024)} KB)`);
  });

  await auditStep("Build Dist", "Chunk Client AgentOrbit généré dans dist/assets/", () => {
    const assetsDir = path.resolve(process.cwd(), "dist/assets");
    assert.ok(fs.existsSync(assetsDir), "Le dossier dist/assets doit exister");
    const files = fs.readdirSync(assetsDir);
    const orbitChunk = files.find((f) => f.startsWith("AgentOrbit-") && f.endsWith(".js"));
    assert.ok(orbitChunk, `Chunk AgentOrbit-* introuvable dans dist/assets/. Fichiers: ${files.slice(0, 5).join(", ")}`);
    const stat = fs.statSync(path.join(assetsDir, orbitChunk));
    assert.ok(stat.size > 20000, `Taille valide (${Math.round(stat.size / 1024)} KB)`);
  });

  await auditStep("CSS Animations", "Keyframes orbitales incluses dans dist/assets/index-*.css", () => {
    const assetsDir = path.resolve(process.cwd(), "dist/assets");
    const files = fs.readdirSync(assetsDir);
    const cssFile = files.find((f) => f.startsWith("index-") && f.endsWith(".css"));
    assert.ok(cssFile, "Fichier CSS principal introuvable");
    const content = fs.readFileSync(path.join(assetsDir, cssFile), "utf8");
    assert.ok(content.includes("orbit-flow-up") || content.includes("orbit-arrow-up"), "Keyframe orbit-flow-up manquante");
    assert.ok(content.includes("orbit-dot-pulse"), "Keyframe orbit-dot-pulse manquante");
  });

  // ---------------------------------------------------------------------------
  // SYNTHÈSE GLOBALE
  // ---------------------------------------------------------------------------
  console.log("\n================================================================================");
  console.log(`📊 RÉSULTAT DE L'AUDIT : ${passedTests} SUCCÈS / ${failedTests} ÉCHECS`);
  console.log(`🎯 TAUX DE CONFORMITÉ : ${Math.round((passedTests / (passedTests + failedTests)) * 100)}%`);
  console.log("================================================================================\n");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runFullProductionAudit().catch((err) => {
  console.error("FATAL ERROR IN AUDIT RUNNER:", err);
  process.exit(1);
});

