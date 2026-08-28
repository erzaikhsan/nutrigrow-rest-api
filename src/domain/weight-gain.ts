import { WeightGainStatus } from "@prisma/client";

/**
 * Penilaian kenaikan berat badan pada KMS (Kartu Menuju Sehat).
 *
 * Ini indikator inti pemantauan pertumbuhan di posyandu, dan sebelumnya
 * dihitung ulang setiap kali laporan bulanan dibuat lalu dibuang begitu PDF
 * selesai. Dengan disimpan per penimbangan, kondisi 2T -- dua kali berturut-
 * turut tidak naik, yang merupakan indikasi rujukan -- bisa dikenali saat
 * pencatatan, bukan sebulan kemudian saat laporan dicetak.
 *
 * Arti kode mengikuti KMS:
 *   N = naik, kenaikan mencapai KBM
 *   T = tidak naik, kenaikan di bawah KBM atau berat turun
 *   O = bulan lalu tidak ditimbang, sehingga tidak ada pembanding
 *   B = baru pertama kali ditimbang
 */

/**
 * Kenaikan Berat Badan Minimum (KBM) dalam gram, menurut umur dalam bulan.
 *
 * PERLU VERIFIKASI: angka di bawah mengikuti tabel KBM yang lazim dipakai pada
 * Petunjuk Teknis Pemantauan Pertumbuhan Balita (Kementerian Kesehatan RI).
 * Mohon dicocokkan dengan edisi pedoman yang Anda rujuk di skripsi sebelum
 * dipakai untuk analisis -- seluruh tabel terkumpul di satu tempat ini supaya
 * koreksinya cukup satu berkas.
 */
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

/** KBM dalam kilogram untuk umur tertentu. */
export function minimumWeightGainKg(ageInMonths: number): number {
  const entry = KBM_GRAM_BY_AGE.find(
    (row) => ageInMonths <= row.maxAgeMonths,
  );

  // Di atas 60 bulan balita sudah lulus dari pemantauan posyandu.
  return (entry?.gram ?? 200) / 1000;
}

export interface WeightGainAssessment {
  /** Selisih berat terhadap penimbangan sebelumnya, dalam kg. null bila tidak ada pembanding. */
  weightGain: number | null;
  status: WeightGainStatus;
  /** Berapa kali berturut-turut berat tidak naik, termasuk penimbangan ini. */
  consecutiveNoGain: number;
}

export interface PreviousWeighIn {
  weight: number;
  /** Periode "YYYY-MM" penimbangan sebelumnya. */
  period: string;
  consecutiveNoGain: number;
}

/**
 * Periode "YYYY-MM" dari sebuah tanggal ukur.
 *
 * Dipakai sebagai kunci aturan "satu penimbangan per balita per bulan", yang
 * kini dijamin basis data lewat indeks unik (childId, period).
 */
export function toPeriod(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Periode "YYYY-MM" tepat satu bulan sebelum periode yang diberikan. */
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

  // Penimbangan sebelumnya bukan bulan lalu: tidak ada pembanding yang sah
  // untuk menilai naik atau tidak, meski selisihnya tetap dicatat.
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

/** Ambang rujukan posyandu: dua kali berturut-turut berat tidak naik. */
export const CONSECUTIVE_NO_GAIN_ALERT = 2;

export function needsReferral(assessment: WeightGainAssessment): boolean {
  return assessment.consecutiveNoGain >= CONSECUTIVE_NO_GAIN_ALERT;
}
