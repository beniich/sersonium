import { Response } from "express";
import { AuthenticatedRequest } from "../types/auth.js";
import { StorageService } from "../services/storage.service.js";
import { AuditService } from "../services/audit.service.js";

/**
 * Contrôleur Stockage & Buckets R2/S3 (Sprint 2: Storage)
 */
export const getUploadUrl = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantPrisma = req.tenantPrisma!;
    const userId = req.user?.userId;
    const { fileName, mimeType, fileSize, bucket } = req.body;

    const result = await StorageService.getUploadUrl(tenantPrisma, req.tenantId!, {
      fileName,
      mimeType,
      fileSize,
      bucket,
      uploadedBy: userId
    });

    // Audit de génération de lien sécurisé
    AuditService.logEvent(tenantPrisma, userId, {
      action: "STORAGE_UPLOAD_URL_REQUESTED",
      resource: "FileMetadata",
      resourceId: result.fileId,
      details: { fileName, fileSize, bucket: result.bucket },
      ipAddress: (req.headers["x-forwarded-for"] as string)?.split(",")[0] || req.socket.remoteAddress
    }).catch(() => {});

    res.status(200).json({
      success: true,
      data: result,
      meta: { tenantId: req.tenantId }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "UPLOAD_URL_FAILED", message: error.message }
    });
  }
};

export const getFiles = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantPrisma = req.tenantPrisma!;
    const files = await StorageService.getFiles(tenantPrisma);

    res.status(200).json({
      success: true,
      data: files,
      meta: {
        tenantId: req.tenantId,
        count: files.length
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "FILE_LIST_FAILED", message: error.message }
    });
  }
};

export const deleteFile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantPrisma = req.tenantPrisma!;
    const { id } = req.params;

    await StorageService.deleteFile(tenantPrisma, id);

    AuditService.logEvent(tenantPrisma, req.user?.userId, {
      action: "STORAGE_FILE_DELETED",
      resource: "FileMetadata",
      resourceId: id,
      ipAddress: (req.headers["x-forwarded-for"] as string)?.split(",")[0] || req.socket.remoteAddress
    }).catch(() => {});

    res.status(200).json({
      success: true,
      message: "Fichier supprimé de l'index de stockage avec succès."
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "FILE_DELETE_FAILED", message: error.message }
    });
  }
};
