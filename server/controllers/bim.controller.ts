import { Request, Response } from "express";
import { StorageService } from "../services/storage.service.js";

const storage = new StorageService();

/**
 * Contrôleur d'upload de maquettes BIM / IFC et documents lourds
 * directement dans le Google Drive de l'utilisateur (SENSORIUM_VAULT).
 */
export const uploadBimModel = async (req: Request, res: Response) => {
  try {
    // Récupération de l'access token Google depuis la session / req.user
    const user = (req as any).user;
    const googleToken = user?.googleAccessToken || (req.headers["x-google-token"] as string);

    if (!googleToken) {
      return res.status(401).json({
        error: "Google Drive OAuth token manquant. Veuillez vous authentifier avec le scope drive.file."
      });
    }

    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({ error: "Aucun fichier téléversé (No file uploaded)" });
    }

    const fileName = file.originalname || `BIM_${Date.now()}.ifc`;
    const mimeType = file.mimetype || "application/octet-stream";

    // Téléversement direct dans le SENSORIUM_VAULT du Drive personnel
    const { fileId, url } = await storage.uploadFile(
      googleToken,
      fileName,
      file.buffer,
      mimeType
    );

    return res.status(201).json({
      success: true,
      message: "Modèle BIM stocké avec succès dans votre Google Drive personnel (SENSORIUM_VAULT)",
      fileId,
      viewUrl: url,
      storedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("[BIM Controller Error]:", error?.message || error);
    return res.status(500).json({ error: error.message || "Erreur lors de l'upload BIM" });
  }
};

/**
 * Récupère le lien de consultation d'une maquette BIM ou d'un document
 */
export const getBimFileUrl = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const googleToken = user?.googleAccessToken || (req.headers["x-google-token"] as string);
    const { fileId } = req.params;

    if (!googleToken) {
      return res.status(401).json({ error: "Token Google manquant" });
    }

    const viewUrl = await storage.getFileUrl(googleToken, fileId);
    return res.json({ success: true, viewUrl });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Impossible de récupérer le fichier" });
  }
};
