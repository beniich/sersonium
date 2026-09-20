import { Response } from "express";
import { AuthenticatedRequest } from "../types/auth.js";
import { createCrudService } from "../services/crudFactory.js";

/**
 * Fabrique générique de contrôleurs REST (CRUD)
 * Dérive automatiquement les handlers HTTP pour une ressource donnée.
 */
export function createCrudController(
  service: ReturnType<typeof createCrudService>,
  resourceName: string
) {
  return {
    /**
     * GET / - Liste paginée
     */
    async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
      try {
        const tenantPrisma = req.tenantPrisma!;
        const { page, limit, sortBy, sortOrder, ...customFilters } = req.query as any;

        const result = await service.findAll(tenantPrisma, {
          page: page ? Number(page) : 1,
          limit: limit ? Number(limit) : 20,
          sortBy,
          sortOrder,
          where: Object.keys(customFilters).length > 0 ? customFilters : undefined
        });

        res.status(200).json({
          success: true,
          data: result.items,
          pagination: result.pagination,
          meta: {
            tenantId: req.tenantId,
            resource: resourceName
          }
        });
      } catch (error: any) {
        res.status(500).json({
          success: false,
          error: {
            code: "FETCH_FAILED",
            message: `Impossible de récupérer les ressources ${resourceName}: ${error.message}`
          }
        });
      }
    },

    /**
     * GET /:id - Détail par identifiant
     */
    async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
      try {
        const tenantPrisma = req.tenantPrisma!;
        const { id } = req.params;

        const item = await service.findById(tenantPrisma, id);
        if (!item) {
          res.status(404).json({
            success: false,
            error: {
              code: "NOT_FOUND",
              message: `${resourceName} introuvable ou n'appartenant pas à votre organisation.`
            }
          });
          return;
        }

        res.status(200).json({
          success: true,
          data: item,
          meta: { tenantId: req.tenantId }
        });
      } catch (error: any) {
        res.status(500).json({
          success: false,
          error: {
            code: "FETCH_FAILED",
            message: `Erreur lors de la récupération de ${resourceName}: ${error.message}`
          }
        });
      }
    },

    /**
     * POST / - Création d'une nouvelle ressource
     */
    async create(req: AuthenticatedRequest, res: Response): Promise<void> {
      try {
        const tenantPrisma = req.tenantPrisma!;
        // req.body a déjà été validé et assaini par le middleware Zod
        const created = await service.create(tenantPrisma, req.body);

        res.status(201).json({
          success: true,
          data: created,
          meta: {
            tenantId: req.tenantId,
            resource: resourceName
          }
        });
      } catch (error: any) {
        res.status(500).json({
          success: false,
          error: {
            code: "CREATE_FAILED",
            message: `Erreur lors de la création de ${resourceName}: ${error.message}`
          }
        });
      }
    },

    /**
     * PUT/PATCH /:id - Mise à jour d'une ressource
     */
    async update(req: AuthenticatedRequest, res: Response): Promise<void> {
      try {
        const tenantPrisma = req.tenantPrisma!;
        const { id } = req.params;

        const updated = await service.update(tenantPrisma, id, req.body);
        if (!updated) {
          res.status(404).json({
            success: false,
            error: {
              code: "NOT_FOUND",
              message: `${resourceName} introuvable ou n'appartenant pas à votre organisation.`
            }
          });
          return;
        }

        res.status(200).json({
          success: true,
          data: updated,
          meta: { tenantId: req.tenantId }
        });
      } catch (error: any) {
        res.status(500).json({
          success: false,
          error: {
            code: "UPDATE_FAILED",
            message: `Erreur lors de la mise à jour de ${resourceName}: ${error.message}`
          }
        });
      }
    },

    /**
     * DELETE /:id - Suppression d'une ressource
     */
    async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
      try {
        const tenantPrisma = req.tenantPrisma!;
        const { id } = req.params;

        const deleted = await service.delete(tenantPrisma, id);
        if (!deleted) {
          res.status(404).json({
            success: false,
            error: {
              code: "NOT_FOUND",
              message: `${resourceName} introuvable ou n'appartenant pas à votre organisation.`
            }
          });
          return;
        }

        res.status(200).json({
          success: true,
          message: `${resourceName} supprimé avec succès.`
        });
      } catch (error: any) {
        res.status(500).json({
          success: false,
          error: {
            code: "DELETE_FAILED",
            message: `Erreur lors de la suppression de ${resourceName}: ${error.message}`
          }
        });
      }
    }
  };
}
