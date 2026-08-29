import { HcaStatus } from "@prisma/client";
import { calculateZScore, type IndicatorResult } from "./growth-standards.js";
import { HCFA_WHO_REFERENCE } from "./hcfa-reference.js";
import type { Sex } from "./who-reference.js";

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
