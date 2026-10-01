import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/auth.js";
import { rawPrisma } from "../db/prisma.js";

/**
 * Controller for Compliance Registry (Certifications, Permits, Insurances)
 * Multi-tenant aware: filters by tenantId or orgId.
 * Sets `needsSync = true` on the organization upon any mutation to trigger terminal sync.
 */

// Helper to trigger physical terminal sync flag
export async function triggerTerminalSync(orgId: string) {
  try {
    await rawPrisma.organization.update({
      where: { id: orgId },
      data: { needsSync: true },
    });
    console.info(`[Compliance] 🔔 Flag needsSync=true set for org ${orgId}`);
  } catch (err: any) {
    console.warn(`[Compliance] ⚠️ Could not set needsSync flag: ${err.message}`);
  }
}

// ─── GET /api/v1/compliance OR /api/v1/compliance/:orgId ─────────────────────
export const getComplianceOverview = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const orgId = req.params.orgId || authReq.user?.tenantId || (req.query.orgId as string) || "tenant_enterprise_lacaza";

    const [certs, permits, insurances, org] = await Promise.all([
      rawPrisma.certification.findMany({
        where: { tenantId: orgId },
        orderBy: { expiry: "asc" },
      }),
      rawPrisma.permit.findMany({
        where: { tenantId: orgId },
        orderBy: { expiry: "asc" },
      }),
      rawPrisma.insurance.findMany({
        where: { tenantId: orgId },
        orderBy: { expiry: "asc" },
      }),
      rawPrisma.organization.findUnique({
        where: { id: orgId },
        select: { id: true, name: true, plan: true, needsSync: true },
      }),
    ]);

    // Format matches both structures (dateExpiry / expiry aliases)
    const formattedCerts = certs.map(c => ({
      ...c,
      dateIssue: c.issuedAt.toISOString().split("T")[0],
      dateExpiry: c.expiry.toISOString().split("T")[0],
      docUrl: c.fileUrl || "#",
    }));

    const formattedPermits = permits.map(p => ({
      ...p,
      dateExpiry: p.expiry.toISOString().split("T")[0],
      licenseNumber: p.id.slice(0, 8).toUpperCase(),
    }));

    const formattedInsurance = insurances.map(i => ({
      ...i,
      dateExpiry: i.expiry.toISOString().split("T")[0],
      policyNumber: i.policy,
      coverage: i.coverageType,
    }));

    res.status(200).json({
      success: true,
      needsSync: org?.needsSync ?? false,
      certs: formattedCerts,
      permits: formattedPermits,
      insurances: formattedInsurance,
      insurance: formattedInsurance,
      data: {
        certs: formattedCerts,
        permits: formattedPermits,
        insurance: formattedInsurance,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "COMPLIANCE_FETCH_FAILED", message: error.message },
    });
  }
};

// ─── UPSERT CERTIFICATION ───────────────────────────────────────────────────
export const upsertCertification = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { id, orgId, tenantId, name, issuer, dateIssue, dateExpiry, expiry, status, docUrl, fileUrl } = req.body;
    const targetOrgId = orgId || tenantId || authReq.user?.tenantId || "tenant_enterprise_lacaza";
    const resolvedExpiry = new Date(dateExpiry || expiry || new Date());
    const resolvedIssue = dateIssue ? new Date(dateIssue) : new Date();

    let cert: any;
    if (id && !id.startsWith("new_") && !id.startsWith("new-")) {
      cert = await rawPrisma.certification.upsert({
        where: { id },
        update: {
          name,
          issuer: issuer || "AFNOR Certification",
          issuedAt: resolvedIssue,
          expiry: resolvedExpiry,
          status: status || "Valid",
          fileUrl: docUrl || fileUrl || null,
        },
        create: {
          tenantId: targetOrgId,
          name,
          issuer: issuer || "AFNOR Certification",
          issuedAt: resolvedIssue,
          expiry: resolvedExpiry,
          status: status || "Valid",
          fileUrl: docUrl || fileUrl || null,
        },
      });
    } else {
      cert = await rawPrisma.certification.create({
        data: {
          tenantId: targetOrgId,
          name,
          issuer: issuer || "AFNOR Certification",
          issuedAt: resolvedIssue,
          expiry: resolvedExpiry,
          status: status || "Valid",
          fileUrl: docUrl || fileUrl || null,
        },
      });
    }

    await triggerTerminalSync(targetOrgId);
    res.json({ success: true, data: cert, ...cert });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Erreur lors de la sauvegarde de la certification: " + error.message });
  }
};

