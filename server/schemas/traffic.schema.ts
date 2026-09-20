import { z } from "zod";

export const recordTrafficLogSchema = z.object({
  nodeId: z.string().min(1, "L'identifiant du point de présence Edge (nodeId) est requis."),
  region: z.string().default("eu-west-3"),
  bytesTransferred: z.number().positive("Les octets transférés doivent être une valeur positive."),
  latencyMs: z.number().nonnegative("La latence doit être positive ou nulle."),
  statusCode: z.number().int().min(100).max(599).default(200)
});

export const bandwidthQuerySchema = z.object({
  hours: z.coerce.number().min(1).max(720).default(24),
  nodeId: z.string().optional()
});
