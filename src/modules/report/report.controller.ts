import type { Request, Response } from "express";
import { parseParams, parseQuery } from "../../core/validate.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { regionParamSchema } from "../shared.schema.js";
import { reportPeriodSchema } from "./report.schema.js";
import * as ReportService from "./report.service.js";

function sendPdf(res: Response, filename: string, pdf: Buffer): void {
  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${filename}"`,
    "Content-Length": String(pdf.length),
  });
  res.status(200).send(pdf);
}

export async function childrenReport(
  req: Request,
  res: Response,
): Promise<void> {
  const auth = requireAuth(req);
  const { month, year } = parseQuery(req, reportPeriodSchema);

  const pdf = await ReportService.generateChildrenReport(month, year, auth);
  sendPdf(res, "Data Penimbangan Balita.pdf", pdf);
}

export async function childrenReportByRegion(
  req: Request,
  res: Response,
): Promise<void> {
  const auth = requireAuth(req);
  const { month, year } = parseQuery(req, reportPeriodSchema);
  const { region } = parseParams(req, regionParamSchema);

  const pdf = await ReportService.generateChildrenReport(
    month,
    year,
    auth,
    region,
  );
  sendPdf(res, "Data Penimbangan Balita.pdf", pdf);
}

export async function parentReport(
  req: Request,
  res: Response,
): Promise<void> {
  const auth = requireAuth(req);
  const pdf = await ReportService.generateParentReport(auth);
  sendPdf(res, "Data Orang Tua Balita.pdf", pdf);
}

export async function parentReportByRegion(
  req: Request,
  res: Response,
): Promise<void> {
  const auth = requireAuth(req);
  const { region } = parseParams(req, regionParamSchema);

  const pdf = await ReportService.generateParentReport(auth, region);
  sendPdf(res, "Data Orang Tua Balita.pdf", pdf);
}

export async function monthlyReport(
  req: Request,
  res: Response,
): Promise<void> {
  const auth = requireAuth(req);
  const { month, year } = parseQuery(req, reportPeriodSchema);
  const { region } = parseParams(req, regionParamSchema);

  const pdf = await ReportService.generateMonthlyReport(
    month,
    year,
    region,
    auth,
  );
  sendPdf(res, "laporan_penimbangan_bulanan.pdf", pdf);
}
