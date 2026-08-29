import type { Children, Growth } from "@prisma/client";
import { calculateAgeInMonths } from "../../domain/growth-standards.js";

const AGE_GROUPS = ["0_4", "5", "6_11", "12_23", "24_59"] as const;
export type AgeGroup = (typeof AGE_GROUPS)[number];

export type UpgkCell =
  | "0_4_L"
  | "0_4_P"
  | "5_L"
  | "5_P"
  | "6_11_L"
  | "6_11_P"
  | "12_23_L"
  | "12_23_P"
  | "24_59_L"
  | "24_59_P"
  | "jumlah_L"
  | "jumlah_P";

export interface UpgkRow {
  kegiatan: string;
  "0_4_L": number;
  "0_4_P": number;
  "5_L": number;
  "5_P": number;
  "6_11_L": number;
  "6_11_P": number;
  "12_23_L": number;
  "12_23_P": number;
  "24_59_L": number;
  "24_59_P": number;
  jumlah_L: number;
  jumlah_P: number;
}

export function initUpgkRow(kegiatan: string): UpgkRow {
  return {
    kegiatan,
    "0_4_L": 0,
    "0_4_P": 0,
    "5_L": 0,
    "5_P": 0,
    "6_11_L": 0,
    "6_11_P": 0,
    "12_23_L": 0,
    "12_23_P": 0,
    "24_59_L": 0,
    "24_59_P": 0,
    jumlah_L: 0,
    jumlah_P: 0,
  };
}

export function ageGroupOf(ageInMonths: number): AgeGroup | null {
  if (ageInMonths < 0) return null;
  if (ageInMonths <= 4) return "0_4";
  if (ageInMonths === 5) return "5";
  if (ageInMonths <= 11) return "6_11";
  if (ageInMonths <= 23) return "12_23";
  if (ageInMonths <= 59) return "24_59";
  return null;
}

export function referenceDateFor(month: number, year: number): Date {
  return new Date(Date.UTC(year, month + 1, 0));
}

export interface UpgkContext {
  children: Children[];

  current: Map<string, Growth>;

  previous: Map<string, Growth>;
  referenceDate: Date;
  month: number;
  year: number;
}

type RowPredicate = (child: Children, context: UpgkContext) => boolean;

export function countRow(
  kegiatan: string,
  context: UpgkContext,
  predicate: RowPredicate,
): UpgkRow {
  const row = initUpgkRow(kegiatan);

  for (const child of context.children) {
    if (!predicate(child, context)) continue;

    const age = calculateAgeInMonths(child.dateOfBirth, context.referenceDate);
    const group = ageGroupOf(age);
    if (!group) continue;

    const gender = child.gender === "M" ? "L" : "P";
    const cell = `${group}_${gender}` as UpgkCell;

    row[cell] += 1;

    if (gender === "L") row.jumlah_L += 1;
    else row.jumlah_P += 1;
  }

  return row;
}

const weighed: RowPredicate = (child, ctx) => ctx.current.has(child.id);

export function buildUpgkRows(context: UpgkContext): UpgkRow[] {
  const growthOf = (child: Children): Growth | undefined =>
    context.current.get(child.id);

  return [
    countRow("Jumlah semua Balita yang ada di Posyandu", context, () => true),
    countRow(
      "Jumlah Balita yang terdaftar dan mempunyai KMS bulan ini",
      context,
      () => true,
    ),
    countRow("Jumlah Balita yang ditimbang bulan ini", context, weighed),
    countRow(
      "Jumlah Balita yang naik berat badannya bulan ini",
      context,
      (child) => growthOf(child)?.gainStatus === "ADEQUATE",
    ),
    countRow(
      "Jumlah Balita yang tidak naik berat badannya 1 kali bulan ini",
      context,
      (child) => growthOf(child)?.gainStatus === "INADEQUATE",
    ),
    countRow(
      "Jumlah Balita yang tidak naik berat badannya 2 kali bulan ini",
      context,
      (child) => (growthOf(child)?.consecutiveNoGain ?? 0) >= 2,
    ),
    countRow(
      "Jumlah Balita yang bulan sebelumnya tidak menimbang",
      context,
      (child, ctx) => ctx.current.has(child.id) && !ctx.previous.has(child.id),
    ),
    countRow("Jumlah Bayi Baru", context, (child, ctx) => {
      return (
        child.dateOfBirth.getUTCFullYear() === ctx.year &&
        child.dateOfBirth.getUTCMonth() === ctx.month
      );
    }),
    countRow(
      "Jumlah Balita Berat Badan Sangat Kurang (Severely Underweight) Berdasarkan Indikator BB/U",
      context,
      (child) => growthOf(child)?.wfaStatus === "SEVERELY_UNDERWEIGHT",
    ),
    countRow(
      "Jumlah Balita Berat Badan Kurang (Underweight) Berdasarkan Indikator BB/U",
      context,
      (child) => growthOf(child)?.wfaStatus === "UNDERWEIGHT",
    ),
    countRow(
      "Jumlah Balita Risiko Berat Badan Lebih Berdasarkan Indikator BB/U",
      context,
      (child) => growthOf(child)?.wfaStatus === "RISK_OVERWEIGHT",
    ),
    countRow(
      "Jumlah Balita Sangat Pendek (Severely Stunting) Berdasarkan Indikator TB/U",
      context,
      (child) => growthOf(child)?.hfaStatus === "SEVERELY_STUNTED",
    ),
    countRow(
      "Jumlah Balita Pendek (Stunting) Berdasarkan Indikator TB/U",
      context,
      (child) => growthOf(child)?.hfaStatus === "STUNTED",
    ),
    countRow(
      "Jumlah Balita Gizi Buruk (Severely Wasting) Berdasarkan Indikator BB/TB",
      context,
      (child) => growthOf(child)?.wfhStatus === "SEVERELY_WASTING",
    ),
    countRow(
      "Jumlah Balita Gizi Kurang (Wasting) Berdasarkan Indikator BB/TB",
      context,
      (child) => growthOf(child)?.wfhStatus === "WASTING",
    ),
    countRow(
      "Jumlah Balita Berisiko Gizi Lebih Berdasarkan Indikator BB/TB",
      context,
      (child) => growthOf(child)?.wfhStatus === "POSSIBLE_RISK_OVERWEIGHT",
    ),
    countRow(
      "Jumlah Balita Gizi Lebih (Overweight) Berdasarkan Indikator BB/TB",
      context,
      (child) => growthOf(child)?.wfhStatus === "OVERWEIGHT",
    ),
    countRow(
      "Jumlah Balita Obesitas (Obese) Berdasarkan Indikator BB/TB",
      context,
      (child) => growthOf(child)?.wfhStatus === "OBESE",
    ),
  ];
}

export const TOTAL_ONLY_ROW_LABEL = "Jumlah Bayi Baru";
