/**
 * Sensorium Enterprise — Terminal Controller
 * Handles callbacks from physical terminals (Silicium X1 NPU):
 *  - POST /terminal/installation-success  → LLM install completed signal
 *  - POST /terminal/heartbeat             → Weekly subscription validity check
 *  - GET  /terminal/status/:orgId         → Superadmin dashboard status
 */

import { Request, Response } from "express";
import { rawPrisma } from "../db/prisma.js";

// ─── Types ───────────────────────────────────────────────────────────────────

interface InstallationPayload {
  orgId: string;
  terminalSerial: string;
  modelName: string;
  modelSizeGb: number;
  installDurationSeconds: number;
  ollamaVersion: string;
  activationKey: string;
}

interface HeartbeatPayload {
  orgId: string;
  terminalSerial: string;
  activationKey: string;
  uptimeSeconds: number;
  inferenceCount: number;
  modelLoaded: string;
}

// ─── POST /terminal/installation-success ─────────────────────────────────────

/**
 * Called by the physical terminal after LLM + Ollama installation completes.
 * Updates org record and notifies Superadmin dashboard.
 */
export async function reportInstallationSuccess(req: Request, res: Response) {
  try {
    const {
      orgId,
      terminalSerial,
      modelName,
      modelSizeGb,
      installDurationSeconds,
      ollamaVersion,
      activationKey,
    } = req.body as InstallationPayload;

    if (!orgId || !terminalSerial || !activationKey) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: orgId, terminalSerial, activationKey",
      });
    }

    // Verify the activation key exists in audit logs for this org
    const auditEntry = await rawPrisma.auditLog.findFirst({
      where: {
        tenantId: orgId,
        action: "SUBSCRIPTION_WEBHOOK_ACTIVATED",
        details: { contains: activationKey },
      },
    });

    if (!auditEntry) {
      console.warn(`[Terminal] ⚠️ Invalid activation key attempt for org ${orgId} from ${terminalSerial}`);
      return res.status(403).json({
        success: false,
        error: "Invalid activation key or unauthorized terminal",
      });
    }

    // Check that the org is still enterprise tier
    const org = await rawPrisma.organization.findUnique({
      where: { id: orgId },
      select: { plan: true, subscriptionStatus: true, name: true },
    });

    if (!org || org.plan !== "enterprise" || org.subscriptionStatus !== "active") {
      return res.status(403).json({
        success: false,
        error: "Subscription is not active Enterprise tier",
        revoke: true, // Signal to terminal to disable LLM access
      });
    }

    // Log installation success
    await rawPrisma.auditLog.create({
      data: {
        tenantId: orgId,
        action: "TERMINAL_LLM_INSTALLED",
        resource: "Terminal",
        details: JSON.stringify({
          terminalSerial,
          modelName,
          modelSizeGb,
          installDurationSeconds,
          ollamaVersion,
          activationKey,
          installedAt: new Date().toISOString(),
        }),
      },
    });

    console.info(
      `[Terminal] ✅ LLM installed on terminal ${terminalSerial} for org "${org.name}" ` +
      `(${modelName} ${modelSizeGb}GB in ${Math.round(installDurationSeconds / 60)}min)`
    );

    return res.json({
      success: true,
      message: "Installation recorded. Sovereign AI is now operational.",
      orgName: org.name,
      authorized: true,
      serverTime: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[Terminal] Installation report error:", err.message);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

// ─── POST /terminal/heartbeat ────────────────────────────────────────────────

/**
 * Called by the physical terminal on a weekly schedule.
 * Verifies the Enterprise subscription is still active.
 * If not → returns { revoke: true } → terminal disables LLM.
 */
export async function terminalHeartbeat(req: Request, res: Response) {
  try {
    const { orgId, terminalSerial, activationKey, uptimeSeconds, inferenceCount, modelLoaded } =
      req.body as HeartbeatPayload;

    if (!orgId || !activationKey) {
      return res.status(400).json({ success: false, error: "Missing orgId or activationKey" });
    }

    const org = await rawPrisma.organization.findUnique({
      where: { id: orgId },
      select: { plan: true, subscriptionStatus: true, name: true },
    });

    const isActive =
      org?.plan === "enterprise" && org?.subscriptionStatus === "active";

    // Log the heartbeat
    await rawPrisma.auditLog.create({
      data: {
        tenantId: orgId,
        action: isActive ? "TERMINAL_HEARTBEAT_OK" : "TERMINAL_HEARTBEAT_REVOKED",
        resource: "Terminal",
        details: JSON.stringify({
          terminalSerial,
          uptimeSeconds,
          inferenceCount,
          modelLoaded,
          subscriptionStatus: org?.subscriptionStatus,
          plan: org?.plan,
          checkedAt: new Date().toISOString(),
        }),
      },
    });

    if (!isActive) {
      console.warn(
        `[Terminal] 🔴 Heartbeat REVOKED for terminal ${terminalSerial} (org ${orgId}) — ` +
        `plan=${org?.plan}, status=${org?.subscriptionStatus}`
      );
      return res.json({
        success: true,
        authorized: false,
        revoke: true,
        reason: "Enterprise subscription is no longer active",
        serverTime: new Date().toISOString(),
      });
    }

    console.info(`[Terminal] 💚 Heartbeat OK — ${terminalSerial} (${inferenceCount} inferences, uptime ${Math.round(uptimeSeconds / 3600)}h)`);

    return res.json({
      success: true,
      authorized: true,
      revoke: false,
      needsSync: org?.needsSync ?? false,
      nextHeartbeatIn: 604800, // 7 days in seconds
      serverTime: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[Terminal] Heartbeat error:", err.message);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

// ─── GET /terminal/status/:orgId ─────────────────────────────────────────────

/**
 * Superadmin dashboard endpoint — shows terminal installation & heartbeat status per org.
 * Protected by requireRole("admin") in the route definition.
 */
export async function getTerminalStatus(req: Request, res: Response) {
  try {
    const { orgId } = req.params;

    const [installLog, lastHeartbeat, org] = await Promise.all([
      rawPrisma.auditLog.findFirst({
        where: { tenantId: orgId, action: "TERMINAL_LLM_INSTALLED" },
        orderBy: { createdAt: "desc" },
      }),
      rawPrisma.auditLog.findFirst({
        where: {
          tenantId: orgId,
          action: { in: ["TERMINAL_HEARTBEAT_OK", "TERMINAL_HEARTBEAT_REVOKED"] },
        },
        orderBy: { createdAt: "desc" },
      }),
      rawPrisma.organization.findUnique({
        where: { id: orgId },
        select: { name: true, plan: true, subscriptionStatus: true },
      }),
    ]);

    const installDetails = installLog?.details ? JSON.parse(installLog.details as string) : null;
    const heartbeatDetails = lastHeartbeat?.details ? JSON.parse(lastHeartbeat.details as string) : null;

    return res.json({
      success: true,
      org,
      terminal: {
        installed: !!installLog,
        installedAt: installLog?.createdAt ?? null,
        model: installDetails?.modelName ?? null,
        terminalSerial: installDetails?.terminalSerial ?? heartbeatDetails?.terminalSerial ?? null,
        lastHeartbeat: lastHeartbeat?.createdAt ?? null,
        heartbeatStatus: lastHeartbeat?.action ?? "NEVER",
        inferenceCount: heartbeatDetails?.inferenceCount ?? 0,
        uptimeHours: heartbeatDetails?.uptimeSeconds
          ? Math.round(heartbeatDetails.uptimeSeconds / 3600)
          : 0,
      },
    });
  } catch (err: any) {
    console.error("[Terminal] Status fetch error:", err.message);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

// ─── GET/POST /terminal/sync-compliance ──────────────────────────────────────

/**
 * Sovereign Compliance Sync Endpoint.
 * Physical edge terminals download organization compliance records (Certifications, Permits, Insurances)
 * to maintain a local JSON mirror for offline AI verification.
 */
export async function syncComplianceData(req: Request, res: Response) {
  try {
    const orgId = (req.query.orgId as string) || (req.body?.orgId as string) || (req.headers["x-org-id"] as string);
    const hardwareId = (req.query.hardwareId as string) || (req.body?.hardwareId as string);

    // If no orgId is passed explicitly, fallback to default enterprise demo tenant
    const targetOrgId = orgId || "tenant_enterprise_lacaza";

    const [certs, permits, insurance, org] = await Promise.all([
      rawPrisma.certification.findMany({
        where: { tenantId: targetOrgId },
        orderBy: { expiry: "asc" },
      }),
      rawPrisma.permit.findMany({
        where: { tenantId: targetOrgId },
        orderBy: { expiry: "asc" },
      }),
      rawPrisma.insurance.findMany({
        where: { tenantId: targetOrgId },
        orderBy: { expiry: "asc" },
      }),
      rawPrisma.organization.findUnique({
        where: { id: targetOrgId },
        select: { id: true, name: true, plan: true },
      }),
    ]);

    // Record sync in audit trail
    await rawPrisma.auditLog.create({
      data: {
        tenantId: targetOrgId,
        action: "TERMINAL_COMPLIANCE_SYNCED",
        resource: "ComplianceRegistry",
        details: JSON.stringify({
          hardwareId: hardwareId || "unknown",
          certsCount: certs.length,
          permitsCount: permits.length,
          insuranceCount: insurance.length,
          syncedAt: new Date().toISOString(),
        }),
      },
    });

    // Reset needsSync flag to false once the terminal has downloaded the latest mirror
    await rawPrisma.organization.update({
      where: { id: targetOrgId },
      data: { needsSync: false },
    });

    return res.json({
      success: true,
      timestamp: new Date().toISOString(),
      organization: org,
      complianceData: {
        certs,
        permits,
        insurance,
      },
    });
  } catch (err: any) {
    console.error("[Terminal] Compliance sync error:", err.message);
    return res.status(500).json({ success: false, error: "Failed to sync compliance registry" });
  }
}
