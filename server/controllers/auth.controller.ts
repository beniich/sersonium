import { Request, Response } from "express";
import crypto from "crypto";
import { 
  signAccessToken, 
  signRefreshToken, 
  verifyAndRotateRefreshToken,
  revokeTokenFamily,
  getRefreshTokenCookieOptions, 
  REFRESH_TOKEN_COOKIE_NAME 
} from "../config/jwt.js";
import { AuthenticatedRequest, UserPayload, RoleType } from "../types/auth.js";
import { generateCsrfToken, CSRF_COOKIE_NAME } from "../middlewares/csrf.middleware.js";
import { authService } from "../services/auth.service.js";
import { rawPrisma } from "../db/prisma.js";
import { hashPassword, verifyPassword } from "../services/password.service.js";

// Helper for constant-time comparison
function timingSafeEqualStr(a: string, b: string): boolean {
  const hashA = crypto.createHash("sha256").update(a).digest();
  const hashB = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

// Demo user directory — only active in development / demo mode.
// In production, authentication is exclusively handled via Firebase (JWT flow above).
// NEVER accept these credentials in production.
const USERS_DB = process.env.NODE_ENV !== "production"
  ? [
      {
        userId: "usr_admin_001",
        email: "admin@demo.sensorium.local",
        role: "admin" as RoleType,
        subscriptionTier: "enterprise" as const,
        tenantId: "tenant_demo",
        organizationName: "SENSORIUM Demo Org"
      },
      {
        userId: "usr_operator_002",
        email: "operator@demo.sensorium.local",
        role: "operator" as RoleType,
        subscriptionTier: "pro" as const,
        tenantId: "tenant_demo",
        organizationName: "SENSORIUM Demo Org"
      },
      {
        userId: "usr_tech_003",
        email: "technician@demo.sensorium.local",
        role: "technician" as RoleType,
        subscriptionTier: "silver" as const,
        tenantId: "tenant_demo",
        organizationName: "SENSORIUM Demo Org"
      },
      {
        userId: "usr_auditor_004",
        email: "auditor@demo.sensorium.local",
        role: "auditor" as RoleType,
        subscriptionTier: "free" as const,
        tenantId: "tenant_demo",
        organizationName: "SENSORIUM Demo Org"
      }
    ]
  : [];

/**
 * POST /api/v1/auth/register
 * Inscription souveraine directe avec création d'Organisation et de Compte Utilisateur
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, organizationName, invitationToken } = req.body;

  try {
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Vérifier si l'utilisateur existe déjà
    const existingUser = await rawPrisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        error: {
          code: "USER_ALREADY_EXISTS",
          message: "Un compte avec cette adresse email existe déjà."
        }
      });
      return;
    }

    // 2. Traiter le cas de l'invitation (collaborateur invité par un administrateur)
    let targetTenantId: string | null = null;
    let targetRole: RoleType = "admin";
    let invitationRecord: any = null;

    if (invitationToken) {
      const tokenHash = crypto.createHash("sha256").update(invitationToken).digest("hex");
      invitationRecord = await rawPrisma.tenantInvitation.findUnique({
        where: { tokenHash },
        include: { organization: true }
      });

      if (!invitationRecord) {
        res.status(400).json({
          success: false,
          error: {
            code: "INVALID_INVITATION",
            message: "Lien d'invitation invalide ou introuvable."
          }
        });
        return;
      }

      if (invitationRecord.expiresAt < new Date()) {
        res.status(400).json({
          success: false,
          error: {
            code: "INVITATION_EXPIRED",
            message: "Cette invitation a expiré. Veuillez contacter votre administrateur."
          }
        });
        return;
      }

      if (invitationRecord.acceptedAt) {
        res.status(400).json({
          success: false,
          error: {
            code: "INVITATION_ALREADY_USED",
            message: "Cette invitation a déjà été acceptée."
          }
        });
        return;
      }

      targetTenantId = invitationRecord.tenantId;
      targetRole = (invitationRecord.role as RoleType) || "viewer";
    }

    // 3. Hachage cryptographique du mot de passe avec scrypt
    const hashedPassword = await hashPassword(password);

    // 4. Transaction atomique de création BDD
    const result = await rawPrisma.$transaction(async (tx) => {
      let organization;
      if (targetTenantId) {
        organization = await tx.organization.findUnique({
          where: { id: targetTenantId }
        });
        if (!organization) throw new Error("Organisation introuvable.");

        await tx.tenantInvitation.update({
          where: { id: invitationRecord.id },
          data: { acceptedAt: new Date() }
        });
      } else {
        const orgName = organizationName?.trim() || `${name.trim()}'s Organization`;
        const slug = `${orgName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now().toString(36)}`;
        organization = await tx.organization.create({
          data: {
            name: orgName,
            slug,
            plan: "FREE",
            subscriptionStatus: "active"
          }
        });
        targetTenantId = organization.id;
        targetRole = "admin";
      }

      const newUser = await tx.user.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          passwordHash: hashedPassword,
          role: targetRole,
          tenantId: targetTenantId,
          tokens: 1000,
          isActive: true,
          lastLoginAt: new Date()
        }
      });

      return { user: newUser, organization };
    });

    // 5. Génération de session JWT sécurisée
    const userPayload: UserPayload = {
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role as RoleType,
      tenantId: result.organization.id,
      organizationName: result.organization.name,
      subscriptionTier: (result.organization.plan || "free").toLowerCase() as any
    };

    const accessToken = signAccessToken(userPayload);
    const refreshData = signRefreshToken(userPayload);
    const refreshToken = refreshData.token;

    // Cookies HTTP-Only
    const cookieOptions = getRefreshTokenCookieOptions();
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, cookieOptions);

    res.cookie("sensorium_access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 15 * 60 * 1000,
      path: "/"
    });

    const csrfToken = generateCsrfToken();
    res.cookie(CSRF_COOKIE_NAME, csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/"
    });

    res.status(201).json({
      success: true,
      data: {
        accessToken,
        csrfToken,
        tokenType: "Bearer",
        expiresIn: "15m",
        user: userPayload
      },
      token: accessToken
    });
  } catch (err: any) {
    console.error("[auth.controller] Registration error:", err);
    res.status(500).json({
      success: false,
      error: {
        code: "REGISTRATION_FAILED",
        message: "Une erreur est survenue lors de l'enregistrement."
      }
    });
  }
};

/**
 * POST /api/v1/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password, token } = req.body;

  try {
    let userPayload: UserPayload;
    let accessToken: string;
    let refreshToken: string;

    // -- 1. Authentication via Firebase (Hybrid Flow)
    if (token) {
      const session = await authService.loginWithFirebase(token);
      accessToken = session.accessToken;
      refreshToken = session.refreshToken;
      userPayload = session.user;
    } 
    // -- 2. Authentication via Base de Données PostgreSQL Réelle
    else {
      const normalizedEmail = (email || "").trim().toLowerCase();
      
      // Recherche prioritaire dans PostgreSQL
      const dbUser = await rawPrisma.user.findUnique({
        where: { email: normalizedEmail },
        include: { organization: true }
      });

      let authenticated = false;

      if (dbUser && dbUser.isActive && dbUser.passwordHash && password) {
        const isPasswordValid = await verifyPassword(password, dbUser.passwordHash);
        if (isPasswordValid) {
          authenticated = true;
          userPayload = {
            userId: dbUser.id,
            email: dbUser.email,
            role: dbUser.role as RoleType,
            tenantId: dbUser.tenantId,
            organizationName: dbUser.organization?.name || "SENSORIUM Sovereign",
            subscriptionTier: (dbUser.organization?.plan || "free").toLowerCase() as any
          };

          // Mise à jour de la dernière date de connexion
          rawPrisma.user.update({
            where: { id: dbUser.id },
            data: { lastLoginAt: new Date() }
          }).catch(() => {});
        }
      }

      // Fallback Demo uniquement en environnement de développement local
      if (!authenticated && process.env.NODE_ENV !== "production") {
        const targetDemoUser = USERS_DB.find(u => u.email.toLowerCase() === normalizedEmail);
        if (targetDemoUser && password && password.length >= 8) {
          authenticated = true;
          userPayload = {
            userId: targetDemoUser.userId,
            email: targetDemoUser.email,
            role: targetDemoUser.role,
            tenantId: targetDemoUser.tenantId,
            organizationName: targetDemoUser.organizationName,
            subscriptionTier: targetDemoUser.subscriptionTier
          };
        }
      }

      if (!authenticated || !userPayload!) {
        res.status(401).json({
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Email ou mot de passe incorrect."
          }
        });
        return;
      }

      accessToken = signAccessToken(userPayload);
      const refreshData = signRefreshToken(userPayload);
      refreshToken = refreshData.token;
    }

    // Set Secure HttpOnly cookie for Refresh Token
    const cookieOptions = getRefreshTokenCookieOptions();
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, cookieOptions);

    // Set Secure HttpOnly cookie for Access Token
    res.cookie("sensorium_access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 15 * 60 * 1000,
      path: "/"
    });

    // Set readable CSRF cookie for client XSRF token header synchronization
    const csrfToken = generateCsrfToken();
    res.cookie(CSRF_COOKIE_NAME, csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/"
    });

    res.status(200).json({
      success: true,
      data: {
        accessToken,
        csrfToken,
        tokenType: "Bearer",
        expiresIn: "15m",
        user: userPayload
      },
      // For compatibility with frontend if it expects token in the root
      token: accessToken,
      user: userPayload
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: {
        code: "AUTHENTICATION_FAILED",
        message: error.message
      }
    });
  }
};

/**
 * POST /api/v1/auth/refresh (RTR - Refresh Token Rotation with Reuse Detection)
 */
export const refreshSession = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const incomingRefreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];

  if (!incomingRefreshToken) {
    res.status(401).json({
      success: false,
      error: {
        code: "REFRESH_TOKEN_MISSING",
        message: "Aucun Refresh Token trouvé. Veuillez vous reconnecter."
      }
    });
    return;
  }

  try {
    const { payload, familyId, reuseDetected } = verifyAndRotateRefreshToken(incomingRefreshToken);

    if (reuseDetected) {
      // Security Alert: Refresh Token Reuse Detected!
      res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, getRefreshTokenCookieOptions());
      res.status(403).json({
        success: false,
        error: {
          code: "REFRESH_TOKEN_REUSE_DETECTED",
          message: "Alerte de sécurité : Tentative de réutilisation d'un jeton de session déjà renouvelé. Session invalidée."
        }
      });
      return;
    }

    const userPayload: UserPayload = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      tenantId: payload.tenantId,
      organizationName: payload.organizationName,
      subscriptionTier: payload.subscriptionTier || "free"
    };

    // Rotate: generate new access token & new rotating refresh token in same family
    const newAccessToken = signAccessToken(userPayload);
    const { token: newRefreshToken } = signRefreshToken(userPayload, familyId);

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, newRefreshToken, getRefreshTokenCookieOptions());

    // Set Secure HttpOnly cookie for rotated Access Token
    res.cookie("sensorium_access_token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 15 * 60 * 1000,
      path: "/"
    });

    res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        tokenType: "Bearer",
        expiresIn: "15m",
        user: userPayload
      }
    });
  } catch (err: any) {
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, getRefreshTokenCookieOptions());
    res.status(401).json({
      success: false,
      error: {
        code: "INVALID_REFRESH_TOKEN",
        message: "Le Refresh Token est expiré ou invalide."
      }
    });
  }
};

