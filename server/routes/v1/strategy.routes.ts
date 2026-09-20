import { Router } from "express";
import { getExecutiveDashboard, createObjective, triggerSync } from "../../controllers/strategy.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";

const router = Router();

// In a real app we'd verify roles: verifyRole(['ADMIN', 'EXECUTIVE'])
// For this demo, authenticateToken is used
router.use(authenticateToken);

router.get("/dashboard", getExecutiveDashboard);
router.post("/objectives", createObjective);
router.post("/sync", triggerSync);

export default router;
