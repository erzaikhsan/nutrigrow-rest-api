import { HfaStatus, WfaStatus, WfhStatus } from "@prisma/client";
import type { Sex, WfhAgeGroup, ZScoreBand } from "./who-reference.js";
import {
  HFA_WHO_REFERENCE,
  WFA_WHO_REFERENCE,
  WFH_WHO_REFERENCE,
} from "./who-reference.js";

/**
 * Penilaian status gizi balita menurut standar antropometri WHO.
 *
 * Perbedaan dari implementasi sebelumnya:
 *
 *   1. Nilai z-score kini dihitung, bukan hanya kategorinya. Kategori
 *      diturunkan DARI z-score, sehingga ambang batas otomatis konsisten
 *      antar indikator. Versi lama membandingkan langsung ke garis SD dan
 *      tanpa sengaja memakai batas berbeda: tinggi tepat di -2 SD dinilai
 *      "Stunted", sedangkan berat tepat di -2 SD dinilai "Normal".
 *      Sekarang keduanya mengikuti aturan WHO: < -2 SD baru bermasalah.
 *
 *   2. Umur dihitung dalam bulan penuh yang sudah terlampaui, bukan selisih
 *      bulan kalender. Versi lama mencatat balita lahir 28 Juli yang ditimbang
 *      1 Agustus sebagai berumur 1 bulan, padahal baru berusia empat hari,
 *      sehingga baris tabel WHO yang dipakai bergeser satu bulan.
 */

export type { Sex };

// ---------------------------------------------------------------------------
// Z-score
// ---------------------------------------------------------------------------

/** Titik-titik garis SD pada tabel WHO, terurut dari -3 hingga +3. */
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

/**
 * Menghitung z-score dari tabel garis SD.
 *
 * Tabel WHO yang tersedia di proyek ini memuat garis SD (-3 sampai +3), bukan
 * parameter LMS. Untuk nilai di antara dua garis, z diperoleh lewat interpolasi
 * linear. Untuk nilai di luar +-3 SD, WHO menganjurkan ekstrapolasi memakai
 * jarak antara dua garis SD terluar -- itulah yang diterapkan di sini.
 *
 * Hasilnya dibulatkan dua angka di belakang koma; presisi lebih dari itu tidak
 * bermakna untuk pengukuran lapangan yang dicatat per 0,1 kg dan 0,1 cm.
 */
export function calculateZScore(value: number, band: ZScoreBand): number {
  const points = toSdPoints(band);

  const lowest = points[0] as [number, number];
  const highest = points[points.length - 1] as [number, number];
  const secondLowest = points[1] as [number, number];
  const secondHighest = points[points.length - 2] as [number, number];

  // Di bawah -3 SD: ekstrapolasi memakai lebar pita -3 SD hingga -2 SD.
  if (value < lowest[1]) {
    const bandWidth = secondLowest[1] - lowest[1];
    if (bandWidth <= 0) return lowest[0];
    return round2(lowest[0] - (lowest[1] - value) / bandWidth);
  }

  // Di atas +3 SD: ekstrapolasi memakai lebar pita +2 SD hingga +3 SD.
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

  // Tidak seharusnya tercapai; garis SD pada tabel WHO selalu menaik.
  return 0;
}

const round2 = (value: number): number => Math.round(value * 100) / 100;

// ---------------------------------------------------------------------------
// Kategori, diturunkan dari z-score
// ---------------------------------------------------------------------------

/**
 * Ambang WHO untuk indikator berbasis berat (BB/U dan BB/TB):
 * z < -3 sangat kurang, -3 <= z < -2 kurang, -2 <= z <= 2 normal, z > 2 lebih.
 */
function classifyWeightZ<T>(
  z: number,
  bands: { severe: T; mild: T; normal: T; high: T },
): T {
  if (z < -3) return bands.severe;
  if (z < -2) return bands.mild;
  if (z <= 2) return bands.normal;
  return bands.high;
}

export interface IndicatorResult<TStatus> {
  /** null bila umur atau tinggi berada di luar jangkauan tabel WHO. */
  zScore: number | null;
  status: TStatus;
}

