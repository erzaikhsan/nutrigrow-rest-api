import { z } from "zod";
import { legacyDateSchema } from "../shared.schema.js";

/**
 * Nama vaksin masih berupa teks bebas, sama seperti versi lama, sehingga
 * "Polio I" dan "Polio 1" tetap dianggap dua imunisasi berbeda dan pengecekan
 * duplikat lolos begitu saja. Perbaikannya berupa tabel master vaksin beserta
 * jadwalnya; itu bagian dari Tier B dan menuntut layar baru di aplikasi, jadi
 * ditunda. Sementara ini nama dinormalkan spasinya agar duplikat yang paling
 * kentara tetap tertangkap.
 */
const vaccineNameSchema = z
  .string()
  .trim()
  .min(1, "Nama vaksin wajib diisi")
  .max(100)
  .transform((value) => value.replace(/\s+/g, " "));

export const createVaccineSchema = z.object({
  children_id: z.string().uuid("Id balita tidak valid"),
  date: legacyDateSchema.refine((date) => date.getTime() <= Date.now(), {
    message: "Tanggal imunisasi tidak boleh di masa depan",
  }),
  vaccine_name: vaccineNameSchema,
  place: z.string().trim().min(1, "Tempat wajib diisi").max(100),
});

export const updateVaccineSchema = createVaccineSchema;

export type CreateVaccineInput = z.infer<typeof createVaccineSchema>;
export type UpdateVaccineInput = z.infer<typeof updateVaccineSchema>;
