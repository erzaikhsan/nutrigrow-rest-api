/**
 * Data penimbangan hasil penelitian di Desa Jipang, disalin apa adanya dari
 * main:src/seeders/growth.seeder.js -- termasuk deret bulanan yang dibangun
 * lewat perulangan.
 *
 * Kolom wilayah tidak lagi disimpan pada penimbangan (diturunkan dari balita),
 * dan status gizi dihitung ulang saat penyemaian. Karena itu argumen-argumen
 * tersebut diterima lalu diabaikan, semata-mata agar bentuk pemanggilan asli
 * bisa dipertahankan utuh.
 */

import { randomUUID } from "node:crypto";

export interface SeedGrowth {
  legacyChildId: string;
  date: string;
  weight: number;
  height: number;
  headCircum: number;
  armCircum: number;
  note: string;
}

export const growths: SeedGrowth[] = [];

const uuidv4 = (): string => randomUUID();

// Blok data asli memanggil ketiga fungsi ini untuk mengisi kolom status.
// Hasilnya diabaikan -- status kini dihitung ulang oleh pipeline penilaian saat
// penyemaian -- tetapi tanda tangannya dibuat variadik agar bentuk pemanggilan
// pada data asli tidak perlu disentuh sama sekali.
const calculateWFA = (..._args: unknown[]): string => "";
const calculateHFA = (..._args: unknown[]): string => "";
const calculateWFH = (..._args: unknown[]): string => "";

const createGrowth = (
  _id: string,
  legacyChildId: string,
  date: string,
  _ageInMonth: number,
  _region: string,
  weight: number,
  _wfaStatus: string,
  height: number,
  _hfaStatus: string,
  _wfhStatus: string,
  headCircum: number,
  armCircum: number,
  note: string,
): void => {
  growths.push({
    legacyChildId,
    date,
    weight,
    height,
    headCircum,
    armCircum,
    note,
  });
};

// ---------------------------------------------------------------------------
// Disalin dari seeder lama mulai dari sini.
// ---------------------------------------------------------------------------

//C1
createGrowth(
  "G0",
  "C1",
  "2023-07-28 00:00:00.000 Z",
  0,
  "RW1",
  3.4,
  "Normal",
  50.2,
  "Normal",
  "Normal",
  34.5,
  10.5,
  "Pengukuran Saat Lahir"
);

//C2
createGrowth(
  "G1",
  "C2",
  "2022-06-20 00:00:00.000 Z",
  0,
  "RW1",
  3.4,
  "Normal",
  50.2,
  "Normal",
  "Normal",
  34.5,
  10.5,
  "Pengukuran Saat Lahir"
);

//C3
createGrowth(
  "G2",
  "C3",
  "2022-06-20 00:00:00.000 Z",
  0,
  "RW1",
  3.4,
  "Normal",
  50.2,
  "Normal",
  "Normal",
  34.5,
  10.5,
  "Pengukuran Saat Lahir"
);

//C4
createGrowth(
  "G3",
  "C4",
  "2022-06-20 00:00:00.000 Z",
  0,
  "RW1",
  3.4,
  "Normal",
  50.2,
  "Normal",
  "Normal",
  34.5,
  10.5,
  "Pengukuran Saat Lahir"
);

//C5
createGrowth(
  "G4",
  "C5",
  "2023-07-28 00:00:00.000 Z",
  0,
  "RW1",
  3.4,
  "Normal",
  50.2,
  "Normal",
  "Normal",
  34.5,
  10.5,
  "Pengukuran Saat Lahir"
);

//C6
createGrowth(
  "G5",
  "C6",
  "2023-07-28 00:00:00.000 Z",
  0,
  "RW2",
  3.4,
  "Normal",
  50.2,
  "Normal",
  "Normal",
  34.5,
  10.5,
  "Pengukuran Saat Lahir"
);

//C7
createGrowth(
  "G6",
  "C7",
  "2022-06-20 00:00:00.000 Z",
  0,
  "RW2",
  3.4,
  "Normal",
  50.2,
  "Normal",
  "Normal",
  34.5,
  10.5,
  "Pengukuran Saat Lahir"
);

//C8
createGrowth(
  "G7",
  "C8",
  "2023-07-28 00:00:00.000 Z",
  0,
  "RW2",
  3.4,
  "Normal",
  50.2,
  "Normal",
  "Normal",
  34.5,
  10.5,
  "Pengukuran Saat Lahir"
);

//C9
createGrowth(
  "G8",
  "C9",
  "2022-06-20 00:00:00.000 Z",
  0,
  "RW3",
  3.4,
  "Normal",
  50.2,
  "Normal",
  "Normal",
  34.5,
  10.5,
  "Pengukuran Saat Lahir"
);

