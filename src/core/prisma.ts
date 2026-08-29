import { PrismaClient } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { env } from "../config/env.js";
import { logger } from "./logger.js";

const logDefinitions: Prisma.LogDefinition[] = env.isDevelopment
  ? [
      { emit: "event", level: "query" },
      { emit: "event", level: "warn" },
      { emit: "event", level: "error" },
    ]
  : [
      { emit: "event", level: "warn" },
      { emit: "event", level: "error" },
    ];

export const prisma = new PrismaClient({ log: logDefinitions });

if (env.isDevelopment) {
  prisma.$on("query", (event) => {
    logger.debug({ query: event.query, durationMs: event.duration }, "prisma");
  });
}

prisma.$on("warn", (event) => logger.warn({ message: event.message }, "prisma"));
prisma.$on("error", (event) => logger.error({ message: event.message }, "prisma"));

export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
  logger.info("Terhubung ke basis data");
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info("Koneksi basis data ditutup");
}
