import { Response } from "express";
import { AuthenticatedRequest } from "../types/auth.js";
import { TrafficService } from "../services/traffic.service.js";

/**
 * Contrôleur Trafic Global & Edge Network (Sprint 3: Traffic & Edge)
 */
export const recordTrafficLog = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantPrisma = req.tenantPrisma!;
    const entry = await TrafficService.recordTrafficLog(tenantPrisma, req.body);

    res.status(201).json({
      success: true,
      data: entry,
      meta: { tenantId: req.tenantId }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "TRAFFIC_RECORD_FAILED", message: error.message }
    });
  }
};

export const getBandwidthUsage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantPrisma = req.tenantPrisma!;
    const hours = req.query.hours ? Number(req.query.hours) : 24;
    const nodeId = req.query.nodeId ? String(req.query.nodeId) : undefined;

    const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);
    const usage = await TrafficService.getBandwidthUsage(tenantPrisma, { start: startDate }, nodeId);

    res.status(200).json({
      success: true,
      data: usage,
      meta: { tenantId: req.tenantId }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "BANDWIDTH_USAGE_FAILED", message: error.message }
    });
  }
};
