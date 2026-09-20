import { z } from "zod";

export const consumeTokensSchema = z.object({
  amount: z.number().int().positive("Le montant de jetons à déduire doit être un entier strictement positif."),
  reason: z.string().min(2, "La raison de consommation est requise (ex: 'AI_INFERENCE', 'REPORT_GENERATION').").optional()
});

export const creditTokensSchema = z.object({
  amount: z.number().int().positive("Le montant de jetons à créditer doit être un entier strictement positif."),
  description: z.string().min(3, "La description de l'achat ou recharge est requise."),
  amountEur: z.number().positive("Le montant en euros doit être strictement supérieur à zéro.")
});

export const createInvoiceSchema = z.object({
  amount: z.number().positive("Le montant de la facture doit être positif."),
  currency: z.string().default("EUR"),
  description: z.string().min(3, "La description de la facture est requise."),
  tokenCredits: z.number().int().nonnegative().default(0)
});
