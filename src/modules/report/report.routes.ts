import { Role } from "@prisma/client";
import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";
import * as ReportController from "./report.controller.js";

export const reportRouter: Router = Router();

reportRouter.use(authenticate, authorize(Role.Admin, Role.Officer));

reportRouter.get(
  "/children/region/:region",
  ReportController.childrenReportByRegion,
);
reportRouter.get("/children", ReportController.childrenReport);

reportRouter.get(
  "/parents/region/:region",
  ReportController.parentReportByRegion,
);
reportRouter.get("/parents", ReportController.parentReport);

reportRouter.get("/growth/month/:region", ReportController.monthlyReport);
