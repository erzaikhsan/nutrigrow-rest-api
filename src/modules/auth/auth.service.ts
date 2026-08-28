import { AuditAction, Role, type User } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomInt } from "node:crypto";
import { env } from "../../config/env.js";
import {
  conflict,
  forbidden,
  invalidCredentials,
  notFound,
  tooManyRequests,
} from "../../core/errors.js";
import { sendOtpEmail, sendPasswordResetEmail } from "../../core/mailer.js";
import { prisma } from "../../core/prisma.js";
import { toUserDto, type UserDto } from "../../core/serialize.js";
import {
  signAccessToken,
  type AuthContext,
} from "../../middlewares/auth.middleware.js";
import { recordAudit } from "../audit/audit.service.js";
import type {
  ForgotPasswordInput,
  LoginInput,
  OtpRequestInput,
  RegisterOfficerInput,
  RegisterParentInput,
  ResetPasswordInput,
  VerifyOtpInput,
} from "./auth.schema.js";

const PASSWORD_ROUNDS = 10;
const OTP_ROUNDS = 8;

const OTP_TTL_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;
const OTP_MAX_REQUESTS_PER_HOUR = 5;

/**
 * Berapa lama sebuah OTP yang sudah diverifikasi masih boleh dipakai untuk
 * menyelesaikan pendaftaran. Aplikasi memanggil verifikasi dan pendaftaran
 * sebagai dua permintaan terpisah, sehingga perlu jeda yang wajar.
 */
const REGISTRATION_WINDOW_MINUTES = 30;

const RESET_TTL_MINUTES = 15;

function minutesFromNow(minutes: number): Date {
  return new Date(Date.now() + minutes * 60_000);
}

function minutesAgo(minutes: number): Date {
  return new Date(Date.now() - minutes * 60_000);
}

function generateNumericCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

/** Masa aktif akun sejak pendaftaran. */
function defaultActivePeriod(): Date {
  const period = new Date();
  period.setFullYear(period.getFullYear() + env.ACCOUNT_ACTIVE_YEARS);
  return period;
}

// ---------------------------------------------------------------------------
// Masuk
// ---------------------------------------------------------------------------

export interface LoginResult {
  id: string;
  role: string;
  region: string;
  token: string;
}

export async function login(input: LoginInput): Promise<LoginResult> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  // Pesan yang sama untuk surel tidak terdaftar maupun kata sandi salah, agar
  // endpoint ini tidak bisa dipakai memeriksa surel mana yang punya akun.
  if (!user) throw invalidCredentials();

  const isPasswordCorrect = await bcrypt.compare(input.password, user.password);
  if (!isPasswordCorrect) throw invalidCredentials();

  if (user.activePeriod.getTime() < Date.now()) {
    if (user.isActive) {
      await prisma.user.update({
        where: { id: user.id },
        data: { isActive: false },
      });
    }
    throw forbidden("Masa aktif akun Anda sudah berakhir", "ACCOUNT_INACTIVE");
  }

  if (!user.isActive) {
    throw forbidden("Akun Anda sedang dinonaktifkan", "ACCOUNT_INACTIVE");
  }

  return {
    id: user.id,
    role: user.role,
    region: user.region,
    token: signAccessToken({
      sub: user.id,
      role: user.role,
      region: user.region,
    }),
  };
}

// ---------------------------------------------------------------------------
// Pendaftaran: permintaan dan verifikasi OTP
// ---------------------------------------------------------------------------

export interface OtpRequestResult {
  email: string;
  password: string;
}

