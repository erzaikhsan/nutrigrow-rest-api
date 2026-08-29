import type { Request, Response } from "express";
import { created, ok } from "../../core/http.js";
import { parseBody, parseParams } from "../../core/validate.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { idParamSchema } from "../shared.schema.js";
import {
  forgotPasswordSchema,
  loginSchema,
  otpRequestSchema,
  registerOfficerSchema,
  registerParentSchema,
  resetPasswordSchema,
  verifyOtpSchema,
} from "./auth.schema.js";
import * as AuthService from "./auth.service.js";

export async function login(req: Request, res: Response): Promise<void> {
  const result = await AuthService.login(parseBody(req, loginSchema));
  ok(res, "Berhasil masuk", result);
}

export async function requestOtp(req: Request, res: Response): Promise<void> {
  const result = await AuthService.requestOtp(parseBody(req, otpRequestSchema));
  created(res, "Kode verifikasi telah dikirim ke surel Anda", result);
}

export async function verifyOtp(req: Request, res: Response): Promise<void> {
  const result = await AuthService.verifyOtp(parseBody(req, verifyOtpSchema));
  ok(res, "Verifikasi berhasil", result);
}

export async function registerParent(
  req: Request,
  res: Response,
): Promise<void> {
  const result = await AuthService.registerParent(
    parseBody(req, registerParentSchema),
  );
  created(res, "Pendaftaran orang tua berhasil", result);
}

export async function registerOfficer(
  req: Request,
  res: Response,
): Promise<void> {
  const auth = requireAuth(req);
  const result = await AuthService.registerOfficer(
    parseBody(req, registerOfficerSchema),
    auth.id,
  );
  created(res, "Pendaftaran kader berhasil", result);
}

export async function deactivateAccount(
  req: Request,
  res: Response,
): Promise<void> {
  const auth = requireAuth(req);
  const { id } = parseParams(req, idParamSchema);
  const result = await AuthService.setAccountActive(id, false, auth);
  ok(res, "Akun berhasil dinonaktifkan", result);
}

export async function activateAccount(
  req: Request,
  res: Response,
): Promise<void> {
  const auth = requireAuth(req);
  const { id } = parseParams(req, idParamSchema);
  const result = await AuthService.setAccountActive(id, true, auth);
  ok(res, "Akun berhasil diaktifkan", result);
}

export async function forgotPassword(
  req: Request,
  res: Response,
): Promise<void> {
  await AuthService.forgotPassword(parseBody(req, forgotPasswordSchema));

  ok(
    res,
    "Bila surel terdaftar, kode pemulihan telah dikirimkan",
    null,
  );
}

export async function resetPassword(
  req: Request,
  res: Response,
): Promise<void> {
  await AuthService.resetPassword(parseBody(req, resetPasswordSchema));
  ok(res, "Kata sandi berhasil diperbarui", null);
}
