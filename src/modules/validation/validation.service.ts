import type { Gender } from "@prisma/client";
import { hfaLabel, wfaLabel, wfhLabel } from "../../core/serialize.js";
import {
  calculateHfa,
  calculateWfa,
  calculateWfh,
  resolveHfaBand,
  resolveWfaBand,
  resolveWfhBand,
} from "../../domain/growth-standards.js";
import type { ZScoreBand } from "../../domain/who-reference.js";
import type { z } from "zod";
import type { zScoreBatchSchema, zScoreSampleSchema } from "./validation.schema.js";

type SampleInput = z.infer<typeof zScoreSampleSchema>;
type BatchInput = z.infer<typeof zScoreBatchSchema>;

export interface ReferenceBandDto {
  basis: string;
  sd_neg3: number;
  sd_neg2: number;
  sd_neg1: number;
  median: number;
  sd_1: number;
  sd_2: number;
  sd_3: number;
}

export interface IndicatorDto {
  z_score: number | null;
  status: string;
  measured: number;
  unit: string;
  reference: ReferenceBandDto | null;
}

export interface ZScoreCheckDto {
  label: string;
  gender: Gender;
  age: number;
  weight: number;
  height: number;
  wfa: IndicatorDto;
  hfa: IndicatorDto;
  wfh: IndicatorDto;
}

function toBandDto(band: ZScoreBand | null, basis: string): ReferenceBandDto | null {
  if (!band) return null;
  return {
    basis,
    sd_neg3: band.sdNeg3,
    sd_neg2: band.sdNeg2,
    sd_neg1: band.sdNeg1,
    median: band.median,
    sd_1: band.sd1,
    sd_2: band.sd2,
    sd_3: band.sd3,
  };
}

export function checkZScore(input: SampleInput): ZScoreCheckDto {
  const { gender, age, weight, height } = input;

  const wfa = calculateWfa(age, weight, gender);
  const hfa = calculateHfa(age, height, gender);
  const wfh = calculateWfh(age, weight, height, gender);

  const roundedHeight = Math.round(height * 2) / 2;

  return {
    label: input.label ?? "",
    gender,
    age,
    weight,
    height,
    wfa: {
      z_score: wfa.zScore,
      status: wfaLabel(wfa.status),
      measured: weight,
      unit: "kg",
      reference: toBandDto(resolveWfaBand(age, gender), `umur ${age} bulan`),
    },
    hfa: {
      z_score: hfa.zScore,
      status: hfaLabel(hfa.status),
      measured: height,
      unit: "cm",
      reference: toBandDto(resolveHfaBand(age, gender), `umur ${age} bulan`),
    },
    wfh: {
      z_score: wfh.zScore,
      status: wfhLabel(wfh.status),
      measured: weight,
      unit: "kg",
      reference: toBandDto(
        resolveWfhBand(age, height, gender),
        `tinggi ${roundedHeight} cm`,
      ),
    },
  };
}

export function checkZScoreBatch(input: BatchInput): ZScoreCheckDto[] {
  return input.samples.map(checkZScore);
}
