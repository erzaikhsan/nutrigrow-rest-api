const { Router } = require("express");
const { CheckController } = require("../controllers");
const { authMiddleware } = require("../middlewares");

const router = Router();
const { ROLES } = require("../utils/constants");

router
  .route("/")
  .post([authMiddleware.authenticate], CheckController.addCheckUp);

router
  .route("/:id")
  .get([authMiddleware.authenticate], CheckController.getCheckUpById);

router
  .route("/parent/:parentId")
  .get([authMiddleware.authenticate], CheckController.getCheckUpByParentId);

module.exports = router;
