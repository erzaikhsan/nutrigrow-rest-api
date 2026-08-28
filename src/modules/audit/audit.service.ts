import type { AuditAction, Prisma } from "@prisma/client";
import { prisma } from "../../core/prisma.js";
import { logger } from "../../core/logger.js";

export interface AuditEntry {
  actorId: string | null;
  action: AuditAction;
  entity: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
}

export async function recordAudit(entry: AuditEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: entry.actorId,
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId,
        before: (entry.before ?? null) as Prisma.InputJsonValue,
        after: (entry.after ?? null) as Prisma.InputJsonValue,
      },
    });
  } catch (error) {
    logger.warn(
      { err: error, entity: entry.entity, entityId: entry.entityId },
      "Gagal menulis jejak audit",
    );
  }
}

export async function recordAuditTx(
  tx: Prisma.TransactionClient,
  entry: AuditEntry,
): Promise<void> {
  await tx.auditLog.create({
    data: {
      actorId: entry.actorId,
      action: entry.action,
      entity: entry.entity,
      entityId: entry.entityId,
      before: (entry.before ?? null) as Prisma.InputJsonValue,
      after: (entry.after ?? null) as Prisma.InputJsonValue,
    },
  });
}
