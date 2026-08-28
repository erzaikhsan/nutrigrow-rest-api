import { Region, Role } from "@prisma/client";
import { forbidden } from "../core/errors.js";
import type { AuthContext } from "../middlewares/auth.middleware.js";

/**
 * Aturan siapa boleh melihat data siapa.
 *
 * Versi lama tidak punya lapisan ini sama sekali. Setiap akun yang berhasil
 * masuk bisa membaca seluruh data balita sedesa, mengubah data anak orang
 * lain, dan mengunduh laporan lengkap. Untuk data kesehatan anak, itu bukan
 * kelalaian kecil.
 *
 * Ringkasan aturan:
 *   Admin   - seluruh wilayah
 *   Officer - wilayahnya sendiri; kader berwilayah "Village" bertugas
 *             tingkat desa sehingga meliputi semua RW
 *   Parent  - hanya dirinya sendiri dan anak-anaknya
 */

export function isVillageWide(auth: AuthContext): boolean {
  return auth.role === Role.Admin || auth.region === Region.Village;
}

export function canAccessRegion(auth: AuthContext, region: Region): boolean {
  if (auth.role === Role.Admin) return true;
  if (auth.role === Role.Officer) {
    return isVillageWide(auth) || auth.region === region;
  }
  return auth.region === region;
}

export function assertRegionAccess(auth: AuthContext, region: Region): void {
  if (!canAccessRegion(auth, region)) {
    throw forbidden("Anda tidak memiliki akses ke wilayah ini");
  }
}

export interface ChildOwnership {
  parentId: string;
  region: Region;
}

export function canAccessChild(
  auth: AuthContext,
  child: ChildOwnership,
): boolean {
  if (auth.role === Role.Admin) return true;
  if (auth.role === Role.Officer) return canAccessRegion(auth, child.region);
  return child.parentId === auth.id;
}

export function assertChildAccess(
  auth: AuthContext,
  child: ChildOwnership,
): void {
  if (!canAccessChild(auth, child)) {
    throw forbidden("Anda tidak memiliki akses ke data balita ini");
  }
}

/** Hanya kader dan admin yang mencatat data pengukuran. */
export function assertCanRecord(auth: AuthContext): void {
  if (auth.role !== Role.Officer && auth.role !== Role.Admin) {
    throw forbidden("Hanya kader dan admin yang dapat mencatat data ini");
  }
}

/**
 * Menyusun penyaring wilayah untuk kueri daftar, sehingga pembatasan terjadi
 * di basis data dan bukan dengan menyaring hasil setelah semua baris terambil.
 */
export function regionFilter(auth: AuthContext): { region?: Region } {
  if (isVillageWide(auth)) return {};
  return { region: auth.region };
}
