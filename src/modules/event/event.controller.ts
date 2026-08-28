import type { Request, Response } from "express";
import { badRequest } from "../../core/errors.js";
import { created, ok } from "../../core/http.js";
import { parseBody, parseParams, parseQuery } from "../../core/validate.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { idParamSchema, regionParamSchema } from "../shared.schema.js";
import {
  createEventSchema,
  eventFilterSchema,
  updateEventSchema,
} from "./event.schema.js";
import * as EventService from "./event.service.js";

export async function createEvent(req: Request, res: Response): Promise<void> {
  const auth = requireAuth(req);
  const result = await EventService.createEvent(
    parseBody(req, createEventSchema),
    auth,
  );
  created(res, "Kegiatan berhasil ditambahkan", result);
}

export async function updateEvent(req: Request, res: Response): Promise<void> {
  const auth = requireAuth(req);
  const { id } = parseParams(req, idParamSchema);
  const result = await EventService.updateEvent(
    id,
    parseBody(req, updateEventSchema),
    auth,
  );
  ok(res, "Kegiatan berhasil diperbarui", result);
}

export async function deleteEvent(req: Request, res: Response): Promise<void> {
  const auth = requireAuth(req);
  const { id } = parseParams(req, idParamSchema);
  const result = await EventService.deleteEvent(id, auth);
  ok(res, "Kegiatan berhasil dihapus", result);
}

export async function getEventById(req: Request, res: Response): Promise<void> {
  const auth = requireAuth(req);
  const { id } = parseParams(req, idParamSchema);
  const result = await EventService.getEventById(id, auth);
  ok(res, "Kegiatan ditemukan", result);
}

export async function listEvents(req: Request, res: Response): Promise<void> {
  const auth = requireAuth(req);
  const result = await EventService.listEvents(
    parseQuery(req, eventFilterSchema),
    auth,
  );
  ok(res, "Daftar kegiatan berhasil diambil", result);
}

export async function listEventsByRegion(
  req: Request,
  res: Response,
): Promise<void> {
  const auth = requireAuth(req);
  const { region } = parseParams(req, regionParamSchema);
  const result = await EventService.listEventsByRegion(region, auth);
  ok(res, "Daftar kegiatan berhasil diambil", result);
}

export async function listIncomingEvents(
  req: Request,
  res: Response,
): Promise<void> {
  const auth = requireAuth(req);
  const { date } = parseQuery(req, eventFilterSchema);
  if (!date) throw badRequest("Parameter tanggal wajib diisi");

  const result = await EventService.listIncomingEvents(date, auth);
  ok(res, "Kegiatan mendatang berhasil diambil", result);
}

export async function listEventsToday(
  req: Request,
  res: Response,
): Promise<void> {
  const auth = requireAuth(req);
  const { date } = parseQuery(req, eventFilterSchema);
  if (!date) throw badRequest("Parameter tanggal wajib diisi");

  const result = await EventService.listEventsOnDate(date, auth);
  ok(res, "Kegiatan hari ini berhasil diambil", result);
}
