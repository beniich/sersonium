import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../config/jwt.js";
import { ZeroTrustService } from "../services/zeroTrust.service.js";
import type { AuthenticatedRequest } from "../types/auth.js";

/**
 * Enhanced Security Shield Middlewares:
 * 1. Deep Defensive HTTP Headers & Content Security Policy (CSP)
 * 2. Real-time Payload Deep-Sanitizer (Anti-XSS, Anti-SQLi, Anti-Prototype Pollution)
 * 3. Replay Attack & Anti-Tamper Check
 */

// Patterns to detect in body/query/headers
const SQL_INJECTION_REGEX = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|EXEC|TRUNCATE)\b\s+.*?(FROM|INTO|TABLE|DATABASE|WHERE|SET)|--|\/\*|\*\/|;\s*SHUTDOWN|;\s*DROP)/i;
const XSS_PATTERNS = /(<script\b[^>]*>([\s\S]*?)<\/script>|javascript:\s*|onload\s*=|onerror\s*=|document\.cookie|window\.location|<iframe\b|<embed\b)/i;

/**
 * Recursive sanitizer to strip prototype pollution keys and dangerous tokens
 */
function sanitizeObject(obj: any): any {
  if (obj === null || typeof obj !== "object") {
    if (typeof obj === "string") {
      // Check for illegal null bytes
      return obj.replace(/\0/g, "");
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitized: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    // Prevent Prototype Pollution (__proto__, constructor, prototype)
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      continue;
    }
    sanitized[key] = sanitizeObject(obj[key]);
  }
  return sanitized;
}

/**
 * 1. Enterprise Security Headers
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Masquer les empreintes du serveur
  res.removeHeader("X-Powered-By");
  res.removeHeader("Server");

  // Empêcher l'inférence de type MIME (Anti-sniffing)
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Protection contre le clickjacking & framing
  res.setHeader("X-Frame-Options", "SAMEORIGIN");

  // Forcer la navigation sécurisée HTTPS
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  // Protection XSS standard
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Politique de référent stricte
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions Policy (Désactivation des capteurs non requis)
  res.setHeader("Permissions-Policy", "accelerometer=(), camera=(self), microphone=(), geolocation=(self)");

  // Cross-Origin Isolation
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
  res.setHeader("X-DNS-Prefetch-Control", "off");

  next();
};

/**
 * 2. Deep Payload Sanitization & Threat Interceptor
 */
export const payloadSanitizer = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Sanitize query params
    if (req.query) {
      req.query = sanitizeObject(req.query);
    }

    // Sanitize request body
    if (req.body && typeof req.body === "object") {
      const rawStringBody = JSON.stringify(req.body);

      // Check for XSS vectors
      if (XSS_PATTERNS.test(rawStringBody)) {
        res.status(400).json({
          success: false,
          error: {
            code: "POTENTIAL_XSS_ATTACK_DETECTED",
            message: "Rejet de la requête : signature XSS détectée par le bouclier WAF."
          }
        });
        return;
      }

      // Check for raw SQL injection attempts on critical unparameterized fields
      if (SQL_INJECTION_REGEX.test(rawStringBody) && !req.path.includes("/ai/analyze")) {
        res.status(400).json({
          success: false,
          error: {
            code: "POTENTIAL_SQL_INJECTION_DETECTED",
            message: "Rejet de la requête : signature SQLi détectée par le pare-feu applicatif."
          }
        });
        return;
      }

      req.body = sanitizeObject(req.body);
    }

    next();
  } catch (err) {
    next(err);
  }
};

/**
 * 3. Anti-Replay & Timestamp Validator
 * Vérifie que la requête ne dépasse pas une fenêtre temporelle de 5 minutes pour les mutations critiques.
 */
export const antiReplayGuard = (req: Request, res: Response, next: NextFunction) => {
  const reqTimestamp = req.headers["x-request-timestamp"];
  if (reqTimestamp && (req.method === "POST" || req.method === "PUT" || req.method === "DELETE")) {
    const timestampNum = Number(reqTimestamp);
    if (!isNaN(timestampNum)) {
      const now = Date.now();
      const diffMs = Math.abs(now - timestampNum);
      if (diffMs > 5 * 60 * 1000) { // 5 minutes max tolerance
        res.status(403).json({
          success: false,
          error: {
            code: "REPLAY_ATTACK_DETECTED",
            message: "Horodatage de requête expiré ou désynchronisé (Anti-Replay Protection)."
          }
        });
        return;
      }
    }
  }
  next();
};

// ─── Zero-Trust: secureRoute() ───────────────────────────────────────────────────

/**
 * Middleware Zero-Trust: Authentication + RBAC en une seule passe.
 *
 * Combine les deux vérifications du principe "Never Trust, Always Verify" :
 * 1. IDENTITÉ   — Valide le JWT Bearer avec verifyAccessToken() (HS256, expiry)
 * 2. AUTORISATION — Vérifie le rôle via ZeroTrustService.authorize() (RBAC stateless)
 *
 * Injecte req.user avec le payload JWT complet pour les controllers en aval.
 *
 * @param allowedRoles Tableau de rôles autorisés (ex: ["admin", "operator"])
 *
 * @example
 * // Seuls les admins peuvent créer un asset
 * app.post('/api/v1/assets', secureRoute(["admin"]), createAsset);
 *
 * // Tout rôle authentifié peut lire ses assets
 * app.get('/api/v1/assets',  secureRoute(["admin", "operator", "auditor", "viewer"]), getAssets);
 */
export const secureRoute = (allowedRoles: string[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // —— 1. Extraction du token Bearer
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Jeton d'accès manquant ou format invalide (Bearer token attendu)."
          }
        });
        return;
      }

      const token = authHeader.split(" ")[1];

      // —— 2. Vérification d'identité (JWT Pilier 1)
      const decoded = verifyAccessToken(token);

      // —— 3. Injection du contexte dans la requête pour les services en aval
      req.user = decoded;

      // —— 4. Contrôle RBAC (Pilier 2 — stateless, sans DB)
      ZeroTrustService.authorize(decoded.role, allowedRoles);

      next();
    } catch (error: any) {
      const isAuthError = error.name === "TokenExpiredError" || error.name === "JsonWebTokenError";
      const isRbacError = error.code === "RBAC_INSUFFICIENT_ROLE";

      res.status(isAuthError ? 401 : 403).json({
        success: false,
        error: {
          code: isAuthError
            ? (error.name === "TokenExpiredError" ? "TOKEN_EXPIRED" : "INVALID_TOKEN")
            : isRbacError
              ? "INSUFFICIENT_ROLE"
              : "SECURITY_BREACH",
          message: error.message,
          ...(isRbacError && { hint: `Rôles autorisés : [${allowedRoles.join(", ")}]` })
        }
      });
    }
  };
};

