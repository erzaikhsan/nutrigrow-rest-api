import type { Request, Response } from "express";
import { ok } from "../../core/http.js";
import { parseBody } from "../../core/validate.js";
import { zScoreBatchSchema, zScoreSampleSchema } from "./validation.schema.js";
import * as ValidationService from "./validation.service.js";

export async function checkZScore(req: Request, res: Response): Promise<void> {
  const result = ValidationService.checkZScore(
    parseBody(req, zScoreSampleSchema),
  );
  ok(res, "Perhitungan z-score berhasil", result);
}

export async function checkZScoreBatch(
  req: Request,
  res: Response,
): Promise<void> {
  const result = ValidationService.checkZScoreBatch(
    parseBody(req, zScoreBatchSchema),
  );
  ok(res, "Perhitungan z-score massal berhasil", result);
}