//Perempuan
const balitaPerempuan = [
  { id: "C1", region: "RW1" },
  { id: "C5", region: "RW1" },
  { id: "C6", region: "RW2" },
  { id: "C8", region: "RW2" },
]

const dataPerempuan2023 = [
  { month: 1, weight: 3.8, height: 54.5, headCircum: 35.8, armCircum: 10.2, note: "Pertumbuhan baik, ASI eksklusif" },
  { month: 2, weight: 4.5, height: 57.0, headCircum: 37.0, armCircum: 10.8, note: "Perkembangan normal, aktif menyusu" },
  { month: 3, weight: 5.2, height: 59.2, headCircum: 38.2, armCircum: 11.4, note: "Mulai tersenyum sosial, BB ideal" },
  { month: 4, weight: 5.8, height: 61.1, headCircum: 39.1, armCircum: 11.9, note: "Dapat menahan kepala tegak" },
  { month: 5, weight: 6.3, height: 62.8, headCircum: 39.8, armCircum: 12.3, note: "Mulai tertawa, perkembangan motorik baik" },
];
const dataPerempuan2024 = [
  { month: 6, weight: 6.8, height: 64.4, headCircum: 40.5, armCircum: 12.7, note: "Siap MPASI, duduk dengan bantuan" },
  { month: 7, weight: 7.2, height: 65.8, headCircum: 41.0, armCircum: 13.1, note: "MPASI dimulai, respon baik" },
  { month: 8, weight: 7.6, height: 67.1, headCircum: 41.5, armCircum: 13.4, note: "Dapat duduk tanpa bantuan" },
  { month: 9, weight: 7.9, height: 68.3, headCircum: 41.9, armCircum: 13.7, note: "Mulai merangkak, eksplorasi aktif" },
  { month: 10, weight: 8.2, height: 69.4, headCircum: 42.3, armCircum: 14.0, note: "Dapat berdiri dengan pegangan" },
  { month: 11, weight: 8.5, height: 70.4, headCircum: 42.6, armCircum: 14.2, note: "Mulai berjalan merambat" },
  { month: 12, weight: 8.8, height: 71.3, headCircum: 42.9, armCircum: 14.5, note: "Dapat berdiri sendiri sesaat" },
  { month: 13, weight: 9.0, height: 72.2, headCircum: 43.2, armCircum: 14.7, note: "Mulai berjalan beberapa langkah" },
  { month: 14, weight: 9.3, height: 73.0, headCircum: 43.5, armCircum: 14.9, note: "Berjalan semakin lancar" },
  { month: 15, weight: 9.5, height: 73.7, headCircum: 43.7, armCircum: 15.1, note: "Dapat naik tangga dengan bantuan" },
  { month: 16, weight: 9.8, height: 74.4, headCircum: 43.9, armCircum: 15.3, note: "Mulai berlari pelan" },
  { month: 17, weight: 10.0, height: 75.1, headCircum: 44.1, armCircum: 15.5, note: "Dapat menendang bola" },
];
const dataPerempuan2025 = [
  { month: 18, weight: 10.2, height: 75.7, headCircum: 44.3, armCircum: 15.7, note: "Naik turun tangga dengan bantuan" },
  { month: 19, weight: 10.4, height: 76.3, headCircum: 44.5, armCircum: 15.9, note: "Dapat melompat di tempat" },
  { month: 20, weight: 10.6, height: 76.8, headCircum: 44.7, armCircum: 16.1, note: "Bermain dengan teman" },
  { month: 21, weight: 10.8, height: 77.3, headCircum: 44.9, armCircum: 16.3, note: "Mulai toilet training" },
  { month: 22, weight: 11.0, height: 77.8, headCircum: 45.1, armCircum: 16.5, note: "Dapat berlari dengan baik" },
  { month: 23, weight: 11.2, height: 78.3, headCircum: 45.3, armCircum: 16.7, note: "Naik turun tangga mandiri" },
];

