const { Router } = require("express");
const { OfficerController } = require("../controllers");
const { validator, authMiddleware } = require("../middlewares");
const { ROLES } = require("../utils/constants");

const router = Router();
const { validate, requirements } = validator;

router
  .route("/")
  .get([authMiddleware.authenticate], OfficerController.getOfficers)
  .put(
    [authMiddleware.authenticate, validate(requirements.updateOfficerById)],
    OfficerController.updateOfficer
  );

router
  .route("/:id")
  .get([authMiddleware.authenticate], OfficerController.getOfficerById)
  .delete([authMiddleware.authenticate], OfficerController.deleteOfficer);

router
  .route("/account/:id")
  .get([authMiddleware.authenticate], OfficerController.getOfficerAccount);

router
  .route("/region/:region")
  .get([authMiddleware.authenticate], OfficerController.getOfficersByRegion);

module.exports = router;
