import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import * as UserController from "./user.controller.js";

/**
 * Orang tua, kader, dan admin disimpan dalam satu tabel `users` dengan kolom
 * peran -- persis seperti basis data lama, yang juga sempat mendefinisikan
 * tabel `parents` dan `officers` namun tidak pernah memakainya.
 *
 * Ketiga prefiks di bawah dipertahankan karena aplikasi memanggilnya, tetapi
 * semuanya bermuara ke layanan yang sama.
 */

export const userRouter: Router = Router();
userRouter.use(authenticate);
userRouter.get("/:id", UserController.getUserById);

export const parentRouter: Router = Router();
parentRouter.use(authenticate);

// Rute spesifik lebih dahulu agar "/name" dan "/account" tidak tertangkap "/:id".
parentRouter.get("/name/:region", UserController.listParentsByRegion);
parentRouter.get("/name", UserController.listParents);
parentRouter.get("/region/:region", UserController.listParentsByRegion);
parentRouter.get("/account/:id", UserController.getUserById);

parentRouter
  .route("/")
  .get(UserController.listParents)
  .put(UserController.updateOwnProfile);

parentRouter
  .route("/:id")
  .get(UserController.getUserById)
  .delete(UserController.deleteUser);

export const officerRouter: Router = Router();
officerRouter.use(authenticate);

officerRouter.get("/name/:region", UserController.listOfficersByRegion);
officerRouter.get("/name", UserController.listOfficers);
officerRouter.get("/region/:region", UserController.listOfficersByRegion);
officerRouter.get("/account/:id", UserController.getUserById);

officerRouter
  .route("/")
  .get(UserController.listOfficers)
  .put(UserController.updateOwnProfile);

officerRouter
  .route("/:id")
  .get(UserController.getUserById)
  .delete(UserController.deleteUser);
