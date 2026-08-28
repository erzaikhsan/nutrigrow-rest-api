import { PrismaClient, WeightGainStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { parseLegacyDate } from "../../src/core/serialize.js";
import { assessMeasurement } from "../../src/domain/assessment.js";
import type { PreviousWeighIn } from "../../src/domain/weight-gain.js";
import { children } from "./data/children.data.js";
import { events } from "./data/event.data.js";
import { growths } from "./data/growth.data.js";
import { users } from "./data/users.data.js";
import { vaccines } from "./data/vaccine.data.js";

/**
 * Penyemaian basis data dengan data penelitian Desa Jipang.
 *
 * Perbedaan mendasar dari seeder lama: status gizi tidak lagi ditulis apa
 * adanya dari berkas data, melainkan dihitung melalui pipeline penilaian yang
 * sama dengan yang dipakai saat kader mencatat penimbangan. Dengan begitu isi
 * basis data hasil semai konsisten dengan aturan yang berlaku sekarang -- dan
 * sekaligus menjadi uji asap bahwa pipeline itu benar-benar berjalan.
 */

const prisma = new PrismaClient();

/** Memetakan penanda lama seperti "P1" dan "C3" ke UUID yang sebenarnya. */
const idMap = new Map<string, string>();

function resolveId(legacyId: string): string {
  const existing = idMap.get(legacyId);
  if (existing) return existing;

  const id = randomUUID();
  idMap.set(legacyId, id);
  return id;
}

function mustParseDate(value: string, context: string): Date {
  const parsed = parseLegacyDate(value);
  if (!parsed) {
    throw new Error(`Tanggal tidak dapat diurai pada ${context}: "${value}"`);
  }
  return parsed;
}

async function clearDatabase(): Promise<void> {
  // Urutan mengikuti ketergantungan kunci asing.
  await prisma.auditLog.deleteMany();
  await prisma.passwordReset.deleteMany();
  await prisma.otpRequest.deleteMany();
  await prisma.growth.deleteMany();
  await prisma.vaccine.deleteMany();
  await prisma.children.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();
}

async function seedUsers(): Promise<void> {
  // Seluruh data semai memakai kata sandi yang sama, sehingga cukup di-hash
  // sekali alih-alih sekali per pengguna.
  const passwordCache = new Map<string, string>();

  for (const user of users) {
    let hashed = passwordCache.get(user.password);
    if (!hashed) {
      hashed = await bcrypt.hash(user.password, 10);
      passwordCache.set(user.password, hashed);
    }

    await prisma.user.create({
      data: {
        id: resolveId(user.legacyId),
        email: user.email,
        password: hashed,
        role: user.role,
        isActive: user.isActive,
        fullName: user.fullName,
        gender: user.gender,
        dateOfBirth: mustParseDate(user.dateOfBirth, `pengguna ${user.email}`),
        phoneNumber: user.phoneNumber,
        address: user.address,
        region: user.region,
        activePeriod: user.activePeriod,
      },
    });
  }

  console.log(`  ${users.length} pengguna`);
}

async function seedChildren(): Promise<void> {
  for (const child of children) {
    await prisma.children.create({
      data: {
        id: resolveId(child.legacyId),
        parentId: resolveId(child.legacyParentId),
        fullName: child.fullName,
        gender: child.gender,
        placeOfBirth: child.placeOfBirth,
        dateOfBirth: mustParseDate(child.dateOfBirth, `balita ${child.fullName}`),
        // Data lama menuliskan "-" untuk ayah yang tidak tercatat.
        father: child.father === "-" ? null : child.father,
        mother: child.mother === "-" ? null : child.mother,
        orderOfChild: child.orderOfChild,
        region: child.region,
        birthWeight: child.birthWeight,
        birthHeight: child.birthHeight,
        birthHeadCircum: child.birthHeadCircum,
      },
    });
  }

  console.log(`  ${children.length} balita`);
}

async function seedGrowth(): Promise<void> {
  const byChild = new Map<string, typeof growths>();

  for (const record of growths) {
    const list = byChild.get(record.legacyChildId) ?? [];
    list.push(record);
    byChild.set(record.legacyChildId, list);
  }

  let inserted = 0;
  let skipped = 0;

  for (const [legacyChildId, records] of byChild) {
    const childId = idMap.get(legacyChildId);
    if (!childId) {
      console.warn(
        `  ! penimbangan untuk balita tak dikenal "${legacyChildId}" dilewati (${records.length} baris)`,
      );
      skipped += records.length;
      continue;
    }

    const child = await prisma.children.findUniqueOrThrow({
      where: { id: childId },
    });

    // Urut menaik supaya rantai kenaikan berat dihitung dari yang paling awal.
    const ordered = records
      .map((record) => ({
        ...record,
        parsedDate: mustParseDate(
          record.date,
          `penimbangan ${legacyChildId}`,
        ),
      }))
      .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());

    let previous: PreviousWeighIn | null = null;
    const usedPeriods = new Set<string>();

    for (const record of ordered) {
      const assessment = assessMeasurement({
        dateOfBirth: child.dateOfBirth,
        measuredAt: record.parsedDate,
        sex: child.gender,
        weight: record.weight,
        height: record.height,
        headCircum: record.headCircum,
        armCircum: record.armCircum,
        previous,
      });

      // Satu penimbangan per balita per bulan dijamin basis data; data lama
      // sesekali memuat dua baris untuk bulan yang sama.
      if (usedPeriods.has(assessment.period)) {
        console.warn(
          `  ! ${child.fullName}: penimbangan ganda pada ${assessment.period} dilewati`,
        );
        skipped += 1;
        continue;
      }
      usedPeriods.add(assessment.period);

      await prisma.growth.create({
        data: {
          childId,
          date: record.parsedDate,
          period: assessment.period,
          ageInMonth: assessment.ageInMonth,
          weight: record.weight,
          height: record.height,
          headCircum: record.headCircum,
          armCircum: record.armCircum,
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
          note: record.note || null,
          // Data historis; kader pencatatnya tidak tercatat pada data lama.
          measuredById: null,
        },
      });

      previous = {
        weight: record.weight,
        period: assessment.period,
        consecutiveNoGain: assessment.consecutiveNoGain,
      };
      inserted += 1;
    }
  }

  console.log(
    `  ${inserted} penimbangan${skipped > 0 ? ` (${skipped} dilewati)` : ""}`,
  );
}

