import {
  AuditAction,
  ChildStatus,
  Prisma,
  Role,
  WeightGainStatus,
  type Children,
  type Region,
} from "@prisma/client";
import { conflict, forbidden, notFound } from "../../core/errors.js";
import { toListParams } from "../../core/http.js";
import { prisma } from "../../core/prisma.js";
import { toChildDto, type ChildDto } from "../../core/serialize.js";
import { assessMeasurement } from "../../domain/assessment.js";
import { toPeriod } from "../../domain/weight-gain.js";
import type { AuthContext } from "../../middlewares/auth.middleware.js";
import { assertChildAccess, regionFilter } from "../access.js";
import { recordAudit, recordAuditTx } from "../audit/audit.service.js";
import type {
  ChildSearchInput,
  CreateChildInput,
  UpdateChildInput,
} from "./children.schema.js";

const BIRTH_RECORD_NOTE = "Pengukuran Saat Bayi Lahir";

async function findChildOrFail(id: string): Promise<Children> {
  const child = await prisma.children.findUnique({ where: { id } });
  if (!child) throw notFound("Balita");
  return child;
}

async function resolveParentId(
  requestedParentId: string,
  auth: AuthContext,
): Promise<string> {
  if (auth.role === Role.Parent) {
    if (requestedParentId !== auth.id) {
      throw forbidden("Anda hanya dapat mendaftarkan anak Anda sendiri");
    }
    return auth.id;
  }

  const parent = await prisma.user.findUnique({
    where: { id: requestedParentId },
    select: { id: true, role: true },
  });

  if (!parent || parent.role !== Role.Parent) {
    throw notFound("Orang tua");
  }

  return parent.id;
}

function buildBirthGrowth(params: {
  dateOfBirth: Date;
  gender: "M" | "F";
  weight: number;
  height: number;
  headCircum: number;
}): Omit<Prisma.GrowthUncheckedCreateInput, "childId"> {
  const assessment = assessMeasurement({
    dateOfBirth: params.dateOfBirth,
    measuredAt: params.dateOfBirth,
    sex: params.gender,
    weight: params.weight,
    height: params.height,
    headCircum: params.headCircum,
    armCircum: 0,
    previous: null,
  });

  return {
    date: params.dateOfBirth,
    period: assessment.period,
    ageInMonth: 0,
    weight: params.weight,
    height: params.height,
    headCircum: params.headCircum,
    armCircum: 0,
    wfaZScore: assessment.wfaZScore,
    hfaZScore: assessment.hfaZScore,
    wfhZScore: assessment.wfhZScore,
    headCircumZScore: assessment.headCircumZScore,
    wfaStatus: assessment.wfaStatus,
    hfaStatus: assessment.hfaStatus,
    wfhStatus: assessment.wfhStatus,
    muacStatus: assessment.muacStatus,
    headCircumStatus: assessment.headCircumStatus,
    weightGain: null,
    gainStatus: WeightGainStatus.FIRST_WEIGHIN,
    consecutiveNoGain: 0,
    isFlagged: assessment.isFlagged,
    flagReason: assessment.flagReason,
    note: BIRTH_RECORD_NOTE,
  };
}

export async function createChild(
  input: CreateChildInput,
  auth: AuthContext,
): Promise<ChildDto> {
  const parentId = await resolveParentId(input.parents_id, auth);

  const child = await prisma
    .$transaction(async (tx) => {
      const created = await tx.children.create({
        data: {
          parentId,
          nik: input.nik ?? null,
          fullName: input.full_name,
          gender: input.gender,
          placeOfBirth: input.place_of_birth,
          dateOfBirth: input.date_of_birth,
          father: input.father || null,
          mother: input.mother || null,
          orderOfChild: input.order_of_child,
          region: input.region,
          birthWeight: input.birth_weight,
          birthHeight: input.birth_height,
          birthHeadCircum: input.birth_head_circum,
        },
      });

      await tx.growth.create({
        data: {
          childId: created.id,
          ...buildBirthGrowth({
            dateOfBirth: created.dateOfBirth,
            gender: created.gender,
            weight: created.birthWeight,
            height: created.birthHeight,
            headCircum: created.birthHeadCircum,
          }),
        },
      });

      await recordAuditTx(tx, {
        actorId: auth.id,
        action: AuditAction.CREATE,
        entity: "children",
        entityId: created.id,
        after: created,
      });

      return created;
    })
    .catch(translateChildConflict);

  return toChildDto(child);
}

function translateChildConflict(error: unknown): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    const target = String(error.meta?.["target"] ?? "");

    if (target.includes("order")) {
      throw conflict(
        "Urutan kelahiran tersebut sudah dipakai oleh anak lain dari orang tua yang sama",
      );
    }
    if (target.includes("nik")) {
      throw conflict("NIK tersebut sudah terdaftar pada balita lain");
    }
  }

  throw error;
}