balitaPerempuan.forEach((child)=> {
  dataPerempuan2023.forEach((entry, index) => {
  createGrowth(
    uuidv4(),
    child.id,
    `2023-${String(index + 8).padStart(2, "0")}-28 00:00:00.000 Z`,
    entry.month,
    child.region,
    entry.weight,
    calculateWFA(entry.month, parseFloat(`${entry.weight}`), "F"),
    entry.height,
    calculateHFA(entry.month, parseFloat(`${entry.height}`), "F"),
    calculateWFH(entry.month, parseFloat(`${entry.weight}`), parseFloat(`${entry.height}`), "F"),
    entry.headCircum,
    entry.armCircum,
    entry.note
  );
});

dataPerempuan2024.forEach((entry, index) => {
  createGrowth(
    uuidv4(),
    child.id,
    `2024-${String(index + 1).padStart(2, "0")}-28 00:00:00.000 Z`,
    entry.month,
    child.region,
    entry.weight,
    calculateWFA(entry.month, parseFloat(`${entry.weight}`), "F"),
    entry.height,
    calculateHFA(entry.month, parseFloat(`${entry.height}`), "F"),
    calculateWFH(entry.month, parseFloat(`${entry.weight}`), parseFloat(`${entry.height}`), "F"),
    entry.headCircum,
    entry.armCircum,
    entry.note
  );
});

dataPerempuan2025.forEach((entry, index) => {
  createGrowth(
    uuidv4(),
    child.id,
    `2025-${String(index + 1).padStart(2, "0")}-28 00:00:00.000 Z`,
    entry.month,
    child.region,
    entry.weight,
    calculateWFA(entry.month, parseFloat(`${entry.weight}`), "F"),
    entry.height,
    calculateHFA(entry.month, parseFloat(`${entry.height}`), "F"),
    calculateWFH(entry.month, parseFloat(`${entry.weight}`), parseFloat(`${entry.height}`), "F"),
    entry.headCircum,
    entry.armCircum,
    entry.note
  );
});

})

//Laki-laki
const balitaLaki = [
  { id: "C2", region: "RW1" },
  { id: "C3", region: "RW1" },
  { id: "C4", region: "RW1" },
  { id: "C7", region: "RW2" },
  { id: "C9", region: "RW3" },
]

const dataLaki2022 = [
  { month: 1, weight: 4.1, height: 56.8, headCircum: 36.2, armCircum: 10.5, note: "ASI eksklusif, pertumbuhan baik" },
  { month: 2, weight: 4.9, height: 59.2, headCircum: 37.5, armCircum: 11.2, note: "Perkembangan normal" },
  { month: 3, weight: 5.6, height: 61.4, headCircum: 38.6, armCircum: 11.8, note: "Mulai tengkurap" },
  { month: 4, weight: 6.2, height: 63.3, headCircum: 39.5, armCircum: 12.3, note: "Dapat berguling" },
  { month: 5, weight: 6.7, height: 65.0, headCircum: 40.3, armCircum: 12.7, note: "Duduk dengan bantuan" },
  { month: 6, weight: 7.2, height: 66.5, headCircum: 41.0, armCircum: 13.2, note: "Mulai MPASI" },
];

const dataLaki2023 = [
  { month: 7, weight: 7.6, height: 67.9, headCircum: 41.6, armCircum: 13.6, note: "Respon MPASI baik" },
  { month: 8, weight: 8.0, height: 69.1, headCircum: 42.1, armCircum: 13.9, note: "Dapat duduk sendiri" },
  { month: 9, weight: 8.3, height: 71.2, headCircum: 42.6, armCircum: 14.3, note: "Mulai merangkak" },
  { month: 10, weight: 8.6, height: 72.2, headCircum: 43.0, armCircum: 14.6, note: "Berdiri dengan pegangan" },
  { month: 11, weight: 8.9, height: 74.1, headCircum: 43.4, armCircum: 14.9, note: "Merambat aktif" },
  { month: 12, weight: 9.2, height: 76.9, headCircum: 43.7, armCircum: 15.2, note: "Berdiri sendiri" },
  { month: 13, weight: 9.5, height: 78.7, headCircum: 44.0, armCircum: 15.5, note: "Langkah pertama" },
  { month: 14, weight: 9.7, height: 79.4, headCircum: 44.3, armCircum: 15.7, note: "Berjalan beberapa langkah" },
  { month: 15, weight: 10.0, height: 80.1, headCircum: 44.6, armCircum: 16.0, note: "Berjalan semakin stabil" },
  { month: 16, weight: 10.2, height: 80.7, headCircum: 44.8, armCircum: 16.2, note: "Dapat berlari pelan" },
  { month: 17, weight: 10.4, height: 82.3, headCircum: 45.0, armCircum: 16.4, note: "Aktif bermain" },
  { month: 18, weight: 10.6, height: 82.9, headCircum: 45.2, armCircum: 16.6, note: "Naik tangga dengan bantuan" },
];
const dataLaki2024 = [
  { month: 19, weight: 10.8, height: 84.4, headCircum: 45.4, armCircum: 16.8, note: "Melompat di tempat" },
  { month: 20, weight: 11.0, height: 84.9, headCircum: 45.6, armCircum: 17.0, note: "Bermain bola" },
  { month: 21, weight: 11.2, height: 85.4, headCircum: 45.8, armCircum: 17.2, note: "Mulai toilet training" },
  { month: 22, weight: 11.4, height: 86.9, headCircum: 46.0, armCircum: 17.4, note: "Berlari dengan baik" },
  { month: 23, weight: 11.6, height: 87.4, headCircum: 46.2, armCircum: 17.6, note: "Naik turun tangga" },
  { month: 24, weight: 11.8, height: 87.9, headCircum: 46.4, armCircum: 17.8, note: "Perkembangan optimal" },
  { month: 25, weight: 12.0, height: 88.3, headCircum: 46.6, armCircum: 18.0, note: "Mulai bermain dengan teman" },
  { month: 26, weight: 12.2, height: 88.7, headCircum: 46.8, armCircum: 18.2, note: "Dapat menggambar garis" },
  { month: 27, weight: 12.4, height: 89.1, headCircum: 47.0, armCircum: 18.4, note: "Mengenal warna dasar" },
  { month: 28, weight: 12.6, height: 89.5, headCircum: 47.2, armCircum: 18.6, note: "Bermain puzzle sederhana" },
  { month: 29, weight: 12.8, height: 89.9, headCircum: 47.4, armCircum: 18.8, note: "Dapat menyusun balok" },
  { month: 30, weight: 13.0, height: 90.3, headCircum: 47.6, armCircum: 19.0, note: "Toilet training berhasil" },
];
const dataLaki2025 = [
  { month: 31, weight: 13.2, height: 90.7, headCircum: 47.8, armCircum: 19.2, note: "Mulai belajar angka" },
  { month: 32, weight: 13.4, height: 91.1, headCircum: 48.0, armCircum: 19.4, note: "Dapat melompat dengan 2 kaki" },
  { month: 33, weight: 13.6, height: 91.5, headCircum: 48.2, armCircum: 19.6, note: "Bermain peran sederhana" },
  { month: 34, weight: 13.8, height: 91.9, headCircum: 48.4, armCircum: 19.8, note: "Dapat menggunting kertas" },
  { month: 35, weight: 14.0, height: 92.3, headCircum: 48.6, armCircum: 20.0, note: "Mengenal huruf awal" },
  { month: 36, weight: 14.2, height: 92.7, headCircum: 48.8, armCircum: 20.2, note: "Berbicara kalimat lengkap" },
];

