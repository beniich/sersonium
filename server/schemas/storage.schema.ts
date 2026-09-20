import { z } from "zod";

export const getUploadUrlSchema = z.object({
  fileName: z.string().min(1, "Le nom du fichier est requis."),
  mimeType: z.string().default("application/octet-stream"),
  fileSize: z.number().int().positive("La taille du fichier doit être supérieure à zéro."),
  bucket: z.string().default("beecarbonat-assets")
});
