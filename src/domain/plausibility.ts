export const PLAUSIBLE_RANGES = {
  weightKg: { min: 0.5, max: 40 },
  heightCm: { min: 30, max: 140 },
  headCircumCm: { min: 25, max: 65 },
  armCircumCm: { min: 5, max: 30 },
} as const;

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
