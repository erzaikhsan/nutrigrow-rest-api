const { Router } = require("express");
const { AuthController } = require("../controllers");
const { validator, authMiddleware } = require("../middlewares");

const router = Router();
const { validate, requirements } = validator;

router
  .route("/login")
  .post([validate(requirements.login)], AuthController.login);

router.route("/register/otp-request").post(AuthController.sendOtp);
router.route("/register/account").post(AuthController.registerAccountParent);

router
  .route("/register/officer")
  .post(
    [validate(requirements.registerOfficer)],
    AuthController.registerOfficer
  );

router
  .route("/register/parent")
  .post([validate(requirements.registerParent)], AuthController.registerParent);

router
  .route("/deactivate/account/:id")
  .delete([authMiddleware.authenticate], AuthController.deactiveAccount);

router
  .route("/activate/account/:id")
  .delete([authMiddleware.authenticate], AuthController.activeAccount);

module.exports = router;