// ─── UPSERT PERMIT ──────────────────────────────────────────────────────────
export const upsertPermit = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { id, orgId, tenantId, driver, category, dateExpiry, expiry, status } = req.body;
    const targetOrgId = orgId || tenantId || authReq.user?.tenantId || "tenant_enterprise_lacaza";
    const resolvedExpiry = new Date(dateExpiry || expiry || new Date());

    let permit: any;
    if (id && !id.startsWith("new_") && !id.startsWith("new-")) {
      permit = await rawPrisma.permit.upsert({
        where: { id },
        update: {
          driver,
          category: category || "CE",
          expiry: resolvedExpiry,
          status: status || "Valid",
        },
        create: {
          tenantId: targetOrgId,
          driver,
          category: category || "CE",
          expiry: resolvedExpiry,
          status: status || "Valid",
        },
      });
    } else {
      permit = await rawPrisma.permit.create({
        data: {
          tenantId: targetOrgId,
          driver,
          category: category || "CE",
          expiry: resolvedExpiry,
          status: status || "Valid",
        },
      });
    }

    await triggerTerminalSync(targetOrgId);
    res.json({ success: true, data: permit, ...permit });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Erreur lors de la sauvegarde du permis: " + error.message });
  }
};

// ─── UPSERT INSURANCE ───────────────────────────────────────────────────────
export const upsertInsurance = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { id, orgId, tenantId, company, policyNumber, policy, coverage, coverageType, vehicle, dateExpiry, expiry, status, premium } = req.body;
    const targetOrgId = orgId || tenantId || authReq.user?.tenantId || "tenant_enterprise_lacaza";
    const resolvedExpiry = new Date(dateExpiry || expiry || new Date());

    let insurance: any;
    if (id && !id.startsWith("new_") && !id.startsWith("new-")) {
      insurance = await rawPrisma.insurance.upsert({
        where: { id },
        update: {
          company,
          policy: policyNumber || policy || "POL-DEFAULT",
          coverageType: coverage || coverageType || "Tous Risques Flotte",
          vehicle: vehicle || "Flotte Entreprise",
          premium: premium ? parseFloat(premium) : 2400.0,
          expiry: resolvedExpiry,
          status: status || "Valid",
        },
        create: {
          tenantId: targetOrgId,
          company,
          policy: policyNumber || policy || "POL-DEFAULT",
          coverageType: coverage || coverageType || "Tous Risques Flotte",
          vehicle: vehicle || "Flotte Entreprise",
          premium: premium ? parseFloat(premium) : 2400.0,
          expiry: resolvedExpiry,
          status: status || "Valid",
        },
      });
    } else {
      insurance = await rawPrisma.insurance.create({
        data: {
          tenantId: targetOrgId,
          company,
          policy: policyNumber || policy || "POL-DEFAULT",
          coverageType: coverage || coverageType || "Tous Risques Flotte",
          vehicle: vehicle || "Flotte Entreprise",
          premium: premium ? parseFloat(premium) : 2400.0,
          expiry: resolvedExpiry,
          status: status || "Valid",
        },
      });
    }

    await triggerTerminalSync(targetOrgId);
    res.json({ success: true, data: insurance, ...insurance });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Erreur lors de la sauvegarde de l'assurance: " + error.message });
  }
};

// ─── GENERIC ITEM CREATE / UPDATE / DELETE ──────────────────────────────────
export const createComplianceItem = async (req: Request, res: Response): Promise<void> => {
  const { category, payload } = req.body;
  if (category === "certs") return upsertCertification({ ...req, body: payload } as Request, res);
  if (category === "permits") return upsertPermit({ ...req, body: payload } as Request, res);
  if (category === "insurance" || category === "insurances") return upsertInsurance({ ...req, body: payload } as Request, res);
  res.status(400).json({ success: false, error: "Invalid category" });
};

export const updateComplianceItem = async (req: Request, res: Response): Promise<void> => {
  const { category, id, payload } = req.body;
  const merged = { ...payload, id };
  if (category === "certs") return upsertCertification({ ...req, body: merged } as Request, res);
  if (category === "permits") return upsertPermit({ ...req, body: merged } as Request, res);
  if (category === "insurance" || category === "insurances") return upsertInsurance({ ...req, body: merged } as Request, res);
  res.status(400).json({ success: false, error: "Invalid category" });
};

export const deleteComplianceItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { category, id } = req.params;
    const targetOrgId = authReq.user?.tenantId || "tenant_enterprise_lacaza";

    if (category === "certs") {
      await rawPrisma.certification.delete({ where: { id } });
    } else if (category === "permits") {
      await rawPrisma.permit.delete({ where: { id } });
    } else if (category === "insurance" || category === "insurances") {
      await rawPrisma.insurance.delete({ where: { id } });
    } else {
      res.status(400).json({ success: false, error: "Invalid category" });
      return;
    }

    await triggerTerminalSync(targetOrgId);
    res.status(200).json({ success: true, message: "Item deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const ComplianceController = {
  getComplianceData: getComplianceOverview,
  upsertCertification,
  upsertPermit,
  upsertInsurance,
  triggerTerminalSync,
};
