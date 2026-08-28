/**
 * Data balita hasil penelitian di Desa Jipang, disalin apa adanya dari
 * main:src/seeders/children.seeder.js.
 *
 * Status gizi yang tercantum pada data lama sengaja diabaikan: nilainya
 * dihitung ulang saat penyemaian memakai rumus yang sudah diperbaiki, sehingga
 * basis data hasil semai konsisten dengan logika yang berlaku sekarang.
 *
 * KOREKSI DATA
 * Ukuran saat lahir pada berkas lama berselisih dengan baris penimbangan
 * kelahiran di growth.seeder.js untuk peristiwa yang sama:
 *
 *   berat          3,2 kg  ->  3,4 kg
 *   tinggi         50 cm   ->  50,2 cm
 *   lingkar kepala 10 cm   ->  34,5 cm
 *
 * Nilai lama seragam untuk seluruh balita, jadi bukan hasil pengukuran
 * per anak melainkan nilai bawaan saat pengembangan. Angka 10 pada kolom
 * lingkar kepala berasal dari lingkar lengan (10,5 cm) -- lingkar kepala bayi
 * baru lahir tidak mungkin 10 cm. Ketiganya disamakan dengan baris penimbangan
 * kelahiran, yang menjadi titik awal grafik pertumbuhan; tanpa itu profil
 * balita akan menampilkan angka yang berbeda dari grafiknya sendiri.
 */

export interface SeedChild {
  legacyId: string;
  legacyParentId: string;
  fullName: string;
  gender: "M" | "F";
  placeOfBirth: string;
  dateOfBirth: string;
  father: string;
  mother: string;
  orderOfChild: number;
  region: "RW1" | "RW2" | "RW3" | "RW4" | "RW5";
  birthWeight: number;
  birthHeight: number;
  birthHeadCircum: number;
}

export const children: SeedChild[] = [];

const createChildren = (
  legacyId: string,
  legacyParentId: string,
  fullName: string,
  gender: SeedChild["gender"],
  placeOfBirth: string,
  dateOfBirth: string,
  father: string,
  mother: string,
  orderOfChild: number,
  region: SeedChild["region"],
  birthWeight: number,
  _wfaStatus: string,
  birthHeight: number,
  _hfaStatus: string,
  _wfhStatus: string,
  birthHeadCircum: number,
): void => {
  children.push({
    legacyId,
    legacyParentId,
    fullName,
    gender,
    placeOfBirth,
    dateOfBirth,
    father,
    mother,
    orderOfChild,
    region,
    birthWeight,
    birthHeight,
    birthHeadCircum,
  });
};

// ---------------------------------------------------------------------------
// Disalin dari seeder lama mulai dari sini.
// ---------------------------------------------------------------------------

//P1
createChildren(
  "C1",
  "P1",
  "Safira Kanza Azura",
  "F",
  "Banyumas",
  "2023-07-28 00:00:00.000 Z",
  "-",
  "Uswatun Khasanah",
  2,
  "RW1",
  3.4,
  "Normal",
  50.2,
  "Normal",
  "Normal",
  34.5
);
createChildren(
  "C2",
  "P1",
  "Muhammad Arifin",
  "M",
  "Banyumas",
  "2022-06-20 00:00:00.000 Z",
  "-",
  "Uswatun Khasanah",
  1,
  "RW1",
  3.4,
  "Normal",
  50.2,
  "Normal",
  "Normal",
  34.5
);

//P2
createChildren(
  "C3",
  "P2",
  "Ukasah Salih",
  "M",
  "Banyumas",
  "2022-06-20 00:00:00.000 Z",
  "-",
  "Dwi Ratna Sari",
  1,
  "RW1",
  3.4,
  "Normal",
  50.2,
  "Normal",
  "Normal",
  34.5
);

//P3
createChildren(
  "C4",
  "P3",
  "Anzel Kalifano",
  "M",
  "Banyumas",
  "2022-06-20 00:00:00.000 Z",
  "-",
  "Miladia Nur Khasanah",
  1,
  "RW1",
  3.4,
  "Normal",
  50.2,
  "Normal",
  "Normal",
  34.5
);

//P4
createChildren(
  "C5",
  "P4",
  "Aisyah Zahra",
  "F",
  "Banyumas",
  "2023-07-28 00:00:00.000 Z",
  "-",
  "Siti Nurhaliza",
  1,
  "RW1",
  3.4,
  "Normal",
  50.2,
  "Normal",
  "Normal",
  34.5
);

//P5
createChildren(
  "C6",
  "P5",
  "Fatimah Azzahra",
  "F",
  "Banyumas",
  "2023-07-28 00:00:00.000 Z",
  "-",
  "Rina Wati",
  1,
  "RW2",
  3.4,
  "Normal",
  50.2,
  "Normal",
  "Normal",
  34.5
);

//P6
createChildren(
  "C7",
  "P6",
  "Rizki Pratama",
  "M",
  "Banyumas",
  "2022-06-20 00:00:00.000 Z",
  "-",
  "Maya Sari",
  1,
  "RW2",
  3.4,
  "Normal",
  50.2,
  "Normal",
  "Normal",
  34.5
);

//P7
createChildren(
  "C8",
  "P7",
  "Putri Cantika",
  "F",
  "Banyumas",
  "2023-07-28 00:00:00.000 Z",
  "-",
  "Indah Permata",
  1,
  "RW2",
  3.4,
  "Normal",
  50.2,
  "Normal",
  "Normal",
  34.5
);

//P8
createChildren(
  "C9",
  "P8",
  "Bayu Aji",
  "M",
  "Banyumas",
  "2022-06-20 00:00:00.000 Z",
  "-",
  "Intan Ayu Sari",
  1,
  "RW3",
  3.4,
  "Normal",
  50.2,
  "Normal",
  "Normal",
  34.5
);

