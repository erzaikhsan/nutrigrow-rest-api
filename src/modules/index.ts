import { Router } from "express";
import { authRouter } from "./auth/auth.routes.js";
import { childrenRouter } from "./children/children.routes.js";
import { eventRouter } from "./event/event.routes.js";
import { growthRouter } from "./growth/growth.routes.js";
import { reportRouter } from "./report/report.routes.js";
import {
  officerRouter,
  parentRouter,
  userRouter,
} from "./user/user.routes.js";
import { vaccineRouter } from "./vaccine/vaccine.routes.js";

export const apiRouter: Router = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/user", userRouter);
apiRouter.use("/parent", parentRouter);
apiRouter.use("/officer", officerRouter);
apiRouter.use("/children", childrenRouter);
apiRouter.use("/growth", growthRouter);
apiRouter.use("/vaccine", vaccineRouter);
apiRouter.use("/event", eventRouter);
apiRouter.use("/report", reportRouter);
