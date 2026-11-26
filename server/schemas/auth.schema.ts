import { z } from "zod";

export const loginSchema = z.union([
  z.object({
    token: z.string().min(1, "Le jeton d'authentification est requis.")
  }),
  z.object({
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
  })
]);

export const registerSchema = z.object({
  name: z.string().min(2, "Le nom doit comporter au moins 2 caractères.").max(100),
  email: z
    .string()
    .min(1, "L'adresse email est requise.")
    .email("Format d'adresse email invalide.")
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(8, "Le mot de passe doit comporter au moins 8 caractères.")
    .max(128, "Le mot de passe ne peut dépasser 128 caractères."),
  organizationName: z
    .string()
    .min(2, "Le nom de l'organisation doit comporter au moins 2 caractères.")
    .max(100)
    .optional(),
  invitationToken: z.string().optional()
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
