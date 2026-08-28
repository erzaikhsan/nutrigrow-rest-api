import type { Response } from "express";

/**
 * Amplop respons dipertahankan persis seperti versi lama — { success, message,
 * data } — karena seluruh model Retrofit di aplikasi memetakan TemplateResponse
 * dengan tiga field itu.
 */
export interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export function ok<T>(res: Response, message: string, data: T): void {
  res.status(200).json({ success: true, message, data } satisfies Envelope<T>);
}

export function created<T>(res: Response, message: string, data: T): void {
  res.status(201).json({ success: true, message, data } satisfies Envelope<T>);
}

/**
 * Rentang halaman untuk endpoint daftar.
 *
 * Versi lama mengambil seluruh tabel dengan findAll tanpa batas — aman saat
 * data seratusan baris, tidak lagi setelah satu desa terkumpul bertahun-tahun.
 *
 * Halaman sengaja hanya diterapkan bila klien meminta lewat parameter `page`.
 * Aplikasi yang beredar sekarang tidak mengirimnya dan menampilkan seluruh isi
 * `data` apa adanya; memaksakan halaman default akan memotong daftar balita
 * tanpa ada yang menyadarinya. Batas pengaman tetap ada agar satu permintaan
 * tidak bisa menarik seluruh tabel.
 */
export const DEFAULT_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 200;
export const LIST_SAFETY_CAP = 1000;

export interface ListParams {
  skip?: number;
  take: number;
}

export function toListParams(
  page: number | undefined,
  size: number | undefined,
): ListParams {
  if (page === undefined) {
    const take = size
      ? Math.min(LIST_SAFETY_CAP, Math.max(1, size))
      : LIST_SAFETY_CAP;
    return { take };
  }

  const safePage = Math.max(1, page);
  const safeSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, size ?? DEFAULT_PAGE_SIZE),
  );

  return { skip: (safePage - 1) * safeSize, take: safeSize };
}
