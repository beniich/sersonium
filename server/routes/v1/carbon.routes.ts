import { Router } from "express";
import { 
  getCarbonEmissions, 
  getCarbonEmissionById,
  getCarbonMetrics, 
  createCarbonEmission, 
  updateCarbonEmission,
  deleteCarbonEmission 
} from "../../controllers/carbon.controller.js";
import { authenticateToken, requireRole } from "../../middlewares/auth.middleware.js";
import { requireTenant } from "../../middlewares/tenant.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { 
  createCarbonEmissionSchema, 
  updateCarbonEmissionSchema, 
  queryCarbonEmissionSchema 
} from "../../schemas/carbon.schema.js";
import { idParamSchema } from "../../schemas/common.schema.js";

const router = Router();

// Chaîne défensive obligatoire : Auth Token -> Tenant Isolation
router.use(authenticateToken);
router.use(requireTenant);

// Endpoints analytiques et lecture
router.get("/metrics", getCarbonMetrics);
router.get("/emissions", validateRequest({ query: queryCarbonEmissionSchema }), getCarbonEmissions);
router.get("/emissions/:id", validateRequest({ params: idParamSchema }), getCarbonEmissionById);

// Mutations sécurisées (Validation Zod + RBAC)
router.post(
  "/emissions",
  requireRole("admin", "operator"),
  validateRequest({ body: createCarbonEmissionSchema }),
  createCarbonEmission
);

router.patch(
  "/emissions/:id",
  requireRole("admin", "operator"),
  validateRequest({ params: idParamSchema, body: updateCarbonEmissionSchema }),
  updateCarbonEmission
);

router.delete(
  "/emissions/:id",
  requireRole("admin", "operator"),
  validateRequest({ params: idParamSchema }),
  deleteCarbonEmission
);

export default router;
