import type { Request, Response } from "express";
import { created, ok } from "../../core/http.js";
import { parseBody, parseParams } from "../../core/validate.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { childIdParamSchema, idParamSchema } from "../shared.schema.js";
import {
  createVaccineSchema,
  updateVaccineSchema,
} from "./vaccine.schema.js";
import * as VaccineService from "./vaccine.service.js";

export async function createVaccine(
  req: Request,
  res: Response,
): Promise<void> {
  const auth = requireAuth(req);
  const result = await VaccineService.createVaccine(
    parseBody(req, createVaccineSchema),
    auth,
  );
  created(res, "Data imunisasi berhasil ditambahkan", result);
}

export async function updateVaccine(
  req: Request,
  res: Response,
): Promise<void> {
  const auth = requireAuth(req);
  const { id } = parseParams(req, idParamSchema);
  const result = await VaccineService.updateVaccine(
    id,
    parseBody(req, updateVaccineSchema),
    auth,
  );
  ok(res, "Data imunisasi berhasil diperbarui", result);
}

export async function deleteVaccine(
  req: Request,
  res: Response,
): Promise<void> {
  const auth = requireAuth(req);
  const { id } = parseParams(req, idParamSchema);
  const result = await VaccineService.deleteVaccine(id, auth);
  ok(res, "Data imunisasi berhasil dihapus", result);
}

export async function getVaccineById(
  req: Request,
  res: Response,
): Promise<void> {
  const auth = requireAuth(req);
  const { id } = parseParams(req, idParamSchema);
  const result = await VaccineService.getVaccineById(id, auth);
  ok(res, "Data imunisasi ditemukan", result);
}

export async function listVaccineByChild(
  req: Request,
  res: Response,
): Promise<void> {
  const auth = requireAuth(req);
  const { childId } = parseParams(req, childIdParamSchema);
  const result = await VaccineService.listVaccineByChild(childId, auth);
  ok(res, "Riwayat imunisasi berhasil diambil", result);
}
