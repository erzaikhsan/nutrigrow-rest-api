const {
  ChildrenRepository,
  ParentRepository,
  GrowthRepository,
  OfficerRepository,
} = require("../repositories");
const PDFDocument = require("pdfkit-table");
const { WritableStreamBuffer } = require("stream-buffers");
const { format } = require("date-fns");
const { id, ro } = require("date-fns/locale");

async function generateChildrenReportPDF(currentMonth, year) {
  const childrenList = await ChildrenRepository.getChildren();
  if (childrenList.length === 0) {
    throw new Error(404);
  }

  const month = currentMonth - 1;

  const monthName = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const doc = new PDFDocument({ margin: 30, size: "A4", layout: "landscape" });
  const buffer = new WritableStreamBuffer();

  doc.pipe(buffer);

  doc
    .font("Helvetica-Bold")
    .fontSize(18)
    .text("Data Hasil Penimbangan Balita Posyandu Jipang", { align: "center" });
  doc.moveDown(1);

  doc
    .font("Helvetica")
    .fontSize(14)
    .text(`Data Bulan : ${monthName[month]} ${year}`)
    .moveDown();

  //Susun data dalam format tabel
  const table = {
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
    rows: [],
  };

  for (let [index, child] of childrenList.entries()) {
    const childGrowth = await GrowthRepository.getGrowthByMonthYearAndChildId(
      child.children_id,
      month,
      year
    );

    if (childGrowth.length === 0) {
      const recentGrowth = await GrowthRepository.getLastGrowthByChildId(
        child.children_id
      );

      table.rows.push([
        index + 1,
        child.full_name,
        child.gender === "M" ? "Laki-laki" : "Perempuan",
        child.place_of_birth,
        format(new Date(child.date_of_birth), "dd MMMM yyyy", { locale: id }),
        child.father,
        child.mother,
        recentGrowth.dataValues.weight,
        recentGrowth.dataValues.height,
        recentGrowth.dataValues.head_circum,
        recentGrowth.dataValues.arm_circum,
        recentGrowth.dataValues.wfa_status,
        recentGrowth.dataValues.hfa_status,
        recentGrowth.dataValues.wfh_status,
        format(new Date(recentGrowth.dataValues.date), "dd MMMM yyyy", {
          locale: id,
        }),
      ]);
    } else {
      table.rows.push([
        index + 1,
        child.full_name,
        child.gender === "M" ? "Laki-laki" : "Perempuan",
        child.place_of_birth,
        format(new Date(child.date_of_birth), "dd MMMM yyyy", { locale: id }),
        child.father,
        child.mother,
        childGrowth[0].dataValues.weight,
        childGrowth[0].dataValues.height,
        childGrowth[0].dataValues.head_circum,
        childGrowth[0].dataValues.arm_circum,
        childGrowth[0].dataValues.wfa_status,
        childGrowth[0].dataValues.hfa_status,
        childGrowth[0].dataValues.wfh_status,
        format(new Date(childGrowth[0].dataValues.date), "dd MMMM yyyy", {
          locale: id,
        }),
      ]);
    }
  }

  //Buat tabel ke dalam dokumen PDF
  await doc.table(table, {
    prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
    prepareRow: (row, i) => doc.font("Helvetica").fontSize(8),
    padding: 5,
    columnSpacing: 5,
    columnsSize: [25, 85, 55, 65, 70, 75, 75, 35, 35, 35, 35, 40, 40, 40, 80],
  });

  doc.end();

  return new Promise((resolve, reject) => {
    buffer.on("finish", () => resolve(buffer.getContents()));
    buffer.on("error", reject);
  });
}

