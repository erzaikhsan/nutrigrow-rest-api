const { Router } = require("express");
const { ChildrenController } = require("../controllers");
const { validator, authMiddleware } = require("../middlewares");
const { ROLES } = require("../utils/constants");

const router = Router();
const { validate, requirements } = validator;

router
  .route("/")
  .post(
    [authMiddleware.authenticate, validate(requirements.createChildren)],
    ChildrenController.addChildren
  )
  .get([authMiddleware.authenticate], ChildrenController.getChildren)
  .get([authMiddleware.authenticate], ChildrenController.getChildrenByName);

router
  .route("/name")
  .get([authMiddleware.authenticate], ChildrenController.getChildrenByName);

router
  .route("/:id")
  .get([authMiddleware.authenticate], ChildrenController.getChildrenById)
  .put(
    [authMiddleware.authenticate, validate(requirements.updateChildren)],
    ChildrenController.updateChildren
  );

router
  .route("/parent/:parentId")
  .get([authMiddleware.authenticate], ChildrenController.getChildrenByParentId);

router
  .route("/region/:region")
  .get([authMiddleware.authenticate], ChildrenController.getChildrenByRegion);

router
  .route("/region/:region/name")
  .get(
    [authMiddleware.authenticate],
    ChildrenController.getChildrenByNameAndRegion
  );

module.exports = router;
