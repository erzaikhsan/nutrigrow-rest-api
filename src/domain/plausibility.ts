/**
 * Penapis kewajaran data pengukuran.
 *
 * Salah ketik 35 kg untuk bayi -- alih-alih 3,5 kg -- sebelumnya diterima tanpa
 * perlawanan dan merusak seluruh grafik pertumbuhan anak tersebut, termasuk
 * penilaian bulan-bulan berikutnya yang membandingkan berat.
 *
 * Pendekatannya mengikuti praktik WHO Anthro: nilai yang mustahil ditolak
 * sebagai galat validasi, sedangkan nilai yang sekadar sangat tidak lazim
 * (|z| > 6) tetap disimpan namun ditandai untuk diverifikasi kader. Menolak
 * semua yang ekstrem berisiko membuang kasus gizi buruk yang justru paling
 * perlu tercatat.
 */

export const PLAUSIBLE_RANGES = {
  weightKg: { min: 0.5, max: 40 },
  heightCm: { min: 30, max: 140 },
  headCircumCm: { min: 25, max: 65 },
  armCircumCm: { min: 5, max: 30 },
} as const;

/** Ambang penandaan z-score, mengikuti WHO Anthro. */
export const EXTREME_Z_SCORE = 6;

export interface PlausibilityFlag {
  isFlagged: boolean;
  reason: string | null;
}

export function assessPlausibility(params: {
  wfaZScore: number | null;
  hfaZScore: number | null;
  wfhZScore: number | null;
}): PlausibilityFlag {
  const reasons: string[] = [];

  const check = (label: string, zScore: number | null): void => {
    if (zScore !== null && Math.abs(zScore) > EXTREME_Z_SCORE) {
      reasons.push(`${label} z-score ${zScore}`);
    }
  };

  check("BB/U", params.wfaZScore);
  check("TB/U", params.hfaZScore);
  check("BB/TB", params.wfhZScore);

  if (reasons.length === 0) {
    return { isFlagged: false, reason: null };
  }

  return {
    isFlagged: true,
    reason: `Nilai ekstrem, mohon diverifikasi: ${reasons.join("; ")}`,
  };
}