async function generateRegionChildrenReportPDF(currentMonth, year, region) {
  const childrenList = await ChildrenRepository.getChildrenByRegion(region);
  if (childrenList.length === 0) {
    throw new Error(404);
  }

  const month = currentMonth - 1;

  const monthName = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const posyanduName = {
    RW1: "PAMUJI 1",
    RW2: "PAMUJI 2",
    RW3: "PAMUJI 3",
    RW4: "PAMUJI 4",
    RW5: "PAMUJI 5",
  };

  const doc = new PDFDocument({ margin: 30, size: "A4", layout: "landscape" });
  const buffer = new WritableStreamBuffer();

  doc.pipe(buffer);

  doc
    .font("Helvetica-Bold")
    .fontSize(18)
    .text(`Data Hasil Penimbangan Balita ${posyanduName[region]}`, {
      align: "center",
    });
  doc.moveDown(1);

  doc
    .font("Helvetica")
    .fontSize(14)
    .text(`Data Bulan : ${monthName[month]} ${year}`)
    .moveDown();

  //Susun data dalam format tabel
  const table = {
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
    rows: [],
  };

  for (let [index, child] of childrenList.entries()) {
    const childGrowth = await GrowthRepository.getGrowthByMonthYearAndChildId(
      child.children_id,
      month,
      year
    );

    if (childGrowth.length === 0) {
      const recentGrowth = await GrowthRepository.getLastGrowthByChildId(
        child.children_id
      );

      table.rows.push([
        index + 1,
        child.full_name,
        child.gender === "M" ? "Laki-laki" : "Perempuan",
        child.place_of_birth,
        format(new Date(child.date_of_birth), "dd MMMM yyyy", { locale: id }),
        child.father,
        child.mother,
        recentGrowth.dataValues.weight,
        recentGrowth.dataValues.height,
        recentGrowth.dataValues.head_circum,
        recentGrowth.dataValues.arm_circum,
        recentGrowth.dataValues.wfa_status,
        recentGrowth.dataValues.hfa_status,
        recentGrowth.dataValues.wfh_status,
        format(new Date(recentGrowth.dataValues.date), "dd MMMM yyyy", {
          locale: id,
        }),
      ]);
    } else {
      table.rows.push([
        index + 1,
        child.full_name,
        child.gender === "M" ? "Laki-laki" : "Perempuan",
        child.place_of_birth,
        format(new Date(child.date_of_birth), "dd MMMM yyyy", { locale: id }),
        child.father,
        child.mother,
        childGrowth[0].dataValues.weight,
        childGrowth[0].dataValues.height,
        childGrowth[0].dataValues.head_circum,
        childGrowth[0].dataValues.arm_circum,
        childGrowth[0].dataValues.wfa_status,
        childGrowth[0].dataValues.hfa_status,
        childGrowth[0].dataValues.wfh_status,
        format(new Date(childGrowth[0].dataValues.date), "dd MMMM yyyy", {
          locale: id,
        }),
      ]);
    }
  }

  //Buat tabel ke dalam dokumen PDF
  await doc.table(table, {
    prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
    prepareRow: (row, i) => doc.font("Helvetica").fontSize(8),
    padding: 5,
    columnSpacing: 5,
    columnsSize: [25, 85, 55, 60, 70, 75, 75, 35, 35, 35, 35, 40, 40, 40, 80],
  });

  doc.end();

  return new Promise((resolve, reject) => {
    buffer.on("finish", () => resolve(buffer.getContents()));
    buffer.on("error", reject);
  });
}

async function generateParentReportPDF() {
  const parentsList = await ParentRepository.getParents();
  if (parentsList.length === 0) {
    throw new Error(404);
  }

  const doc = new PDFDocument({ margin: 30, size: "A4" });
  const buffer = new WritableStreamBuffer();

  doc.pipe(buffer);

  doc
    .font("Helvetica-Bold")
    .fontSize(18)
    .text(`Daftar Orang Tua Balita Posyandu Desa Jipang`, { align: "center" });
  doc.moveDown();

  //Susun data dalam format tabel
  const table = {
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
    rows: [],
  };

  for (let [index, parent] of parentsList.entries()) {
    const childrenList = await ChildrenRepository.getChildrenByParentId(
      parent.id
    );
    const jumlahBalita = childrenList?.length || 0;

    table.rows.push([
      index + 1,
      parent.full_name,
      parent.gender === "M" ? "Laki-laki" : "Perempuan",
      format(new Date(parent.date_of_birth), "dd MMMM yyyy", { locale: id }),
      parent.phone_number,
      parent.address,
      parent.region,
      jumlahBalita,
    ]);
  }

  //Buat tabel ke dalam dokumen PDF
  await doc.table(table, {
    prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
    prepareRow: (row, i) => doc.font("Helvetica").fontSize(8),
    padding: 5,
    columnSpacing: 5,
    columnsSize: [25, 80, 60, 80, 85, 100, 60, 45],
  });

  doc.end();

  return new Promise((resolve, reject) => {
    buffer.on("finish", () => resolve(buffer.getContents()));
    buffer.on("error", reject);
  });
}

