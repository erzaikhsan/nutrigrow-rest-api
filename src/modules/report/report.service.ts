import { ChildStatus, Role, type Children, type Growth, type Region } from "@prisma/client";
import { forbidden, notFound } from "../../core/errors.js";
import { prisma } from "../../core/prisma.js";
import {
  hfaLabel,
  wfaLabel,
  wfhLabel,
} from "../../core/serialize.js";
import type { AuthContext } from "../../middlewares/auth.middleware.js";
import { assertRegionAccess, regionFilter } from "../access.js";
import {
  createLandscapeDocument,
  createPortraitDocument,
  formatDateId,
  formatGender,
  MONTH_NAMES,
  POSYANDU_NAMES,
  renderToBuffer,
} from "./report.pdf.js";
import {
  buildUpgkRows,
  referenceDateFor,
  TOTAL_ONLY_ROW_LABEL,
  type UpgkRow,
} from "./upgk.js";

const ACTIVE_GROWTH = { deletedAt: null } as const;

function assertCanGenerate(auth: AuthContext): void {
  if (auth.role !== Role.Officer && auth.role !== Role.Admin) {
    throw forbidden("Hanya kader dan admin yang dapat mengunduh laporan");
  }
}

function periodOf(month: number, year: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

function previousPeriodOf(month: number, year: number): string {
  return month === 0 ? periodOf(11, year - 1) : periodOf(month - 1, year);
}

async function growthByPeriod(
  childIds: string[],
  period: string,
): Promise<Map<string, Growth>> {
  if (childIds.length === 0) return new Map();

  const records = await prisma.growth.findMany({
    where: { childId: { in: childIds }, period, ...ACTIVE_GROWTH },
  });

  return new Map(records.map((record) => [record.childId, record]));
}

async function latestGrowthFor(
  childIds: string[],
): Promise<Map<string, Growth>> {
  if (childIds.length === 0) return new Map();

  const records = await prisma.growth.findMany({
    where: { childId: { in: childIds }, ...ACTIVE_GROWTH },
    orderBy: [{ childId: "asc" }, { date: "desc" }],
  });

  const latest = new Map<string, Growth>();
  for (const record of records) {
    if (!latest.has(record.childId)) latest.set(record.childId, record);
  }

  return latest;
}

async function loadChildren(
  auth: AuthContext,
  region?: Region,
): Promise<Children[]> {
  if (region) assertRegionAccess(auth, region);

  return prisma.children.findMany({
    where: {
      status: ChildStatus.ACTIVE,
      ...(region ? { region } : {}),
      ...regionFilter(auth),
    },
    orderBy: { fullName: "asc" },
  });
}

export async function generateChildrenReport(
  month: number,
  year: number,
  auth: AuthContext,
  region?: Region,
): Promise<Buffer> {
  assertCanGenerate(auth);

  const children = await loadChildren(auth, region);
  if (children.length === 0) throw notFound("Data balita");

  const ids = children.map((child) => child.id);
  const current = await growthByPeriod(ids, periodOf(month, year));

  const missing = ids.filter((id) => !current.has(id));
  const fallback = await latestGrowthFor(missing);

  const doc = createLandscapeDocument();

  doc
    .font("Helvetica-Bold")
    .fontSize(18)
    .text("Data Hasil Penimbangan Balita Posyandu Jipang", { align: "center" });
  doc.moveDown(1);

  doc
    .font("Helvetica")
    .fontSize(14)
    .text(
      `Data Bulan : ${MONTH_NAMES[month]} ${year}` +
        (region ? `   |   Wilayah : ${POSYANDU_NAMES[region] ?? region}` : ""),
    )
    .moveDown();

  const rows = children.map((child, index) => {
    const growth = current.get(child.id) ?? fallback.get(child.id);

    if (!growth) {
      return [
        index + 1,
        child.fullName,
        formatGender(child.gender),
        child.placeOfBirth,
        formatDateId(child.dateOfBirth),
        child.father ?? "-",
        child.mother ?? "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "Belum pernah ditimbang",
      ];
    }

    return [
      index + 1,
      child.fullName,
      formatGender(child.gender),
      child.placeOfBirth,
      formatDateId(child.dateOfBirth),
      child.father ?? "-",
      child.mother ?? "-",
      growth.weight,
      growth.height,
      growth.headCircum,
      growth.armCircum,
      wfaLabel(growth.wfaStatus),
      hfaLabel(growth.hfaStatus),
      wfhLabel(growth.wfhStatus),
      formatDateId(growth.date),
    ];
  });

  await doc.table(
    {
      headers: [
        "No",
        "Nama",
        "Gender",
        "Tempat Lahir",
        "Tgl Lahir",
        "Ayah Balita",
        "Ibu Balita",
        "BB (kg)",
        "TB (cm)",
        "LK (cm)",
        "LL (cm)",
        "WFA",
        "HFA",
        "WFH",
        "Tgl Penimbangan",
      ],
      rows,
    },
    {
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(9),
      prepareRow: () => doc.font("Helvetica").fontSize(8),
      padding: 4,
    },
  );

  return renderToBuffer(doc);
}

export async function generateParentReport(
  auth: AuthContext,
  region?: Region,
): Promise<Buffer> {
  assertCanGenerate(auth);

  if (region) assertRegionAccess(auth, region);

  const parents = await prisma.user.findMany({
    where: {
      role: Role.Parent,
      ...(region ? { region } : {}),
      ...regionFilter(auth),
    },
    orderBy: { fullName: "asc" },
  });

  if (parents.length === 0) throw notFound("Data orang tua");

  const counts = await prisma.children.groupBy({
    by: ["parentId"],
    where: {
      parentId: { in: parents.map((parent) => parent.id) },
      status: ChildStatus.ACTIVE,
    },
    _count: { _all: true },
  });

  const childCount = new Map(
    counts.map((row) => [row.parentId, row._count._all]),
  );

  const doc = createPortraitDocument();

  doc
    .font("Helvetica-Bold")
    .fontSize(18)
    .text("Daftar Orang Tua Balita Posyandu Desa Jipang", { align: "center" });
  doc.moveDown();

  if (region) {
    doc
      .font("Helvetica")
      .fontSize(12)
      .text(`Wilayah : ${POSYANDU_NAMES[region] ?? region}`)
      .moveDown();
  }

  const rows = parents.map((parent, index) => [
    index + 1,
    parent.fullName,
    formatGender(parent.gender),
    formatDateId(parent.dateOfBirth),
    parent.phoneNumber,
    parent.address ?? "-",
    parent.region,
    childCount.get(parent.id) ?? 0,
  ]);

  await doc.table(
    {
      headers: [
        "No",
        "Nama",
        "Gender",
        "Tgl Lahir",
        "Nomor Telepon",
        "Alamat",
        "Wilayah Posyandu",
        "Jumlah Balita",
      ],
      rows,
    },
    {
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
      prepareRow: () => doc.font("Helvetica").fontSize(8),
      padding: 5,
      columnsSize: [25, 80, 60, 80, 85, 100, 60, 45],
    },
  );

  return renderToBuffer(doc);
}

export async function generateMonthlyReport(
  month: number,
  year: number,
  region: Region,
  auth: AuthContext,
): Promise<Buffer> {
  assertCanGenerate(auth);
  assertRegionAccess(auth, region);

  const children = await prisma.children.findMany({
    where: { region, status: ChildStatus.ACTIVE },
    orderBy: { fullName: "asc" },
  });

  if (children.length === 0) throw notFound("Data balita");

  const officers = await prisma.user.count({
    where: { role: Role.Officer, region, isActive: true },
  });

  const ids = children.map((child) => child.id);

  const current = await growthByPeriod(ids, periodOf(month, year));
  const previous = await growthByPeriod(ids, previousPeriodOf(month, year));

  const rows = buildUpgkRows({
    children,
    current,
    previous,
    referenceDate: referenceDateFor(month, year),
    month,
    year,
  });

  const doc = createLandscapeDocument();

  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .text("HASIL KEGIATAN BULANAN POSYANDU", { align: "center" })
    .moveDown(1);

  doc
    .font("Helvetica")
    .fontSize(10)
    .text(`LAPORAN BULAN   : ${MONTH_NAMES[month]} ${year}`)
    .text(`a. Nama Posyandu : ${POSYANDU_NAMES[region] ?? region}`)
    .text(`b. Kelurahan/Desa: Desa Jipang`)
    .text(`c. Jumlah Kader  : ${officers}`)
    .text(`d. Jumlah Kader Aktif: ${officers}`)
    .moveDown();

  const header = [
    { label: "NO", width: 30 },
    { label: "KEGIATAN UPGK", width: 180 },
    { label: "0-4 bln\nL", width: 45 },
    { label: "0-4 bln\nP", width: 45 },
    { label: "5 bln\nL", width: 40 },
    { label: "5 bln\nP", width: 40 },
    { label: "6-11 bln\nL", width: 45 },
    { label: "6-11 bln\nP", width: 45 },
    { label: "12-23 bln\nL", width: 55 },
    { label: "12-23 bln\nP", width: 55 },
    { label: "24-59 bln\nL", width: 55 },
    { label: "24-59 bln\nP", width: 55 },
    { label: "JUMLAH\nL", width: 50 },
    { label: "JUMLAH\nP", width: 50 },
  ];

  const tableRows = rows.map((row: UpgkRow, index) => {
    const totalOnly = row.kegiatan === TOTAL_ONLY_ROW_LABEL;
    const cell = (value: number): string | number => (totalOnly ? "-" : value);

    return [
      index + 1,
      row.kegiatan,
      cell(row["0_4_L"]),
      cell(row["0_4_P"]),
      cell(row["5_L"]),
      cell(row["5_P"]),
      cell(row["6_11_L"]),
      cell(row["6_11_P"]),
      cell(row["12_23_L"]),
      cell(row["12_23_P"]),
      cell(row["24_59_L"]),
      cell(row["24_59_P"]),
      row.jumlah_L,
      row.jumlah_P,
    ];
  });

  await doc.table(
    {
      headers: header.map((column) => column.label),
      rows: tableRows,
    },
    {
      columnsSize: header.map((column) => column.width),
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(9),
      prepareRow: () => doc.font("Helvetica").fontSize(8),
      padding: 4,
    },
  );

  return renderToBuffer(doc);
}
