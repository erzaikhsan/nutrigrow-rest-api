import { Role } from "@prisma/client";
import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";
import * as ValidationController from "./validation.controller.js";

export const validationRouter: Router = Router();

validationRouter.use(authenticate, authorize(Role.Admin));

validationRouter.post("/zscore", ValidationController.checkZScore);
validationRouter.post("/zscore/batch", ValidationController.checkZScoreBatch);
