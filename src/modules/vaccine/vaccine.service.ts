import { AuditAction, type Children, type Vaccine } from "@prisma/client";
import { badRequest, conflict, notFound } from "../../core/errors.js";
import { prisma } from "../../core/prisma.js";
import { toVaccineDto, type VaccineDto } from "../../core/serialize.js";
import type { AuthContext } from "../../middlewares/auth.middleware.js";
import { assertCanRecord, assertChildAccess } from "../access.js";
import { recordAudit } from "../audit/audit.service.js";
import type {
  CreateVaccineInput,
  UpdateVaccineInput,
} from "./vaccine.schema.js";

const ACTIVE = { deletedAt: null } as const;

async function loadChild(childId: string): Promise<Children> {
  const child = await prisma.children.findUnique({ where: { id: childId } });
  if (!child) throw notFound("Balita");
  return child;
}

async function loadVaccine(
  id: string,
): Promise<Vaccine & { child: Children }> {
  const vaccine = await prisma.vaccine.findFirst({
    where: { id, ...ACTIVE },
    include: { child: true },
  });
  if (!vaccine) throw notFound("Data imunisasi");
  return vaccine;
}

function assertVaccinationDate(child: Children, date: Date): void {
  if (date.getTime() < child.dateOfBirth.getTime()) {
    throw badRequest(
      "Tanggal imunisasi tidak boleh mendahului tanggal lahir balita",
    );
  }
}

async function assertNotDuplicate(
  childId: string,
  vaccineName: string,
  excludeId?: string,
): Promise<void> {
  const existing = await prisma.vaccine.findFirst({
    where: {
      childId,
      ...ACTIVE,
      vaccineName: { equals: vaccineName, mode: "insensitive" },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true },
  });

  if (existing) {
    throw conflict(`Imunisasi ${vaccineName} sudah tercatat untuk balita ini`);
  }
}

export async function createVaccine(
  input: CreateVaccineInput,
  auth: AuthContext,
): Promise<VaccineDto> {
  assertCanRecord(auth);

  const child = await loadChild(input.children_id);
  assertChildAccess(auth, child);
  assertVaccinationDate(child, input.date);
  await assertNotDuplicate(child.id, input.vaccine_name);

  const vaccine = await prisma.vaccine.create({
    data: {
      childId: child.id,
      date: input.date,
      vaccineName: input.vaccine_name,
      place: input.place,
    },
  });

  await recordAudit({
    actorId: auth.id,
    action: AuditAction.CREATE,
    entity: "vaccines",
    entityId: vaccine.id,
    after: vaccine,
  });

  return toVaccineDto(vaccine);
}

export async function updateVaccine(
  id: string,
  input: UpdateVaccineInput,
  auth: AuthContext,
): Promise<VaccineDto> {
  assertCanRecord(auth);

  const existing = await loadVaccine(id);
  assertChildAccess(auth, existing.child);
  assertVaccinationDate(existing.child, input.date);
  await assertNotDuplicate(existing.childId, input.vaccine_name, id);

  const vaccine = await prisma.vaccine.update({
    where: { id },
    data: {
      date: input.date,
      vaccineName: input.vaccine_name,
      place: input.place,
    },
  });

  await recordAudit({
    actorId: auth.id,
    action: AuditAction.UPDATE,
    entity: "vaccines",
    entityId: id,
    before: existing,
    after: vaccine,
  });

  return toVaccineDto(vaccine);
}

export async function deleteVaccine(
  id: string,
  auth: AuthContext,
): Promise<VaccineDto> {
  assertCanRecord(auth);

  const existing = await loadVaccine(id);
  assertChildAccess(auth, existing.child);

  await prisma.vaccine.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await recordAudit({
    actorId: auth.id,
    action: AuditAction.DELETE,
    entity: "vaccines",
    entityId: id,
    before: existing,
  });

  return toVaccineDto(existing);
}

export async function getVaccineById(
  id: string,
  auth: AuthContext,
): Promise<VaccineDto> {
  const vaccine = await loadVaccine(id);
  assertChildAccess(auth, vaccine.child);
  return toVaccineDto(vaccine);
}

export async function listVaccineByChild(
  childId: string,
  auth: AuthContext,
): Promise<VaccineDto[]> {
  const child = await loadChild(childId);
  assertChildAccess(auth, child);

  const records = await prisma.vaccine.findMany({
    where: { childId, ...ACTIVE },
    orderBy: { date: "asc" },
  });

  return records.map(toVaccineDto);
}
