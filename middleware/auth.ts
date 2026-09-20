import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || "jeton_access_super_secret_key_2026_dev";

/**
 * Supported User Roles & Normalized casing
 */
export type Role = "Viewer" | "Technician" | "Admin" | "Operator" | "Auditor" | "viewer" | "technician" | "admin" | "operator" | "auditor";

/**
 * Standard Granular Permissions
 */
export type Permission =
  | "infra:read"
  | "infra:write"
  | "infra:control"
  | "infra:delete"
  | "workorder:read"
  | "workorder:execute"
  | "workorder:create"
  | "parts:read"
  | "parts:consume"
  | "parts:manage"
  | "audit:read"
  | "security:manage"
  | "tenant:admin";

/**
 * JWT Claims Payload Interface
 */
export interface AuthJwtClaims {
  userId: string;
  email: string;
  role: Role;
  tenantId?: string;
  organizationName?: string;
  permissions?: Permission[];
  jti?: string;
  iat?: number;
  exp?: number;
}

/**
 * Extended Express Request with Authenticated User Context
 */
export interface AuthenticatedUserRequest extends Request {
  user?: AuthJwtClaims;
}

/**
 * Hierarchical Role Permissions Mapping
 */
export const ROLE_HIERARCHY_PERMISSIONS: Record<string, Permission[]> = {
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
 * Normalize role string to lowercase standard
 */
export function normalizeRole(role?: string): string {
  if (!role) return "viewer";
  return role.toLowerCase();
}

/**
 * Helper function: Verify if JWT claims indicate Viewer role (or higher)
 */
export function isViewer(claims?: AuthJwtClaims | null): boolean {
  if (!claims || !claims.role) return false;
  const role = normalizeRole(claims.role);
  return ["viewer", "technician", "operator", "auditor", "admin"].includes(role);
}

/**
 * Helper function: Verify if JWT claims indicate Technician role (or higher)
 */
export function isTechnician(claims?: AuthJwtClaims | null): boolean {
  if (!claims || !claims.role) return false;
  const role = normalizeRole(claims.role);
  return ["technician", "operator", "admin"].includes(role);
}

/**
 * Helper function: Verify if JWT claims indicate Admin role
 */
export function isAdmin(claims?: AuthJwtClaims | null): boolean {
  if (!claims || !claims.role) return false;
  const role = normalizeRole(claims.role);
  return role === "admin";
}

/**
 * Helper function: Check whether JWT claims satisfy a specific permission
 */
export function hasClaimPermission(claims: AuthJwtClaims | undefined, permission: Permission): boolean {
  if (!claims) return false;
  const normalized = normalizeRole(claims.role);
  
  // Custom explicit claims take precedence, otherwise fallback to role hierarchy matrix
  const permissions = claims.permissions || ROLE_HIERARCHY_PERMISSIONS[normalized] || [];
  return permissions.includes(permission);
}

/**
 * Middleware: Verify and extract JWT claims from Authorization Bearer header
 */
export const authenticateJwt = (
  req: AuthenticatedUserRequest,
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
        message: "Jeton d'authentification Bearer manquant."
      }
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as AuthJwtClaims;
    const normalizedRole = normalizeRole(decoded.role);
    const assignedPermissions = decoded.permissions || ROLE_HIERARCHY_PERMISSIONS[normalizedRole] || [];

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
          ? "Le jeton JWT a expiré."
          : "Jeton JWT invalide ou signature corrompue."
      }
    });
    return;
  }
};

/**
 * RBAC Middleware: Enforce minimum required roles
 * Example usage: requireRole('Admin') or requireRole('Technician', 'Admin')
 */
export const requireRole = (...allowedRoles: Role[]) => {
  const normalizedAllowed = allowedRoles.map(r => normalizeRole(r));

  return (req: AuthenticatedUserRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentification requise pour cette ressource."
        }
      });
      return;
    }

    const userRole = normalizeRole(req.user.role);

    if (!normalizedAllowed.includes(userRole)) {
      res.status(403).json({
        success: false,
        error: {
          code: "INSUFFICIENT_ROLE_PRIVILEGES",
          message: `Accès interdit. Rôle(s) autorisé(s) : [${allowedRoles.join(", ")}]. Rôle actuel : ${req.user.role}`
        }
      });
      return;
    }

    next();
  };
};

/**
 * RBAC Middleware: Enforce Viewer permission or higher
 */
export const requireViewer = (req: AuthenticatedUserRequest, res: Response, next: NextFunction): void => {
  if (!req.user || !isViewer(req.user)) {
    res.status(403).json({
      success: false,
      error: {
        code: "VIEWER_PERMISSION_REQUIRED",
        message: "Accès en lecture seule (Viewer) requis."
      }
    });
    return;
  }
  next();
};

/**
 * RBAC Middleware: Enforce Technician permission or higher
 */
export const requireTechnician = (req: AuthenticatedUserRequest, res: Response, next: NextFunction): void => {
  if (!req.user || !isTechnician(req.user)) {
    res.status(403).json({
      success: false,
      error: {
        code: "TECHNICIAN_PERMISSION_REQUIRED",
        message: "Privilèges Technicien ou supérieur requis pour cette action."
      }
    });
    return;
  }
  next();
};

/**
 * RBAC Middleware: Enforce Admin permission
 */
export const requireAdmin = (req: AuthenticatedUserRequest, res: Response, next: NextFunction): void => {
  if (!req.user || !isAdmin(req.user)) {
    res.status(403).json({
      success: false,
      error: {
        code: "ADMIN_PERMISSION_REQUIRED",
        message: "Privilèges Administrateur requis pour cette opération critique."
      }
    });
    return;
  }
  next();
};

/**
 * RBAC Middleware: Enforce fine-grained individual permissions
 * Example usage: requirePermission('workorder:execute')
 */
export const requirePermission = (...requiredPermissions: Permission[]) => {
  return (req: AuthenticatedUserRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentification requise."
        }
      });
      return;
    }

    const hasAllPermissions = requiredPermissions.every(perm =>
      hasClaimPermission(req.user, perm)
    );

    if (!hasAllPermissions) {
      res.status(403).json({
        success: false,
        error: {
          code: "INSUFFICIENT_PERMISSIONS",
          message: `Permissions manquantes : [${requiredPermissions.join(", ")}]. Action refusée.`
        }
      });
      return;
    }

    next();
  };
};

export default {
  authenticateJwt,
  requireRole,
  requireViewer,
  requireTechnician,
  requireAdmin,
  requirePermission,
  isViewer,
  isTechnician,
  isAdmin,
  hasClaimPermission
};
