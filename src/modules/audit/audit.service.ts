import type { AuditAction, Prisma } from "@prisma/client";
import { prisma } from "../../core/prisma.js";
import { logger } from "../../core/logger.js";

/**
 * Jejak audit.
 *
 * Data kesehatan anak yang bisa diubah dan dihapus tanpa meninggalkan jejak
 * tidak bisa dipertanggungjawabkan -- tidak ada cara menjawab "siapa yang
 * mengubah berat badan ini, dan berapa nilainya sebelum diubah".
 *
 * Pencatatan sengaja tidak boleh menggagalkan operasi utamanya: kegagalan
 * menulis jejak dicatat sebagai peringatan, bukan dilempar. Kehilangan satu
 * baris audit lebih ringan daripada menggagalkan penimbangan yang sudah
 * terlanjur tersimpan.
 */

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

/**
 * Varian yang ikut dalam transaksi pemanggil. Dipakai bila jejak harus batal
 * bersama operasinya, misalnya penghapusan data.
 */
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
