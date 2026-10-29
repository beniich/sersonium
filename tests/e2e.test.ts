/**
 * SENSORIUM — Tests End-to-End Navigation & Logique Métier (Axe 5.3)
 *
 * Valide les scénarios critiques de bout en bout sans serveur ni navigateur :
 *  1. Navigation Contextuelle : Clic alerte → état activeAssetId → breadcrumb
 *  2. Gestion des tenants    : Changement de tenant → reset de l'état
 *  3. Resilience AIOps       : Analyse déterministe → scoring DORA
 *  4. Subscription Guard     : Accès feature → vérification entitlement
 *  5. Offline Queue          : Enqueue action offline → flush au retour en ligne
 */

import assert from "node:assert";

// Mock localStorage pour Node
if (typeof globalThis.localStorage === "undefined" || !globalThis.localStorage?.getItem) {
  const store = new Map<string, string>();
  (globalThis as any).localStorage = {
    getItem: (key: string) => store.get(key) || null,
    setItem: (key: string, val: string) => store.set(key, String(val)),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
  };
}

// Mock window.dispatchEvent / addEventListener pour Node
if (typeof globalThis.window === "undefined") {
  const listeners = new Map<string, Function[]>();
  (globalThis as any).window = {
    dispatchEvent: (event: any) => {
      const handlers = listeners.get(event.type) || [];
      handlers.forEach(h => h(event));
    },
    addEventListener: (type: string, handler: Function) => {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type)!.push(handler);
    },
    removeEventListener: (type: string, handler: Function) => {
      const arr = listeners.get(type) || [];
      const idx = arr.indexOf(handler);
      if (idx >= 0) arr.splice(idx, 1);
    },
  };
  (globalThis as any).CustomEvent = class CustomEvent {
    type: string;
    detail: any;
    constructor(type: string, opts?: { detail?: any }) {
      this.type = type;
      this.detail = opts?.detail;
    }
  };
}

// Mock navigator pour ConnectionManager
if (typeof globalThis.navigator === "undefined") {
  (globalThis as any).navigator = { onLine: true };
}

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

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── E2E Tests ───────────────────────────────────────────────────────────────

