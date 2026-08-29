import { AuditAction, Prisma, Role, type Region } from "@prisma/client";
import { conflict, forbidden, notFound } from "../../core/errors.js";
import { toListParams } from "../../core/http.js";
import { prisma } from "../../core/prisma.js";
import { toUserDto, type UserDto } from "../../core/serialize.js";
import type { AuthContext } from "../../middlewares/auth.middleware.js";
import { assertRegionAccess, isVillageWide, regionFilter } from "../access.js";
import { recordAudit } from "../audit/audit.service.js";
import type { UpdateProfileInput, UserSearchInput } from "./user.schema.js";

async function findUserOrFail(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw notFound("Pengguna");
  return user;
}

function assertCanViewUser(
  auth: AuthContext,
  target: { id: string; role: Role; region: Region },
): void {
  if (auth.id === target.id) return;
  if (auth.role === Role.Admin) return;

  if (auth.role === Role.Officer) {
    if (target.role === Role.Parent && !isVillageWide(auth)) {
      assertRegionAccess(auth, target.region);
    }
    return;
  }

  throw forbidden("Anda tidak memiliki akses ke data pengguna ini");
}

export async function getUserById(
  id: string,
  auth: AuthContext,
): Promise<UserDto> {
  const user = await findUserOrFail(id);
  assertCanViewUser(auth, user);
  return toUserDto(user);
}

export async function updateOwnProfile(
  input: UpdateProfileInput,
  auth: AuthContext,
): Promise<UserDto> {
  const existing = await findUserOrFail(auth.id);

  const updated = await prisma.user.update({
    where: { id: auth.id },
    data: {
      fullName: input.full_name,
      gender: input.gender,
      dateOfBirth: input.date_of_birth,
      phoneNumber: input.phone_number,
      address: input.address || null,
      region: input.region,
    },
  });

  await recordAudit({
    actorId: auth.id,
    action: AuditAction.UPDATE,
    entity: "users",
    entityId: auth.id,
    before: { ...existing, password: undefined },
    after: { ...updated, password: undefined },
  });

  return toUserDto(updated);
}

function nameFilter(name: string | undefined): Prisma.UserWhereInput {
  if (!name) return {};
  return { fullName: { contains: name, mode: "insensitive" } };
}

async function listByRole(
  role: Role,
  query: UserSearchInput,
  auth: AuthContext,
  region?: Region,
): Promise<UserDto[]> {
  if (auth.role === Role.Parent) {
    throw forbidden("Anda tidak memiliki akses ke daftar pengguna");
  }

  if (region) assertRegionAccess(auth, region);

  const users = await prisma.user.findMany({
    where: {
      role,
      ...nameFilter(query.name),
      ...(region ? { region } : {}),

      ...(role === Role.Parent ? regionFilter(auth) : {}),
    },
    orderBy: { fullName: "asc" },
    ...toListParams(query.page, query.size),
  });

  return users.map(toUserDto);
}

export const listParents = (
  query: UserSearchInput,
  auth: AuthContext,
  region?: Region,
): Promise<UserDto[]> => listByRole(Role.Parent, query, auth, region);

export const listOfficers = (
  query: UserSearchInput,
  auth: AuthContext,
  region?: Region,
): Promise<UserDto[]> => listByRole(Role.Officer, query, auth, region);

export async function deleteUser(
  id: string,
  auth: AuthContext,
): Promise<UserDto> {
  if (auth.role !== Role.Admin) {
    throw forbidden("Hanya admin yang dapat menghapus akun");
  }
  if (id === auth.id) {
    throw forbidden("Anda tidak dapat menghapus akun sendiri");
  }

  const user = await findUserOrFail(id);

  const childCount = await prisma.children.count({ where: { parentId: id } });
  if (childCount > 0) {
    throw conflict(
      "Akun masih memiliki data balita. Nonaktifkan akun alih-alih menghapusnya.",
    );
  }

  await prisma.user.delete({ where: { id } });

  await recordAudit({
    actorId: auth.id,
    action: AuditAction.DELETE,
    entity: "users",
    entityId: id,
    before: { ...user, password: undefined },
  });

  return toUserDto(user);
}
