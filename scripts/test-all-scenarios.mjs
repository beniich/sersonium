// test-all-scenarios.mjs
// Suite de tests exhaustive pour la vérification triple couche d'accès SENSORIUM
// Authentification -> Abonnement -> Tokens/API
import fs from 'fs';

const BASE_URL = 'http://localhost:3000/api/v1';

// Charger les jetons générés
const tokens = JSON.parse(fs.readFileSync('scripts/tokens.json', 'utf-8'));

let passCount = 0;
let failCount = 0;
const results = [];

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  magenta: '\x1b[35m'
};

async function testCase({ id, name, url, method = 'GET', headers = {}, body = null, expectedStatus, expectedCode = null, customValidator = null }) {
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
  const options = {
    method,
    headers: { ...headers }
  };

  if (body) {
    options.headers['Content-Type'] = 'application/json';
    options.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  try {
    const res = await fetch(fullUrl, options);
    const status = res.status;
    let data = null;
    let text = '';
    try {
      text = await res.text();
      data = JSON.parse(text);
    } catch {
      // Pas du JSON
    }

    let pass = status === expectedStatus;
    let detail = `Status ${status} (attendu ${expectedStatus})`;

    if (expectedCode) {
      const actualCode = data?.error?.code || (text.includes(expectedCode) ? expectedCode : null);
      if (actualCode !== expectedCode) {
        pass = false;
        detail += ` | Code '${actualCode}' (attendu '${expectedCode}')`;
      } else {
        detail += ` | Code '${expectedCode}' OK`;
      }
    }

    if (customValidator && pass) {
      const customRes = customValidator(data, res);
      if (!customRes.valid) {
        pass = false;
        detail += ` | Validation: ${customRes.reason}`;
      } else {
        detail += ` | ${customRes.reason}`;
      }
    }

    if (pass) {
      passCount++;
      console.log(`  ${c.green}✅ [${id}] ${name}${c.reset}`);
      console.log(`     ${c.gray}${method} ${url} -> ${detail}${c.reset}`);
    } else {
      failCount++;
      console.log(`  ${c.red}❌ [${id}] ${name}${c.reset}`);
      console.log(`     ${c.yellow}${method} ${url} -> ${detail}${c.reset}`);
      if (data) {
        console.log(`     ${c.gray}Response:${JSON.stringify(data)}${c.reset}`);
      }
    }

    results.push({ id, name, pass, detail });
    return pass;
  } catch (err) {
    failCount++;
    console.log(`  ${c.red}❌ [${id}] ${name} (EXCEPTION: ${err.message})${c.reset}`);
    results.push({ id, name, pass: false, detail: err.message });
    return false;
  }
}

async function run() {
  console.log(`\n${c.magenta}${c.bold}═════════════════════════════════════════════════════════════════${c.reset}`);
  console.log(`${c.magenta}${c.bold}   SENSORIUM — SUITE DE TESTS : CONTRÔLE D'ACCÈS TRIPLE COUCHE   ${c.reset}`);
  console.log(`${c.magenta}${c.bold}   1. Authentification  2. Abonnement  3. Quota Tokens & API     ${c.reset}`);
  console.log(`${c.magenta}${c.bold}═════════════════════════════════════════════════════════════════${c.reset}\n`);

  // ─────────────────────────────────────────────────────────────
  console.log(`${c.cyan}${c.bold}▶ SCÉNARIO 1 : Routes Publiques (accès libre sans authentification)${c.reset}`);
  await testCase({
    id: 'S1.1',
    name: 'GET /bridge/plans (catalogue public des offres)',
    url: '/bridge/plans',
    expectedStatus: 200,
    customValidator: (data) => ({
      valid: Array.isArray(data?.data) && data.data.length > 0,
      reason: `${data?.data?.length || 0} plans listés`
    })
  });

  await testCase({
    id: 'S1.2',
    name: 'GET /auth/csrf-token (génération cookie CSRF public)',
    url: '/auth/csrf-token',
    expectedStatus: 200
  });

  // ─────────────────────────────────────────────────────────────
  console.log(`\n${c.cyan}${c.bold}▶ SCÉNARIO 2 : Accès Anonyme Bloqué (HTTP 401 attendu sur toutes les ressources cockpit)${c.reset}`);
  await testCase({
    id: 'S2.1',
    name: 'GET /bridge/subscription-status sans token',
    url: '/bridge/subscription-status?uid=test_user_free',
    expectedStatus: 401,
    expectedCode: 'UNAUTHORIZED'
  });

  await testCase({
    id: 'S2.2',
    name: 'GET /carbon sans token',
    url: '/carbon',
    expectedStatus: 401,
    expectedCode: 'UNAUTHORIZED'
  });

  await testCase({
    id: 'S2.3',
    name: 'GET /iot sans token',
    url: '/iot',
    expectedStatus: 401,
    expectedCode: 'UNAUTHORIZED'
  });

  await testCase({
    id: 'S2.4',
    name: 'GET /ai/diagnostics sans token',
    url: '/ai/diagnostics',
    expectedStatus: 401,
    expectedCode: 'UNAUTHORIZED'
  });

  await testCase({
    id: 'S2.5',
    name: 'GET /auth/me sans token',
    url: '/auth/me',
    expectedStatus: 401,
    expectedCode: 'UNAUTHORIZED'
  });

  // ─────────────────────────────────────────────────────────────
  console.log(`\n${c.cyan}${c.bold}▶ SCÉNARIO 3 : Jetons Invalides, Expirés ou Falsifiés${c.reset}`);
  await testCase({
    id: 'S3.1',
    name: 'Faux jeton avec signature invalide (TOKEN_FAKE)',
    url: '/bridge/subscription-status?uid=test_user_pro',
    headers: { Authorization: `Bearer ${tokens.TOKEN_FAKE}` },
    expectedStatus: 401,
    expectedCode: 'INVALID_TOKEN'
  });

  await testCase({
    id: 'S3.2',
    name: 'Jeton expiré (TOKEN_EXPIRED)',
    url: '/carbon',
    headers: { Authorization: `Bearer ${tokens.TOKEN_EXPIRED}` },
    expectedStatus: 401,
    expectedCode: 'TOKEN_EXPIRED'
  });

  await testCase({
    id: 'S3.3',
    name: 'En-tête Authorization malformé (sans préfixe Bearer)',
    url: '/carbon',
    headers: { Authorization: tokens.TOKEN_PRO },
    expectedStatus: 401,
    expectedCode: 'UNAUTHORIZED'
  });

  // ─────────────────────────────────────────────────────────────
  console.log(`\n${c.cyan}${c.bold}▶ SCÉNARIO 4 : Utilisateur Connecté mais Abonnement FREE (Paywall & 402)${c.reset}`);
  await testCase({
    id: 'S4.1',
    name: 'GET /bridge/subscription-status avec TOKEN_FREE -> hasAccess: false, tier: FREE',
    url: '/bridge/subscription-status?uid=test_user_free',
    headers: { Authorization: `Bearer ${tokens.TOKEN_FREE}` },
    expectedStatus: 200,
    customValidator: (data) => ({
      valid: data?.data?.hasAccess === false && data?.data?.tier === 'FREE',
      reason: `hasAccess=${data?.data?.hasAccess}, tier=${data?.data?.tier}`
    })
  });

  await testCase({
    id: 'S4.2',
    name: 'GET /carbon avec TOKEN_FREE -> 402 PAYMENT_REQUIRED',
    url: '/carbon',
    headers: { Authorization: `Bearer ${tokens.TOKEN_FREE}` },
    expectedStatus: 402,
    expectedCode: 'PAYMENT_REQUIRED'
  });

  await testCase({
    id: 'S4.3',
    name: 'GET /iot avec TOKEN_FREE -> 402 PAYMENT_REQUIRED',
    url: '/iot',
    headers: { Authorization: `Bearer ${tokens.TOKEN_FREE}` },
    expectedStatus: 402,
    expectedCode: 'PAYMENT_REQUIRED'
  });

  // ─────────────────────────────────────────────────────────────
  console.log(`\n${c.cyan}${c.bold}▶ SCÉNARIO 5 : Quota de Jetons Épuisé (Solde = 0 -> HTTP 429)${c.reset}`);
  await testCase({
    id: 'S5.1',
    name: 'POST /ai/* avec solde de 0 tokens -> HTTP 429 TOKEN_QUOTA_EXCEEDED',
    url: '/ai/analyze',
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.TOKEN_NO_TOKENS}` },
    body: { message: "Test analyse IA sans jetons" },
    expectedStatus: 429,
    expectedCode: 'TOKEN_QUOTA_EXCEEDED'
  });

  await testCase({
    id: 'S5.2',
    name: 'GET /ai/diagnostics avec solde de 0 tokens -> HTTP 429 TOKEN_QUOTA_EXCEEDED',
    url: '/ai/diagnostics',
    headers: { Authorization: `Bearer ${tokens.TOKEN_NO_TOKENS}` },
    expectedStatus: 429,
    expectedCode: 'TOKEN_QUOTA_EXCEEDED'
  });

  // ─────────────────────────────────────────────────────────────
  console.log(`\n${c.cyan}${c.bold}▶ SCÉNARIO 6 : Accès Complet Autorisé (Abonnement PRO + Jetons Disponibles)${c.reset}`);
  await testCase({
    id: 'S6.1',
    name: 'GET /bridge/subscription-status avec TOKEN_PRO -> hasAccess: true, tier: PRO',
    url: '/bridge/subscription-status?uid=test_user_pro',
    headers: { Authorization: `Bearer ${tokens.TOKEN_PRO}` },
    expectedStatus: 200,
    customValidator: (data) => ({
      valid: data?.data?.hasAccess === true && data?.data?.tier === 'PRO',
      reason: `hasAccess=${data?.data?.hasAccess}, tier=${data?.data?.tier}, tokens=${data?.data?.tokenBalance}`
    })
  });

  await testCase({
    id: 'S6.2',
    name: 'GET /carbon avec TOKEN_PRO -> HTTP 200 OK',
    url: '/carbon',
    headers: { Authorization: `Bearer ${tokens.TOKEN_PRO}` },
    expectedStatus: 200
  });

  await testCase({
    id: 'S6.3',
    name: 'GET /iot avec TOKEN_PRO -> HTTP 200 OK',
    url: '/iot',
    headers: { Authorization: `Bearer ${tokens.TOKEN_PRO}` },
    expectedStatus: 200
  });

  // ─────────────────────────────────────────────────────────────
  console.log(`\n${c.cyan}${c.bold}▶ SCÉNARIO 7 : Isolation Multi-Tenant & Cloisonnement des Comptes${c.reset}`);
  await testCase({
    id: 'S7.1',
    name: 'User standard (test_user_free) tente de sonder le statut d\'un autre compte (test_user_pro) -> 403',
    url: '/bridge/subscription-status?uid=test_user_pro',
    headers: { Authorization: `Bearer ${tokens.TOKEN_FREE}` },
    expectedStatus: 403
  });

  await testCase({
    id: 'S7.2',
    name: 'Tenant Spoofing : tentative d\'usurper X-Tenant-Id avec un token non admin -> 403',
    url: '/carbon',
    headers: {
      Authorization: `Bearer ${tokens.TOKEN_FREE}`,
      'X-Tenant-Id': 'tenant_beecarbonat_global'
    },
    expectedStatus: 403,
    expectedCode: 'TENANT_MISMATCH_SECURITY_VIOLATION'
  });

  // ─────────────────────────────────────────────────────────────
  console.log(`\n${c.magenta}${c.bold}═════════════════════════════════════════════════════════════════${c.reset}`);
  console.log(`${c.magenta}${c.bold}   RÉSULTATS DE LA SUITE DE TESTS                                ${c.reset}`);
  console.log(`${c.magenta}${c.bold}═════════════════════════════════════════════════════════════════${c.reset}`);
  const total = passCount + failCount;
  console.log(`\n  Total des assertions : ${total}`);
  console.log(`  Tests réussis        : ${c.green}${c.bold}${passCount} / ${total}${c.reset}`);
  console.log(`  Tests échoués        : ${failCount > 0 ? c.red : c.green}${c.bold}${failCount} / ${total}${c.reset}\n`);

  if (failCount === 0) {
    console.log(`  ${c.green}${c.bold}🎉 TOUS LES SCÉNARIOS SONT VALIDÉS AVEC SUCCÈS !${c.reset}`);
    console.log(`  ${c.green}La sécurité triple couche (Auth -> Abonnement -> Tokens) est opérationnelle à 100%.${c.reset}\n`);
  } else {
    console.log(`  ${c.red}${c.bold}⚠️  ${failCount} scénario(s) ont échoué. Consulter les détails ci-dessus.${c.reset}\n`);
  }

  process.exit(failCount > 0 ? 1 : 0);
}

run();
