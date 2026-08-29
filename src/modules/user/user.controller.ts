import type { Request, Response } from "express";
import { ok } from "../../core/http.js";
import { parseBody, parseParams, parseQuery } from "../../core/validate.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { idParamSchema, regionParamSchema } from "../shared.schema.js";
import { updateProfileSchema, userSearchSchema } from "./user.schema.js";
import * as UserService from "./user.service.js";

export async function getUserById(req: Request, res: Response): Promise<void> {
  const auth = requireAuth(req);
  const { id } = parseParams(req, idParamSchema);
  const result = await UserService.getUserById(id, auth);
  ok(res, "Data pengguna ditemukan", result);
}

export async function updateOwnProfile(
  req: Request,
  res: Response,
): Promise<void> {
  const auth = requireAuth(req);
  const result = await UserService.updateOwnProfile(
    parseBody(req, updateProfileSchema),
    auth,
  );
  ok(res, "Profil berhasil diperbarui", result);
}

export async function listParents(req: Request, res: Response): Promise<void> {
  const auth = requireAuth(req);
  const result = await UserService.listParents(
    parseQuery(req, userSearchSchema),
    auth,
  );
  ok(res, "Daftar orang tua berhasil diambil", result);
}

export async function listParentsByRegion(
  req: Request,
  res: Response,
): Promise<void> {
  const auth = requireAuth(req);
  const { region } = parseParams(req, regionParamSchema);
  const result = await UserService.listParents(
    parseQuery(req, userSearchSchema),
    auth,
    region,
  );
  ok(res, "Daftar orang tua berhasil diambil", result);
}

export async function listOfficers(req: Request, res: Response): Promise<void> {
  const auth = requireAuth(req);
  const result = await UserService.listOfficers(
    parseQuery(req, userSearchSchema),
    auth,
  );
  ok(res, "Daftar kader berhasil diambil", result);
}

export async function listOfficersByRegion(
  req: Request,
  res: Response,
): Promise<void> {
  const auth = requireAuth(req);
  const { region } = parseParams(req, regionParamSchema);
  const result = await UserService.listOfficers(
    parseQuery(req, userSearchSchema),
    auth,
    region,
  );
  ok(res, "Daftar kader berhasil diambil", result);
}

export async function deleteUser(req: Request, res: Response): Promise<void> {
  const auth = requireAuth(req);
  const { id } = parseParams(req, idParamSchema);
  const result = await UserService.deleteUser(id, auth);
  ok(res, "Akun berhasil dihapus", result);
}
