import { HcaStatus } from "@prisma/client";
import { calculateZScore, type IndicatorResult } from "./growth-standards.js";
import { HCFA_WHO_REFERENCE } from "./hcfa-reference.js";
import type { Sex } from "./who-reference.js";

/**
 * Lingkar kepala menurut umur.
 *
 * Sama seperti lingkar lengan, lingkar kepala sudah dicatat sejak awal tetapi
 * tidak pernah dinilai. Penyimpangan lingkar kepala adalah penanda dini
 * gangguan perkembangan otak, sehingga sayang bila datanya hanya menumpuk.
 *
 * Ambang yang dipakai adalah konvensi klinis umum: di bawah -2 SD mengarah ke
 * mikrosefali, di atas +2 SD ke makrosefali. Keduanya bukan diagnosis,
 * melainkan penanda bahwa anak perlu diperiksa lebih lanjut.
 *
 * Selama tabel rujukan WHO belum diimpor (lihat hcfa-reference.ts), fungsi ini
 * mengembalikan UNKNOWN dan z-score null.
 */
export function calculateHeadCircumference(
  ageInMonths: number,
  headCircumCm: number,
  sex: Sex,
): IndicatorResult<HcaStatus> {
  const band = HCFA_WHO_REFERENCE[sex][ageInMonths];
  if (!band) return { zScore: null, status: HcaStatus.UNKNOWN };

  const zScore = calculateZScore(headCircumCm, band);

  let status: HcaStatus;
  if (zScore < -2) status = HcaStatus.MICROCEPHALY;
  else if (zScore > 2) status = HcaStatus.MACROCEPHALY;
  else status = HcaStatus.NORMAL;

  return { zScore, status };
}