async function generateRegionParentReportPDF(region) {
  const parentsList = await ParentRepository.getParentsByRegion(region);
  if (parentsList.length === 0) {
    throw new Error(404);
  }

  const posyanduName = {
    RW1: "PAMUJI 1",
    RW2: "PAMUJI 2",
    RW3: "PAMUJI 3",
    RW4: "PAMUJI 4",
    RW5: "PAMUJI 5",
  };

  const doc = new PDFDocument({ margin: 30, size: "A4" });
  const buffer = new WritableStreamBuffer();

  doc.pipe(buffer);

  doc
    .font("Helvetica-Bold")
    .fontSize(18)
    .text(`Daftar Orang Tua Balita Posyandu Wilayah ${posyanduName[region]}`, {
      align: "center",
    });
  doc.moveDown();

  //Susun data dalam format tabel
  const table = {
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
    rows: [],
  };

  for (let [index, parent] of parentsList.entries()) {
    const childrenList = await ChildrenRepository.getChildrenByParentId(
      parent.id
    );
    const jumlahBalita = childrenList?.length || 0;

    table.rows.push([
      index + 1,
      parent.full_name,
      parent.gender === "M" ? "Laki-laki" : "Perempuan",
      format(new Date(parent.date_of_birth), "dd MMMM yyyy", { locale: id }),
      parent.phone_number,
      parent.address,
      parent.region,
      jumlahBalita,
    ]);
  }

  //Buat tabel ke dalam dokumen PDF
  await doc.table(table, {
    prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
    prepareRow: (row, i) => doc.font("Helvetica").fontSize(8),
    padding: 5,
    columnSpacing: 5,
    columnsSize: [25, 80, 60, 80, 85, 100, 60, 45],
  });

  doc.end();

  return new Promise((resolve, reject) => {
    buffer.on("finish", () => resolve(buffer.getContents()));
    buffer.on("error", reject);
  });
}