export async function updateChild(
  id: string,
  input: UpdateChildInput,
  auth: AuthContext,
): Promise<ChildDto> {
  const existing = await findChildOrFail(id);
  assertChildAccess(auth, existing);

  if (auth.role === Role.Parent) {
    throw forbidden("Perubahan data balita dilakukan oleh kader posyandu");
  }

  const parentId = await resolveParentId(input.parents_id, auth);

  const child = await prisma
    .$transaction(async (tx) => {
      const updated = await tx.children.update({
        where: { id },
        data: {
          parentId,
          nik: input.nik ?? existing.nik,
          fullName: input.full_name,
          gender: input.gender,
          placeOfBirth: input.place_of_birth,
          dateOfBirth: input.date_of_birth,
          father: input.father || null,
          mother: input.mother || null,
          orderOfChild: input.order_of_child,
          region: input.region,
          birthWeight: input.birth_weight,
          birthHeight: input.birth_height,
          birthHeadCircum: input.birth_head_circum,
          ...(input.status ? { status: input.status } : {}),
        },
      });

      const birthRecord = await tx.growth.findFirst({
        where: { childId: id, deletedAt: null },
        orderBy: { date: "asc" },
        select: { id: true },
      });

      if (birthRecord) {
        await tx.growth.update({
          where: { id: birthRecord.id },
          data: buildBirthGrowth({
            dateOfBirth: updated.dateOfBirth,
            gender: updated.gender,
            weight: updated.birthWeight,
            height: updated.birthHeight,
            headCircum: updated.birthHeadCircum,
          }),
        });
      }

      await recordAuditTx(tx, {
        actorId: auth.id,
        action: AuditAction.UPDATE,
        entity: "children",
        entityId: id,
        before: existing,
        after: updated,
      });

      return updated;
    })
    .catch(translateChildConflict);

  return toChildDto(child);
}

export async function getChildById(
  id: string,
  auth: AuthContext,
): Promise<ChildDto> {
  const child = await findChildOrFail(id);
  assertChildAccess(auth, child);
  return toChildDto(child);
}

function statusFilter(includeInactive: boolean): { status?: ChildStatus } {
  return includeInactive ? {} : { status: ChildStatus.ACTIVE };
}

function nameFilter(name: string | undefined): Prisma.ChildrenWhereInput {
  if (!name) return {};
  return { fullName: { contains: name, mode: "insensitive" } };
}

export async function listChildren(
  query: ChildSearchInput,
  auth: AuthContext,
): Promise<ChildDto[]> {
  if (auth.role === Role.Parent) {
    return listChildrenByParent(auth.id, auth);
  }

  const children = await prisma.children.findMany({
    where: {
      ...regionFilter(auth),
      ...statusFilter(query.includeInactive),
      ...nameFilter(query.name),
    },
    orderBy: { fullName: "asc" },
    ...toListParams(query.page, query.size),
  });

  return children.map(toChildDto);
}

export async function listChildrenByParent(
  parentId: string,
  auth: AuthContext,
): Promise<ChildDto[]> {
  if (auth.role === Role.Parent && parentId !== auth.id) {
    throw forbidden("Anda hanya dapat melihat data anak Anda sendiri");
  }

  const children = await prisma.children.findMany({
    where: { parentId },
    orderBy: { orderOfChild: "asc" },
  });

  if (auth.role === Role.Officer) {
    for (const child of children) assertChildAccess(auth, child);
  }

  return children.map(toChildDto);
}

export async function listChildrenByRegion(
  region: Region,
  query: ChildSearchInput,
  auth: AuthContext,
): Promise<ChildDto[]> {
  if (auth.role === Role.Parent) {
    throw forbidden("Anda tidak memiliki akses ke daftar balita per wilayah");
  }

  const children = await prisma.children.findMany({
    where: {
      region,
      ...statusFilter(query.includeInactive),
      ...nameFilter(query.name),

      ...regionFilter(auth),
    },
    orderBy: { fullName: "asc" },
    ...toListParams(query.page, query.size),
  });

  return children.map(toChildDto);
}

export async function graduateOverAgeChildren(
  auth: AuthContext,
): Promise<number> {
  const cutoff = new Date();
  cutoff.setUTCMonth(cutoff.getUTCMonth() - 60);

  const overAge = await prisma.children.findMany({
    where: { status: ChildStatus.ACTIVE, dateOfBirth: { lt: cutoff } },
    select: { id: true },
  });

  if (overAge.length === 0) return 0;

  await prisma.children.updateMany({
    where: { id: { in: overAge.map((child) => child.id) } },
    data: { status: ChildStatus.GRADUATED },
  });

  await recordAudit({
    actorId: auth.id,
    action: AuditAction.UPDATE,
    entity: "children",
    entityId: "batch",
    after: { graduated: overAge.length },
  });

  return overAge.length;
}
