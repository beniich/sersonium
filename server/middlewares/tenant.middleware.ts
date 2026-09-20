import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/auth.js";
import { getTenantPrisma } from "../db/tenantPrisma.js";

/**
 * Tenant Isolation Middleware (Troisième maillon de la chaîne)
 * - Garantit l'étanchéité absolue entre organisations (SaaS Multi-Tenant)
 * - Empêche les attaques de type "Tenant Spoofing" ou "Tenant Leak"
 * - Injecte `req.tenantId` validé pour les couches services / Prisma
 * - Instancie automatiquement le client Prisma étendu avec isolation stricte : `req.tenantPrisma`
 */
export const requireTenant = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  // L'utilisateur doit avoir été authentifié au préalable
  if (!req.user || !req.user.tenantId) {
    res.status(403).json({
      success: false,
      error: {
        code: "MISSING_TENANT_CONTEXT",
        message: "Contexte d'organisation/tenant manquant dans l'identité de l'utilisateur."
      }
    });
    return;
  }

  const tokenTenantId = req.user.tenantId;
  const headerTenantId = req.headers["x-tenant-id"] as string | undefined;

  // Si un en-tête x-tenant-id est spécifié, il DOIT concorder avec le token de l'utilisateur
  // (sauf rôle super-administrateur d'infrastructure)
  if (headerTenantId && headerTenantId !== tokenTenantId && req.user.role !== "admin") {
    res.status(403).json({
      success: false,
      error: {
        code: "TENANT_MISMATCH_SECURITY_VIOLATION",
        message: "Violation de sécurité : tentative d'accès à un tenant non autorisé."
      }
    });
    return;
  }

  // Affectation sécurisée du tenantId validé
  const validatedTenantId = (req.user.role === "admin" && headerTenantId) ? headerTenantId : tokenTenantId;
  req.tenantId = validatedTenantId;

  // Injection du client Prisma hermétique à ce tenant
  req.tenantPrisma = getTenantPrisma(validatedTenantId);

  // Exposition de l'en-tête de réponse confirmant le tenant isolé
  res.setHeader("X-Tenant-Context", req.tenantId);

  next();
};