//LAPORAN BULANAN
async function generateMonthlyReportPDF(currentMonth, year, region) {
  const childrenList = await ChildrenRepository.getChildrenByRegion(region);
  if (childrenList.length === 0) {
    throw new Error(404);
  }

  const officerList = await OfficerRepository.getOfficersByRegion(region);
  if (officerList.length === 0) {
    throw new Error(404);
  }

  const month = currentMonth - 1;

  let prevMonth = month - 1;
  let prevYear = year;

  if (prevMonth < 0) {
    prevMonth = 11; // Desember
    prevYear -= 1;
  }

  let prev2Month = prevMonth - 1;
  let prev2Year = year;

  if (prev2Month < 0) {
    prevMonth = 11; // Desember
    prev2Year -= 1;
  }

  const growthList = await GrowthRepository.getGrowthOnMonth(
    month,
    year,
    region
  );
  if (growthList.length === 0) {
    throw new Error(404);
  }

  const prevGrowthList = await GrowthRepository.getGrowthOnMonth(
    prevMonth,
    prevYear,
    region
  );

  const prev2GrowthList = await GrowthRepository.getGrowthOnMonth(
    prev2Month,
    prev2Year,
    region
  );

  const monthName = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const posyanduName = {
    RW1: "PAMUJI 1",
    RW2: "PAMUJI 2",
    RW3: "PAMUJI 3",
    RW4: "PAMUJI 4",
    RW5: "PAMUJI 5",
  };

  const upgkRow1 = countAllChildrenByAgeAndGender(
    month,
    year,
    "Jumlah semua Balita yang ada di Posyandu",
    childrenList
  );
  const upgkRow2 = countAllChildrenByAgeAndGender(
    month,
    year,
    "Jumlah Balita yang terdaftar dan mempunyai KMS bulan ini",
    childrenList
  );
  const upgkRow3 = countChildrenWeighedThisMonth(
    month,
    year,
    "Jumlah Balita yang ditimbang bulan ini",
    childrenList,
    growthList
  );
  const upgkRow4 = countChildrenWithWeightGain(
    month,
    year,
    "Jumlah Balita yang naik berat badannya bulan ini",
    childrenList,
    growthList,
    prevGrowthList
  );
  const upgkRow5 = countChildrenWithWeightLoss(
    month,
    year,
    "Jumlah Balita yang tidak naik berat badannya 1 kali bulan ini",
    childrenList,
    growthList,
    prevGrowthList
  );
  const upgkRow6 = countChildrenWithWeightDoubleLoss(
    month,
    year,
    "Jumlah Balita yang tidak naik berat badannya 2 kali bulan ini",
    childrenList,
    growthList,
    prevGrowthList,
    prev2GrowthList
  );
  const upgkRow7 = countChildrenNotWeighedPrevMonth(
    month,
    year,
    "Jumlah Balita yang bulan sebelumnya tidak menimbang",
    childrenList,
    growthList,
    prevGrowthList
  );
  const upgkRow8 = countAllNewChildren(
    month,
    year,
    "Jumlah Bayi Baru",
    childrenList
  );
  const upgkRow9 = countSevUnderweightChildren(
    month,
    year,
    "Jumlah Balita Berat Badan Sangat Kurang (Severely Underweight) Berdasarkan Indikator BB/U",
    childrenList,
    growthList
  );
  const upgkRow10 = countUnderweightChildren(
    month,
    year,
    "Jumlah Balita Berat Badan Kurang (Underweight) Berdasarkan Indikator BB/U",
    childrenList,
    growthList
  );
  const upgkRow11 = countOverweightChildren(
    month,
    year,
    "Jumlah Balita Berat Badan Lebih (Overweight) Berdasarkan Indikator BB/U",
    childrenList,
    growthList
  );
  const upgkRow12 = countSevStuntedChildren(
    month,
    year,
    "Jumlah Balita Sangat Pendek (Severely Stunting) Berdasarkan Indikator TB/U",
    childrenList,
    growthList
  );
  const upgkRow13 = countStuntedChildren(
    month,
    year,
    "Jumlah Balita Pendek (Stunting) Berdasarkan Indikator TB/U",
    childrenList,
    growthList
  );
  const upgkRow14 = countSevWastedChildren(
    month,
    year,
    "Jumlah Balita Gizi Buruk (Severely Wasting) Berdasarkan Indikator BB/TB",
    childrenList,
    growthList
  );
  const upgkRow15 = countWastedChildren(
    month,
    year,
    "Jumlah Balita Gizi Kurang (Wasting) Berdasarkan Indikator BB/TB",
    childrenList,
    growthList
  );
  const upgkRow16 = countObeseChildren(
    month,
    year,
    "Jumlah Balita Gizi Lebih (Overweight and Obesse) Berdasarkan Indikator BB/TB",
    childrenList,
    growthList
  );

  const monthData = [
    upgkRow1,
    upgkRow2,
    upgkRow3,
    upgkRow4,
    upgkRow5,
    upgkRow6,
    upgkRow7,
    upgkRow8,
    upgkRow9,
    upgkRow10,
    upgkRow11,
    upgkRow12,
    upgkRow13,
    upgkRow14,
    upgkRow15,
    upgkRow16,
  ];

  const doc = new PDFDocument({ margin: 30, size: "A4", layout: "landscape" });
  const buffer = new WritableStreamBuffer();

  doc.pipe(buffer);

  // Judul dan informasi Posyandu
  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .text("HASIL KEGIATAN BULANAN POSYANDU", { align: "center" })
    .moveDown(1);

  doc
    .font("Helvetica")
    .fontSize(10)
    .text(`LAPORAN BULAN   : ${monthName[month]} ${year}`)
    .text(`a. Nama Posyandu : ${posyanduName[region]}`)
    .text(`b. Kelurahan/Desa: Desa Jipang`)
    .text(`c. Jumlah Kader  : ${officerList.length}`)
    .text(`d. Jumlah Kader Aktif: ${officerList.length}`)
    .moveDown();

  // Header kolom umur dan jenis kelamin
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

  // Ubah data kegiatan ke format rows
  const rows = monthData.map((item, index) => {
    const isRow8 = item.kegiatan === "Jumlah Bayi Baru";

    return [
      index + 1,
      item.kegiatan,
      isRow8 ? "-" : item["0_4_L"] ?? 0,
      isRow8 ? "-" : item["0_4_P"] ?? 0,
      isRow8 ? "-" : item["5_L"] ?? 0,
      isRow8 ? "-" : item["5_P"] ?? 0,
      isRow8 ? "-" : item["6_11_L"] ?? 0,
      isRow8 ? "-" : item["6_11_P"] ?? 0,
      isRow8 ? "-" : item["12_23_L"] ?? 0,
      isRow8 ? "-" : item["12_23_P"] ?? 0,
      isRow8 ? "-" : item["24_59_L"] ?? 0,
      isRow8 ? "-" : item["24_59_P"] ?? 0,
      item["jumlah_L"] ?? 0,
      item["jumlah_P"] ?? 0,
    ];
  });

  // Render tabel kegiatan UPGK
  await doc.table(
    {
      headers: header.map((h) => h.label),
      rows: rows,
    },
    {
      columnsSize: header.map((h) => h.width),
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(9),
      prepareRow: () => doc.font("Helvetica").fontSize(8),
      padding: 4,
    }
  );

  doc.end();

  return new Promise((resolve, reject) => {
    buffer.on("finish", () => resolve(buffer.getContents()));
    buffer.on("error", reject);
  });
}