export async function requestOtp(
  input: OtpRequestInput,
): Promise<OtpRequestResult> {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });
  if (existing) throw conflict("Surel sudah terdaftar");

  const recentRequests = await prisma.otpRequest.count({
    where: { email: input.email, createdAt: { gte: minutesAgo(60) } },
  });
  if (recentRequests >= OTP_MAX_REQUESTS_PER_HOUR) {
    throw tooManyRequests(
      "Terlalu banyak permintaan kode. Coba lagi satu jam berikutnya.",
    );
  }

  const code = generateNumericCode();

  await prisma.otpRequest.create({
    data: {
      email: input.email,
      codeHash: await bcrypt.hash(code, OTP_ROUNDS),
      expiresAt: minutesFromNow(OTP_TTL_MINUTES),
    },
  });

  await sendOtpEmail(input.email, code);

  // Kata sandi dikembalikan apa adanya semata-mata karena alur aplikasi yang
  // beredar menyimpannya lalu mengirimkannya kembali pada langkah pendaftaran.
  // Begitu aplikasi diperbarui untuk memakai token registrasi, field ini
  // sebaiknya dihapus dari respons.
  return { email: input.email, password: input.password };
}

export interface VerifyOtpResult {
  id: string;
  email: string;
  password: string;
  role: string;
  is_active: string;
  token: string;
}

export async function verifyOtp(
  input: VerifyOtpInput,
): Promise<VerifyOtpResult> {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });
  if (existing) throw conflict("Surel sudah terdaftar");

  const record = await prisma.otpRequest.findFirst({
    where: { email: input.email, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!record) throw notFound("Kode verifikasi");

  if (record.expiresAt.getTime() < Date.now()) {
    throw forbidden("Kode verifikasi sudah kedaluwarsa");
  }

  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    throw tooManyRequests(
      "Percobaan kode verifikasi sudah melebihi batas. Mohon minta kode baru.",
    );
  }

  const isCodeCorrect = await bcrypt.compare(input.otp, record.codeHash);

  if (!isCodeCorrect) {
    await prisma.otpRequest.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    throw forbidden("Kode verifikasi salah");
  }

  await prisma.otpRequest.update({
    where: { id: record.id },
    data: { consumedAt: new Date() },
  });

  return {
    id: record.id,
    email: input.email,
    password: "",
    role: "",
    is_active: "false",
    token: "",
  };
}

// ---------------------------------------------------------------------------
// Pendaftaran akun
// ---------------------------------------------------------------------------

/**
 * Memastikan pendaftaran benar-benar didahului verifikasi OTP.
 *
 * Versi lama tidak pernah memeriksa ini: siapa pun bisa memanggil endpoint
 * pendaftaran secara langsung dan mendapat akun tanpa pernah menerima kode,
 * sehingga seluruh alur OTP hanya bersifat hiasan.
 */
async function assertOtpVerified(email: string): Promise<void> {
  const verified = await prisma.otpRequest.findFirst({
    where: {
      email,
      consumedAt: { not: null, gte: minutesAgo(REGISTRATION_WINDOW_MINUTES) },
    },
    orderBy: { consumedAt: "desc" },
    select: { id: true },
  });

  if (!verified) {
    throw forbidden(
      "Surel belum diverifikasi. Mohon minta dan masukkan kode verifikasi terlebih dahulu.",
    );
  }
}

async function createAccount(
  input: RegisterParentInput | RegisterOfficerInput,
  role: Role,
): Promise<User> {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });
  if (existing) throw conflict("Surel sudah terdaftar");

  return prisma.user.create({
    data: {
      email: input.email,
      password: await bcrypt.hash(input.password, PASSWORD_ROUNDS),
      role,
      isActive: true,
      fullName: input.full_name,
      gender: input.gender,
      dateOfBirth: input.date_of_birth,
      phoneNumber: input.phone_number,
      address: input.address || null,
      region: input.region,
      // Dulu kolom ini tidak pernah diisi padahal NOT NULL, sehingga setiap
      // pendaftaran berakhir dengan galat 500.
      activePeriod: defaultActivePeriod(),
    },
  });
}

export async function registerParent(
  input: RegisterParentInput,
): Promise<UserDto> {
  await assertOtpVerified(input.email);

  const user = await createAccount(input, Role.Parent);

  await recordAudit({
    actorId: user.id,
    action: AuditAction.CREATE,
    entity: "users",
    entityId: user.id,
    after: { email: user.email, role: user.role, region: user.region },
  });

  return toUserDto(user);
}