async function seedVaccines(): Promise<void> {
  let inserted = 0;

  for (const vaccine of vaccines) {
    const childId = idMap.get(vaccine.legacyChildId);
    if (!childId) continue;

    await prisma.vaccine.create({
      data: {
        childId,
        date: mustParseDate(vaccine.date, `imunisasi ${vaccine.vaccineName}`),
        vaccineName: vaccine.vaccineName,
        place: vaccine.place,
      },
    });
    inserted += 1;
  }

  console.log(`  ${inserted} imunisasi`);
}

async function seedEvents(): Promise<void> {
  for (const event of events) {
    await prisma.event.create({
      data: {
        title: event.title,
        date: mustParseDate(event.date, `kegiatan ${event.title}`),
        startTime: event.startTime,
        endTime: event.endTime,
        place: event.place,
        description: event.description,
        region: event.region,
      },
    });
  }

  console.log(`  ${events.length} kegiatan`);
}

async function main(): Promise<void> {
  console.log("Mengosongkan basis data...");
  await clearDatabase();

  console.log("Menyemai data:");
  await seedUsers();
  await seedChildren();
  await seedGrowth();
  await seedVaccines();
  await seedEvents();

  const flagged = await prisma.growth.count({ where: { isFlagged: true } });
  const noGain = await prisma.growth.count({
    where: { gainStatus: WeightGainStatus.INADEQUATE },
  });
  const referral = await prisma.growth.count({
    where: { consecutiveNoGain: { gte: 2 } },
  });

  console.log("\nRingkasan penilaian:");
  console.log(`  ${noGain} penimbangan berstatus tidak naik (T)`);
  console.log(`  ${referral} penimbangan mencapai kondisi 2T`);
  console.log(`  ${flagged} penimbangan ditandai perlu verifikasi`);
  console.log("\nSelesai. Kata sandi seluruh akun semai: password123");
}

main()
  .catch((error: unknown) => {
    console.error("Penyemaian gagal:", error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