//Fungsi Bantuan untuk mengelola LAPORAN BULANAN
function initUPGKRow(label) {
  return {
    kegiatan: label,
    "0_4_L": 0,
    "0_4_P": 0,
    "5_L": 0,
    "5_P": 0,
    "6_11_L": 0,
    "6_11_P": 0,
    "12_23_L": 0,
    "12_23_P": 0,
    "24_59_L": 0,
    "24_59_P": 0,
    jumlah_L: 0,
    jumlah_P: 0,
  };
}

function getAgeInMonths(month, year, dateOfBirth) {
  const now = new Date(year, month - 1);
  const dob = new Date(dateOfBirth);

  let months =
    (now.getFullYear() - dob.getFullYear()) * 12 +
    (now.getMonth() - dob.getMonth());

  if (now.getDate() < dob.getDate()) {
    months--;
  }

  return months;
}

function getAgeGroup(ageInMonths) {
  if (ageInMonths <= 4) return "0_4";
  if (ageInMonths === 5) return "5";
  if (ageInMonths >= 6 && ageInMonths <= 11) return "6_11";
  if (ageInMonths >= 12 && ageInMonths <= 23) return "12_23";
  if (ageInMonths >= 24 && ageInMonths <= 59) return "24_59";
  return null; // Di luar rentang balita
}

//Fungsi Utama Setiap Baris
//Baris 1, 2
function countAllChildrenByAgeAndGender(month, year, eventTitle, childrenList) {
  const result = initUPGKRow(eventTitle);

  for (const child of childrenList) {
    const age = getAgeInMonths(month, year, child.date_of_birth);
    if (age < 0) continue;

    const group = getAgeGroup(age);
    if (!group) continue;

    const gender = child.gender === "M" ? "L" : "P";
    const key = `${group}_${gender}`;
    result[key]++;

    // Akumulasi total
    if (gender === "L") result.jumlah_L++;
    else result.jumlah_P++;
  }

  return result;
}

// Baris 3
function countChildrenWeighedThisMonth(
  month,
  year,
  eventTitle,
  childrenList,
  growthList
) {
  const result = initUPGKRow(eventTitle);

  for (const growth of growthList) {
    const child = childrenList.find(
      (c) => c.children_id === growth.children_id
    );
    if (!child) continue;

    const age = getAgeInMonths(month, year, child.date_of_birth);
    if (age < 0) continue;

    const group = getAgeGroup(age);
    if (!group) continue;

    const gender = child.gender === "M" ? "L" : "P";
    const key = `${group}_${gender}`;
    result[key]++;

    // Akumulasi total
    if (gender === "L") result.jumlah_L++;
    else result.jumlah_P++;
  }

  return result;
}

