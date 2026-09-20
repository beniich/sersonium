import "dotenv/config";
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./dev.db";
}
import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import apiRouterV1 from "./server/routes/v1/index.js";
import { seedDatabase } from "./server/db/seed.js";
import { kafkaService } from "./server/services/kafka.service.js";
import { 
  securityHeaders, 
  payloadSanitizer,
  antiReplayGuard,
  auditMiddleware, 
  requestLogger, 
  errorHandler 
} from "./server/middlewares/index.js";

async function startServer() {
  // Initialize multi-tenant database seed if required
  seedDatabase().catch((err) => console.error("[Server] Seed warning:", err));

  // Initialize Kafka Producer (Event Streaming)
  kafkaService.connect().catch(err => console.error("[Server] Kafka init error:", err));

  const app = express();

  const PORT = 3000;

  // 1. Chaîne de Middlewares de Défense & Zone Tampon
  app.use(securityHeaders);
  app.use(cookieParser());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use(payloadSanitizer);
  app.use(antiReplayGuard);
  app.use(requestLogger);
  app.use(auditMiddleware);

  // 2. Montage des APIs V1
  app.use("/api/v1", apiRouterV1);


  // Fallback for previous API path (backward compatibility during migration)
  app.post("/api/ai/analyze", (req, res, next) => {
    req.url = "/ai/analyze";
    apiRouterV1(req, res, next);
  });

  // Public Privacy Policy route for Google Play & OAuth validation
  app.get("/privacy", (req, res) => {
    res.sendFile(path.join(process.cwd(), "public", "privacy.html"));
  });

  // Vite middleware for development or fallback if dist not built
  const distPath = path.join(process.cwd(), "dist");
  const distIndexHtml = path.join(distPath, "index.html");
  const isProduction = process.env.NODE_ENV === "production" && fs.existsSync(distIndexHtml);

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const publicPath = path.join(process.cwd(), "public");
    app.use(express.static(distPath));
    app.use(express.static(publicPath));
    app.get("*", (req: express.Request, res: express.Response) => {
      res.sendFile(distIndexHtml);
    });
  }

  // Global Error Handler
  app.use(errorHandler);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Jeton Edge API Platform running on port ${PORT}`);
    console.log(`[Server] Environment: ${process.env.NODE_ENV || "development"}`);
  });
}

startServer();
