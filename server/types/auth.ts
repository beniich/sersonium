import { Request } from "express";
import type { TenantPrismaClient } from "../db/tenantPrisma.js";

export type RoleType = "admin" | "operator" | "technician" | "auditor" | "viewer";

export type SubscriptionTierType = "free" | "silver" | "pro" | "enterprise";

export type PermissionType = 
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

export interface UserPayload {
  userId: string;
  email: string;
  role: RoleType;
  tenantId: string;
  organizationName?: string;
  subscriptionTier?: SubscriptionTierType;
  permissions?: PermissionType[];
}

export interface JWTPayload extends UserPayload {
  tokenVersion?: number;
  jti?: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
  tenantId?: string;
  tenantPrisma?: TenantPrismaClient;
  auditContext?: {
    action: string;
    resource?: string;
    performedAt: string;
  };
}
