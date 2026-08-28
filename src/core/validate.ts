import type { Request } from "express";
import type { ZodType } from "zod";

/**
 * Validasi dipanggil langsung dari controller, bukan sebagai middleware.
 *
 * Alasannya tipe: helper ini mengembalikan nilai yang sudah bertipe sesuai
 * skema, sehingga controller bekerja dengan data yang terjamin bentuknya tanpa
 * penegasan tipe manual. Sebagai bonus, Express 5 menjadikan req.query hanya
 * bisa dibaca, sehingga pola middleware lama yang menimpa req.query akan
 * melempar error.
 *
 * ZodError yang dilempar ditangkap oleh error handler terpusat dan diubah
 * menjadi respons 400 berisi pesan per field.
 */

export function parseBody<T>(req: Request, schema: ZodType<T>): T {
  return schema.parse(req.body);
}

export function parseQuery<T>(req: Request, schema: ZodType<T>): T {
  return schema.parse(req.query);
}

export function parseParams<T>(req: Request, schema: ZodType<T>): T {
  return schema.parse(req.params);
}
