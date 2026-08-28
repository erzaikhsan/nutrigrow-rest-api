import { z } from "zod";

/**
 * Bulan dikirim aplikasi dalam basis satu (1 = Januari) dan dikonversi ke
 * basis nol di sini, satu kali. Versi lama melakukan konversi itu di beberapa
 * tempat dan salah satu di antaranya mengurangi dua kali.
 */
export const reportPeriodSchema = z.object({
  month: z.coerce
    .number()
    .int()
    .min(1, "Bulan harus antara 1 dan 12")
    .max(12, "Bulan harus antara 1 dan 12")
    .transform((value) => value - 1),
  year: z.coerce
    .number()
    .int()
    .min(2000, "Tahun tidak valid")
    .max(2100, "Tahun tidak valid"),
});

export type ReportPeriod = z.infer<typeof reportPeriodSchema>;
