import { Gender, Region } from "@prisma/client";
import { z } from "zod";
import { parseLegacyDate } from "../core/serialize.js";

/**
 * Skema yang dipakai bersama antar modul.
 *
 * Validasi kini memakai zod, menggantikan express-validator. Bedanya bukan
 * sekadar pustaka: zod mengembalikan nilai yang sudah bertipe dan sudah
 * dikonversi, sehingga tanggal sampai di service sebagai objek Date, bukan
 * string yang diurai ulang di beberapa tempat dengan cara berbeda-beda.
 */

/** Tanggal dalam format yang dikirim aplikasi: "2023-07-28 00:00:00.000 Z". */
export const legacyDateSchema = z.string().transform((value, ctx) => {
  const parsed = parseLegacyDate(value);

  if (!parsed) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Format tanggal tidak dikenali",
    });
    return z.NEVER;
  }

  return parsed;
});

export const regionSchema = z.nativeEnum(Region, {
  errorMap: () => ({ message: "Wilayah tidak dikenali" }),
});

export const genderSchema = z.nativeEnum(Gender, {
  errorMap: () => ({ message: "Jenis kelamin harus M atau F" }),
});

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Format surel tidak valid")
  .max(120);

export const passwordSchema = z
  .string()
  .min(8, "Kata sandi minimal 8 karakter")
  .max(72, "Kata sandi maksimal 72 karakter");

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[0-9+][0-9\s-]{7,19}$/, "Nomor telepon tidak valid");

export const fullNameSchema = z.string().trim().min(1).max(100);

export const idParamSchema = z.object({
  id: z.string().uuid("Id tidak valid"),
});

export const childIdParamSchema = z.object({
  childId: z.string().uuid("Id balita tidak valid"),
});

export const regionParamSchema = z.object({
  region: regionSchema,
});

/** Parameter halaman untuk endpoint daftar. */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  size: z.coerce.number().int().positive().max(200).optional(),
});

/**
 * Pengukuran antropometri. Batas atas dan bawah di sini menolak nilai yang
 * mustahil; nilai yang sekadar tidak lazim tetap diterima lalu ditandai oleh
 * penapis kewajaran agar kasus gizi buruk tidak ikut terbuang.
 */
export const weightSchema = z.coerce
  .number()
  .min(0.5, "Berat badan tidak wajar")
  .max(40, "Berat badan tidak wajar");

export const heightSchema = z.coerce
  .number()
  .min(30, "Tinggi badan tidak wajar")
  .max(140, "Tinggi badan tidak wajar");

export const headCircumSchema = z.coerce
  .number()
  .min(25, "Lingkar kepala tidak wajar")
  .max(65, "Lingkar kepala tidak wajar");

export const armCircumSchema = z.coerce
  .number()
  .min(5, "Lingkar lengan tidak wajar")
  .max(30, "Lingkar lengan tidak wajar");
