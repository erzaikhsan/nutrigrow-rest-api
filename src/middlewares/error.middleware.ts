import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { env } from "../config/env.js";
import { AppError, isAppError } from "../core/errors.js";
import { logger } from "../core/logger.js";

interface ErrorBody {
  success: false;
  message: string;
  code: string;
  errors?: unknown;
}

/**
 * Satu tempat untuk seluruh kegagalan.
 *
 * Express 5 meneruskan promise yang ditolak dari handler async ke sini secara
 * otomatis, jadi tidak perlu lagi blok try/catch yang diulang di setiap
 * controller seperti pada versi lama.
 */
export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    next(error);
    return;
  }

  const body = toErrorBody(error);
  const status = resolveStatus(error);

  if (status >= 500) {
    logger.error({ err: error, path: req.originalUrl, method: req.method }, "Permintaan gagal");
  } else {
    logger.warn(
      { code: body.code, path: req.originalUrl, method: req.method },
      body.message,
    );
  }

  res.status(status).json(body);
}

function resolveStatus(error: unknown): number {
  if (isAppError(error)) return error.status;
  if (error instanceof ZodError) return 400;
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return 409;
    if (error.code === "P2025") return 404;
    if (error.code === "P2003") return 409;
  }
  return 500;
}

function toErrorBody(error: unknown): ErrorBody {
  if (error instanceof ZodError) {
    return {
      success: false,
      message: "Data yang dikirim tidak valid",
      code: "VALIDATION_ERROR",
      // Bentuk ini cocok dengan cabang `errorResponse.errors` pada helper
      // processError() di aplikasi, yang mengambil pesan pertama tiap field.
      errors: Object.fromEntries(
        Object.entries(error.flatten().fieldErrors).filter(
          ([, messages]) => messages && messages.length > 0,
        ),
      ),
    };
  }

  if (isAppError(error)) {
    const body: ErrorBody = {
      success: false,
      message: error.message,
      code: error.code,
    };
    if (error.details !== undefined) body.errors = error.details;
    return body;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return {
          success: false,
          message: "Data dengan nilai unik yang sama sudah ada",
          code: "CONFLICT",
        };
      case "P2025":
        return {
          success: false,
          message: "Data tidak ditemukan",
          code: "NOT_FOUND",
        };
      case "P2003":
        return {
          success: false,
          message: "Data masih terkait dengan data lain",
          code: "CONFLICT",
        };
    }
  }

  // Detail kegagalan internal tidak pernah dibocorkan ke klien.
  return {
    success: false,
    message: env.isProduction
      ? "Terjadi kesalahan pada server"
      : error instanceof Error
        ? error.message
        : "Terjadi kesalahan pada server",
    code: "INTERNAL_ERROR",
  };
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`,
    code: "NOT_FOUND",
  } satisfies ErrorBody);
}

export { AppError };