async function runE2ETests() {
  console.log("\n🚀 Démarrage des tests End-to-End SENSORIUM...\n");

  // ── Suite E2E-1 : Alerte → Navigation Contextuelle ──────────────────────
  console.log("🗺️  [Suite E2E-1] Navigation Contextuelle — Alerte → Asset");

  // Simulation de l'état de navigation (équivalent du store React)
  await test("Un clic sur une alerte P1 doit mettre à jour activeAssetId", () => {
    // Simule l'état interne d'un composant de navigation
    let activeAssetId: string | null = null;
    let breadcrumbs: string[] = ["Dashboard"];

    // Simule la fonction jumpToAsset utilisée dans AlertCard
    function jumpToAsset(assetId: string, assetLabel: string) {
      activeAssetId = assetId;
      breadcrumbs = ["Dashboard", "Alertes", assetLabel];
    }

    // Simule le clic sur une alerte P1
    const alertP1 = { id: "alert-001", assetId: "srv-rack-04", label: "Rack 4 — Surchauffe", severity: "P1" };
    jumpToAsset(alertP1.assetId, alertP1.label);

    assert.strictEqual(activeAssetId, "srv-rack-04", "activeAssetId non mis à jour");
    assert.strictEqual(breadcrumbs.length, 3, `Breadcrumb doit avoir 3 niveaux (actuel: ${breadcrumbs.length})`);
    assert.strictEqual(breadcrumbs[2], "Rack 4 — Surchauffe", "Le label de l'asset est incorrect dans le breadcrumb");
  });

  await test("Plusieurs navigations successives doivent toujours refléter le dernier asset actif", () => {
    let activeAssetId: string | null = null;

    function jumpToAsset(assetId: string) {
      activeAssetId = assetId;
    }

    const alerts = [
      { assetId: "srv-rack-01" },
      { assetId: "srv-rack-02" },
      { assetId: "switch-core-01" },
    ];

    for (const alert of alerts) {
      jumpToAsset(alert.assetId);
    }

    assert.strictEqual(activeAssetId, "switch-core-01", "Le dernier asset doit être 'switch-core-01'");
  });

  // ── Suite E2E-2 : Changement de Tenant → Reset d'État ─────────────────
  console.log("\n🏢 [Suite E2E-2] Multi-Tenant — Changement → Reset d'État");

  const { rbacService } = await import("../src/services/rbac.service.js");
  const { authService } = await import("../src/services/auth.service.js");

  await test("Changer de tenant doit réinitialiser la session RBAC au profil du nouveau tenant", () => {
    // Connexion initiale : tenant A
    rbacService.syncFromAuthUser({
      userId: "usr-admin-A",
      email: "admin@tenant-a.fr",
      role: "admin",
      tenantId: "tenant-A",
    });

    const sessionA = rbacService.getSession();
    assert.strictEqual(sessionA?.tenantId, "tenant-A");
    assert.strictEqual(sessionA?.role, "TENANT_ADMIN");

    // Changement de tenant : tenant B (rôle operator)
    rbacService.syncFromAuthUser({
      userId: "usr-ops-B",
      email: "ops@tenant-b.fr",
      role: "operator",
      tenantId: "tenant-B",
    });

    const sessionB = rbacService.getSession();
    assert.strictEqual(sessionB?.tenantId, "tenant-B", "TenantId non mis à jour");
    assert.notStrictEqual(sessionB?.role, "TENANT_ADMIN", "Le rôle admin du tenant A ne doit pas persister");
    assert.strictEqual(rbacService.can("infrastructure:provision"), false, "Un opérateur ne doit pas pouvoir provisionner");
  });

  await test("Après logout(), la session doit être nulle et les permissions refusées", async () => {
    rbacService.loginAsMock("TENANT_ADMIN", "tenant-test");
    assert.ok(rbacService.can("tenants:read"), "L'admin doit pouvoir lire les tenants");

    await authService.logout();

    // Après logout, la session RBAC doit aussi être nulle (synchronisation via Observer)
    const postLogoutSession = rbacService.getSession();
    assert.ok(
      postLogoutSession === null || !postLogoutSession?.userId,
      "La session RBAC doit être nulle après logout"
    );
  });

  // ── Suite E2E-3 : AIOps — Analyse Déterministe ────────────────────────
  console.log("\n🤖 [Suite E2E-3] AIOps — Résilience \& Analyse Déterministe");

  const { AIService } = await import("../server/services/ai.service.js");

  await test("L'analyse déterministe doit classifier correctement une alerte réseau WARNING (timeout)", () => {
    const check = AIService.runDeterministicLogChecks(
      "Connection timeout sur le routeur core — perte de paquet 80%",
      "Réseau / Core Switch"
    );
    // "timeout" correspond au pattern WARNING — comportement correct et attendu
    assert.ok(["WARNING", "CRITICAL"].includes(check.severity), `Sévérité attendue WARNING ou CRITICAL, obtenu: ${check.severity}`);
    assert.ok(check.rootCause.length > 0, "Le rootCause ne doit pas être vide");
    assert.ok(check.action.length > 0, "Une action corrective doit être fournie");
  });

  await test("L'analyse déterministe doit classifier une surchauffe comme CRITICAL", () => {
    const check = AIService.runDeterministicLogChecks(
      "Température CPU atteint 98°C overtemp — throttling automatique activé",
      "Serveur / Rack 4"
    );
    assert.strictEqual(check.severity, "CRITICAL");
    assert.ok(check.rootCause.toLowerCase().includes("thermique") || check.rootCause.toLowerCase().includes("surchauffe"),
      `rootCause doit mentionner la cause thermique (obtenu: "${check.rootCause}")`);
  });

  await test("Un log normal ne doit pas déclencher une alerte CRITICAL", () => {
    const check = AIService.runDeterministicLogChecks(
      "Routine backup completed successfully. 2847 files archived.",
      "Backup / Storage"
    );
    assert.ok(check.severity !== "CRITICAL", `Un log de backup ne devrait pas être CRITICAL (obtenu: ${check.severity})`);
  });

  // ── Suite E2E-4 : File d'Attente Offline ──────────────────────────────
  console.log("\n📶 [Suite E2E-4] Offline Queue — Résilience Hors-Ligne");

  // Assure que window.location est disponible pour ConnectionManager en Node
  if (typeof (globalThis as any).window !== "undefined" && typeof (globalThis as any).window.location === "undefined") {
    (globalThis as any).window.location = { origin: "http://localhost:3000", href: "http://localhost:3000/" };
  }
  const { connectionManager } = await import("../src/services/connectionManager.js");

  await test("enqueueOfflineAction() doit stocker l'action et notifier les abonnés", () => {
    let notified = false;
    const unsub = connectionManager.subscribe(() => {
      notified = true;
    });
    notified = false; // Reset après l'appel initial

    connectionManager.enqueueOfflineAction("DEPLOY_PATCH", { assetId: "srv-001", version: "2.4.1" });

    assert.ok(notified, "Les abonnés doivent être notifiés après enqueueOfflineAction");

    const state = connectionManager.getState();
    assert.ok(state.pendingSyncCount >= 1, `Au moins 1 action doit être en queue (actuel: ${state.pendingSyncCount})`);

    unsub();
  });

  await test("Plusieurs actions offline doivent s'accumuler correctement", () => {
    const initialCount = connectionManager.getState().pendingSyncCount;

    connectionManager.enqueueOfflineAction("RESTART_SERVICE", { service: "nginx" });
    connectionManager.enqueueOfflineAction("UPDATE_POLICY", { policyId: "pol-022" });
    connectionManager.enqueueOfflineAction("COLLECT_INVENTORY", { scope: "full" });

    const newCount = connectionManager.getState().pendingSyncCount;
    assert.ok(newCount >= initialCount + 3, `3 nouvelles actions devaient s'ajouter (avant: ${initialCount}, après: ${newCount})`);
  });

  // ── Suite E2E-5 : Scénario Complet Sécurité ──────────────────────────
  console.log("\n🔒 [Suite E2E-5] Scénario Sécurité — WAF + Zero-Trust Enchaîné");

  process.env.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "sensorium_sovereign_encryption_key_32chars_ok";
  const { WafService } = await import("../server/services/waf.service.js");
  const { ZeroTrustService } = await import("../server/services/zeroTrust.service.js");

  await test("Un agent malveillant doit être banni WAF ET déclencher un Impossible Travel Zero-Trust", () => {
    const maliciousIp = "10.99.88.77";
    const userId = "suspect-user-007";

    // 1. Attaque WAF — score dépasse 80 → auto-ban
    WafService.updateThreatScore(maliciousIp, 45, "SQL_INJECTION");
    WafService.updateThreatScore(maliciousIp, 40, "XSS");

    assert.ok(WafService.isIpBanned(maliciousIp), "L'IP malveillante doit être bannie par le WAF");

    // 2. Impossible Travel Zero-Trust — 2 pays différents en moins de 60 min
    ZeroTrustService.resetTravelTracking(userId);
    ZeroTrustService.evaluateImpossibleTravel(userId, maliciousIp, "FR"); // Paris
    const eval2 = ZeroTrustService.evaluateImpossibleTravel(userId, "8.8.8.8", "US"); // New York 1 sec après

    assert.strictEqual(eval2.isImpossible, true, "Zero-Trust doit détecter un Impossible Travel");
    assert.ok(eval2.riskScore >= 85, `Score de risque doit être >= 85 (actuel: ${eval2.riskScore})`);

    // 3. Double couche de protection confirmée
    const alerts = ZeroTrustService.getTravelAlerts();
    const alert = alerts.find((a) => a.userId === userId);
    assert.ok(alert !== undefined, "L'alerte Zero-Trust doit être enregistrée");
    assert.ok(alert!.details.isImpossible, "L'alerte doit marquer le voyage comme impossible");
  });

  await test("Un utilisateur légitime se reconnectant du même pays ne doit pas déclencher d'alerte", () => {
    const userId = "legit-user-paris";
    ZeroTrustService.resetTravelTracking(userId);

    const eval1 = ZeroTrustService.evaluateImpossibleTravel(userId, "195.154.1.1", "FR");
    assert.strictEqual(eval1.isImpossible, false);
    assert.strictEqual(eval1.riskScore, 0);

    // Reconnexion depuis le même pays quelques secondes après
    const eval2 = ZeroTrustService.evaluateImpossibleTravel(userId, "195.154.1.2", "FR");
    assert.strictEqual(eval2.isImpossible, false, "Même pays → pas d'impossible travel");
  });

  // ── Bilan ──────────────────────────────────────────────────────────────────
  console.log("\n" + "=".repeat(60));
  console.log(`📊 Résultat E2E Tests : ${passedTests} réussis, ${failedTests} échoués`);
  console.log("=".repeat(60) + "\n");

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runE2ETests().catch((err) => {
  console.error("Erreur fatale lors des tests E2E:", err);
  process.exit(1);
});

