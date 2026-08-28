/**
 * Mengubah tabel resmi WHO "head circumference-for-age" menjadi berkas
 * TypeScript yang dipakai aplikasi.
 *
 * Pemakaian:
 *   npm run who:import-hcfa -- <berkas-laki-laki.txt> <berkas-perempuan.txt>
 *
 * Berkas masukan adalah "expanded tables" berformat teks dari WHO Child Growth
 * Standards, yang berisi kolom Month, L, M, S, lalu garis-garis SD. Skrip ini
 * memetakan kolom berdasarkan namanya, sehingga tahan terhadap perbedaan urutan
 * maupun pemisah tab/spasi antar edisi berkas.
 *
 * Keluaran ditulis ke src/domain/hcfa-reference.ts.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

interface Row {
  month: number;
  median: number;
  sd1: number;
  sd2: number;
  sd3: number;
  sdNeg1: number;
  sdNeg2: number;
  sdNeg3: number;
}

const COLUMN_ALIASES: Record<keyof Omit<Row, "month">, string[]> = {
  median: ["sd0", "m", "median"],
  sd1: ["sd1"],
  sd2: ["sd2"],
  sd3: ["sd3"],
  sdNeg1: ["sd1neg", "sd-1", "sd_1neg"],
  sdNeg2: ["sd2neg", "sd-2", "sd_2neg"],
  sdNeg3: ["sd3neg", "sd-3", "sd_3neg"],
};

function normalise(header: string): string {
  return header.trim().toLowerCase().replace(/[\s_]/g, "");
}

function parseTable(filePath: string): Row[] {
  const content = readFileSync(filePath, "utf8");
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const headerLine = lines[0];
  if (!headerLine) {
    throw new Error(`Berkas kosong: ${filePath}`);
  }

  const headers = headerLine.split(/\t|\s{2,}|\s+/).map(normalise);

  const indexOf = (aliases: string[]): number => {
    for (const alias of aliases) {
      const index = headers.indexOf(normalise(alias));
      if (index !== -1) return index;
    }
    return -1;
  };

  const monthIndex = indexOf(["month", "age", "agemonth"]);
  if (monthIndex === -1) {
    throw new Error(
      `Kolom umur tidak ditemukan di ${filePath}. Header terbaca: ${headers.join(", ")}`,
    );
  }

  const columnIndex = {} as Record<keyof Omit<Row, "month">, number>;
  for (const [field, aliases] of Object.entries(COLUMN_ALIASES) as Array<
    [keyof Omit<Row, "month">, string[]]
  >) {
    const index = indexOf(aliases);
    if (index === -1) {
      throw new Error(
        `Kolom ${field} tidak ditemukan di ${filePath}. Header terbaca: ${headers.join(", ")}`,
      );
    }
    columnIndex[field] = index;
  }

  const rows: Row[] = [];

  for (const line of lines.slice(1)) {
    const cells = line.split(/\t|\s{2,}|\s+/);
    const month = Number(cells[monthIndex]);

    if (!Number.isInteger(month) || month < 0 || month > 60) continue;

    const read = (field: keyof Omit<Row, "month">): number => {
      const value = Number(cells[columnIndex[field]]);
      if (!Number.isFinite(value)) {
        throw new Error(`Nilai ${field} tidak valid pada umur ${month} di ${filePath}`);
      }
      return value;
    };

    rows.push({
      month,
      median: read("median"),
      sd1: read("sd1"),
      sd2: read("sd2"),
      sd3: read("sd3"),
      sdNeg1: read("sdNeg1"),
      sdNeg2: read("sdNeg2"),
      sdNeg3: read("sdNeg3"),
    });
  }

  if (rows.length === 0) {
    throw new Error(`Tidak ada baris data terbaca dari ${filePath}`);
  }

  return rows;
}

function renderTable(rows: Row[]): string {
  return rows
    .map(
      (row) => `    ${row.month}: {
      median: ${row.median},
      sd1: ${row.sd1},
      sd2: ${row.sd2},
      sd3: ${row.sd3},
      sdNeg1: ${row.sdNeg1},
      sdNeg2: ${row.sdNeg2},
      sdNeg3: ${row.sdNeg3},
    },`,
    )
    .join("\n");
}

function main(): void {
  const [boysPath, girlsPath] = process.argv.slice(2);

  if (!boysPath || !girlsPath) {
    console.error(
      "Pemakaian: npm run who:import-hcfa -- <berkas-laki-laki.txt> <berkas-perempuan.txt>",
    );
    process.exit(1);
  }

  const boys = parseTable(resolve(boysPath));
  const girls = parseTable(resolve(girlsPath));

  const output = `import type { ByAge, Sex } from "./who-reference.js";

/**
 * Standar WHO lingkar kepala menurut umur (head circumference-for-age).
 *
 * BERKAS INI DIHASILKAN OLEH SKRIP -- jangan disunting manual.
 * Sumber : ${boysPath} , ${girlsPath}
 * Perintah: npm run who:import-hcfa
 */

export const HCFA_WHO_REFERENCE: Record<Sex, ByAge> = {
  M: {
${renderTable(boys)}
  },
  F: {
${renderTable(girls)}
  },
};

export const HCFA_REFERENCE_AVAILABLE =
  Object.keys(HCFA_WHO_REFERENCE.M).length > 0 &&
  Object.keys(HCFA_WHO_REFERENCE.F).length > 0;
`;

  const target = resolve("src/domain/hcfa-reference.ts");
  writeFileSync(target, output, "utf8");

  console.log(
    `Tabel lingkar kepala ditulis ke ${target} (${boys.length} baris laki-laki, ${girls.length} baris perempuan).`,
  );
}

main();
