import express from "express";
import type { RequestHandler } from "express";
import cors from "cors";
import * as helmetModule from "helmet";
import { pinoHttp } from "pino-http";
import { env } from "./config/env.js";
import { logger } from "./core/logger.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import { apiRouter } from "./modules/index.js";

type HelmetFactory = (options?: Record<string, unknown>) => RequestHandler;

const helmetImport = helmetModule as unknown as HelmetFactory & {
  default?: HelmetFactory;
};

const helmet: HelmetFactory = helmetImport.default ?? helmetImport;

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  app.use(helmet());

  app.use(
    cors({
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
