/**
 * Satu jenis error untuk seluruh aplikasi.
 *
 * Versi lama memakai `throw new Error(404)` lalu dibandingkan dengan
 * `err.message == 404` di setiap controller. Selain rapuh, pola itu membuat
 * satu jenis kegagalan tidak bisa dibedakan dari yang lain — dan sempat
 * menyebabkan konflik 409 dilaporkan sebagai 404 ke aplikasi.
 */

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHENTICATED"
  | "INVALID_CREDENTIALS"
  | "TOKEN_EXPIRED"
  | "FORBIDDEN"
  | "ACCOUNT_INACTIVE"
  | "NOT_FOUND"
  | "CONFLICT"
  | "TOO_MANY_REQUESTS"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  readonly status: number;
  readonly code: ErrorCode;
  readonly details?: unknown;

  constructor(
    status: number,
    code: ErrorCode,
    message: string,
    details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.details = details;
    Error.captureStackTrace?.(this, AppError);
  }
}

export const badRequest = (message: string, details?: unknown): AppError =>
  new AppError(400, "VALIDATION_ERROR", message, details);

export const unauthenticated = (
  message = "Token tidak valid atau sudah kedaluwarsa",
  code: ErrorCode = "UNAUTHENTICATED",
): AppError => new AppError(401, code, message);

export const invalidCredentials = (): AppError =>
  new AppError(401, "INVALID_CREDENTIALS", "Email atau kata sandi salah");

export const forbidden = (
  message = "Anda tidak memiliki akses ke sumber daya ini",
  code: ErrorCode = "FORBIDDEN",
): AppError => new AppError(403, code, message);

export const notFound = (resource = "Data"): AppError =>
  new AppError(404, "NOT_FOUND", `${resource} tidak ditemukan`);

export const conflict = (message: string): AppError =>
  new AppError(409, "CONFLICT", message);

export const tooManyRequests = (message: string): AppError =>
  new AppError(429, "TOO_MANY_REQUESTS", message);

export const isAppError = (error: unknown): error is AppError =>
  error instanceof AppError;
