import { z } from "zod";
import { legacyDateSchema } from "../shared.schema.js";

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
