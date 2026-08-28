const { Router } = require("express");
const { VaccineController } = require("../controllers");
const { authMiddleware } = require("../middlewares");
const { ROLES } = require("../utils/constants");

const router = Router();

router
  .route("/")
  .post([authMiddleware.authenticate], VaccineController.addVaccine);

router
  .route("/:id")
  .get([authMiddleware.authenticate], VaccineController.getVaccineById)
  .put([authMiddleware.authenticate], VaccineController.updateVaccine)
  .delete([authMiddleware.authenticate], VaccineController.deleteVaccine);

router
  .route("/children/:childId")
  .get([authMiddleware.authenticate], VaccineController.getVaccineByChildId);

module.exports = router;