export async function registerOfficer(
  input: RegisterOfficerInput,
  actorId: string,
): Promise<UserDto> {
  const user = await createAccount(input, Role.Officer);

  await recordAudit({
    actorId,
    action: AuditAction.CREATE,
    entity: "users",
    entityId: user.id,
    after: { email: user.email, role: user.role, region: user.region },
  });

  return toUserDto(user);
}

// ---------------------------------------------------------------------------
// Aktivasi akun
// ---------------------------------------------------------------------------

/**
 * Mengaktifkan atau menonaktifkan akun.
 *
 * Versi lama hanya meminta pengguna sudah masuk, sehingga akun mana pun bisa
 * menonaktifkan akun mana pun -- termasuk orang tua menonaktifkan admin.
 * Aturannya kini: admin boleh atas siapa saja, kader hanya atas orang tua di
 * wilayahnya sendiri, dan tidak seorang pun boleh menonaktifkan dirinya.
 */
export async function setAccountActive(
  userId: string,
  isActive: boolean,
  actor: AuthContext,
): Promise<UserDto> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw notFound("Pengguna");

  if (user.id === actor.id) {
    throw forbidden("Anda tidak dapat mengubah status akun sendiri");
  }

  if (actor.role === Role.Officer) {
    if (user.role !== Role.Parent || user.region !== actor.region) {
      throw forbidden(
        "Kader hanya dapat mengubah status akun orang tua di wilayahnya",
      );
    }
  } else if (actor.role !== Role.Admin) {
    throw forbidden();
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isActive },
  });

  await recordAudit({
    actorId: actor.id,
    action: AuditAction.UPDATE,
    entity: "users",
    entityId: userId,
    before: { isActive: user.isActive },
    after: { isActive },
  });

  return toUserDto(updated);
}

// ---------------------------------------------------------------------------
// Pemulihan kata sandi
// ---------------------------------------------------------------------------

export async function forgotPassword(
  input: ForgotPasswordInput,
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });

  // Selalu berakhir sukses, terdaftar maupun tidak, agar endpoint ini tidak
  // bisa dipakai memetakan surel mana yang punya akun.
  if (!user) return;

  const recentRequests = await prisma.passwordReset.count({
    where: { userId: user.id, createdAt: { gte: minutesAgo(60) } },
  });
  if (recentRequests >= OTP_MAX_REQUESTS_PER_HOUR) return;

  const code = generateNumericCode();

  await prisma.passwordReset.create({
    data: {
      userId: user.id,
      tokenHash: await bcrypt.hash(code, OTP_ROUNDS),
      expiresAt: minutesFromNow(RESET_TTL_MINUTES),
    },
  });

  await sendPasswordResetEmail(input.email, code);
}

export async function resetPassword(input: ResetPasswordInput): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });
  if (!user) throw forbidden("Kode pemulihan tidak valid");

  const record = await prisma.passwordReset.findFirst({
    where: { userId: user.id, usedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!record || record.expiresAt.getTime() < Date.now()) {
    throw forbidden("Kode pemulihan tidak valid atau sudah kedaluwarsa");
  }

  const isCodeCorrect = await bcrypt.compare(input.otp, record.tokenHash);
  if (!isCodeCorrect) throw forbidden("Kode pemulihan tidak valid");

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { password: bcrypt.hashSync(input.password, PASSWORD_ROUNDS) },
    }),
    prisma.passwordReset.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    // Seluruh kode pemulihan lain untuk pengguna ini ikut dimatikan.
    prisma.passwordReset.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    }),
  ]);

  await recordAudit({
    actorId: user.id,
    action: AuditAction.UPDATE,
    entity: "users",
    entityId: user.id,
    after: { passwordChanged: true },
  });
}
