import { Response } from "express";
import crypto from "crypto";
import { AuthenticatedRequest } from "../types/auth.js";
import { rawPrisma } from "../db/prisma.js";

// Limites d'utilisateurs par forfait (Sovereign Multi-Tenant Isolation)
const PLAN_USER_LIMITS: Record<string, number> = {
  FREE: 1,
  STARTER: 5,
  SILVER: 5,
  PRO: 25,
  GOLD: 25,
  ENTERPRISE: 1000
};

/**
 * GET /api/v1/iam/members
 * Récupère tous les membres actifs et les invitations en attente de l'organisation courante.
 */
export const getMembers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.tenantId || req.user?.tenantId;
    if (!tenantId) {
      res.status(401).json({ success: false, error: "Tenant non authentifié." });
      return;
    }

    const [members, invitations, organization] = await Promise.all([
      rawPrisma.user.findMany({
        where: { tenantId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          tokens: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true
        },
        orderBy: { createdAt: "asc" }
      }),
      rawPrisma.tenantInvitation.findMany({
        where: {
          tenantId,
          acceptedAt: null,
          expiresAt: { gt: new Date() }
        },
        select: {
          id: true,
          email: true,
          role: true,
          expiresAt: true,
          createdAt: true,
          invitedBy: {
            select: { name: true, email: true }
          }
        },
        orderBy: { createdAt: "desc" }
      }),
      rawPrisma.organization.findUnique({
        where: { id: tenantId },
        select: { id: true, name: true, plan: true, subscriptionStatus: true }
      })
    ]);

    const planKey = (organization?.plan || "FREE").toUpperCase();
    const maxUsers = PLAN_USER_LIMITS[planKey] || 1;

    res.status(200).json({
      success: true,
      data: {
        organization,
        quota: {
          maxUsers,
          activeUsers: members.filter(m => m.isActive).length,
          pendingInvitations: invitations.length,
          remainingSlots: Math.max(0, maxUsers - members.filter(m => m.isActive).length - invitations.length)
        },
        members,
        invitations
      }
    });
  } catch (err: any) {
    console.error("[iam.controller] getMembers error:", err);
    res.status(500).json({ success: false, error: "Impossible de récupérer les membres du tenant." });
  }
};

/**
 * POST /api/v1/iam/invitations
 * Invite un collaborateur par email dans le tenant de l'administrateur.
 */
export const createInvitation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.tenantId || req.user?.tenantId;
    const inviterId = req.user?.userId;

    if (!tenantId || !inviterId) {
      res.status(401).json({ success: false, error: "Authentification requise." });
      return;
    }

    // Seuls les administrateurs peuvent inviter de nouveaux membres
    if (req.user?.role !== "admin") {
      res.status(403).json({ success: false, error: "Seuls les administrateurs peuvent inviter des collaborateurs." });
      return;
    }

    const { email, role } = req.body;
    if (!email || typeof email !== "string" || !email.includes("@")) {
      res.status(400).json({ success: false, error: "Adresse email invalide." });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const roleMapping: Record<string, string> = {
      super_admin: "admin",
      tenant_admin: "admin",
      facility_lead: "operator",
      field_technician: "operator",
      csrd_auditor: "auditor",
      viewer: "viewer",
      admin: "admin",
      operator: "operator",
      auditor: "auditor",
    };
    const targetRole = roleMapping[String(role || "").toLowerCase()] || "viewer";

    // 1. Vérifier si l'utilisateur est déjà membre de ce tenant
    const existingMember = await rawPrisma.user.findFirst({
      where: { email: normalizedEmail, tenantId }
    });
    if (existingMember) {
      res.status(409).json({ success: false, error: "Cet utilisateur est déjà membre de votre organisation." });
      return;
    }

    // 2. Vérifier les quotas du forfait
    const org = await rawPrisma.organization.findUnique({ where: { id: tenantId } });
    const planKey = (org?.plan || "FREE").toUpperCase();
    const maxUsers = PLAN_USER_LIMITS[planKey] || 1;

    const [currentMembersCount, pendingInvitesCount] = await Promise.all([
      rawPrisma.user.count({ where: { tenantId, isActive: true } }),
      rawPrisma.tenantInvitation.count({
        where: { tenantId, acceptedAt: null, expiresAt: { gt: new Date() } }
      })
    ]);

    if (currentMembersCount + pendingInvitesCount >= maxUsers) {
      res.status(403).json({
        success: false,
        error: {
          code: "USER_LIMIT_REACHED",
          message: `La limite d'utilisateurs pour votre forfait ${planKey} (${maxUsers} max) est atteinte. Veuillez mettre à niveau votre abonnement.`,
          upgradeUrl: "/pricing"
        }
      });
      return;
    }

    // 3. Génération du jeton sécurisé d'invitation
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours

    const invitation = await rawPrisma.tenantInvitation.create({
      data: {
        tenantId,
        email: normalizedEmail,
        role: targetRole,
        tokenHash,
        expiresAt,
        invitedById: inviterId
      }
    });

    res.status(201).json({
      success: true,
      data: {
        invitationId: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
        invitationToken: rawToken,
        invitationUrl: `/register?invite=${rawToken}`
      }
    });
  } catch (err: any) {
    console.error("[iam.controller] createInvitation error:", err);
    res.status(500).json({ success: false, error: "Erreur lors de la création de l'invitation." });
  }
};

