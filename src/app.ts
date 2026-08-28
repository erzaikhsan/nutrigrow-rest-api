import express from "express";
import cors from "cors";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { env } from "./config/env.js";
import { logger } from "./core/logger.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import { apiRouter } from "./modules/index.js";

export function createApp() {
  const app = express();

  // Di belakang reverse proxy, dibutuhkan agar rate limiter membaca IP asli.
  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  app.use(helmet());

  app.use(
    cors({
      // Versi lama memasang origin "*" bersama credentials: true, kombinasi
      // yang tidak valid dan terlalu terbuka. Daftar origin kini dikendalikan
      // lewat environment; kosong berarti bebas, hanya dipakai saat development.
      origin: env.corsOrigins.length > 0 ? env.corsOrigins : true,
      credentials: env.corsOrigins.length > 0,
    }),
  );

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));

  app.use(
    pinoHttp({
      logger,
      autoLogging: {
        ignore: (req) => req.url === "/health",
      },
    }),
  );

  app.get("/health", (_req, res) => {
    res.json({ success: true, message: "NutriGrow API aktif", data: null });
  });

  app.use(`/${env.API_PREFIX}`, apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
