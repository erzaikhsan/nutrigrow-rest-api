declare module "pdfkit-table" {
  import PDFDocument from "pdfkit";

  export interface Table {
    title?: string;
    subtitle?: string;
    headers: Array<string | { label: string; width?: number }>;
    rows: Array<Array<string | number>>;
  }

  export interface TableOptions {
    columnsSize?: number[];
    width?: number;
    padding?: number;
    prepareHeader?: () => PDFKit.PDFDocument;
    prepareRow?: (
      row?: Array<string | number>,
      indexColumn?: number,
      indexRow?: number,
      rectRow?: unknown,
      rectCell?: unknown,
    ) => PDFKit.PDFDocument;
  }

  export default class PDFDocumentWithTables extends PDFDocument {
    table(table: Table, options?: TableOptions): Promise<void>;
  }
}
