import { Request, Response } from "express";
import { rawPrisma as prisma } from "../db/prisma.js";
import { strategyService } from "../services/strategy.service.js";

export const getExecutiveDashboard = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user?.tenantId || "default-tenant";

    const objectives = await prisma.strategicObjective.findMany({
      where: { tenantId },
      include: {
        kpis: {
          include: {
            history: {
              orderBy: { timestamp: "desc" },
              take: 10
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const enrichedObjectives = await Promise.all(
      objectives.map(async (obj) => {
        const progress = await strategyService.getObjectiveProgress(obj.id);
        return { ...obj, progress };
      })
    );

    res.json({ objectives: enrichedObjectives });
  } catch (error) {
    console.error("Error fetching strategy dashboard:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createObjective = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user?.tenantId || "default-tenant";
    const { title, description, period, priority, status } = req.body;

    const objective = await prisma.strategicObjective.create({
      data: {
        tenantId,
        title,
        description,
        period,
        priority: priority || 3,
        status: status || "Active"
      }
    });

    res.status(201).json(objective);
  } catch (error) {
    console.error("Error creating objective:", error);
    res.status(500).json({ error: "Failed to create objective" });
  }
};

export const triggerSync = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user?.tenantId || "default-tenant";
    const syncedCount = await strategyService.syncAutomatedKpis(tenantId);
    res.json({ message: `Successfully synchronized ${syncedCount} automated KPIs` });
  } catch (error) {
    console.error("Error triggering KPI sync:", error);
    res.status(500).json({ error: "Failed to sync KPIs" });
  }
};
