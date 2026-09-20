import { Request, Response, NextFunction } from "express";

export { 
  securityHeaders, 
  payloadSanitizer, 
  antiReplayGuard 
} from "./security.middleware.js";
export { 
  authenticateToken, 
  requireRole, 
  requirePermission,
  ROLE_PERMISSIONS,
  hasPermission
} from "./auth.middleware.js";
export { requireTenant } from "./tenant.middleware.js";
export { auditMiddleware } from "./audit.middleware.js";
export { 
  apiRateLimiter, 
  strictRateLimiter, 
  telemetryRateLimiter, 
  createRateLimiter 
} from "./rateLimit.middleware.js";
export { csrfProtection, generateCsrfToken, verifyCsrfToken } from "./csrf.middleware.js";
export { validateRequest } from "./validate.middleware.js";

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[API-SHIELD] ${req.method} ${req.originalUrl} [${res.statusCode}] - ${duration}ms`);
  });
  next();
};

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("[API Shield Error]", err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({
    success: false,
    error: {
      message,
      code: err.code || status,
      timestamp: new Date().toISOString()
    }
  });
};
