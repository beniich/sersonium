import { Request, Response } from "express";
import { MasterControlService } from "../services/masterControl.service.js";

/**
 * Contrôleur du Master Control Panel (Tableau de Bord Exécutif CEO/CTO)
 */
export async function getMasterControlStatus(req: Request, res: Response): Promise<void> {
  try {
    const data = await MasterControlService.getGlobalStatus();
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("[MasterControl] Error generating global status:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "MASTER_CONTROL_FAILED",
        message: error.message || "Failed to retrieve Master Control status",
      },
    });
  }
}