//Baris 4
function countChildrenWithWeightGain(
  month,
  year,
  eventTitle,
  childrenList,
  currentGrowthList,
  previousGrowthList
) {
  const result = initUPGKRow(eventTitle);

  // Buat Map untuk akses cepat
  const currentMap = new Map();
  const previousMap = new Map();

  for (const g of currentGrowthList) {
    currentMap.set(g.children_id, g);
  }

  for (const g of previousGrowthList) {
    previousMap.set(g.children_id, g);
  }

  for (const child of childrenList) {
    const current = currentMap.get(child.children_id);
    const previous = previousMap.get(child.children_id);

    if (!current || !previous) continue;

    if (current.weight > previous.weight) {
      const age = getAgeInMonths(month, year, child.date_of_birth);
      if (age < 0) continue;

      const group = getAgeGroup(age);
      if (!group) continue;

      const gender = child.gender === "M" ? "L" : "P";
      const key = `${group}_${gender}`;
      result[key]++;

      // Akumulasi total
      if (gender === "L") result.jumlah_L++;
      else result.jumlah_P++;
    }
  }

  return result;
}

//Baris 5
function countChildrenWithWeightLoss(
  month,
  year,
  eventTitle,
  childrenList,
  currentGrowthList,
  previousGrowthList
) {
  const result = initUPGKRow(eventTitle);

  // Buat Map untuk akses cepat
  const currentMap = new Map();
  const previousMap = new Map();

  for (const g of currentGrowthList) {
    currentMap.set(g.children_id, g);
  }

  for (const g of previousGrowthList) {
    previousMap.set(g.children_id, g);
  }

  for (const child of childrenList) {
    const current = currentMap.get(child.children_id);
    const previous = previousMap.get(child.children_id);

    if (!current || !previous) continue;

    if (current.weight < previous.weight) {
      const age = getAgeInMonths(month, year, child.date_of_birth);
      if (age < 0) continue;

      const group = getAgeGroup(age);
      if (!group) continue;

      const gender = child.gender === "M" ? "L" : "P";
      const key = `${group}_${gender}`;
      result[key]++;

      // Akumulasi total
      if (gender === "L") result.jumlah_L++;
      else result.jumlah_P++;
    }
  }

  return result;
}

//Baris 6
function countChildrenWithWeightDoubleLoss(
  month,
  year,
  eventTitle,
  childrenList,
  currentGrowthList,
  previous1GrowthList,
  previous2GrowthList
) {
  const result = initUPGKRow(eventTitle);

  // Map growth data by child ID
  const currentMap = new Map();
  const prev1Map = new Map();
  const prev2Map = new Map();

  for (const g of currentGrowthList) {
    currentMap.set(g.children_id, g);
  }

  for (const g of previous1GrowthList) {
    prev1Map.set(g.children_id, g);
  }

  for (const g of previous2GrowthList) {
    prev2Map.set(g.children_id, g);
  }

  for (const child of childrenList) {
    const id = child.children_id;
    const current = currentMap.get(id);
    const prev1 = prev1Map.get(id);
    const prev2 = prev2Map.get(id);

    // Harus punya semua data
    if (!current || !prev1 || !prev2) continue;

    // Dua kali berturut-turut tidak naik
    const firstNoGain = prev1.weight <= prev2.weight;
    const secondNoGain = current.weight <= prev1.weight;

    if (firstNoGain && secondNoGain) {
      const age = getAgeInMonths(month, year, child.date_of_birth);
      if (age < 0) continue;

      const group = getAgeGroup(age);
      if (!group) continue;

      const gender = child.gender === "M" ? "L" : "P";
      const key = `${group}_${gender}`;
      result[key]++;

      if (gender === "L") result.jumlah_L++;
      else result.jumlah_P++;
    }
  }

  return result;
}

//Baris 7
function countChildrenNotWeighedPrevMonth(
  month,
  year,
  eventTitle,
  childrenList,
  currentGrowthList,
  previousGrowthList
) {
  const result = initUPGKRow(eventTitle);

  // Buat Map untuk akses cepat
  const currentMap = new Map();
  const previousMap = new Map();

  for (const g of currentGrowthList) {
    currentMap.set(g.children_id, g);
  }

  for (const g of previousGrowthList) {
    previousMap.set(g.children_id, g);
  }

  for (const child of childrenList) {
    const current = currentMap.get(child.children_id);
    const previous = previousMap.get(child.children_id);

    if (current && !previous) {
      const age = getAgeInMonths(month, year, child.date_of_birth);
      if (age < 0) continue;

      const group = getAgeGroup(age);
      if (!group) continue;

      const gender = child.gender === "M" ? "L" : "P";
      const key = `${group}_${gender}`;
      result[key]++;

      // Akumulasi total
      if (gender === "L") result.jumlah_L++;
      else result.jumlah_P++;
    }
  }

  return result;
}

