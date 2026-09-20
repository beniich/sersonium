import { z } from "zod";

export const createAccessPolicySchema = z.object({
  userId: z.string().optional(), // Si null/undefined, s'applique à tous les utilisateurs du tenant
  resourceId: z.string().min(1, "L'identifiant de ressource ou wildcard ('*') est requis."),
  action: z.enum(["read", "write", "admin", "*"]),
  allowed: z.boolean().default(true),
  description: z.string().max(255).optional()
});

export const evaluateAccessSchema = z.object({
  resourceId: z.string().min(1, "La ressource cible à évaluer est requise."),
  action: z.enum(["read", "write", "admin", "*"]).default("read"),
  targetUserId: z.string().optional()
});
