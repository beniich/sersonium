import { Router } from "express";
import { 
  getUploadUrl, 
  getDownloadUrl,
  getFiles, 
  deleteFile,
  listBuckets,
  createBucket,
  deleteBucket
} from "../../controllers/storage.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { requireTenant } from "../../middlewares/tenant.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { getUploadUrlSchema } from "../../schemas/storage.schema.js";

const router = Router();

router.use(authenticateToken, requireTenant);

// Buckets MinIO (liste, création, suppression)
router.get("/buckets", listBuckets);
router.post("/buckets", createBucket);
router.delete("/buckets/:bucketName", deleteBucket);

// Obtention d'une URL signée pour upload direct MinIO / S3
router.post("/upload-url", validateRequest({ body: getUploadUrlSchema }), getUploadUrl);

// Téléchargement sécurisé pré-signé MinIO
router.get("/files/:id/download-url", getDownloadUrl);

// Liste des fichiers du tenant
router.get("/files", getFiles);

// Suppression de métadonnées de fichier et objet MinIO
router.delete("/files/:id", deleteFile);

export default router;
