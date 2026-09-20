import { Router } from "express";
import { authenticateToken, requirePermission, requireRole } from "../../middlewares/auth.middleware.js";
import { requireTenant } from "../../middlewares/tenant.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { createCrudService } from "../../services/crudFactory.js";
import { createCrudController } from "../../controllers/crudFactory.controller.js";
import { createAssetSchema, updateAssetSchema } from "../../schemas/asset.schema.js";
import { idParamSchema } from "../../schemas/common.schema.js";

const router = Router();

// Chaîne défensive : Auth Token -> Tenant Isolation
router.use(authenticateToken);
router.use(requireTenant);

// Instanciation directe de la fabrique CRUD pour le modèle InfrastructureAsset
const assetService = createCrudService("infrastructureAsset");
const assetController = createCrudController(assetService, "Équipement Infrastructure");

// Routes CRUD avec RBAC granulaire (Permissions)
router.get(
  "/", 
  requirePermission("infra:read"),
  assetController.getAll
);

router.get(
  "/:id", 
  requirePermission("infra:read"),
  validateRequest({ params: idParamSchema }), 
  assetController.getById
);

router.post(
  "/",
  requirePermission("infra:write"),
  validateRequest({ body: createAssetSchema }),
  assetController.create
);

router.patch(
  "/:id",
  requirePermission("infra:write"),
  validateRequest({ params: idParamSchema, body: updateAssetSchema }),
  assetController.update
);

router.delete(
  "/:id",
  requirePermission("infra:delete"),
  validateRequest({ params: idParamSchema }),
  assetController.delete
);

export default router;
