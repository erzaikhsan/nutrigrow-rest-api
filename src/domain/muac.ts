import { MuacStatus } from "@prisma/client";

/**
 * Lingkar Lengan Atas (LiLA) / Mid-Upper Arm Circumference.
 *
 * Lingkar lengan sudah dicatat pada setiap penimbangan sejak awal, tetapi tidak
 * pernah dinilai -- tersimpan sebagai angka tanpa makna. Padahal LiLA adalah
 * penapis gizi buruk akut yang tidak memerlukan timbangan maupun alat ukur
 * tinggi, sehingga sangat berguna di lapangan.
 *
 * Ambang WHO/UNICEF untuk umur 6-59 bulan:
 *   < 11,5 cm         gizi buruk akut (severe acute malnutrition)
 *   11,5 - < 12,5 cm  gizi kurang akut (moderate acute malnutrition)
 *   >= 12,5 cm        normal
 *
 * Di luar rentang umur tersebut LiLA tidak dipakai sebagai penapis, sehingga
 * dinilai NOT_APPLICABLE dan bukan "normal" -- membedakan "tidak bermasalah"
 * dari "tidak dinilai" penting agar laporan tidak menghitungnya sebagai sehat.
 */

export const MUAC_SEVERE_THRESHOLD_CM = 11.5;
export const MUAC_MODERATE_THRESHOLD_CM = 12.5;

export const MUAC_MIN_AGE_MONTHS = 6;
export const MUAC_MAX_AGE_MONTHS = 59;

export function classifyMuac(
  ageInMonths: number,
  armCircumCm: number,
): MuacStatus {
  if (
    ageInMonths < MUAC_MIN_AGE_MONTHS ||
    ageInMonths > MUAC_MAX_AGE_MONTHS ||
    armCircumCm <= 0
  ) {
    return MuacStatus.NOT_APPLICABLE;
  }

  if (armCircumCm < MUAC_SEVERE_THRESHOLD_CM) return MuacStatus.SEVERE_ACUTE;
  if (armCircumCm < MUAC_MODERATE_THRESHOLD_CM) return MuacStatus.MODERATE_ACUTE;
  return MuacStatus.NORMAL;
}
