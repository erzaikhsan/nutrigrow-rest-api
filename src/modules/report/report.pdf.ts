import PDFDocument from "pdfkit-table";

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

export function renderToBuffer(doc: PDFDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.end();
  });
}

export function formatDateId(date: Date): string {
  const day = date.getUTCDate();
  const month = MONTH_NAMES[date.getUTCMonth()] ?? "";
  return `${day} ${month} ${date.getUTCFullYear()}`;
}

export function formatGender(gender: "M" | "F"): string {
  return gender === "M" ? "Laki-laki" : "Perempuan";
}