//Baris 8
function countAllNewChildren(month, year, eventTitle, childrenList) {
  const result = initUPGKRow(eventTitle);

  for (const child of childrenList) {
    const age = getAgeInMonths(month, year, child.date_of_birth);
    if (age < 0 || age > 4) continue;

    const group = getAgeGroup(age);
    if (!group) continue;

    const gender = child.gender === "M" ? "L" : "P";
    const key = `${group}_${gender}`;
    result[key]++;

    // Akumulasi total
    if (gender === "L") result.jumlah_L++;
    else result.jumlah_P++;
  }

  return result;
}

//Baris 9
function countSevUnderweightChildren(
  month,
  year,
  eventTitle,
  childrenList,
  growthList
) {
  const result = initUPGKRow(eventTitle);

  // Buat Map growth data
  const growthMap = new Map();
  for (const g of growthList) {
    growthMap.set(g.children_id, g);
  }

  for (const child of childrenList) {
    const growth = growthMap.get(child.children_id);
    if (!growth) continue;

    if (growth.wfa_status === "Severely Underweight") {
      const age = getAgeInMonths(month, year, child.date_of_birth);
      if (age < 0) continue;

      const group = getAgeGroup(age);
      if (!group) continue;

      const gender = child.gender === "M" ? "L" : "P";
      const key = `${group}_${gender}`;
      result[key]++;

      // Akumulasi total
      if (gender === "L") result.jumlah_L++;
      else result.jumlah_P++;
    }
  }

  return result;
}

//Baris 10
function countUnderweightChildren(
  month,
  year,
  eventTitle,
  childrenList,
  growthList
) {
  const result = initUPGKRow(eventTitle);

  // Buat Map growth data
  const growthMap = new Map();
  for (const g of growthList) {
    growthMap.set(g.children_id, g);
  }

  for (const child of childrenList) {
    const growth = growthMap.get(child.children_id);
    if (!growth) continue;

    if (growth.wfa_status === "Underweight") {
      const age = getAgeInMonths(month, year, child.date_of_birth);
      if (age < 0) continue;

      const group = getAgeGroup(age);
      if (!group) continue;

      const gender = child.gender === "M" ? "L" : "P";
      const key = `${group}_${gender}`;
      result[key]++;

      // Akumulasi total
      if (gender === "L") result.jumlah_L++;
      else result.jumlah_P++;
    }
  }

  return result;
}

//Baris 11
function countOverweightChildren(
  month,
  year,
  eventTitle,
  childrenList,
  growthList
) {
  const result = initUPGKRow(eventTitle);

  // Buat Map growth data
  const growthMap = new Map();
  for (const g of growthList) {
    growthMap.set(g.children_id, g);
  }

  for (const child of childrenList) {
    const growth = growthMap.get(child.children_id);
    if (!growth) continue;

    if (growth.wfa_status === "Overweight and Obese") {
      const age = getAgeInMonths(month, year, child.date_of_birth);
      if (age < 0) continue;

      const group = getAgeGroup(age);
      if (!group) continue;

      const gender = child.gender === "M" ? "L" : "P";
      const key = `${group}_${gender}`;
      result[key]++;

      // Akumulasi total
      if (gender === "L") result.jumlah_L++;
      else result.jumlah_P++;
    }
  }

  return result;
}