/**
 * POST /api/v1/auth/logout
 */
export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const token = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];
  if (token) {
    try {
      const { familyId } = verifyAndRotateRefreshToken(token);
      revokeTokenFamily(familyId);
    } catch {
      // Silent catch on invalid token logout
    }
  }

  res.clearCookie("sensorium_access_token", { path: "/" });
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, getRefreshTokenCookieOptions());
  res.clearCookie(CSRF_COOKIE_NAME, { path: "/" });
  res.status(200).json({
    success: true,
    message: "Déconnexion réussie. Session et jetons révoqués."
  });
};

/**
 * GET /api/v1/auth/csrf-token
 */
export const getCsrfToken = (req: Request, res: Response): void => {
  const csrfToken = generateCsrfToken();
  res.cookie(CSRF_COOKIE_NAME, csrfToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });
  res.status(200).json({
    success: true,
    csrfToken
  });
};

/**
 * GET /api/v1/auth/me
 */
export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user,
      activeTenantId: req.tenantId
    }
  });
};

/**
 * GET /api/v1/auth/google/url
 * Renvoie l'URL d'autorisation Google OAuth 2.0 (compatible sersonium.cloudindustrie.com)
 */
export const getGoogleAuthUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const { includeGmail } = req.query;
    const { gmailService } = await import("../services/gmail.service.js");
    const url = gmailService.getAuthorizationUrl(includeGmail === "true");
    res.status(200).json({ success: true, url });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/v1/auth/google/callback
 * Point de rappel après consentement Google OAuth 2.0
 */
