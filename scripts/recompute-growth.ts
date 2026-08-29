import { prisma } from "../src/core/prisma.js";
import { recomputeChain } from "../src/modules/growth/growth.service.js";

async function main(): Promise<void> {
  const children = await prisma.children.findMany({ orderBy: { id: "asc" } });

  let recomputed = 0;
  let skipped = 0;

  for (const child of children) {
    const earliest = await prisma.growth.findFirst({
      where: { childId: child.id, deletedAt: null },
      orderBy: { date: "asc" },
      select: { date: true },
    });

    if (!earliest) {
      skipped += 1;
      continue;
    }

    await prisma.$transaction(async (tx) => {
      await recomputeChain(tx, child, earliest.date);
    });

    recomputed += 1;
  }

  const total = await prisma.growth.count({ where: { deletedAt: null } });

  console.log(`Selesai. ${recomputed} balita dinilai ulang, ${skipped} balita belum punya penimbangan.`);
  console.log(`${total} baris penimbangan aktif kini memakai ambang Permenkes 2/2020.`);
}

main()
  .catch((error) => {
    console.error("Gagal menilai ulang data penimbangan:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
