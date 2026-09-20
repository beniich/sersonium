import { Router } from "express";
import { login, refreshSession, logout, getProfile, getCsrfToken } from "../../controllers/auth.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { requireTenant } from "../../middlewares/tenant.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { strictRateLimiter } from "../../middlewares/rateLimit.middleware.js";
import { loginSchema } from "../../schemas/auth.schema.js";

const router = Router();

// Endpoint pour obtenir un token CSRF initial
router.get("/csrf-token", getCsrfToken);

// Routes publiques d'authentification blindées par Rate-Limiter strict (anti-brute force) et validation Zod
router.post("/login", strictRateLimiter, validateRequest({ body: loginSchema }), login);
router.post("/refresh", strictRateLimiter, refreshSession);
router.post("/logout", logout);

// Route protégée : chaîne complète auth -> tenant
router.get("/me", authenticateToken, requireTenant, getProfile);

export default router;
