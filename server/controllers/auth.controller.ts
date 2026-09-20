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

// Helper for constant-time comparison
function timingSafeEqualStr(a: string, b: string): boolean {
  const hashA = crypto.createHash("sha256").update(a).digest();
  const hashB = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

// Mock user directory for authentication demonstration
const USERS_DB = [
  {
    userId: "usr_admin_001",
    email: "beniich.contact@gmail.com",
    role: "admin" as RoleType,
    tenantId: "tenant_enterprise_lacaza",
    organizationName: "LACAZA ClouIndustrie Group"
  },
  {
    userId: "usr_operator_002",
    email: "ops@lacaza.clouindustrie.com",
    role: "operator" as RoleType,
    tenantId: "tenant_enterprise_lacaza",
    organizationName: "LACAZA ClouIndustrie Group"
  },
  {
    userId: "usr_tech_003",
    email: "tech.field@lacaza.clouindustrie.com",
    role: "technician" as RoleType,
    tenantId: "tenant_enterprise_lacaza",
    organizationName: "LACAZA ClouIndustrie Group"
  },
  {
    userId: "usr_auditor_004",
    email: "auditor@lacaza.clouindustrie.com",
    role: "auditor" as RoleType,
    tenantId: "tenant_enterprise_lacaza",
    organizationName: "LACAZA ClouIndustrie Group"
  }
];

/**
 * POST /api/v1/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const targetUser = USERS_DB.find(u => u.email.toLowerCase() === email.toLowerCase());

  let isMatch = false;
  if (targetUser && password) {
    if (password === "AdminSecure2026!" || password === "password123" || password.length >= 6) {
      isMatch = true;
    }
  }

  if (!targetUser || !isMatch) {
    res.status(401).json({
      success: false,
      error: {
        code: "INVALID_CREDENTIALS",
        message: "Email ou mot de passe incorrect."
      }
    });
    return;
  }

  const userPayload: UserPayload = {
    userId: targetUser.userId,
    email: targetUser.email,
    role: targetUser.role,
    tenantId: targetUser.tenantId,
    organizationName: targetUser.organizationName
  };

  const accessToken = signAccessToken(userPayload);
  const { token: refreshToken } = signRefreshToken(userPayload);

  // Set Secure HttpOnly cookie for Refresh Token
  const cookieOptions = getRefreshTokenCookieOptions();
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, cookieOptions);

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
    }
  });
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
      organizationName: payload.organizationName
    };

    // Rotate: generate new access token & new rotating refresh token in same family
    const newAccessToken = signAccessToken(userPayload);
    const { token: newRefreshToken } = signRefreshToken(userPayload, familyId);

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, newRefreshToken, getRefreshTokenCookieOptions());

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

  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, getRefreshTokenCookieOptions());
  res.clearCookie(CSRF_COOKIE_NAME);
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
