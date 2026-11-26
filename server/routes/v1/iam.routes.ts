import { Router } from "express";
import { 
  getMembers, 
  createInvitation, 
  updateMemberRole, 
  removeMember, 
  cancelInvitation 
} from "../../controllers/iam.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { requireTenant } from "../../middlewares/tenant.middleware.js";
import { csrfProtection } from "../../middlewares/csrf.middleware.js";

const router = Router();

// Toutes les routes IAM exigent l'authentification et le contexte d'organisation (Multi-Tenant)
router.use(authenticateToken);
router.use(requireTenant);

router.get("/members", getMembers);
router.post("/invitations", csrfProtection, createInvitation);
router.patch("/members/:userId/role", csrfProtection, updateMemberRole);
router.delete("/members/:userId", csrfProtection, removeMember);
router.delete("/invitations/:invitationId", csrfProtection, cancelInvitation);

export default router;

