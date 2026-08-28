import { z } from "zod";
import {
  fullNameSchema,
  genderSchema,
  legacyDateSchema,
  paginationSchema,
  phoneSchema,
  regionSchema,
} from "../shared.schema.js";

/**
 * Pembaruan profil selalu mengenai akun yang sedang masuk -- aplikasi memang
 * tidak mengirimkan id pada endpoint ini. Sifat itu dipertahankan karena
 * sekaligus menutup kemungkinan seseorang memperbarui profil orang lain.
 */
export const updateProfileSchema = z.object({
  full_name: fullNameSchema,
  gender: genderSchema,
  date_of_birth: legacyDateSchema.refine(
    (date) => date.getTime() <= Date.now(),
    { message: "Tanggal lahir tidak boleh di masa depan" },
  ),
  phone_number: phoneSchema,
  address: z.string().trim().max(500).optional().default(""),
  region: regionSchema,
});

export const userSearchSchema = paginationSchema.extend({
  name: z.string().trim().max(100).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UserSearchInput = z.infer<typeof userSearchSchema>;
