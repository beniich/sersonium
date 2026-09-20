import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

const CSRF_SECRET = process.env.CSRF_SECRET || "csrf_protection_secret_2026_super_safe";
export const CSRF_COOKIE_NAME = "XSRF-TOKEN";
export const CSRF_HEADER_NAME = "x-csrf-token";

/**
 * Generates a signed CSRF token
 */
export function generateCsrfToken(): string {
  const randomBytes = crypto.randomBytes(24).toString("hex");
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac("sha256", CSRF_SECRET)
    .update(`${randomBytes}.${timestamp}`)
    .digest("hex");
  
  return `${randomBytes}.${timestamp}.${signature}`;
}

/**
 * Validates the cryptographic signature and freshness of a CSRF token
 */
export function verifyCsrfToken(token: string): boolean {
  if (!token || typeof token !== "string") return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [randomBytes, timestamp, signature] = parts;
  const timeNum = Number(timestamp);
  
  // Expiration (4 hours)
  if (isNaN(timeNum) || Date.now() - timeNum > 4 * 60 * 60 * 1000) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", CSRF_SECRET)
    .update(`${randomBytes}.${timestamp}`)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
  } catch {
    return false;
  }
}

/**
 * CSRF Protection Middleware
 * Inspects state-changing requests (POST, PUT, PATCH, DELETE)
 * Exempts safe HTTP methods (GET, HEAD, OPTIONS) and Bearer-token API calls without cookies.
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction): void => {
  const safeMethods = ["GET", "HEAD", "OPTIONS"];
  if (safeMethods.includes(req.method)) {
    next();
    return;
  }

  // Exempt Stripe/PayPal Webhooks or raw server-to-server endpoints
  if (req.path.startsWith("/api/v1/webhooks") || req.path.includes("/payments/webhook") || req.path.includes("/paypal/webhook")) {
    next();
    return;
  }

  // Retrieve token from header (x-csrf-token, x-xsrf-token) or body
  const tokenFromHeader = (req.headers[CSRF_HEADER_NAME] || req.headers["x-xsrf-token"]) as string;
  const tokenFromBody = req.body?._csrf;
  const token = tokenFromHeader || tokenFromBody;

  // Retrieve token from cookie
  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];

  // If client is pure Bearer API without session cookies, allow if valid Bearer token exists
  const hasAuthBearer = req.headers.authorization?.startsWith("Bearer ");
  
  if (!token && hasAuthBearer && !req.cookies?.beecarbonat_refresh_token) {
    // Pure Authorization header SPA API calls without ambient cookies are inherently protected against CSRF
    next();
    return;
  }

  if (!token || !verifyCsrfToken(token)) {
    res.status(403).json({
      success: false,
      error: {
        code: "CSRF_TOKEN_INVALID_OR_MISSING",
        message: "Échec de la validation CSRF. Jeton manquant ou invalide. Veuillez recharger la session."
      }
    });
    return;
  }

  // Ensure header matches cookie if cookie is present (Double Submit Pattern)
  if (cookieToken && cookieToken !== token) {
    res.status(403).json({
      success: false,
      error: {
        code: "CSRF_TOKEN_MISMATCH",
        message: "Désynchronisation du jeton CSRF entre en-tête et cookie."
      }
    });
    return;
  }

  next();
};
