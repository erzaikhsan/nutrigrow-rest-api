import { Role } from "@prisma/client";
import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";
import * as VaccineController from "./vaccine.controller.js";

export const vaccineRouter: Router = Router();

vaccineRouter.use(authenticate);

vaccineRouter.get("/children/:childId", VaccineController.listVaccineByChild);

vaccineRouter.post(
  "/",
  authorize(Role.Admin, Role.Officer),
  VaccineController.createVaccine,
);

vaccineRouter
  .route("/:id")
  .get(VaccineController.getVaccineById)
  .put(authorize(Role.Admin, Role.Officer), VaccineController.updateVaccine)
  .delete(authorize(Role.Admin, Role.Officer), VaccineController.deleteVaccine);
