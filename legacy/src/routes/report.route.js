const { Router } = require("express");
const { ReportController } = require("../controllers");
const { authMiddleware } = require("../middlewares");
const { ROLES } = require("../utils/constants");

const router = Router();
router
  .route("/children")
  .get(
    [authMiddleware.authenticate],
    ReportController.generateChildrenReportPDF
  );

router
  .route("/children/region/:region")
  .get(
    [authMiddleware.authenticate],
    ReportController.generateRegionChildrenReportPDF
  );

router
  .route("/parents")
  .get([authMiddleware.authenticate], ReportController.generateParentReportPDF);

router
  .route("/parents/region/:region")
  .get(
    [authMiddleware.authenticate],
    ReportController.generateRegionParentReportPDF
  );

router
  .route("/growth/month/:region")
  .get(
    [authMiddleware.authenticate],
    ReportController.generateMonthlyReportPDF
  );

module.exports = router;
