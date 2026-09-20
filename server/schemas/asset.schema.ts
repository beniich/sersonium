import { z } from "zod";

export const createAssetSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit comporter au moins 2 caractères.")
    .max(120)
    .trim(),
  location: z
    .string()
    .min(2, "La localisation géographique est requise.")
    .trim(),
  type: z
    .string()
    .min(2, "Le type d'équipement est requis.")
    .trim(),
  status: z
    .enum(["healthy", "warning", "critical", "offline"])
    .default("healthy"),
  powerUsageKw: z
    .coerce
    .number()
    .nonnegative("La puissance consommée ne peut pas être négative.")
    .default(0.0),
  pueScore: z
    .coerce
    .number()
    .min(1.0, "Le score PUE minimal théorique est de 1.0.")
    .max(5.0, "Le score PUE ne peut pas dépasser 5.0.")
    .default(1.15),
  renewablePct: z
    .coerce
    .number()
    .min(0, "Le pourcentage d'énergie renouvelable ne peut être inférieur à 0%.")
    .max(100, "Le pourcentage d'énergie renouvelable ne peut dépasser 100%.")
    .default(100.0)
});

export const updateAssetSchema = createAssetSchema.partial();

export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;
