const { ReportService } = require("../services");
const logger = require("../utils/logger");
const { handle404Response, handle500Response } = require("../utils/response");

async function generateChildrenReportPDF(req, res) {
  try {
    const pdfBuffer = await ReportService.generateChildrenReportPDF(
      req.query.currentDate
    );
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition":
        'attachment; filename="Data Penimbangan Balita.pdf"',
      "Content-Length": pdfBuffer.length,
    });

    res.status(200).send(pdfBuffer);
  } catch (err) {
    if (err.message == 404) {
      return handle404Response(res);
    }
    logger.error({ status: 500, error: err });
    handle500Response(res);
  }
}

async function generateRegionChildrenReportPDF(req, res) {
  try {
    const pdfBuffer = await ReportService.generateRegionChildrenReportPDF(
      req.query.currentDate,
      req.params.region
    );
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition":
        'attachment; filename="Data Penimbangan Balita.pdf"',
      "Content-Length": pdfBuffer.length,
    });

    res.status(200).send(pdfBuffer);
  } catch (err) {
    if (err.message == 404) {
      return handle404Response(res);
    }
    logger.error({ status: 500, error: err });
    handle500Response(res);
  }
}

async function generateParentReportPDF(req, res) {
  try {
    const pdfBuffer = await ReportService.generateParentReportPDF();
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="Data Orang Tua Balita.pdf"',
      "Content-Length": pdfBuffer.length,
    });

    res.status(200).send(pdfBuffer);
  } catch (err) {
    if (err.message == 404) {
      return handle404Response(res);
    }
    logger.error({ status: 500, error: err });
    handle500Response(res);
  }
}

async function generateRegionParentReportPDF(req, res) {
  try {
    const pdfBuffer = await ReportService.generateRegionParentReportPDF(
      req.params.region
    );
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="Data Orang Tua Balita.pdf"',
      "Content-Length": pdfBuffer.length,
    });

    res.status(200).send(pdfBuffer);
  } catch (err) {
    if (err.message == 404) {
      return handle404Response(res);
    }
    logger.error({ status: 500, error: err });
    handle500Response(res);
  }
}

async function generateMonthlyReportPDF(req, res) {
  try {
    const pdfBuffer = await ReportService.generateMonthlyReportPDF(
      req.query.currentDate,
      req.params.region
    );
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition":
        'attachment; filename="laporan_penimbangan_bulanan.pdf"',
      "Content-Length": pdfBuffer.length,
    });

    res.status(200).send(pdfBuffer);
  } catch (err) {
    if (err.message == 404) {
      return handle404Response(res);
    }
    logger.error({ status: 500, error: err });
    handle500Response(res);
  }
}

module.exports = {
  generateChildrenReportPDF,
  generateRegionChildrenReportPDF,
  generateParentReportPDF,
  generateRegionParentReportPDF,
  generateMonthlyReportPDF,
};
