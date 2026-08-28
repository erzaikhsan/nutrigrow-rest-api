import type { Request, Response } from "express";
import { created, ok } from "../../core/http.js";
import { parseBody, parseParams, parseQuery } from "../../core/validate.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { idParamSchema, regionParamSchema } from "../shared.schema.js";
import {
  childSearchSchema,
  createChildSchema,
  parentIdParamSchema,
  updateChildSchema,
} from "./children.schema.js";
import * as ChildrenService from "./children.service.js";

export async function createChild(req: Request, res: Response): Promise<void> {
  const auth = requireAuth(req);
  const result = await ChildrenService.createChild(
    parseBody(req, createChildSchema),
    auth,
  );
  created(res, "Data balita berhasil ditambahkan", result);
}

export async function updateChild(req: Request, res: Response): Promise<void> {
  const auth = requireAuth(req);
  const { id } = parseParams(req, idParamSchema);
  const result = await ChildrenService.updateChild(
    id,
    parseBody(req, updateChildSchema),
    auth,
  );
  ok(res, "Data balita berhasil diperbarui", result);
}

export async function getChildById(req: Request, res: Response): Promise<void> {
  const auth = requireAuth(req);
  const { id } = parseParams(req, idParamSchema);
  const result = await ChildrenService.getChildById(id, auth);
  ok(res, "Data balita ditemukan", result);
}

export async function listChildren(req: Request, res: Response): Promise<void> {
  const auth = requireAuth(req);
  const result = await ChildrenService.listChildren(
    parseQuery(req, childSearchSchema),
    auth,
  );
  ok(res, "Daftar balita berhasil diambil", result);
}

export async function listChildrenByParent(
  req: Request,
  res: Response,
): Promise<void> {
  const auth = requireAuth(req);
  const { parentId } = parseParams(req, parentIdParamSchema);
  const result = await ChildrenService.listChildrenByParent(parentId, auth);
  ok(res, "Daftar balita berhasil diambil", result);
}

export async function listChildrenByRegion(
  req: Request,
  res: Response,
): Promise<void> {
  const auth = requireAuth(req);
  const { region } = parseParams(req, regionParamSchema);
  const result = await ChildrenService.listChildrenByRegion(
    region,
    parseQuery(req, childSearchSchema),
    auth,
  );
  ok(res, "Daftar balita berhasil diambil", result);
}

export async function graduateOverAge(
  req: Request,
  res: Response,
): Promise<void> {
  const auth = requireAuth(req);
  const graduated = await ChildrenService.graduateOverAgeChildren(auth);
  ok(res, "Status kelulusan balita diperbarui", { graduated });
}
