import { Role } from "@prisma/client";
import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";
import * as EventController from "./event.controller.js";

export const eventRouter: Router = Router();

eventRouter.use(authenticate);

eventRouter.get("/incoming/event", EventController.listIncomingEvents);
eventRouter.get("/today/reminder", EventController.listEventsToday);
eventRouter.get("/region/:region", EventController.listEventsByRegion);

eventRouter
  .route("/")
  .get(EventController.listEvents)
  .post(authorize(Role.Admin, Role.Officer), EventController.createEvent);

eventRouter
  .route("/:id")
  .get(EventController.getEventById)
  .put(authorize(Role.Admin, Role.Officer), EventController.updateEvent)
  .delete(authorize(Role.Admin, Role.Officer), EventController.deleteEvent);
