import { z } from "zod";
import {
  armCircumSchema,
  headCircumSchema,
  heightSchema,
  legacyDateSchema,
  paginationSchema,
  weightSchema,
} from "../shared.schema.js";

const notInFuture = z.date().refine((date) => date.getTime() <= Date.now(), {
  message: "Tanggal pengukuran tidak boleh di masa depan",
});

export const createGrowthSchema = z.object({
  children_id: z.string().uuid("Id balita tidak valid"),
  date: legacyDateSchema.pipe(notInFuture),
  weight: weightSchema,
  height: heightSchema,

  head_circum: headCircumSchema,
  arm_circum: armCircumSchema,
  note: z.string().trim().max(255).optional().default(""),
});

export const updateGrowthSchema = createGrowthSchema;

export const yearQuerySchema = z.object({
  year: z.coerce
    .number()
    .int()
    .min(2000, "Tahun tidak valid")
    .max(2100, "Tahun tidak valid"),
});

export const monthQuerySchema = z.object({
  date: legacyDateSchema,
});

export const growthListQuerySchema = paginationSchema;

export type CreateGrowthInput = z.infer<typeof createGrowthSchema>;
export type UpdateGrowthInput = z.infer<typeof updateGrowthSchema>;
