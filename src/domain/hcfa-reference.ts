import type { ByAge, Sex } from "./who-reference.js";

/**
 * Standar WHO lingkar kepala menurut umur (head circumference-for-age),
 * 0-60 bulan.
 *
 * BERKAS INI DIISI OLEH SKRIP, BUKAN DITULIS TANGAN.
 *
 *   npm run who:import-hcfa -- <berkas-laki-laki> <berkas-perempuan>
 *
 * Angkanya sengaja tidak ditulis manual. Tabel z-score antropometri memuat
 * ratusan bilangan yang saling berdekatan; satu galat ketik tidak akan terlihat
 * saat dibaca, tetapi diam-diam menggeser klasifikasi. Karena hasil klasifikasi
 * ini masuk ke dalam skripsi, sumbernya harus berkas resmi WHO.
 *
 * Unduh dua berkas berikut dari halaman WHO Child Growth Standards
 * (bagian "Head circumference-for-age", tabel "expanded tables", format txt):
 *
 *   hcfa-boys-zscore-expanded-tables.txt
 *   hcfa-girls-zscore-expanded-tables.txt
 *
 * Selama tabel belum diimpor, lingkar kepala tetap dicatat apa adanya dan
 * statusnya dikembalikan sebagai UNKNOWN -- tidak ada nilai yang dikarang.
 */

export const HCFA_WHO_REFERENCE: Record<Sex, ByAge> = {
  M: {},
  F: {},
};

export const HCFA_REFERENCE_AVAILABLE =
  Object.keys(HCFA_WHO_REFERENCE.M).length > 0 &&
  Object.keys(HCFA_WHO_REFERENCE.F).length > 0;
