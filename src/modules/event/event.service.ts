import {
  AuditAction,
  Prisma,
  Region,
  Role,
  type Event,
} from "@prisma/client";
import { forbidden, notFound } from "../../core/errors.js";
import { toListParams } from "../../core/http.js";
import { prisma } from "../../core/prisma.js";
import { toEventDto, type EventDto } from "../../core/serialize.js";
import type { AuthContext } from "../../middlewares/auth.middleware.js";
import { isVillageWide } from "../access.js";
import { recordAudit } from "../audit/audit.service.js";
import type {
  CreateEventInput,
  EventFilterInput,
  UpdateEventInput,
} from "./event.schema.js";

const ACTIVE = { deletedAt: null } as const;

/**
 * Kegiatan berskala desa terlihat oleh semua wilayah, sedangkan kegiatan RW
 * hanya oleh wilayahnya sendiri. Aturan ini sudah ada sejak versi lama dan
 * dipertahankan; yang baru adalah penerapannya juga pada penulisan.
 */
function visibilityFilter(auth: AuthContext): Prisma.EventWhereInput {
  if (isVillageWide(auth)) return {};
  return { region: { in: [auth.region, Region.Village] } };
}

function assertCanManage(auth: AuthContext, region: Region): void {
  if (auth.role === Role.Admin) return;

  if (auth.role !== Role.Officer) {
    throw forbidden("Hanya kader dan admin yang dapat mengelola kegiatan");
  }

  // Kader RW tidak boleh membuat kegiatan atas nama desa atau RW lain.
  if (!isVillageWide(auth) && region !== auth.region) {
    throw forbidden("Anda hanya dapat mengelola kegiatan di wilayah Anda");
  }
}

async function loadEvent(id: string): Promise<Event> {
  const event = await prisma.event.findFirst({ where: { id, ...ACTIVE } });
  if (!event) throw notFound("Kegiatan");
  return event;
}

function assertVisible(auth: AuthContext, event: Event): void {
  if (isVillageWide(auth)) return;
  if (event.region === Region.Village || event.region === auth.region) return;
  throw forbidden("Anda tidak memiliki akses ke kegiatan ini");
}

export async function createEvent(
  input: CreateEventInput,
  auth: AuthContext,
): Promise<EventDto> {
  assertCanManage(auth, input.region);

  const event = await prisma.event.create({
    data: {
      title: input.title,
      date: input.date,
      startTime: input.start_time,
      endTime: input.end_time,
      place: input.place,
      description: input.description,
      region: input.region,
    },
  });

  await recordAudit({
    actorId: auth.id,
    action: AuditAction.CREATE,
    entity: "events",
    entityId: event.id,
    after: event,
  });

  return toEventDto(event);
}

export async function updateEvent(
  id: string,
  input: UpdateEventInput,
  auth: AuthContext,
): Promise<EventDto> {
  const existing = await loadEvent(id);
  assertCanManage(auth, existing.region);
  assertCanManage(auth, input.region);

  const event = await prisma.event.update({
    where: { id },
    data: {
      title: input.title,
      date: input.date,
      startTime: input.start_time,
      endTime: input.end_time,
      place: input.place,
      description: input.description,
      region: input.region,
    },
  });

  await recordAudit({
    actorId: auth.id,
    action: AuditAction.UPDATE,
    entity: "events",
    entityId: id,
    before: existing,
    after: event,
  });

  return toEventDto(event);
}

export async function deleteEvent(
  id: string,
  auth: AuthContext,
): Promise<EventDto> {
  const existing = await loadEvent(id);
  assertCanManage(auth, existing.region);

  await prisma.event.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await recordAudit({
    actorId: auth.id,
    action: AuditAction.DELETE,
    entity: "events",
    entityId: id,
    before: existing,
  });

  return toEventDto(existing);
}

export async function getEventById(
  id: string,
  auth: AuthContext,
): Promise<EventDto> {
  const event = await loadEvent(id);
  assertVisible(auth, event);
  return toEventDto(event);
}

export async function listEvents(
  query: EventFilterInput,
  auth: AuthContext,
): Promise<EventDto[]> {
  const events = await prisma.event.findMany({
    where: { ...ACTIVE, ...visibilityFilter(auth) },
    orderBy: { date: "asc" },
    ...toListParams(query.page, query.size),
  });

  return events.map(toEventDto);
}

export async function listEventsByRegion(
  region: Region,
  auth: AuthContext,
): Promise<EventDto[]> {
  if (!isVillageWide(auth) && region !== auth.region) {
    throw forbidden("Anda tidak memiliki akses ke wilayah ini");
  }

  const events = await prisma.event.findMany({
    where: { ...ACTIVE, region: { in: [region, Region.Village] } },
    orderBy: { date: "asc" },
  });

  return events.map(toEventDto);
}

export async function listIncomingEvents(
  from: Date,
  auth: AuthContext,
): Promise<EventDto[]> {
  const events = await prisma.event.findMany({
    where: { ...ACTIVE, ...visibilityFilter(auth), date: { gte: from } },
    orderBy: { date: "asc" },
  });

  return events.map(toEventDto);
}

export async function listEventsOnDate(
  date: Date,
  auth: AuthContext,
): Promise<EventDto[]> {
  const events = await prisma.event.findMany({
    where: { ...ACTIVE, ...visibilityFilter(auth), date },
    orderBy: { startTime: "asc" },
  });

  return events.map(toEventDto);
}
