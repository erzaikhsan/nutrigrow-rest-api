import { z } from "zod";
import {
  legacyDateSchema,
  paginationSchema,
  regionSchema,
} from "../shared.schema.js";

/** Jam dalam format 24 jam, misalnya "09:00". Dulu tidak divalidasi sama sekali. */
const timeSchema = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Jam harus dalam format HH:MM");

const baseEventSchema = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi").max(150),
  date: legacyDateSchema,
  start_time: timeSchema,
  end_time: timeSchema,
  place: z.string().trim().min(1, "Tempat wajib diisi").max(150),
  description: z.string().trim().min(1, "Deskripsi wajib diisi").max(2000),
  region: regionSchema,
});

export const createEventSchema = baseEventSchema.refine(
  (value) => value.end_time > value.start_time,
  {
    message: "Jam selesai harus setelah jam mulai",
    path: ["end_time"],
  },
);

export const updateEventSchema = createEventSchema;

export const eventFilterSchema = paginationSchema.extend({
  date: legacyDateSchema.optional(),
  region: regionSchema.optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type EventFilterInput = z.infer<typeof eventFilterSchema>;
