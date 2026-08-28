import { z } from "zod";
import {
  armCircumSchema,
  headCircumSchema,
  heightSchema,
  legacyDateSchema,
  paginationSchema,
  weightSchema,
} from "../shared.schema.js";

/**
 * Tanggal pengukuran tidak boleh di masa depan.
 *
 * Versi lama menerima tanggal apa pun. Tanggal di masa depan membuat umur dan
 * seluruh penilaian gizi ikut salah, sementara tanggal sebelum kelahiran
 * menghasilkan umur negatif yang diam-diam dipangkas menjadi nol.
 */
const notInFuture = z.date().refine((date) => date.getTime() <= Date.now(), {
  message: "Tanggal pengukuran tidak boleh di masa depan",
});

export const createGrowthSchema = z.object({
  children_id: z.string().uuid("Id balita tidak valid"),
  date: legacyDateSchema.pipe(notInFuture),
  weight: weightSchema,
  height: heightSchema,
  // Dulu keduanya tidak divalidasi sama sekali, sehingga nilai yang tidak
  // dikirim berubah menjadi NaN dan menggagalkan penyimpanan dengan galat 500.
  head_circum: headCircumSchema,
  arm_circum: armCircumSchema,
  note: z.string().trim().max(255).optional().default(""),
});

export const updateGrowthSchema = createGrowthSchema;

export const yearQuerySchema = z.object({
  // Sumber bug lama: nilai ini string, dan `year + 1` menghasilkan "20251"
  // sehingga batas atas rentang melompat ke tahun 20251.
  year: z.coerce
    .number()
    .int()
    .min(2000, "Tahun tidak valid")
    .max(2100, "Tahun tidak valid"),
});

/**
 * Aplikasi mengirim tanggal lewat @Field pada permintaan GET untuk dua
 * endpoint ini, yang tidak sah dan ditolak Retrofit. Backend menerima dari
 * query maupun body agar tetap melayani aplikasi lama sesudah diperbaiki
 * maupun sebelumnya.
 */
export const monthQuerySchema = z.object({
  date: legacyDateSchema,
});

export const growthListQuerySchema = paginationSchema;

export type CreateGrowthInput = z.infer<typeof createGrowthSchema>;
export type UpdateGrowthInput = z.infer<typeof updateGrowthSchema>;
