const { Router } = require("express");
const { GrowthController } = require("../controllers");
const { validator, authMiddleware } = require("../middlewares");
const { ROLES } = require("../utils/constants");

const router = Router();
const { validate, requirements } = validator;

router
  .route("/")
  .post(
    [authMiddleware.authenticate, validate(requirements.createGrowth)],
    GrowthController.addGrowth
  )
  .get([authMiddleware.authenticate], GrowthController.getGrowth);

router
  .route("/:id")
  .get([authMiddleware.authenticate], GrowthController.getGrowthById)
  .put(
    [authMiddleware.authenticate, validate(requirements.updateGrowth)],
    GrowthController.updateGrowth
  )
  .delete([authMiddleware.authenticate], GrowthController.deleteGrowth);

router
  .route("/children/:childId")
  .get([authMiddleware.authenticate], GrowthController.getGrowthByChildId);

router
  .route("/date/month/children/:childId")
  .get(
    [authMiddleware.authenticate],
    GrowthController.getGrowthByMonthYearAndChildId
  );

// router
//   .route("/date/month")
//   .get([authMiddleware.authenticate], GrowthController.getGrowthOnMonth);

router
  .route("/date/last/:childId")
  .get([authMiddleware.authenticate], GrowthController.getLastGrowthByChildId);

module.exports = router;
