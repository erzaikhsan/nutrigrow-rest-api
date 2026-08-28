import { Role } from "@prisma/client";
import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";
import * as ChildrenController from "./children.controller.js";

export const childrenRouter: Router = Router();

childrenRouter.use(authenticate);

// Rute spesifik didaftarkan lebih dahulu; bila tidak, "/name" akan tertangkap
// oleh "/:id" dan dicari sebagai id balita.
childrenRouter.get("/name", ChildrenController.listChildren);

childrenRouter.get(
  "/region/:region/name",
  ChildrenController.listChildrenByRegion,
);
childrenRouter.get("/region/:region", ChildrenController.listChildrenByRegion);

childrenRouter.get("/parent/:parentId", ChildrenController.listChildrenByParent);

childrenRouter.post(
  "/graduate",
  authorize(Role.Admin, Role.Officer),
  ChildrenController.graduateOverAge,
);

childrenRouter
  .route("/")
  .get(ChildrenController.listChildren)
  .post(
    authorize(Role.Admin, Role.Officer, Role.Parent),
    ChildrenController.createChild,
  );

childrenRouter
  .route("/:id")
  .get(ChildrenController.getChildById)
  .put(authorize(Role.Admin, Role.Officer), ChildrenController.updateChild);