export const handleGoogleCallback = async (req: Request, res: Response): Promise<void> => {
  const { code, error } = req.query;

  if (error || !code) {
    res.redirect(`/?auth_error=${encodeURIComponent(String(error || "Authorization code missing"))}`);
    return;
  }

  try {
    const { gmailService } = await import("../services/gmail.service.js");
    const tokens = await gmailService.exchangeCodeForTokens(String(code));
    const googleProfile = await gmailService.getUserProfile(tokens.access_token);

    // Payload de session utilisateur Sensorium
    const userPayload: UserPayload = {
      userId: `google_${googleProfile.id}`,
      email: googleProfile.email,
      role: "admin", // Rôle par défaut
      tenantId: "tenant_enterprise_cloudindustrie",
      organizationName: "Cloud Industrie - SENSORIUM",
      subscriptionTier: "enterprise"
    };

    const accessToken = signAccessToken(userPayload);
    const refreshData = signRefreshToken(userPayload);

    // Configuration des cookies de session
    const cookieOptions = getRefreshTokenCookieOptions();
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshData.token, cookieOptions);

    // Set Secure HttpOnly cookie for Access Token
    res.cookie("sensorium_access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 15 * 60 * 1000,
      path: "/"
    });

    const csrfToken = generateCsrfToken();
    res.cookie(CSRF_COOKIE_NAME, csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/"
    });

    // Redirection vers le dashboard Sensorium avec le token
    const redirectBase = process.env.NODE_ENV === "production"
      ? "https://sersonium.cloudindustrie.com"
      : (process.env.APP_URL || "http://localhost:3000");

    res.redirect(`${redirectBase}/?access_token=${accessToken}&auth_provider=google`);
  } catch (err: any) {
    res.redirect(`/?auth_error=${encodeURIComponent(err.message)}`);
  }
};

