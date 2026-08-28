import {
  AuditAction,
  Prisma,
  type Children,
  type Growth,
} from "@prisma/client";
import { badRequest, conflict, notFound } from "../../core/errors.js";
import { toListParams } from "../../core/http.js";
import { prisma } from "../../core/prisma.js";
import { toGrowthDto, type GrowthDto } from "../../core/serialize.js";
import { assessMeasurement } from "../../domain/assessment.js";
import { toPeriod, type PreviousWeighIn } from "../../domain/weight-gain.js";
import type { AuthContext } from "../../middlewares/auth.middleware.js";
import { assertCanRecord, assertChildAccess, regionFilter } from "../access.js";
import { recordAuditTx } from "../audit/audit.service.js";
import type { CreateGrowthInput, UpdateGrowthInput } from "./growth.schema.js";

const ACTIVE = { deletedAt: null } as const;

async function findChildOrFail(childId: string): Promise<Children> {
  const child = await prisma.children.findUnique({ where: { id: childId } });
  if (!child) throw notFound("Balita");
  return child;
}

async function loadGrowthWithChild(
  id: string,
): Promise<Growth & { child: Children }> {
  const growth = await prisma.growth.findFirst({
    where: { id, ...ACTIVE },
    include: { child: true },
  });
  if (!growth) throw notFound("Data penimbangan");
  return growth;
}

function assertMeasurableDate(child: Children, date: Date): void {
  if (date.getTime() < child.dateOfBirth.getTime()) {
    throw badRequest(
      "Tanggal pengukuran tidak boleh mendahului tanggal lahir balita",
    );
  }
}

function toPrevious(record: Growth | null): PreviousWeighIn | null {
  if (!record?.period) return null;
  return {
    weight: record.weight,
    period: record.period,
    consecutiveNoGain: record.consecutiveNoGain,
  };
}

async function recomputeChain(
  tx: Prisma.TransactionClient,
  child: Children,
  fromDate: Date,
): Promise<void> {
  const seed = await tx.growth.findFirst({
    where: { childId: child.id, ...ACTIVE, date: { lt: fromDate } },
    orderBy: { date: "desc" },
  });

  const following = await tx.growth.findMany({
    where: { childId: child.id, ...ACTIVE, date: { gte: fromDate } },
    orderBy: { date: "asc" },
  });

  let previous = toPrevious(seed);

  for (const record of following) {
    const assessment = assessMeasurement({
      dateOfBirth: child.dateOfBirth,
      measuredAt: record.date,
      sex: child.gender,
      weight: record.weight,
      height: record.height,
      headCircum: record.headCircum,
      armCircum: record.armCircum,
      previous,
    });

    await tx.growth.update({
      where: { id: record.id },
      data: {
        period: assessment.period,
        ageInMonth: assessment.ageInMonth,
        wfaZScore: assessment.wfaZScore,
        hfaZScore: assessment.hfaZScore,
        wfhZScore: assessment.wfhZScore,
        headCircumZScore: assessment.headCircumZScore,
        wfaStatus: assessment.wfaStatus,
        hfaStatus: assessment.hfaStatus,
        wfhStatus: assessment.wfhStatus,
        muacStatus: assessment.muacStatus,
        headCircumStatus: assessment.headCircumStatus,
        weightGain: assessment.weightGain,
        gainStatus: assessment.gainStatus,
        consecutiveNoGain: assessment.consecutiveNoGain,
        isFlagged: assessment.isFlagged,
        flagReason: assessment.flagReason,
      },
    });

    previous = {
      weight: record.weight,
      period: assessment.period,
      consecutiveNoGain: assessment.consecutiveNoGain,
    };
  }
}

function translatePeriodConflict(error: unknown): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    throw conflict("Balita ini sudah memiliki penimbangan pada bulan tersebut");
  }
  throw error;
}

export async function createGrowth(
  input: CreateGrowthInput,
  auth: AuthContext,
): Promise<GrowthDto> {
  assertCanRecord(auth);

  const child = await findChildOrFail(input.children_id);
  assertChildAccess(auth, child);
  assertMeasurableDate(child, input.date);

  const growth = await prisma
    .$transaction(async (tx) => {
      const previous = toPrevious(
        await tx.growth.findFirst({
          where: { childId: child.id, ...ACTIVE, date: { lt: input.date } },
          orderBy: { date: "desc" },
        }),
      );

      const assessment = assessMeasurement({
        dateOfBirth: child.dateOfBirth,
        measuredAt: input.date,
        sex: child.gender,
        weight: input.weight,
        height: input.height,
        headCircum: input.head_circum,
        armCircum: input.arm_circum,
        previous,
      });

      const created = await tx.growth.create({
        data: {
          childId: child.id,
          date: input.date,
          period: assessment.period,
          ageInMonth: assessment.ageInMonth,
          weight: input.weight,
          height: input.height,
          headCircum: input.head_circum,
          armCircum: input.arm_circum,
          wfaZScore: assessment.wfaZScore,
          hfaZScore: assessment.hfaZScore,
          wfhZScore: assessment.wfhZScore,
          headCircumZScore: assessment.headCircumZScore,
          wfaStatus: assessment.wfaStatus,
          hfaStatus: assessment.hfaStatus,
          wfhStatus: assessment.wfhStatus,
          muacStatus: assessment.muacStatus,
          headCircumStatus: assessment.headCircumStatus,
          weightGain: assessment.weightGain,
          gainStatus: assessment.gainStatus,
          consecutiveNoGain: assessment.consecutiveNoGain,
          isFlagged: assessment.isFlagged,
          flagReason: assessment.flagReason,
          note: input.note || null,
          measuredById: auth.id,
        },
      });

      await recomputeChain(tx, child, input.date);

      await recordAuditTx(tx, {
        actorId: auth.id,
        action: AuditAction.CREATE,
        entity: "growth",
        entityId: created.id,
        after: created,
      });

      return tx.growth.findUniqueOrThrow({ where: { id: created.id } });
    })
    .catch(translatePeriodConflict);

  return toGrowthDto(growth);
}

