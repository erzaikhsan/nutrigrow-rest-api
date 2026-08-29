import { Role } from "@prisma/client";
import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";
import * as AuthController from "./auth.controller.js";

const rejection = (message: string) => ({
  success: false,
  message,
  code: "TOO_MANY_REQUESTS",
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (_req, res) => {
    res
      .status(429)
      .json(rejection("Terlalu banyak percobaan masuk. Coba lagi nanti."));
  },
});

const otpLimiter = rateLimit({
  windowMs: 60 * 60_000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (_req, res) => {
    res
      .status(429)
      .json(rejection("Terlalu banyak permintaan kode. Coba lagi nanti."));
  },
});

export const authRouter: Router = Router();

authRouter.post("/login", loginLimiter, AuthController.login);

authRouter.post("/register/otp-request", otpLimiter, AuthController.requestOtp);
authRouter.post("/register/verify", otpLimiter, AuthController.verifyOtp);
authRouter.post("/register/parent", AuthController.registerParent);

authRouter.post(
  "/register/officer",
  authenticate,
  authorize(Role.Admin),
  AuthController.registerOfficer,
);

authRouter.delete(
  "/deactivate/account/:id",
  authenticate,
  authorize(Role.Admin, Role.Officer),
  AuthController.deactivateAccount,
);

authRouter.delete(
  "/activate/account/:id",
  authenticate,
  authorize(Role.Admin, Role.Officer),
  AuthController.activateAccount,
);

authRouter.post("/password/forgot", otpLimiter, AuthController.forgotPassword);
authRouter.post("/password/reset", otpLimiter, AuthController.resetPassword);
