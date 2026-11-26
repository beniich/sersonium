import jwt from "jsonwebtoken";
import { CookieOptions } from "express";
import crypto from "crypto";
import { UserPayload, JWTPayload } from "../types/auth.js";

// In production, secrets MUST be provided via environment variables.
// Weak dev fallbacks are only allowed outside production.
const _isDev = process.env.NODE_ENV !== "production";

if (!_isDev && !process.env.JWT_ACCESS_SECRET) {
  throw new Error("FATAL: JWT_ACCESS_SECRET must be set in production. Refusing to start.");
}
if (!_isDev && !process.env.JWT_REFRESH_SECRET) {
  throw new Error("FATAL: JWT_REFRESH_SECRET must be set in production. Refusing to start.");
}

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || (_isDev ? "jeton_access_dev_only_not_for_prod" : "");
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || (_isDev ? "jeton_refresh_dev_only_not_for_prod" : "");

/**
 * Fail-fast assertion for JWT configuration — called at server startup.
 */
export function assertJwtConfig(): void {
  if (process.env.NODE_ENV === "production") {
    if (!process.env.JWT_ACCESS_SECRET || process.env.JWT_ACCESS_SECRET.length < 32) {
      throw new Error("FATAL: JWT_ACCESS_SECRET must be set and ≥ 32 characters in production.");
    }
    if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET.length < 32) {
      throw new Error("FATAL: JWT_REFRESH_SECRET must be set and ≥ 32 characters in production.");
    }
  }
}

export const ACCESS_TOKEN_EXPIRY = "15m";
export const REFRESH_TOKEN_EXPIRY = "7d";
export const REFRESH_TOKEN_COOKIE_NAME = "beecarbonat_refresh_token";

/**
 * In-memory Token Family & Reuse Detection Store (RTR - Refresh Token Rotation)
 * Maps jti -> { userId, familyId, isRevoked, replacedByJti, expiresAt }
 */
interface TokenMetadata {
  userId: string;
  familyId: string;
  isUsed: boolean;
  isRevoked: boolean;
  expiresAt: number;
}

const tokenStore = new Map<string, TokenMetadata>();

// Auto purge expired tokens from store
setInterval(() => {
  const now = Date.now();
  for (const [jti, meta] of tokenStore.entries()) {
    if (meta.expiresAt <= now) {
      tokenStore.delete(jti);
    }
  }
}, 60 * 1000).unref();

/**
 * Signs a short-lived access token (15 minutes) with cryptographic JTI
 */
export function signAccessToken(payload: UserPayload): string {
  const jti = crypto.randomUUID();
  return jwt.sign({ ...payload, jti }, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    algorithm: "HS256"
  });
}

/**
 * Signs a secure rotating Refresh Token with unique JTI and Family ID
 */
export function signRefreshToken(payload: UserPayload, existingFamilyId?: string): { token: string; jti: string; familyId: string } {
  const jti = crypto.randomUUID();
  const familyId = existingFamilyId || crypto.randomUUID();
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

  const token = jwt.sign({ ...payload, jti, familyId }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
    algorithm: "HS256"
  });

  tokenStore.set(jti, {
    userId: payload.userId,
    familyId,
    isUsed: false,
    isRevoked: false,
    expiresAt
  });

  return { token, jti, familyId };
}

/**
 * Verifies access token
 */
export function verifyAccessToken(token: string): JWTPayload {
  return jwt.verify(token, ACCESS_TOKEN_SECRET) as JWTPayload;
}

/**
 * Verifies refresh token & checks for reuse (Token Reuse Detection)
 */
export function verifyAndRotateRefreshToken(token: string): { 
  payload: JWTPayload; 
  familyId: string; 
  reuseDetected: boolean 
} {
  const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as JWTPayload & { familyId?: string; jti?: string };
  const jti = decoded.jti;
  const familyId = decoded.familyId || decoded.userId;

  if (!jti) {
    return { payload: decoded, familyId, reuseDetected: false };
  }

  const tokenMeta = tokenStore.get(jti);

  // If token is already used or revoked -> BREACH DETECTED: Revoke entire token family
  if (tokenMeta && (tokenMeta.isUsed || tokenMeta.isRevoked)) {
    revokeTokenFamily(familyId);
    return { payload: decoded, familyId, reuseDetected: true };
  }

  // Mark token as used
  if (tokenMeta) {
    tokenMeta.isUsed = true;
  }

  return { payload: decoded, familyId, reuseDetected: false };
}

/**
 * Revokes all tokens in a family (used when breach is detected or on logout)
 */
export function revokeTokenFamily(familyId: string): void {
  for (const [_, meta] of tokenStore.entries()) {
    if (meta.familyId === familyId) {
      meta.isRevoked = true;
    }
  }
}

/**
 * Cookie options for HttpOnly, Secure, SameSite refresh token
 */
export function getRefreshTokenCookieOptions(): CookieOptions {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api/v1/auth"
  };
}
