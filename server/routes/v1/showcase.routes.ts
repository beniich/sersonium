import { Router } from "express";
import demoRouter from "./demo.routes.js";
import developerHubRouter from "./developer-hub.routes.js";

const router = Router();

/**
 * SENSORIUM Showcase Aggregator (Modular Composition)
 * Composes:
 * - Demo & Simulator routes (/api/v1/showcase/...)
 * - Developer Hub Sandbox (/api/v1/showcase/developers/...)
 */

// Developer Hub sub-routes (Sandbox & OpenAPI)
router.use("/developers", developerHubRouter);

// Interactive Demonstration & AI Inference routes
router.use("/", demoRouter);

export default router;
