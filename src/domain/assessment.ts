import type {
  HcaStatus,
  HfaStatus,
  MuacStatus,
  WeightGainStatus,
  WfaStatus,
  WfhStatus,
} from "@prisma/client";
import {
  assessNutrition,
  calculateAgeInMonths,
  MAX_TRACKED_AGE_IN_MONTHS,
} from "./growth-standards.js";
import { calculateHeadCircumference } from "./head-circumference.js";
import { classifyMuac } from "./muac.js";
import { assessPlausibility } from "./plausibility.js";
import {
  assessWeightGain,
  needsReferral,
  toPeriod,
  type PreviousWeighIn,
} from "./weight-gain.js";
import type { Sex } from "./who-reference.js";

/**
 * Titik masuk tunggal untuk menilai satu pengukuran.
 *
 * Seluruh aturan gizi terkumpul di sini supaya service pencatatan tidak perlu
 * tahu urutan maupun saling-ketergantungan antar indikator, dan supaya
 * perhitungan yang sama tidak tersebar ulang di layanan laporan seperti dulu.
 */

export interface MeasurementInput {
  dateOfBirth: Date;
  measuredAt: Date;
  sex: Sex;
  weight: number;
  height: number;
  headCircum: number;
  armCircum: number;
  /** Penimbangan terakhir sebelum pengukuran ini, bila ada. */
  previous: PreviousWeighIn | null;
}

export interface MeasurementAssessment {
  period: string;
  ageInMonth: number;

  wfaZScore: number | null;
  hfaZScore: number | null;
  wfhZScore: number | null;
  headCircumZScore: number | null;

  wfaStatus: WfaStatus;
  hfaStatus: HfaStatus;
  wfhStatus: WfhStatus;
  muacStatus: MuacStatus;
  headCircumStatus: HcaStatus;

  weightGain: number | null;
  gainStatus: WeightGainStatus;
  consecutiveNoGain: number;

  isFlagged: boolean;
  flagReason: string | null;

  /** Turunan, tidak disimpan: dipakai untuk peringatan di lapisan penyajian. */
  needsReferral: boolean;
}

export function assessMeasurement(
  input: MeasurementInput,
): MeasurementAssessment {
  const {
    dateOfBirth,
    measuredAt,
    sex,
    weight,
    height,
    headCircum,
    armCircum,
    previous,
  } = input;

  const nutrition = assessNutrition({
    dateOfBirth,
    measuredAt,
    weight,
    height,
    sex,
  });

  const { ageInMonths } = nutrition;
  const period = toPeriod(measuredAt);

  const headCircumference = calculateHeadCircumference(
    ageInMonths,
    headCircum,
    sex,
  );

  const gain = assessWeightGain({
    ageInMonths,
    weight,
    period,
    previous,
  });

  const plausibility = assessPlausibility({
    wfaZScore: nutrition.wfaZScore,
    hfaZScore: nutrition.hfaZScore,
    wfhZScore: nutrition.wfhZScore,
  });

  return {
    period,
    ageInMonth: ageInMonths,

    wfaZScore: nutrition.wfaZScore,
    hfaZScore: nutrition.hfaZScore,
    wfhZScore: nutrition.wfhZScore,
    headCircumZScore: headCircumference.zScore,

    wfaStatus: nutrition.wfaStatus,
    hfaStatus: nutrition.hfaStatus,
    wfhStatus: nutrition.wfhStatus,
    muacStatus: classifyMuac(ageInMonths, armCircum),
    headCircumStatus: headCircumference.status,

    weightGain: gain.weightGain,
    gainStatus: gain.status,
    consecutiveNoGain: gain.consecutiveNoGain,

    isFlagged: plausibility.isFlagged,
    flagReason: plausibility.reason,

    needsReferral: needsReferral(gain),
  };
}

/**
 * Balita dianggap lulus dari sasaran posyandu setelah melewati 60 bulan.
 * Dipakai untuk memutakhirkan status secara otomatis agar penyebut laporan
 * tidak ikut menghitung anak yang sudah bukan sasaran.
 */
export function hasGraduated(dateOfBirth: Date, on: Date = new Date()): boolean {
  return calculateAgeInMonths(dateOfBirth, on) > MAX_TRACKED_AGE_IN_MONTHS;
}

export { toPeriod };
export type { PreviousWeighIn, Sex };
