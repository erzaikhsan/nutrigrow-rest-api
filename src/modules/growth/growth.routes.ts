import { Role } from "@prisma/client";
import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";
import * as GrowthController from "./growth.controller.js";

export const growthRouter: Router = Router();

growthRouter.use(authenticate);

// Rute spesifik lebih dahulu agar tidak tertangkap oleh "/:id".
growthRouter.get("/year/:childId", GrowthController.listGrowthByChildInYear);
growthRouter.get("/children/:childId", GrowthController.listGrowthByChild);
growthRouter.get(
  "/date/month/children/:childId",
  GrowthController.listGrowthByChildAndMonth,
);
growthRouter.get("/date/month", GrowthController.listGrowthByMonth);
growthRouter.get("/date/last/:childId", GrowthController.getLastGrowth);

growthRouter
  .route("/")
  .get(GrowthController.listGrowth)
  .post(
    authorize(Role.Admin, Role.Officer),
    GrowthController.createGrowth,
  );

growthRouter
  .route("/:id")
  .get(GrowthController.getGrowthById)
  .put(authorize(Role.Admin, Role.Officer), GrowthController.updateGrowth)
  .delete(authorize(Role.Admin, Role.Officer), GrowthController.deleteGrowth);
