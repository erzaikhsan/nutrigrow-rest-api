import { WeightGainStatus } from "@prisma/client";

const KBM_GRAM_BY_AGE: ReadonlyArray<{ maxAgeMonths: number; gram: number }> = [
  { maxAgeMonths: 1, gram: 800 },
  { maxAgeMonths: 2, gram: 900 },
  { maxAgeMonths: 3, gram: 800 },
  { maxAgeMonths: 4, gram: 600 },
  { maxAgeMonths: 5, gram: 500 },
  { maxAgeMonths: 6, gram: 400 },
  { maxAgeMonths: 10, gram: 300 },
  { maxAgeMonths: 60, gram: 200 },
];

export function minimumWeightGainKg(ageInMonths: number): number {
  const entry = KBM_GRAM_BY_AGE.find(
    (row) => ageInMonths <= row.maxAgeMonths,
  );

  return (entry?.gram ?? 200) / 1000;
}

export interface WeightGainAssessment {
  weightGain: number | null;
  status: WeightGainStatus;

  consecutiveNoGain: number;
}

export interface PreviousWeighIn {
  weight: number;

  period: string;
  consecutiveNoGain: number;
}

export function toPeriod(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function previousPeriod(period: string): string {
  const [yearPart, monthPart] = period.split("-");
  const year = Number(yearPart);
  const month = Number(monthPart);

  const previousMonth = month === 1 ? 12 : month - 1;
  const previousYear = month === 1 ? year - 1 : year;

  return `${previousYear}-${String(previousMonth).padStart(2, "0")}`;
}

export function assessWeightGain(params: {
  ageInMonths: number;
  weight: number;
  period: string;
  previous: PreviousWeighIn | null;
}): WeightGainAssessment {
  const { ageInMonths, weight, period, previous } = params;

  if (!previous) {
    return {
      weightGain: null,
      status: WeightGainStatus.FIRST_WEIGHIN,
      consecutiveNoGain: 0,
    };
  }

  const gain = Math.round((weight - previous.weight) * 1000) / 1000;

  if (previous.period !== previousPeriod(period)) {
    return {
      weightGain: gain,
      status: WeightGainStatus.NOT_WEIGHED,
      consecutiveNoGain: previous.consecutiveNoGain,
    };
  }

  const isAdequate = gain >= minimumWeightGainKg(ageInMonths);

  return {
    weightGain: gain,
    status: isAdequate
      ? WeightGainStatus.ADEQUATE
      : WeightGainStatus.INADEQUATE,
    consecutiveNoGain: isAdequate ? 0 : previous.consecutiveNoGain + 1,
  };
}

export const CONSECUTIVE_NO_GAIN_ALERT = 2;

export function needsReferral(assessment: WeightGainAssessment): boolean {
  return assessment.consecutiveNoGain >= CONSECUTIVE_NO_GAIN_ALERT;
}
