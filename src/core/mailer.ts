import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { logger } from "./logger.js";

/**
 * Pengirim surel.
 *
 * Kredensial kini datang dari environment. Versi lama menuliskan alamat Gmail
 * beserta app password langsung di dalam kode sumber, dan nilainya sudah
 * terlanjur masuk ke riwayat git.
 */
const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASSWORD,
  },
});

const from = `"${env.SMTP_FROM_NAME}" <${env.SMTP_USER}>`;

async function send(to: string, subject: string, text: string): Promise<void> {
  await transporter.sendMail({ from, to, subject, text });
}

export async function sendOtpEmail(to: string, code: string): Promise<void> {
  await send(
    to,
    "Kode Verifikasi NutriGrow",
    [
      "Halo,",
      "",
      `Kode verifikasi pendaftaran NutriGrow Anda adalah: ${code}`,
      "",
      "Kode ini berlaku 10 menit dan hanya bisa dipakai satu kali.",
      "Abaikan surel ini bila Anda tidak merasa mendaftar.",
    ].join("\n"),
  );

  logger.info({ to }, "Kode OTP terkirim");
}

export async function sendPasswordResetEmail(
  to: string,
  code: string,
): Promise<void> {
  await send(
    to,
    "Pemulihan Kata Sandi NutriGrow",
    [
      "Halo,",
      "",
      `Kode pemulihan kata sandi NutriGrow Anda adalah: ${code}`,
      "",
      "Kode ini berlaku 15 menit dan hanya bisa dipakai satu kali.",
      "Bila Anda tidak meminta pemulihan kata sandi, abaikan surel ini dan",
      "kata sandi Anda akan tetap seperti semula.",
    ].join("\n"),
  );

  logger.info({ to }, "Kode pemulihan kata sandi terkirim");
}
