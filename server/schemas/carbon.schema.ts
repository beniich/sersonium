import { z } from "zod";

export const createCarbonEmissionSchema = z.object({
  title: z
    .string()
    .min(3, "Le titre doit comporter au moins 3 caractères.")
    .max(255, "Le titre ne doit pas dépasser 255 caractères.")
    .trim(),
  scope: z
    .coerce
    .number()
    .int()
    .refine((val) => [1, 2, 3].includes(val), {
      message: "Le scope doit être obligatoirement 1 (Direct), 2 (Énergie indirecte) ou 3 (Chaîne de valeur)."
    }),
  category: z
    .string()
    .min(2, "La catégorie doit comporter au moins 2 caractères.")
    .trim(),
  co2EquivalentKg: z
    .coerce
    .number()
    .positive("La quantité d'émission doit être une valeur numérique strictement positive."),
  source: z
    .string()
    .trim()
    .default("automated_telemetry"),
  status: z
    .enum(["draft", "verified", "audited"])
    .default("verified"),
  activityDate: z
    .coerce
    .date()
    .optional()
});

export const updateCarbonEmissionSchema = createCarbonEmissionSchema.partial();

export const queryCarbonEmissionSchema = z.object({
  scope: z.coerce.number().int().optional(),
  category: z.string().trim().optional(),
  status: z.enum(["draft", "verified", "audited"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(25)
});

export type CreateCarbonEmissionInput = z.infer<typeof createCarbonEmissionSchema>;
export type UpdateCarbonEmissionInput = z.infer<typeof updateCarbonEmissionSchema>;
export type QueryCarbonEmissionInput = z.infer<typeof queryCarbonEmissionSchema>;