export async function updateGrowth(
  id: string,
  input: UpdateGrowthInput,
  auth: AuthContext,
): Promise<GrowthDto> {
  assertCanRecord(auth);

  const existing = await loadGrowthWithChild(id);
  assertChildAccess(auth, existing.child);

  const child = existing.child;
  assertMeasurableDate(child, input.date);

  const growth = await prisma
    .$transaction(async (tx) => {
      await tx.growth.update({
        where: { id },
        data: {
          date: input.date,
          period: toPeriod(input.date),
          weight: input.weight,
          height: input.height,
          headCircum: input.head_circum,
          armCircum: input.arm_circum,
          note: input.note || null,
        },
      });

      const from =
        input.date.getTime() < existing.date.getTime()
          ? input.date
          : existing.date;

      await recomputeChain(tx, child, from);

      const updated = await tx.growth.findUniqueOrThrow({ where: { id } });

      await recordAuditTx(tx, {
        actorId: auth.id,
        action: AuditAction.UPDATE,
        entity: "growth",
        entityId: id,
        before: existing,
        after: updated,
      });

      return updated;
    })
    .catch(translatePeriodConflict);

  return toGrowthDto(growth);
}

export async function deleteGrowth(
  id: string,
  auth: AuthContext,
): Promise<GrowthDto> {
  assertCanRecord(auth);

  const existing = await loadGrowthWithChild(id);
  assertChildAccess(auth, existing.child);

  await prisma.$transaction(async (tx) => {
    await tx.growth.update({
      where: { id },
      data: { deletedAt: new Date(), period: null },
    });

    await recomputeChain(tx, existing.child, existing.date);

    await recordAuditTx(tx, {
      actorId: auth.id,
      action: AuditAction.DELETE,
      entity: "growth",
      entityId: id,
      before: existing,
    });
  });

  return toGrowthDto(existing);
}

export async function getGrowthById(
  id: string,
  auth: AuthContext,
): Promise<GrowthDto> {
  const growth = await loadGrowthWithChild(id);
  assertChildAccess(auth, growth.child);
  return toGrowthDto(growth);
}

async function assertChildReadable(
  childId: string,
  auth: AuthContext,
): Promise<Children> {
  const child = await findChildOrFail(childId);
  assertChildAccess(auth, child);
  return child;
}

export async function listGrowthByChild(
  childId: string,
  auth: AuthContext,
): Promise<GrowthDto[]> {
  await assertChildReadable(childId, auth);

  const records = await prisma.growth.findMany({
    where: { childId, ...ACTIVE },
    orderBy: { date: "desc" },
  });

  return records.map(toGrowthDto);
}

export async function listGrowthByChildInYear(
  childId: string,
  year: number,
  auth: AuthContext,
): Promise<GrowthDto[]> {
  await assertChildReadable(childId, auth);

  const records = await prisma.growth.findMany({
    where: {
      childId,
      ...ACTIVE,

      date: {
        gte: new Date(Date.UTC(year, 0, 1)),
        lt: new Date(Date.UTC(year + 1, 0, 1)),
      },
    },
    orderBy: { date: "asc" },
  });

  return records.map(toGrowthDto);
}

export async function listGrowthByChildAndMonth(
  childId: string,
  date: Date,
  auth: AuthContext,
): Promise<GrowthDto[]> {
  await assertChildReadable(childId, auth);

  const records = await prisma.growth.findMany({
    where: { childId, ...ACTIVE, period: toPeriod(date) },
    orderBy: { date: "asc" },
  });

  return records.map(toGrowthDto);
}

export async function getLastGrowthByChild(
  childId: string,
  auth: AuthContext,
): Promise<GrowthDto | null> {
  await assertChildReadable(childId, auth);

  const record = await prisma.growth.findFirst({
    where: { childId, ...ACTIVE },
    orderBy: { date: "desc" },
  });

  return record ? toGrowthDto(record) : null;
}

export async function listGrowth(
  query: { page?: number; size?: number },
  auth: AuthContext,
): Promise<GrowthDto[]> {
  const scope = regionFilter(auth);

  const records = await prisma.growth.findMany({
    where: {
      ...ACTIVE,
      child:
        auth.role === "Parent"
          ? { parentId: auth.id }
          : Object.keys(scope).length > 0
            ? scope
            : undefined,
    },
    orderBy: { date: "desc" },
    ...toListParams(query.page, query.size),
  });

  return records.map(toGrowthDto);
}

export async function listGrowthByMonth(
  date: Date,
  auth: AuthContext,
): Promise<GrowthDto[]> {
  const scope = regionFilter(auth);

  const records = await prisma.growth.findMany({
    where: {
      ...ACTIVE,
      period: toPeriod(date),
      child:
        auth.role === "Parent"
          ? { parentId: auth.id }
          : Object.keys(scope).length > 0
            ? scope
            : undefined,
    },
    orderBy: { date: "desc" },
  });

  return records.map(toGrowthDto);
}
