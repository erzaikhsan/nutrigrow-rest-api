import type { NextFunction, Request, Response } from "express";
import type { Region, Role } from "@prisma/client";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { forbidden, unauthenticated } from "../core/errors.js";
import { prisma } from "../core/prisma.js";

export interface AuthContext {
  id: string;
  role: Role;
  region: Region;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

export interface TokenPayload {
  sub: string;
  role: Role;
  region: Region;
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

/**
 * Membaca konteks autentikasi yang sudah dipasang `authenticate`.
 * Dipakai di controller supaya tipenya tidak lagi opsional.
 */
export function requireAuth(req: Request): AuthContext {
  if (!req.auth) {
    throw unauthenticated("Autentikasi dibutuhkan");
  }
  return req.auth;
}

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    throw unauthenticated("Header Authorization tidak ditemukan");
  }

  const token = header.slice("Bearer ".length).trim();
  if (token.length === 0) {
    throw unauthenticated("Token kosong");
  }

  let payload: TokenPayload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw unauthenticated("Sesi sudah berakhir, silakan masuk kembali", "TOKEN_EXPIRED");
    }
    throw unauthenticated("Token tidak valid");
  }

  // Peran dan status akun dibaca ulang dari basis data, bukan dipercaya dari
  // isi token. Akun yang dinonaktifkan setelah token terbit harus langsung
  // kehilangan akses.
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, role: true, region: true, isActive: true, activePeriod: true },
  });

  if (!user) {
    throw unauthenticated("Akun tidak ditemukan");
  }

  if (!user.isActive) {
    throw forbidden("Akun Anda sedang dinonaktifkan", "ACCOUNT_INACTIVE");
  }

  if (user.activePeriod.getTime() < Date.now()) {
    throw forbidden("Masa aktif akun Anda sudah berakhir", "ACCOUNT_INACTIVE");
  }

  req.auth = { id: user.id, role: user.role, region: user.region };
  next();
}

/**
 * Pembatas peran.
 *
 * Ini yang hilang di versi lama: fungsi serupa sudah ditulis tetapi tidak
 * pernah dipasang di satu route pun, sehingga setiap akun yang berhasil masuk
 * -- termasuk orang tua -- bisa membaca seluruh data balita sedesa, mengubah
 * data anak orang lain, dan menonaktifkan akun siapa saja.
 */
export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const auth = requireAuth(req);

    if (!roles.includes(auth.role)) {
      throw forbidden();
    }

    next();
  };
}

/**
 * Mengizinkan pemilik sumber daya, atau peran tertentu sebagai pengecualian.
 * Contoh: orang tua boleh membuka profilnya sendiri, kader dan admin boleh
 * membuka profil siapa pun.
 */
export function authorizeSelfOr(paramName: string, ...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const auth = requireAuth(req);

    if (roles.includes(auth.role)) {
      next();
      return;
    }

    if (req.params[paramName] === auth.id) {
      next();
      return;
    }

    throw forbidden();
  };
}
