import { MuacStatus } from "@prisma/client";

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
