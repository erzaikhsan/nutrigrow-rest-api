const { ChildrenModel } = require("../models");
const logger = require("../utils/logger");

const children = [];

const createChildren = (
  children_id,
  parents_id,
  full_name,
  gender,
  place_of_birth,
  date_of_birth,
  father,
  mother,
  order_of_child,
  region,
  birth_weight,
  wfa_status,
  birth_height,
  hfa_status,
  wfh_status,
  birth_head_circum
) => {
  const child = {
    children_id,
    parents_id,
    full_name,
    gender,
    place_of_birth,
    date_of_birth,
    father,
    mother,
    order_of_child,
    region,
    birth_weight,
    wfa_status,
    birth_height,
    hfa_status,
    wfh_status,
    birth_head_circum,
  };
  children.push(child);
};

//P1
createChildren(
  "C1",
  "P1",
  "Safira Kanza Azura",
  "F",
  "Banyumas",
  "2023-07-28 00:00:00.000 Z",
  "-",
  "Uswatun Khasanah",
  2,
  "RW1",
  3.2,
  "Normal",
  50,
  "Normal",
  "Normal",
  10
);
createChildren(
  "C2",
  "P1",
  "Muhammad Arifin",
  "M",
  "Banyumas",
  "2022-06-20 00:00:00.000 Z",
  "-",
  "Uswatun Khasanah",
  1,
  "RW1",
  3.2,
  "Normal",
  50,
  "Normal",
  "Normal",
  10
);

//P2
createChildren(
  "C3",
  "P2",
  "Ukasah Salih",
  "M",
  "Banyumas",
  "2022-06-20 00:00:00.000 Z",
  "-",
  "Dwi Ratna Sari",
  1,
  "RW1",
  3.2,
  "Normal",
  50,
  "Normal",
  "Normal",
  10
);

//P3
createChildren(
  "C4",
  "P3",
  "Anzel Kalifano",
  "M",
  "Banyumas",
  "2022-06-20 00:00:00.000 Z",
  "-",
  "Miladia Nur Khasanah",
  1,
  "RW1",
  3.2,
  "Normal",
  50,
  "Normal",
  "Normal",
  10
);

//P4
createChildren(
  "C5",
  "P4",
  "Aisyah Zahra",
  "F",
  "Banyumas",
  "2023-07-28 00:00:00.000 Z",
  "-",
  "Siti Nurhaliza",
  1,
  "RW1",
  3.2,
  "Normal",
  50,
  "Normal",
  "Normal",
  10
);

//P5
createChildren(
  "C6",
  "P5",
  "Fatimah Azzahra",
  "F",
  "Banyumas",
  "2023-07-28 00:00:00.000 Z",
  "-",
  "Rina Wati",
  1,
  "RW2",
  3.2,
  "Normal",
  50,
  "Normal",
  "Normal",
  10
);

//P6
createChildren(
  "C7",
  "P6",
  "Rizki Pratama",
  "M",
  "Banyumas",
  "2022-06-20 00:00:00.000 Z",
  "-",
  "Maya Sari",
  1,
  "RW2",
  3.2,
  "Normal",
  50,
  "Normal",
  "Normal",
  10
);

//P7
createChildren(
  "C8",
  "P7",
  "Putri Cantika",
  "F",
  "Banyumas",
  "2023-07-28 00:00:00.000 Z",
  "-",
  "Indah Permata",
  1,
  "RW2",
  3.2,
  "Normal",
  50,
  "Normal",
  "Normal",
  10
);

//P8
createChildren(
  "C9",
  "P8",
  "Bayu Aji",
  "M",
  "Banyumas",
  "2022-06-20 00:00:00.000 Z",
  "-",
  "Intan Ayu Sari",
  1,
  "RW3",
  3.2,
  "Normal",
  50,
  "Normal",
  "Normal",
  10
);

const seedChildren = async () => {
  try {
    await ChildrenModel.bulkCreate(children);
    logger.info("Children seed data inserted successfully.");
  } catch (error) {
    logger.error("Error seeding children data:", error);
  }
};

module.exports = seedChildren;

// createChildren(
//   "C11",
//   "P2",
//   "Samuel Williams",
//   "M",
//   "Banyumas",
//   "2023-07-14 17:00:00.000 Z",
//   `Bob Williams`,
//   `Vey Williams`,
//   "RW1",
//   3.2,
//   "Normal",
//   50,
//   "Normal",
//   "Normal",
//   10
// );
// createChildren(
//   "C12",
//   "P3",
//   "Rebecca Davis",
//   "F",
//   "Banyumas",
//   "2024-05-14 17:00:00.000 Z",
//   `Simon Davis`,
//   `Carol Davis`,
//   "RW1",
//   3.2,
//   "Normal",
//   50,
//   "Normal",
//   "Normal",
//   10
// );

// createChildren(
//   "C13",
//   "P1",
//   "Chyntia Johnson",
//   "F",
//   "Banyumas",
//   "2023-11-14 17:00:00.000 Z",
//   "Marcus Johnson",
//   "Alice Johnson",
//   "RW1",
//   3.2,
//   "Normal",
//   50,
//   "Normal",
//   "Normal",
//   10
// );

// createChildren(
//   "C14",
//   "P2",
//   "Felix Williams",
//   "M",
//   "Banyumas",
//   "2024-05-14 17:00:00.000 Z",
//   `Bob Williams`,
//   `Vey Williams`,
//   "RW1",
//   3.2,
//   "Normal",
//   50,
//   "Normal",
//   "Normal",
//   10
// );