//Baris 12
function countSevStuntedChildren(
  month,
  year,
  eventTitle,
  childrenList,
  growthList
) {
  const result = initUPGKRow(eventTitle);

  // Buat Map growth data
  const growthMap = new Map();
  for (const g of growthList) {
    growthMap.set(g.children_id, g);
  }

  for (const child of childrenList) {
    const growth = growthMap.get(child.children_id);
    if (!growth) continue;

    if (growth.hfa_status === "Severely Stunted") {
      const age = getAgeInMonths(month, year, child.date_of_birth);
      if (age < 0) continue;

      const group = getAgeGroup(age);
      if (!group) continue;

      const gender = child.gender === "M" ? "L" : "P";
      const key = `${group}_${gender}`;
      result[key]++;

      // Akumulasi total
      if (gender === "L") result.jumlah_L++;
      else result.jumlah_P++;
    }
  }

  return result;
}

//Baris 13
function countStuntedChildren(
  month,
  year,
  eventTitle,
  childrenList,
  growthList
) {
  const result = initUPGKRow(eventTitle);

  // Buat Map growth data
  const growthMap = new Map();
  for (const g of growthList) {
    growthMap.set(g.children_id, g);
  }

  for (const child of childrenList) {
    const growth = growthMap.get(child.children_id);
    if (!growth) continue;

    if (growth.hfa_status === "Stunted") {
      const age = getAgeInMonths(month, year, child.date_of_birth);
      if (age < 0) continue;

      const group = getAgeGroup(age);
      if (!group) continue;

      const gender = child.gender === "M" ? "L" : "P";
      const key = `${group}_${gender}`;
      result[key]++;

      // Akumulasi total
      if (gender === "L") result.jumlah_L++;
      else result.jumlah_P++;
    }
  }

  return result;
}

//Baris 14
function countSevWastedChildren(
  month,
  year,
  eventTitle,
  childrenList,
  growthList
) {
  const result = initUPGKRow(eventTitle);

  // Buat Map growth data
  const growthMap = new Map();
  for (const g of growthList) {
    growthMap.set(g.children_id, g);
  }

  for (const child of childrenList) {
    const growth = growthMap.get(child.children_id);
    if (!growth) continue;

    if (growth.wfh_status === "Severely Wasting") {
      const age = getAgeInMonths(month, year, child.date_of_birth);
      if (age < 0) continue;

      const group = getAgeGroup(age);
      if (!group) continue;

      const gender = child.gender === "M" ? "L" : "P";
      const key = `${group}_${gender}`;
      result[key]++;

      // Akumulasi total
      if (gender === "L") result.jumlah_L++;
      else result.jumlah_P++;
    }
  }

  return result;
}

//Baris 15
function countWastedChildren(
  month,
  year,
  eventTitle,
  childrenList,
  growthList
) {
  const result = initUPGKRow(eventTitle);

  // Buat Map growth data
  const growthMap = new Map();
  for (const g of growthList) {
    growthMap.set(g.children_id, g);
  }

  for (const child of childrenList) {
    const growth = growthMap.get(child.children_id);
    if (!growth) continue;

    if (growth.wfh_status === "Wasting") {
      const age = getAgeInMonths(month, year, child.date_of_birth);
      if (age < 0) continue;

      const group = getAgeGroup(age);
      if (!group) continue;

      const gender = child.gender === "M" ? "L" : "P";
      const key = `${group}_${gender}`;
      result[key]++;

      // Akumulasi total
      if (gender === "L") result.jumlah_L++;
      else result.jumlah_P++;
    }
  }

  return result;
}

//Baris 16
function countObeseChildren(month, year, eventTitle, childrenList, growthList) {
  const result = initUPGKRow(eventTitle);

  // Buat Map growth data
  const growthMap = new Map();
  for (const g of growthList) {
    growthMap.set(g.children_id, g);
  }

  for (const child of childrenList) {
    const growth = growthMap.get(child.children_id);
    if (!growth) continue;

    if (growth.wfh_status === "Overweight and Obese") {
      const age = getAgeInMonths(month, year, child.date_of_birth);
      if (age < 0) continue;

      const group = getAgeGroup(age);
      if (!group) continue;

      const gender = child.gender === "M" ? "L" : "P";
      const key = `${group}_${gender}`;
      result[key]++;

      // Akumulasi total
      if (gender === "L") result.jumlah_L++;
      else result.jumlah_P++;
    }
  }

  return result;
}

module.exports = {
  generateChildrenReportPDF,
  generateRegionChildrenReportPDF,
  generateParentReportPDF,
  generateRegionParentReportPDF,
  generateMonthlyReportPDF,
};