/** Berat badan menurut umur (BB/U). */
export function calculateWfa(
  ageInMonths: number,
  weight: number,
  sex: Sex,
): IndicatorResult<WfaStatus> {
  const band = WFA_WHO_REFERENCE[sex][ageInMonths];
  if (!band) return { zScore: null, status: WfaStatus.UNKNOWN };

  const zScore = calculateZScore(weight, band);

  return {
    zScore,
    status: classifyWeightZ(zScore, {
      severe: WfaStatus.SEVERELY_UNDERWEIGHT,
      mild: WfaStatus.UNDERWEIGHT,
      normal: WfaStatus.NORMAL,
      high: WfaStatus.OVERWEIGHT_OBESE,
    }),
  };
}

/**
 * Tinggi badan menurut umur (TB/U).
 *
 * Tidak ada kategori "lebih" pada indikator ini; anak yang sangat tinggi tetap
 * dinilai normal, sesuai standar WHO.
 */
export function calculateHfa(
  ageInMonths: number,
  height: number,
  sex: Sex,
): IndicatorResult<HfaStatus> {
  const band = HFA_WHO_REFERENCE[sex][ageInMonths];
  if (!band) return { zScore: null, status: HfaStatus.UNKNOWN };

  const zScore = calculateZScore(height, band);

  let status: HfaStatus;
  if (zScore < -3) status = HfaStatus.SEVERELY_STUNTED;
  else if (zScore < -2) status = HfaStatus.STUNTED;
  else status = HfaStatus.NORMAL;

  return { zScore, status };
}

function resolveWfhAgeGroup(ageInMonths: number): WfhAgeGroup {
  if (ageInMonths <= 24) return "under_2y";
  if (ageInMonths <= 60) return "under_5y";
  return "5y_and_over";
}

/** Berat badan menurut tinggi badan (BB/TB). */
export function calculateWfh(
  ageInMonths: number,
  weight: number,
  height: number,
  sex: Sex,
): IndicatorResult<WfhStatus> {
  const ageGroup = resolveWfhAgeGroup(ageInMonths);

  // Tabel BB/TB bergerak per 0,5 cm; tinggi ukur dibulatkan ke titik terdekat.
  const roundedHeight = Math.round(height * 2) / 2;
  const band = WFH_WHO_REFERENCE[sex][ageGroup][roundedHeight];
  if (!band) return { zScore: null, status: WfhStatus.UNKNOWN };

  const zScore = calculateZScore(weight, band);

  return {
    zScore,
    status: classifyWeightZ(zScore, {
      severe: WfhStatus.SEVERELY_WASTING,
      mild: WfhStatus.WASTING,
      normal: WfhStatus.NORMAL,
      high: WfhStatus.OVERWEIGHT_OBESE,
    }),
  };
}

// ---------------------------------------------------------------------------
// Umur
// ---------------------------------------------------------------------------

/**
 * Umur balita dalam bulan penuh yang sudah terlampaui pada tanggal pengukuran.
 *
 * Tanggal ikut diperhitungkan: balita lahir 28 Juli yang ditimbang 1 Agustus
 * berumur 0 bulan, dan baru berumur 1 bulan pada 28 Agustus. Ini yang dipakai
 * WHO untuk menentukan baris tabel standar.
 */
export function calculateAgeInMonths(
  dateOfBirth: Date,
  measuredAt: Date,
): number {
  let months =
    (measuredAt.getUTCFullYear() - dateOfBirth.getUTCFullYear()) * 12 +
    (measuredAt.getUTCMonth() - dateOfBirth.getUTCMonth());

  // Bulan berjalan belum genap bila tanggalnya belum sampai.
  if (measuredAt.getUTCDate() < dateOfBirth.getUTCDate()) {
    months -= 1;
  }

  return Math.max(0, months);
}

/** Batas atas jangkauan standar antropometri balita WHO. */
export const MAX_TRACKED_AGE_IN_MONTHS = 60;

// ---------------------------------------------------------------------------
// Penilaian gabungan
// ---------------------------------------------------------------------------

export interface NutritionAssessment {
  ageInMonths: number;
  wfaZScore: number | null;
  hfaZScore: number | null;
  wfhZScore: number | null;
  wfaStatus: WfaStatus;
  hfaStatus: HfaStatus;
  wfhStatus: WfhStatus;
}

/** Menghitung ketiga indikator sekaligus untuk satu pengukuran. */
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
