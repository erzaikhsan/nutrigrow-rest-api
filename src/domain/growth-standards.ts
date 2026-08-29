import { HfaStatus, WfaStatus, WfhStatus } from "@prisma/client";
import type { Sex, WfhAgeGroup, ZScoreBand } from "./who-reference.js";
import {
  HFA_WHO_REFERENCE,
  WFA_WHO_REFERENCE,
  WFH_WHO_REFERENCE,
} from "./who-reference.js";

export type { Sex };

function toSdPoints(band: ZScoreBand): Array<[z: number, value: number]> {
  return [
    [-3, band.sdNeg3],
    [-2, band.sdNeg2],
    [-1, band.sdNeg1],
    [0, band.median],
    [1, band.sd1],
    [2, band.sd2],
    [3, band.sd3],
  ];
}

export function calculateZScore(value: number, band: ZScoreBand): number {
  const points = toSdPoints(band);

  const lowest = points[0] as [number, number];
  const highest = points[points.length - 1] as [number, number];
  const secondLowest = points[1] as [number, number];
  const secondHighest = points[points.length - 2] as [number, number];

  if (value < lowest[1]) {
    const bandWidth = secondLowest[1] - lowest[1];
    if (bandWidth <= 0) return lowest[0];
    return round2(lowest[0] - (lowest[1] - value) / bandWidth);
  }

  if (value > highest[1]) {
    const bandWidth = highest[1] - secondHighest[1];
    if (bandWidth <= 0) return highest[0];
    return round2(highest[0] + (value - highest[1]) / bandWidth);
  }

  for (let index = 0; index < points.length - 1; index += 1) {
    const [lowerZ, lowerValue] = points[index] as [number, number];
    const [upperZ, upperValue] = points[index + 1] as [number, number];

    if (value >= lowerValue && value <= upperValue) {
      const span = upperValue - lowerValue;
      if (span <= 0) return round2(lowerZ);
      return round2(lowerZ + ((value - lowerValue) / span) * (upperZ - lowerZ));
    }
  }

  return 0;
}

const round2 = (value: number): number => Math.round(value * 100) / 100;

export interface IndicatorResult<TStatus> {
  zScore: number | null;
  status: TStatus;
}

export function resolveWfaBand(
  ageInMonths: number,
  sex: Sex,
): ZScoreBand | null {
  return WFA_WHO_REFERENCE[sex][ageInMonths] ?? null;
}

export function resolveHfaBand(
  ageInMonths: number,
  sex: Sex,
): ZScoreBand | null {
  return HFA_WHO_REFERENCE[sex][ageInMonths] ?? null;
}

export function resolveWfhBand(
  ageInMonths: number,
  height: number,
  sex: Sex,
): ZScoreBand | null {
  const ageGroup = resolveWfhAgeGroup(ageInMonths);
  const roundedHeight = Math.round(height * 2) / 2;
  return WFH_WHO_REFERENCE[sex][ageGroup]?.[roundedHeight] ?? null;
}

export function calculateWfa(
  ageInMonths: number,
  weight: number,
  sex: Sex,
): IndicatorResult<WfaStatus> {
  const band = resolveWfaBand(ageInMonths, sex);
  if (!band) return { zScore: null, status: WfaStatus.UNKNOWN };

  const zScore = calculateZScore(weight, band);

  let status: WfaStatus;
  if (zScore < -3) status = WfaStatus.SEVERELY_UNDERWEIGHT;
  else if (zScore < -2) status = WfaStatus.UNDERWEIGHT;
  else if (zScore <= 1) status = WfaStatus.NORMAL;
  else status = WfaStatus.RISK_OVERWEIGHT;

  return { zScore, status };
}

export function calculateHfa(
  ageInMonths: number,
  height: number,
  sex: Sex,
): IndicatorResult<HfaStatus> {
  const band = resolveHfaBand(ageInMonths, sex);
  if (!band) return { zScore: null, status: HfaStatus.UNKNOWN };

  const zScore = calculateZScore(height, band);

  let status: HfaStatus;
  if (zScore < -3) status = HfaStatus.SEVERELY_STUNTED;
  else if (zScore < -2) status = HfaStatus.STUNTED;
  else if (zScore <= 3) status = HfaStatus.NORMAL;
  else status = HfaStatus.TALL;

  return { zScore, status };
}

function resolveWfhAgeGroup(ageInMonths: number): WfhAgeGroup {
  if (ageInMonths <= 24) return "under_2y";
  if (ageInMonths <= 60) return "under_5y";
  return "5y_and_over";
}

export function calculateWfh(
  ageInMonths: number,
  weight: number,
  height: number,
  sex: Sex,
): IndicatorResult<WfhStatus> {
  const band = resolveWfhBand(ageInMonths, height, sex);
  if (!band) return { zScore: null, status: WfhStatus.UNKNOWN };

  const zScore = calculateZScore(weight, band);

  let status: WfhStatus;
  if (zScore < -3) status = WfhStatus.SEVERELY_WASTING;
  else if (zScore < -2) status = WfhStatus.WASTING;
  else if (zScore <= 1) status = WfhStatus.NORMAL;
  else if (zScore <= 2) status = WfhStatus.POSSIBLE_RISK_OVERWEIGHT;
  else if (zScore <= 3) status = WfhStatus.OVERWEIGHT;
  else status = WfhStatus.OBESE;

  return { zScore, status };
}

export function calculateAgeInMonths(
  dateOfBirth: Date,
  measuredAt: Date,
): number {
  let months =
    (measuredAt.getUTCFullYear() - dateOfBirth.getUTCFullYear()) * 12 +
    (measuredAt.getUTCMonth() - dateOfBirth.getUTCMonth());

  if (measuredAt.getUTCDate() < dateOfBirth.getUTCDate()) {
    months -= 1;
  }

  return Math.max(0, months);
}

export const MAX_TRACKED_AGE_IN_MONTHS = 60;

export interface NutritionAssessment {
  ageInMonths: number;
  wfaZScore: number | null;
  hfaZScore: number | null;
  wfhZScore: number | null;
  wfaStatus: WfaStatus;
  hfaStatus: HfaStatus;
  wfhStatus: WfhStatus;
}

export function assessNutrition(params: {
  dateOfBirth: Date;
  measuredAt: Date;
  weight: number;
  height: number;
  sex: Sex;
}): NutritionAssessment {
  const { dateOfBirth, measuredAt, weight, height, sex } = params;

  const ageInMonths = calculateAgeInMonths(dateOfBirth, measuredAt);

  const wfa = calculateWfa(ageInMonths, weight, sex);
  const hfa = calculateHfa(ageInMonths, height, sex);
  const wfh = calculateWfh(ageInMonths, weight, height, sex);

  return {
    ageInMonths,
    wfaZScore: wfa.zScore,
    hfaZScore: hfa.zScore,
    wfhZScore: wfh.zScore,
    wfaStatus: wfa.status,
    hfaStatus: hfa.status,
    wfhStatus: wfh.status,
  };
}
