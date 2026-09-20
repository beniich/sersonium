import { z } from "zod";

export const analyzeLogsSchema = z.object({
  logs: z.string().min(5, "Les logs ou la télémétrie d'infrastructure à analyser doivent comporter au moins 5 caractères."),
  context: z.string().optional(),
  tokenBudget: z.number().int().positive().default(15)
});