/**
 * PATCH /api/v1/iam/members/:userId/role
 * Met à jour le rôle d'un membre au sein du même tenant.
 */
export const updateMemberRole = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.tenantId || req.user?.tenantId;
    if (!tenantId || req.user?.role !== "admin") {
      res.status(403).json({ success: false, error: "Action réservée aux administrateurs." });
      return;
    }

    const { userId } = req.params;
    const { role } = req.body;

    const roleMapping: Record<string, string> = {
      super_admin: "admin",
      tenant_admin: "admin",
      facility_lead: "operator",
      field_technician: "operator",
      csrd_auditor: "auditor",
      viewer: "viewer",
      admin: "admin",
      operator: "operator",
      auditor: "auditor",
    };
    const mappedRole = roleMapping[String(role || "").toLowerCase()] || role;

    const validRoles = ["admin", "operator", "auditor", "viewer"];
    if (!validRoles.includes(mappedRole)) {
      res.status(400).json({ success: false, error: "Rôle non valide." });
      return;
    }

    // Vérifier l'appartenance au tenant
    const targetUser = await rawPrisma.user.findFirst({
      where: { id: userId, tenantId }
    });

    if (!targetUser) {
      res.status(404).json({ success: false, error: "Utilisateur introuvable dans votre organisation." });
      return;
    }

    // Empêcher l'administrateur unique de se rétrograder lui-même
    if (targetUser.id === req.user.userId && mappedRole !== "admin") {
      const adminCount = await rawPrisma.user.count({
        where: { tenantId, role: "admin", isActive: true }
      });
      if (adminCount <= 1) {
        res.status(400).json({ success: false, error: "Impossible de retirer le rôle admin : l'organisation doit avoir au moins un administrateur." });
        return;
      }
    }

    const updated = await rawPrisma.user.update({
      where: { id: userId },
      data: { role: mappedRole }
    });

    res.status(200).json({
      success: true,
      data: { id: updated.id, email: updated.email, role: updated.role }
    });
  } catch (err: any) {
    console.error("[iam.controller] updateMemberRole error:", err);
    res.status(500).json({ success: false, error: "Erreur lors de la mise à jour du rôle." });
  }
};

/**
 * DELETE /api/v1/iam/members/:userId
 * Désactive ou retire un membre du tenant.
 */
export const removeMember = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.tenantId || req.user?.tenantId;
    if (!tenantId || req.user?.role !== "admin") {
      res.status(403).json({ success: false, error: "Action réservée aux administrateurs." });
      return;
    }

    const { userId } = req.params;

    if (userId === req.user.userId) {
      res.status(400).json({ success: false, error: "Vous ne pouvez pas supprimer votre propre compte depuis l'interface IAM." });
      return;
    }

    const targetUser = await rawPrisma.user.findFirst({
      where: { id: userId, tenantId }
    });

    if (!targetUser) {
      res.status(404).json({ success: false, error: "Utilisateur introuvable dans ce tenant." });
      return;
    }

    await rawPrisma.user.update({
      where: { id: userId },
      data: { isActive: false }
    });

    res.status(200).json({
      success: true,
      message: `L'accès de l'utilisateur ${targetUser.email} a été révoqué avec succès.`
    });
  } catch (err: any) {
    console.error("[iam.controller] removeMember error:", err);
    res.status(500).json({ success: false, error: "Erreur lors de la suppression du membre." });
  }
};

/**
 * DELETE /api/v1/iam/invitations/:invitationId
 * Révoque une invitation en attente.
 */
export const cancelInvitation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.tenantId || req.user?.tenantId;
    if (!tenantId || req.user?.role !== "admin") {
      res.status(403).json({ success: false, error: "Action réservée aux administrateurs." });
      return;
    }

    const { invitationId } = req.params;

    const invitation = await rawPrisma.tenantInvitation.findFirst({
      where: { id: invitationId, tenantId }
    });

    if (!invitation) {
      res.status(404).json({ success: false, error: "Invitation introuvable." });
      return;
    }

    await rawPrisma.tenantInvitation.delete({
      where: { id: invitationId }
    });

    res.status(200).json({
      success: true,
      message: "L'invitation a été révoquée."
    });
  } catch (err: any) {
    console.error("[iam.controller] cancelInvitation error:", err);
    res.status(500).json({ success: false, error: "Erreur lors de la révocation de l'invitation." });
  }
};

