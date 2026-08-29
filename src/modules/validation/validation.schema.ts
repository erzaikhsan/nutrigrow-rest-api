import { z } from "zod";
import { genderSchema, heightSchema, weightSchema } from "../shared.schema.js";

export const zScoreSampleSchema = z.object({
  gender: genderSchema,
  age: z.coerce
    .number()
    .int("Umur harus berupa bilangan bulat dalam bulan")
    .min(0, "Umur tidak boleh negatif")
    .max(60, "Umur maksimal 60 bulan"),
  weight: weightSchema,
  height: heightSchema,
  label: z.string().trim().max(60).optional(),
});

export const zScoreBatchSchema = z.object({
  samples: z
    .array(zScoreSampleSchema)
    .min(1, "Minimal satu sampel")
    .max(200, "Maksimal 200 sampel sekali jalan"),
});
