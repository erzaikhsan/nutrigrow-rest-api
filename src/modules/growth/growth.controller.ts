import type { Request, Response } from "express";
import { notFound } from "../../core/errors.js";
import { created, ok } from "../../core/http.js";
import { parseBody, parseParams, parseQuery } from "../../core/validate.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { childIdParamSchema, idParamSchema } from "../shared.schema.js";
import {
  createGrowthSchema,
  growthListQuerySchema,
  monthQuerySchema,
  updateGrowthSchema,
  yearQuerySchema,
} from "./growth.schema.js";
import * as GrowthService from "./growth.service.js";

function readDateInput(req: Request): { date: Date } {
  const query = req.query as Record<string, unknown>;
  const body = (req.body ?? {}) as Record<string, unknown>;

  return monthQuerySchema.parse({ date: query["date"] ?? body["date"] });
}

export async function createGrowth(req: Request, res: Response): Promise<void> {
  const auth = requireAuth(req);
  const result = await GrowthService.createGrowth(
    parseBody(req, createGrowthSchema),
    auth,
  );
  created(res, "Data penimbangan berhasil ditambahkan", result);
}

export async function updateGrowth(req: Request, res: Response): Promise<void> {
  const auth = requireAuth(req);
  const { id } = parseParams(req, idParamSchema);
  const result = await GrowthService.updateGrowth(
    id,
    parseBody(req, updateGrowthSchema),
    auth,
  );
  ok(res, "Data penimbangan berhasil diperbarui", result);
}

export async function deleteGrowth(req: Request, res: Response): Promise<void> {
  const auth = requireAuth(req);
  const { id } = parseParams(req, idParamSchema);
  const result = await GrowthService.deleteGrowth(id, auth);
  ok(res, "Data penimbangan berhasil dihapus", result);
}

export async function getGrowthById(
  req: Request,
  res: Response,
): Promise<void> {
  const auth = requireAuth(req);
  const { id } = parseParams(req, idParamSchema);
  const result = await GrowthService.getGrowthById(id, auth);
  ok(res, "Data penimbangan ditemukan", result);
}

export async function listGrowth(req: Request, res: Response): Promise<void> {
  const auth = requireAuth(req);
  const result = await GrowthService.listGrowth(
    parseQuery(req, growthListQuerySchema),
    auth,
  );
  ok(res, "Daftar penimbangan berhasil diambil", result);
}

export async function listGrowthByChild(
  req: Request,
  res: Response,
): Promise<void> {
  const auth = requireAuth(req);
  const { childId } = parseParams(req, childIdParamSchema);
  const result = await GrowthService.listGrowthByChild(childId, auth);
  ok(res, "Riwayat penimbangan berhasil diambil", result);
}

export async function listGrowthByChildInYear(
  req: Request,
  res: Response,
): Promise<void> {
  const auth = requireAuth(req);
  const { childId } = parseParams(req, childIdParamSchema);
  const { year } = parseQuery(req, yearQuerySchema);
  const result = await GrowthService.listGrowthByChildInYear(
    childId,
    year,
    auth,
  );
  ok(res, "Riwayat penimbangan tahunan berhasil diambil", result);
}

export async function listGrowthByChildAndMonth(
  req: Request,
  res: Response,
): Promise<void> {
  const auth = requireAuth(req);
  const { childId } = parseParams(req, childIdParamSchema);
  const { date } = readDateInput(req);
  const result = await GrowthService.listGrowthByChildAndMonth(
    childId,
    date,
    auth,
  );
  ok(res, "Penimbangan bulan tersebut berhasil diambil", result);
}

export async function listGrowthByMonth(
  req: Request,
  res: Response,
): Promise<void> {
  const auth = requireAuth(req);
  const { date } = readDateInput(req);
  const result = await GrowthService.listGrowthByMonth(date, auth);
  ok(res, "Penimbangan bulan tersebut berhasil diambil", result);
}

export async function getLastGrowth(
  req: Request,
  res: Response,
): Promise<void> {
  const auth = requireAuth(req);
  const { childId } = parseParams(req, childIdParamSchema);
  const result = await GrowthService.getLastGrowthByChild(childId, auth);

  if (!result) throw notFound("Data penimbangan");

  ok(res, "Penimbangan terakhir berhasil diambil", result);
}
