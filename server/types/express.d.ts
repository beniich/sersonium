/**
 * Express global type augmentation for SENSORIUM backend.
 * Extends the Express Request object with Sensorium-specific middleware properties:
 * - req.user       : decoded JWT payload (set by authenticate middleware)
 * - req.tenantId   : resolved tenant identifier (set by tenantPrisma middleware)
 * - req.tenantPrisma : scoped Prisma client with auto-injected tenantId (set by tenantPrisma middleware)
 */

import { UserPayload } from "./auth.js";
import { PrismaClient } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      /** Decoded JWT payload — present on authenticated routes. */
      user?: UserPayload;
      /** Active tenant identifier resolved from JWT or header. */
      tenantId?: string;
      /** Prisma client scoped to the current tenant (auto-injects tenantId). */
      tenantPrisma?: PrismaClient;
    }
  }
}

export {};