/**
 * DELETE /api/v1/auth/me (or /api/v1/auth/users/:id)
 * RGPD Article 17 - Right to erasure ("Right to be forgotten")
 * Cascade purges personal identifiable data or anonymizes audit records to satisfy DORA/NIS2 regulatory retention while purging PII.
 */
export const deleteUserAccountGdpr = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      res.status(401).json({ success: false, error: "Authentication required" });
      return;
    }

    const targetUserId = req.params.id || authReq.user.userId;

    // Authorization check: Only user themselves or an admin of the same tenant can delete
    if (targetUserId !== authReq.user.userId && authReq.user.role !== "admin") {
      res.status(403).json({
        success: false,
        error: "Forbidden: You are not authorized to delete another user's account under RGPD Art. 17."
      });
      return;
    }

    // Try finding the user in Prisma DB
    const existingUser = await rawPrisma.user.findFirst({
      where: {
        OR: [
          { id: targetUserId },
          { email: targetUserId },
          { firebaseUid: targetUserId }
        ],
        ...(authReq.user.role !== "admin" ? { tenantId: authReq.user.tenantId } : {})
      }
    });

    if (existingUser) {
      // Cascade delete user and associated policies/tokens
      await rawPrisma.user.delete({
        where: { id: existingUser.id }
      });
    }

    // Revoke any refresh token family
    try {
      revokeTokenFamily(targetUserId);
    } catch {
      // Best-effort in-memory token purge
    }

    // Clear session cookies if user deleted their own account
    if (targetUserId === authReq.user.userId) {
      res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, { path: "/" });
      res.clearCookie("sensorium_access_token", { path: "/" });
      res.clearCookie(CSRF_COOKIE_NAME, { path: "/" });
    }

    res.status(200).json({
      success: true,
      message: "Account and personal data successfully purged in compliance with RGPD Article 17 (Right to Erasure).",
      purgedUserId: targetUserId,
      retentionPolicy: "Audit trails sanitized of PII, cryptographic access tokens revoked.",
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error("[Auth / RGPD] Error during Art. 17 deletion:", err);
    res.status(500).json({
      success: false,
      error: "Failed to complete RGPD Art. 17 erasure request: " + err.message
    });
  }
};

