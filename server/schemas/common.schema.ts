import { z } from "zod";

/**
 * Common Zod Schemas for clean sanitization and parameter parsing
 */

export const idParamSchema = z.object({
  id: z.string().min(1, "L'identifiant est requis").trim()
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().optional(),
  sortBy: z.string().trim().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc")
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type IdParam = z.infer<typeof idParamSchema>;
