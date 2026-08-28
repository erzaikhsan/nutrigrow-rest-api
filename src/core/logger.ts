import pino from "pino";
import { env } from "../config/env.js";

export const logger = pino({
  level: env.isProduction ? "info" : "debug",
  // Jangan pernah menuliskan kredensial atau token ke log.
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "password",
      "*.password",
      "body.password",
      "res.headers['set-cookie']",
    ],
    censor: "[REDACTED]",
  },
  transport: env.isProduction
    ? undefined
    : {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "yyyy-mm-dd HH:MM:ss",
          ignore: "pid,hostname",
        },
      },
});

export type Logger = typeof logger;
