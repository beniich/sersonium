import { Router } from "express";
import { queryGroundedAI } from "../../controllers/grounding.controller.js";

const router = Router();

router.post("/query", queryGroundedAI);

export default router;
