import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "L'adresse email est requise.")
    .email("Format d'adresse email invalide.")
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(6, "Le mot de passe doit comporter au moins 6 caractères.")
    .max(128, "Le mot de passe ne peut dépasser 128 caractères.")
});

export type LoginInput = z.infer<typeof loginSchema>;
