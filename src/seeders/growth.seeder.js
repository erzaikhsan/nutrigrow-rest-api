const { GrowthModel } = require("../models");
const logger = require("../utils/logger");

const growths = [];

const createGrowth = (
  id,
  children_id,
  date,
  age,
  region,
  weight,
  wfa_status,
  height,
  hfa_status,
  wfh_status,
  head_circum,
  arm_circum,
  note
) => {
  const growth = {
    id,
    children_id,
    date,
    age,
    region,
    weight,
    wfa_status,
    height,
    hfa_status,
    wfh_status,
    head_circum,
    arm_circum,
    note,
  };
  growths.push(growth);
};

//Kevin Johnson
createGrowth(
  "G0",
  "C10",
  "2023-11-14 17:00:00.000 Z",
  0,
  "RW1",
  3.4,
  "Normal",
  50.2,
  "Normal",
  "Normal",
  34.5,
  10.5,
  "Pengukuran Saat Lahir"
);

createGrowth(
  "G01",
  "C10",
  "2023-12-14 17:00:00.000 Z",
  1,
  "RW1",
  4.3,
  "Normal",
  54.1,
  "Normal",
  "Normal",
  36.2,
  10.8,
  "Asi Eksklusif"
);

createGrowth(
  "G02",
  "C10",
  "2024-01-14 17:00:00.000 Z",
  2,
  "RW1",
  5.2,
  "Normal",
  57.3,
  "Normal",
  "Normal",
  37.5,
  11.3,
  "Asi Eksklusif"
);

createGrowth(
  "G03",
  "C10",
  "2024-02-14 17:00:00.000 Z",
  3,
  "RW1",
  6.0,
  "Normal",
  60.1,
  "Normal",
  "Normal",
  38.7,
  11.8,
  "Asi Eksklusif"
);

createGrowth(
  "G04",
  "C10",
  "2024-03-14 17:00:00.000 Z",
  4,
  "RW1",
  6.7,
  "Normal",
  62.4,
  "Normal",
  "Normal",
  39.8,
  12.3,
  "Asi Eksklusif"
);

createGrowth(
  "G05",
  "C10",
  "2024-04-14 17:00:00.000 Z",
  5,
  "RW1",
  7.3,
  "Normal",
  64.5,
  "Normal",
  "Normal",
  40.6,
  12.7,
  "Asi Eksklusif"
);

createGrowth(
  "G06",
  "C10",
  "2024-05-14 17:00:00.000 Z",
  6,
  "RW1",
  7.8,
  "Normal",
  66.3,
  "Normal",
  "Normal",
  41.4,
  13.1,
  "Asi Eksklusif"
);

createGrowth(
  "G07",
  "C10",
  "2024-06-14 17:00:00.000 Z",
  7,
  "RW1",
  8.2,
  "Normal",
  67.8,
  "Normal",
  "Normal",
  42.0,
  13.4,
  "Asi Eksklusif"
);

//Chyntia Johnson
createGrowth(
  "G4",
  "C13",
  "2023-11-14 17:00:00.000 Z",
  0,
  "RW1",
  3.4,
  "Normal",
  50.2,
  "Normal",
  "Normal",
  34.5,
  10.5,
  "Pengukuran Saat Lahir"
);

createGrowth(
  "G41",
  "C13",
  "2023-12-14 17:00:00.000 Z",
  1,
  "RW1",
  4.3,
  "Normal",
  54.1,
  "Normal",
  "Normal",
  36.2,
  10.8,
  "Asi Eksklusif"
);

createGrowth(
  "G42",
  "C13",
  "2024-01-14 17:00:00.000 Z",
  2,
  "RW1",
  5.2,
  "Normal",
  57.3,
  "Normal",
  "Normal",
  37.5,
  11.3,
  "Asi Eksklusif"
);

createGrowth(
  "G43",
  "C13",
  "2024-02-14 17:00:00.000 Z",
  3,
  "RW1",
  6.0,
  "Normal",
  60.1,
  "Normal",
  "Normal",
  38.7,
  11.8,
  "Asi Eksklusif"
);

createGrowth(
  "G44",
  "C13",
  "2024-03-14 17:00:00.000 Z",
  4,
  "RW1",
  6.7,
  "Normal",
  62.4,
  "Normal",
  "Normal",
  39.8,
  12.3,
  "Asi Eksklusif"
);

createGrowth(
  "G45",
  "C13",
  "2024-04-14 17:00:00.000 Z",
  5,
  "RW1",
  7.3,
  "Normal",
  64.5,
  "Normal",
  "Normal",
  40.6,
  12.7,
  "Asi Eksklusif"
);

createGrowth(
  "G46",
  "C13",
  "2024-05-14 17:00:00.000 Z",
  6,
  "RW1",
  7.8,
  "Normal",
  66.3,
  "Normal",
  "Normal",
  41.4,
  13.1,
  "Asi Eksklusif"
);

createGrowth(
  "G47",
  "C13",
  "2024-06-14 17:00:00.000 Z",
  7,
  "RW1",
  8.2,
  "Normal",
  67.8,
  "Normal",
  "Normal",
  42.0,
  13.4,
  "Asi Eksklusif"
);

//Other Children
createGrowth(
  "G2",
  "C11",
  "2023-07-14 17:00:00.000 Z",
  0,
  "RW1",
  3.2,
  "Normal",
  50,
  "Normal",
  "Normal",
  34,
  10,
  "Pengukuran Saat Lahir"
);

createGrowth(
  "G3",
  "C12",
  "2024-05-14 17:00:00.000 Z",
  0,
  "RW1",
  3.2,
  "Normal",
  50,
  "Normal",
  "Normal",
  34,
  10,
  "Pengukuran Saat Lahir"
);

createGrowth(
  "G8",
  "C14",
  "2024-05-14 17:00:00.000 Z",
  0,
  "RW1",
  3.2,
  "Normal",
  50,
  "Normal",
  "Normal",
  34,
  10,
  "Pengukuran Saat Lahir"
);

const seedGrowth = async () => {
  try {
    await GrowthModel.bulkCreate(growths);
    logger.info("Growth seed data inserted successfully.");
  } catch (error) {
    logger.error("Error seeding growth data:", error);
  }
};

module.exports = seedGrowth;
