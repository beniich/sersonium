import { Request, Response, NextFunction } from "express";
import { ZodTypeAny, ZodError } from "zod";

export interface ValidationTargets {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

/**
 * Middleware de validation stricte basé sur Zod
 * - Valide et assainit (sanitize & strip unknown) les charges utiles body, query et params
 * - Retourne des erreurs formatées et explicites (champ, règle violée)
 * - Empêche l'injection de données malformées dans les contrôleurs et la base de données
 */
export const validateRequest = (schemas: ValidationTargets) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.params) {
        req.params = (await schemas.params.parseAsync(req.params)) as any;
      }

      if (schemas.query) {
        req.query = (await schemas.query.parseAsync(req.query)) as any;
      }

      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues || (error as any).errors || [];
        const formattedErrors = issues.map((err: any) => ({
          field: err.path?.join(".") || "root",
          code: err.code,
          message: err.message
        }));

        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "La charge utile soumise est invalide ou incomplète.",
            details: formattedErrors
          }
        });
        return;
      }

      next(error);
    }
  };
};
