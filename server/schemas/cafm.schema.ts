import { z } from "zod";

export const recordTelemetrySchema = z.object({
  assetId: z.string().min(1, "L'identifiant de l'équipement (assetId) est requis."),
  temperatureC: z.number().min(-20).max(120, "Température hors plage réaliste (-20°C à 120°C)."),
  vibrationMmS: z.number().min(0).max(50, "Vibration hors plage (0 à 50 mm/s)."),
  powerKw: z.number().positive("La puissance active (kW) doit être positive."),
  pueScore: z.number().min(1.0).max(5.0).default(1.15),
  status: z.enum(["nominal", "warning", "critical"]).default("nominal")
});

export const predictFailureQuerySchema = z.object({
  windowSize: z.coerce.number().int().min(5).max(500).default(50)
});
