import PDFDocument from "pdfkit-table";

/**
 * Perkakas bersama untuk seluruh laporan PDF.
 *
 * Versi lama memakai paket stream-buffers untuk menampung keluaran. Node sudah
 * menyediakan semua yang diperlukan, jadi satu ketergantungan bisa dilepas.
 */

export const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const;

export const POSYANDU_NAMES: Record<string, string> = {
  RW1: "PAMUJI 1",
  RW2: "PAMUJI 2",
  RW3: "PAMUJI 3",
  RW4: "PAMUJI 4",
  RW5: "PAMUJI 5",
  Village: "DESA JIPANG",
};

export function createLandscapeDocument(): PDFDocument {
  return new PDFDocument({ margin: 30, size: "A4", layout: "landscape" });
}

export function createPortraitDocument(): PDFDocument {
  return new PDFDocument({ margin: 30, size: "A4" });
}

/**
 * Menutup dokumen dan mengumpulkan seluruh isinya menjadi satu Buffer.
 * Pemanggil wajib sudah menuliskan seluruh isi sebelum memanggil ini.
 */
export function renderToBuffer(doc: PDFDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.end();
  });
}

/** Tanggal dalam bahasa Indonesia, misalnya "28 Juli 2023". */
export function formatDateId(date: Date): string {
  const day = date.getUTCDate();
  const month = MONTH_NAMES[date.getUTCMonth()] ?? "";
  return `${day} ${month} ${date.getUTCFullYear()}`;
}

export function formatGender(gender: "M" | "F"): string {
  return gender === "M" ? "Laki-laki" : "Perempuan";
}
