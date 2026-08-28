import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./core/logger.js";
import { connectDatabase, disconnectDatabase } from "./core/prisma.js";

async function bootstrap(): Promise<void> {
  await connectDatabase();

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info(
      `Server berjalan di http://localhost:${env.PORT}/${env.API_PREFIX} (${env.NODE_ENV})`,
    );
  });

  const shutdown = (signal: string): void => {
    logger.info(`${signal} diterima, menutup server...`);

    server.close(() => {
      void disconnectDatabase().finally(() => process.exit(0));
    });

    setTimeout(() => {
      logger.error("Penutupan melewati batas waktu, memaksa keluar");
      process.exit(1);
    }, 10_000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

bootstrap().catch((error: unknown) => {
  logger.error({ err: error }, "Gagal menjalankan server");
  process.exit(1);
});
