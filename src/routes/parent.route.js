const { Router } = require("express");
const { ParentController } = require("../controllers");
const { validator, authMiddleware } = require("../middlewares");
const { ROLES } = require("../utils/constants");

const router = Router();
const { validate, requirements } = validator;

router
  .route("/")
  .get([authMiddleware.authenticate], ParentController.getParents)
  .put(
    [authMiddleware.authenticate, validate(requirements.updateParentById)],
    ParentController.updateParent
  );

router
  .route("/name")
  .get([authMiddleware.authenticate], ParentController.getParentByName);

router
  .route("/name/:region")
  .get([authMiddleware.authenticate], ParentController.getParentByNameAndRegion);

router
  .route("/:id")
  .get([authMiddleware.authenticate], ParentController.getParentById)
  .delete([authMiddleware.authenticate], ParentController.deleteParent);

router
  .route("/account/:id")
  .get([authMiddleware.authenticate], ParentController.getParentAccount);

router
  .route("/region/:region")
  .get([authMiddleware.authenticate], ParentController.getParentsByRegion);

module.exports = router;
