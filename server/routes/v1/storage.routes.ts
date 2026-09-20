import { Router } from "express";
import { 
  getUploadUrl, 
  getFiles, 
  deleteFile 
} from "../../controllers/storage.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { requireTenant } from "../../middlewares/tenant.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { getUploadUrlSchema } from "../../schemas/storage.schema.js";

const router = Router();

router.use(authenticateToken, requireTenant);

// Obtention d'une URL signée pour upload direct S3/R2
router.post("/upload-url", validateRequest({ body: getUploadUrlSchema }), getUploadUrl);

// Liste des fichiers du tenant
router.get("/files", getFiles);

// Suppression de métadonnées de fichier
router.delete("/files/:id", deleteFile);

export default router;