balitaLaki.forEach((child)=> {
dataLaki2022.forEach((entry, index) => {
  createGrowth(
    uuidv4(),
    child.id,
    `2022-${String(index + 7).padStart(2, "0")}-20 00:00:00.000 Z`,
    entry.month,
    child.region,
    entry.weight,
    calculateWFA(entry.month, parseFloat(`${entry.weight}`), "M"),
    entry.height,
    calculateHFA(entry.month, parseFloat(`${entry.height}`), "M"),
    calculateWFH(entry.month, parseFloat(`${entry.weight}`), parseFloat(`${entry.height}`), "M"),
    entry.headCircum,
    entry.armCircum,
    entry.note
  );
});

dataLaki2023.forEach((entry, index) => {
  createGrowth(
    uuidv4(),
    child.id,
    `2023-${String(index + 1).padStart(2, "0")}-20 00:00:00.000 Z`,
    entry.month,
    child.region,
    entry.weight,
    calculateWFA(entry.month, parseFloat(`${entry.weight}`), "M"),
    entry.height,
    calculateHFA(entry.month, parseFloat(`${entry.height}`), "M"),
    calculateWFH(entry.month, parseFloat(`${entry.weight}`), parseFloat(`${entry.height}`), "M"),
    entry.headCircum,
    entry.armCircum,
    entry.note
  );
});

dataLaki2024.forEach((entry, index) => {
  createGrowth(
    uuidv4(),
    child.id,
    `2024-${String(index + 1).padStart(2, "0")}-20 00:00:00.000 Z`,
    entry.month,
    child.region,
    entry.weight,
    calculateWFA(entry.month, parseFloat(`${entry.weight}`), "M"),
    entry.height,
    calculateHFA(entry.month, parseFloat(`${entry.height}`), "M"),
    calculateWFH(entry.month, parseFloat(`${entry.weight}`), parseFloat(`${entry.height}`), "M"),
    entry.headCircum,
    entry.armCircum,
    entry.note
  );
});

dataLaki2025.forEach((entry, index) => {
  createGrowth(
    uuidv4(),
    child.id,
    `2025-${String(index + 1).padStart(2, "0")}-20 00:00:00.000 Z`,
    entry.month,
    child.region,
    entry.weight,
    calculateWFA(entry.month, parseFloat(`${entry.weight}`), "M"),
    entry.height,
    calculateHFA(entry.month, parseFloat(`${entry.height}`), "M"),
    calculateWFH(entry.month, parseFloat(`${entry.weight}`), parseFloat(`${entry.height}`), "M"),
    entry.headCircum,
    entry.armCircum,
    entry.note
  );
});

})

