const { Router } = require("express");
const { EventController } = require("../controllers");
const { validator, authMiddleware } = require("../middlewares");
const { ROLES } = require("../utils/constants");

const router = Router();
const { validate, requirements } = validator;

router
  .route("/")
  .post(
    [authMiddleware.authenticate, validate(requirements.addEvent)],
    EventController.addEvent
  )
  .get([authMiddleware.authenticate], EventController.getEvents);

router
  .route("/:id")
  .get([authMiddleware.authenticate], EventController.getEventById)
  .put(
    [authMiddleware.authenticate, validate(requirements.updateEvent)],
    EventController.updateEvent
  )
  .delete([authMiddleware.authenticate], EventController.deleteEvent);

router
  .route("/date/month")
  .get([authMiddleware.authenticate], EventController.getEventByMonth);

router
  .route("/today/reminder")
  .get([authMiddleware.authenticate], EventController.getEventToday);

router
  .route("/region/:region")
  .get([authMiddleware.authenticate], EventController.getEventByRegion);

module.exports = router;
