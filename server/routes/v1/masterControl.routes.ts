import { Router } from "express";
import { getMasterControlStatus } from "../../controllers/masterControl.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";

const router = Router();

// Endpoint d'agrégation exécutif pour le CEO/CTO
// Permet la consultation authentifiée
router.get("/", authenticateToken, getMasterControlStatus);

export default router;
