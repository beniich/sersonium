import { Response, NextFunction } from "express";
import { verifyAccessToken } from "../config/jwt.js";
import { AuthenticatedRequest, RoleType, PermissionType } from "../types/auth.js";

/**
 * Role to Permissions mapping matrix
 */
export const ROLE_PERMISSIONS: Record<RoleType, PermissionType[]> = {
  admin: [
    "infra:read",
    "infra:write",
    "infra:control",
    "infra:delete",
    "workorder:read",
    "workorder:execute",
    "workorder:create",
    "parts:read",
    "parts:consume",
    "parts:manage",
    "audit:read",
    "security:manage",
    "tenant:admin"
  ],
  operator: [
    "infra:read",
    "infra:write",
    "infra:control",
    "workorder:read",
    "workorder:create",
    "parts:read",
    "parts:manage",
    "audit:read"
  ],
  technician: [
    "infra:read",
    "workorder:read",
    "workorder:execute",
    "parts:read",
    "parts:consume"
  ],
  auditor: [
    "infra:read",
    "workorder:read",
    "parts:read",
    "audit:read"
  ],
  viewer: [
    "infra:read",
    "workorder:read",
    "parts:read"
  ]
};

/**
 * Helper to check if a user has a specific permission
 */
export function hasPermission(role: RoleType, permission: PermissionType): boolean {
  const rolePerms = ROLE_PERMISSIONS[role] || [];
  return rolePerms.includes(permission);
}

/**
 * Authentication Middleware (Validates JWT Bearer token)
 */
export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ") 
    ? authHeader.split(" ")[1] 
    : null;

  if (!token) {
    res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Jeton d'accès manquant ou format invalide (Bearer token attendu)."
      }
    });
    return;
  }

  try {
    const decoded = verifyAccessToken(token);
    // Enrich with permissions based on role
    const assignedPermissions = decoded.permissions || ROLE_PERMISSIONS[decoded.role as RoleType] || [];
    req.user = {
      ...decoded,
      permissions: assignedPermissions
    };
    next();
  } catch (err: any) {
    const isExpired = err.name === "TokenExpiredError";
    res.status(401).json({
      success: false,
      error: {
        code: isExpired ? "TOKEN_EXPIRED" : "INVALID_TOKEN",
        message: isExpired
          ? "Le jeton d'accès a expiré. Veuillez utiliser le Refresh Token."
          : "Jeton d'accès invalide ou corrompu."
      }
    });
    return;
  }
};

/**
 * Role-Based Access Control (RBAC) - Coarse Grained
 */
export const requireRole = (...allowedRoles: RoleType[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authentification requise." }
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: "INSUFFICIENT_ROLE",
          message: `Accès refusé. Rôles requis : [${allowedRoles.join(", ")}]. Votre rôle : ${req.user.role}`
        }
      });
      return;
    }

    next();
  };
};

/**
 * Fine-Grained Permission Access Control
 */
export const requirePermission = (...requiredPermissions: PermissionType[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authentification requise." }
      });
      return;
    }

    const userPerms = req.user.permissions || ROLE_PERMISSIONS[req.user.role] || [];
    const hasAll = requiredPermissions.every(perm => userPerms.includes(perm));

    if (!hasAll) {
      res.status(403).json({
        success: false,
        error: {
          code: "INSUFFICIENT_PERMISSIONS",
          message: `Permissions insuffisantes. Requis : [${requiredPermissions.join(", ")}]. Rôle actuel : ${req.user.role}`
        }
      });
      return;
    }

    next();
  };
};
