// Script pour générer des JWT de test valides
// Lit la clé secrète directement depuis .env
import jwt from 'jsonwebtoken';
import fs from 'fs';

let secret = 'jeton_edge_access_secret_dev_2026_secure';
try {
  const envContent = fs.readFileSync('.env', 'utf-8');
  const match = envContent.match(/JWT_ACCESS_SECRET=["']?([^"'\r\n]+)["']?/);
  if (match) {
    secret = match[1];
  }
} catch (e) {
  console.warn('Could not read .env, using fallback');
}

console.log('Using JWT secret:', secret);

function signToken(payload, expiresIn = '1h') {
  return jwt.sign({ ...payload, jti: Math.random().toString(36).substring(2) }, secret, {
    expiresIn,
    algorithm: 'HS256'
  });
}

// 1. User FREE : abonnement FREE actif (mais plan FREE -> hasAccess = false -> cockpit interdit)
const tokenFree = signToken({
  userId: 'test_user_free',
  email: 'test.free@sensorium.test',
  role: 'operator',
  tenantId: 'test_org_free',
  subscriptionTier: 'free'
});

// 2. User PRO : abonnement PRO actif (5000 tokens dispo -> hasAccess = true -> cockpit autorisé)
const tokenPro = signToken({
  userId: 'test_user_pro',
  email: 'test.pro@sensorium.test',
  role: 'admin',
  tenantId: 'test_org_pro',
  subscriptionTier: 'pro'
});

// 3. User ZERO TOKENS : abonnement PRO actif mais solde tokens = 0 -> AI 429 quota dépassé
const tokenNoTokens = signToken({
  userId: 'test_user_notokens',
  email: 'test.notokens@sensorium.test',
  role: 'admin',
  tenantId: 'test_org_notokens',
  subscriptionTier: 'pro'
});

// 4. Token EXPIRÉ
const tokenExpired = jwt.sign(
  { userId: 'test_user_pro', email: 'test.pro@sensorium.test', role: 'admin', tenantId: 'test_org_pro', jti: 'expired-token-123' },
  secret,
  { expiresIn: '-10s', algorithm: 'HS256' }
);

// 5. Faux token (mauvaise signature)
const tokenFake = jwt.sign(
  { userId: 'hacker', email: 'hacker@evil.com', role: 'admin', tenantId: 'test_org_pro' },
  'wrong_secret_key_12345',
  { expiresIn: '1h', algorithm: 'HS256' }
);

const tokens = {
  TOKEN_FREE: tokenFree,
  TOKEN_PRO: tokenPro,
  TOKEN_NO_TOKENS: tokenNoTokens,
  TOKEN_EXPIRED: tokenExpired,
  TOKEN_FAKE: tokenFake
};

fs.writeFileSync('scripts/tokens.json', JSON.stringify(tokens, null, 2));
console.log('Saved tokens to scripts/tokens.json');
