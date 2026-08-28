import { z } from "zod";
import {
  emailSchema,
  fullNameSchema,
  genderSchema,
  legacyDateSchema,
  passwordSchema,
  phoneSchema,
  regionSchema,
} from "../shared.schema.js";

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Kata sandi wajib diisi"),
});

export const otpRequestSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const verifyOtpSchema = z.object({
  email: emailSchema,
  otp: z
    .string()
    .trim()
    .regex(/^\d{4,8}$/, "Kode OTP tidak valid"),
});

const profileSchema = z.object({
  full_name: fullNameSchema,
  gender: genderSchema,
  date_of_birth: legacyDateSchema,
  phone_number: phoneSchema,
  address: z.string().trim().max(500).optional().default(""),
  region: regionSchema,
});

export const registerParentSchema = profileSchema.extend({
  email: emailSchema,
  password: passwordSchema,
});

export const registerOfficerSchema = profileSchema.extend({
  email: emailSchema,
  password: passwordSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
  otp: z
    .string()
    .trim()
    .regex(/^\d{4,8}$/, "Kode pemulihan tidak valid"),
  password: passwordSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type OtpRequestInput = z.infer<typeof otpRequestSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type RegisterParentInput = z.infer<typeof registerParentSchema>;
export type RegisterOfficerInput = z.infer<typeof registerOfficerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
