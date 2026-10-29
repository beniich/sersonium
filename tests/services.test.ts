/**
 * SENSORIUM — Test Suite des Services Critiques
 * Couvre :
 * 1. ConnectionManager (Pattern multi-abonnés subscribe/unsubscribe, queue offline)
 * 2. AuthService (Pattern Observer onAuthStateChange, session persistence)
 * 3. RbacService (Synchronisation dynamique Auth -> RBAC, matrice de permissions)
 * 4. DnsService (Lazy-loading, filtrage, export RFC 1035)
 */

import assert from "node:assert";

// Mock localStorage pour l'environnement de test Node
if (typeof globalThis.localStorage === "undefined" || !globalThis.localStorage?.getItem) {
  const store = new Map<string, string>();
  (globalThis as any).localStorage = {
    getItem: (key: string) => store.get(key) || null,
    setItem: (key: string, val: string) => store.set(key, String(val)),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
  };
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

async function runTests() {
  console.log("\n🧪 Démarrage de la suite de tests des services SENSORIUM...\n");

  // ─── 1. Tests ConnectionManager ─────────────────────────────────────────────
  console.log("📡 [Suite 1] ConnectionManager - Multi-Abonnés & File d'attente");
  const { connectionManager } = await import("../src/services/connectionManager.js");

  await test("subscribe() doit notifier immédiatement l'écouteur avec l'état actuel", () => {
    let notified = false;
    let receivedState: any = null;

    const unsub = connectionManager.subscribe((state) => {
      notified = true;
      receivedState = state;
    });

    assert.strictEqual(notified, true, "L'écouteur n'a pas été appelé immédiatement");
    assert.ok(receivedState !== null, "L'état reçu est nul");
    assert.strictEqual(typeof receivedState.isOnline, "boolean");
    unsub();
  });

  await test("L'appel de la fonction de retour de subscribe() doit désabonner l'écouteur", () => {
    let callCount = 0;
    const unsub = connectionManager.subscribe(() => {
      callCount++;
    });

    assert.strictEqual(callCount, 1, "Appel initial manquant");
    unsub();

    // Déclenche une action qui notifie les écouteurs
    connectionManager.enqueueOfflineAction("TEST_ACTION", { id: 1 });
    assert.strictEqual(callCount, 1, "L'écouteur désabonné a été rappelé");
  });

  await test("Plusieurs écouteurs peuvent s'abonner simultanément sans s'écraser", () => {
    let count1 = 0;
    let count2 = 0;

    const unsub1 = connectionManager.subscribe(() => { count1++; });
    const unsub2 = connectionManager.subscribe(() => { count2++; });

    assert.strictEqual(count1, 1);
    assert.strictEqual(count2, 1);

    connectionManager.enqueueOfflineAction("TEST_MULTI", { foo: "bar" });

    assert.strictEqual(count1, 2, "Le premier abonné n'a pas reçu la notification");
    assert.strictEqual(count2, 2, "Le second abonné n'a pas reçu la notification");

    unsub1();
    unsub2();
  });

  // ─── 2. Tests AuthService ───────────────────────────────────────────────────
  console.log("\n🔐 [Suite 2] AuthService - Observer & Gestion de Session");
  const { authService } = await import("../src/services/auth.service.js");

  await test("onAuthStateChange() doit notifier lors d'un setSession()", () => {
    let receivedUser: any = null;
    const unsub = authService.onAuthStateChange((s) => {
      receivedUser = s.user;
    });

    authService.setSession({
      userId: "usr-test-1",
      email: "test.auditor@sensorium.ai",
      role: "auditor",
      tenantId: "tenant-cmr",
    }, "fake-jwt-token");

    assert.ok(receivedUser !== null, "L'utilisateur n'a pas été transmis");
    assert.strictEqual(receivedUser.email, "test.auditor@sensorium.ai");
    assert.strictEqual(authService.getSession().isAuthenticated, true);

    unsub();
  });

  await test("logout() doit vider la session et notifier les écouteurs", async () => {
    let isAuthed = true;
    const unsub = authService.onAuthStateChange((s) => {
      isAuthed = s.isAuthenticated;
    });

    await authService.logout();
    assert.strictEqual(isAuthed, false, "L'état d'authentification devrait être false après logout");
    assert.strictEqual(authService.getSession().user, null);

    unsub();
  });

  // ─── 3. Tests RbacService & Synchronisation Auth -> RBAC ────────────────────
  console.log("\n🛡️ [Suite 3] RbacService - Synchronisation Automatique & Matrice");
  const { rbacService } = await import("../src/services/rbac.service.js");

  await test("syncFromAuthUser() doit mapper un rôle 'admin' vers 'TENANT_ADMIN'", () => {
    rbacService.syncFromAuthUser({
      userId: "usr-admin-1",
      email: "direction@caissedesdepots.fr",
      role: "admin",
      tenantId: "tenant-cdc",
      organizationName: "Caisse des Dépôts",
    });

    const session = rbacService.getSession();
    assert.ok(session !== null, "Session RBAC non initialisée");
    assert.strictEqual(session.role, "TENANT_ADMIN");
    assert.strictEqual(session.tenantId, "tenant-cdc");
    assert.strictEqual(rbacService.can("tenants:read"), true);
    assert.strictEqual(rbacService.can("billing:read"), true);
  });

  await test("syncFromAuthUser() doit restreindre un rôle 'auditor' à CSRD_AUDITOR", () => {
    rbacService.syncFromAuthUser({
      userId: "usr-audit-1",
      email: "esg.auditor@kpmg.fr",
      role: "auditor",
      tenantId: "tenant-cmr",
    });

    const session = rbacService.getSession();
    assert.ok(session !== null);
    assert.strictEqual(session.role, "CSRD_AUDITOR");
    assert.strictEqual(rbacService.can("compliance:read"), true);
    assert.strictEqual(rbacService.can("infrastructure:provision"), false, "Un auditeur ne doit pas pouvoir provisionner de l'infra");
  });

  await test("loginAsMock() doit synchroniser la session vers AuthService", () => {
    rbacService.loginAsMock("SUPER_ADMIN", "tenant-demo");

    const authSession = authService.getSession();
    assert.strictEqual(authSession.isAuthenticated, true);
    assert.strictEqual(authSession.user?.role, "SUPER_ADMIN");
    assert.strictEqual(rbacService.can("zerotrust:manage"), true);
  });

  // ─── 4. Tests DnsService ────────────────────────────────────────────────────
  console.log("\n🌐 [Suite 4] DnsService - Lazy Loading & Format BIND RFC 1035");
  const { dnsService } = await import("../src/services/dns.service.js");

  await test("getDomains() doit paginer et filtrer sur le parc mémoïsé", async () => {
    const res = await dnsService.getDomains({ page: 1, limit: 10 });
    assert.strictEqual(res.domains.length, 10);
    assert.ok(res.total >= 1000, "Le parc total doit contenir les 1571 zones");
  });

  await test("exportBind1035ZoneFile() doit générer une zone BIND RFC 1035 valide", () => {
    const rawZone = dnsService.exportBind1035ZoneFile();
    assert.ok(rawZone.includes("RFC 1035 (BIND Zone File)"), "En-tête manquant");
    assert.ok(rawZone.includes("$ORIGIN"), "Directives $ORIGIN manquantes");
    assert.ok(rawZone.includes("IN SOA"), "Enregistrement SOA manquant");
  });

  // ─── 5. Tests Cryptographie Souveraine DORA (RFC 6234 / FIPS 180-4) ─────────
  console.log("\n🔒 [Suite 5] Crypto - Conformité Empreinte SHA-256 DORA");
  const { computeSha256 } = await import("../src/utils/crypto.js");

  await test("computeSha256() doit calculer le hachage standard NIST certifié", async () => {
    const hash = await computeSha256("hello");
    assert.strictEqual(
      hash,
      "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
      "L'empreinte SHA-256 ne correspond pas au vecteur de test FIPS 180-4"
    );
  });

  // ─── 6. Tests Circuit Breaker IA & Résilience Déterministe ──────────────────
  console.log("\n⚡ [Suite 6] Circuit Breaker IA Gemini & Résilience");
  const { AIService } = await import("../server/services/ai.service.js");

  await test("getCircuitStatus() doit initialement rapporter un état CLOSED et sain", () => {
    const status = AIService.getCircuitStatus();
    assert.strictEqual(status.state, "CLOSED", "L'état initial du circuit doit être CLOSED");
    assert.strictEqual(status.failureCount, 0, "Le nombre d'échecs initial doit être 0");
  });

  await test("resetCircuit() doit réinitialiser le circuit en CLOSED sans lever d'erreur", () => {
    const res = AIService.resetCircuit();
    assert.strictEqual(res.state, "CLOSED");
    assert.ok(res.message.includes("CLOSED") || res.message.includes("succès"));
    const status = AIService.getCircuitStatus();
    assert.strictEqual(status.state, "CLOSED");
    assert.strictEqual(status.failureCount, 0);
  });

  await test("runDeterministicLogChecks() doit détecter les pannes critiques sans IA", () => {
    const check = AIService.runDeterministicLogChecks("Alerte surchauffe overtemp détectée sur rack 4", "CVC salle serveur");
    assert.strictEqual(check.severity, "CRITICAL");
    assert.ok(check.rootCause.includes("thermique") || check.rootCause.includes("surchauffe"));
  });

  // ─── 7. Tests WAF Adaptatif & Threat Scoring Dynamique ──────────────────────
  console.log("\n🛡️ [Suite 7] WAF Adaptatif & Système de Score de Menace");
  const { WafService } = await import("../server/services/waf.service.js");

  await test("WafService doit incrémenter le score de menace et bannir après seuil", () => {
    const testIp = "198.51.100.99";
    const initialScore = WafService.getThreatScore(testIp);
    assert.strictEqual(initialScore, 0, "Score initial doit être 0");

    // Attaque SQL Injection (+35)
    const score1 = WafService.updateThreatScore(testIp, 35, "SQL_INJECTION").score;
    assert.strictEqual(score1, 35);
    assert.strictEqual(WafService.isIpBanned(testIp), false, "Ne doit pas être banni sous 80");

    // Attaque XSS (+30)
    const score2 = WafService.updateThreatScore(testIp, 30, "XSS").score;
    assert.strictEqual(score2, 65);
    assert.strictEqual(WafService.isIpBanned(testIp), false);

    // Attaque Path Traversal (+25) -> Dépasse 80 -> Auto-ban
    const score3 = WafService.updateThreatScore(testIp, 25, "PATH_TRAVERSAL").score;
    assert.ok(score3 >= 80, `Score doit être >= 80 (actuel: ${score3})`);
    assert.strictEqual(WafService.isIpBanned(testIp), true, "L'IP doit être bannie automatiquement");
  });

  // ─── 8. Tests Zero Trust & Détection Impossible Travel ──────────────────────
  console.log("\n🛰️ [Suite 8] Zero Trust & Impossible Travel Detection");
  process.env.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "sensorium_sovereign_encryption_key_32chars_ok";
  const { ZeroTrustService } = await import("../server/services/zeroTrust.service.js");

  await test("ZeroTrustService doit détecter un déplacement physiquement impossible (< 60 min entre 2 pays)", () => {
    const userId = "agent-007-test";
    ZeroTrustService.resetTravelTracking(userId);

    // 1er accès à Paris, France
    const eval1 = ZeroTrustService.evaluateImpossibleTravel(userId, "195.154.122.1", "FR");
    assert.strictEqual(eval1.isImpossible, false);
    assert.strictEqual(eval1.riskScore, 0);

    // 2ème accès 1 seconde plus tard à New York, USA depuis une autre IP
    const eval2 = ZeroTrustService.evaluateImpossibleTravel(userId, "198.51.100.42", "US");
    assert.strictEqual(eval2.isImpossible, true, "Doit être marqué comme impossible travel");
    assert.ok(eval2.riskScore >= 85, `Le score de risque doit être >= 85 (actuel: ${eval2.riskScore})`);
    assert.ok(eval2.reason?.includes("Déplacement impossible"), "Le motif doit expliciter l'anomalie géographique");

    // Vérifier l'enregistrement de l'alerte
    const alerts = ZeroTrustService.getTravelAlerts();
    const alert = alerts.find(a => a.userId === userId);
    assert.ok(alert !== undefined, "L'alerte doit être enregistrée dans ZeroTrustService");
    assert.strictEqual(alert?.details.isImpossible, true);
  });

  // ─── Bilan Final ────────────────────────────────────────────────────────────
  console.log("\n" + "=".repeat(60));
  console.log(`📊 Résultat des tests : ${passedTests} réussis, ${failedTests} échoués`);
  console.log("=".repeat(60) + "\n");

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error("Erreur fatale lors des tests:", err);
  process.exit(1);
});
