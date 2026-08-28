import { ChildStatus } from "@prisma/client";
import { z } from "zod";
import {
  fullNameSchema,
  genderSchema,
  headCircumSchema,
  heightSchema,
  legacyDateSchema,
  paginationSchema,
  regionSchema,
  weightSchema,
} from "../shared.schema.js";

const baseChildSchema = z.object({
  parents_id: z.string().uuid("Id orang tua tidak valid"),
  full_name: fullNameSchema.max(75),
  gender: genderSchema,
  place_of_birth: z.string().trim().min(1).max(100),
  date_of_birth: legacyDateSchema,
  father: z.string().trim().max(100).optional().default(""),
  mother: z.string().trim().max(100).optional().default(""),
  order_of_child: z.coerce
    .number()
    .int()
    .min(1, "Urutan kelahiran minimal 1")
    .max(20),
  region: regionSchema,
  birth_weight: weightSchema,
  birth_height: heightSchema,
  birth_head_circum: headCircumSchema,
  /// Opsional; belum tentu sudah terbit saat balita didaftarkan.
  nik: z
    .string()
    .trim()
    .regex(/^\d{16}$/, "NIK harus 16 digit angka")
    .optional(),
});

/** Tanggal lahir tidak boleh di masa depan. */
const notInFuture = (date: Date): boolean => date.getTime() <= Date.now();

export const createChildSchema = baseChildSchema.refine(
  (value) => notInFuture(value.date_of_birth),
  { message: "Tanggal lahir tidak boleh di masa depan", path: ["date_of_birth"] },
);

export const updateChildSchema = baseChildSchema
  .extend({
    status: z.nativeEnum(ChildStatus).optional(),
  })
  .refine((value) => notInFuture(value.date_of_birth), {
    message: "Tanggal lahir tidak boleh di masa depan",
    path: ["date_of_birth"],
  });

export const childSearchSchema = paginationSchema.extend({
  name: z.string().trim().max(75).optional(),
  /** Secara bawaan hanya balita yang masih menjadi sasaran posyandu. */
  includeInactive: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
});

export const parentIdParamSchema = z.object({
  parentId: z.string().uuid("Id orang tua tidak valid"),
});

export type CreateChildInput = z.infer<typeof createChildSchema>;
export type UpdateChildInput = z.infer<typeof updateChildSchema>;
export type ChildSearchInput = z.infer<typeof childSearchSchema>;
