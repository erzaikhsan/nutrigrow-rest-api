const { Router } = require("express");
const { UserController } = require("../controllers");
const { authMiddleware } = require("../middlewares");

const router = Router();

router
  .route("/:id")
  .get([authMiddleware.authenticate], UserController.getUserById);

module.exports = router;
