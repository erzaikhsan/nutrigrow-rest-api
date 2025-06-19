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

createChildren(
  "C10",
  "P1",
  "Kevin Johnson",
  "M",
  "Banyumas",
  "2023-11-14 17:00:00.000 Z",
  "Marcus Johnson",
  "Alice Johnson",
  "RW1",
  3.2,
  "Normal",
  50,
  "Normal",
  "Normal",
  10
);

createChildren(
  "C11",
  "P2",
  "Samuel Williams",
  "M",
  "Banyumas",
  "2023-07-14 17:00:00.000 Z",
  `Bob Williams`,
  `Vey Williams`,
  "RW1",
  3.2,
  "Normal",
  50,
  "Normal",
  "Normal",
  10
);
createChildren(
  "C12",
  "P3",
  "Rebecca Davis",
  "F",
  "Banyumas",
  "2024-05-14 17:00:00.000 Z",
  `Simon Davis`,
  `Carol Davis`,
  "RW1",
  3.2,
  "Normal",
  50,
  "Normal",
  "Normal",
  10
);

createChildren(
  "C13",
  "P1",
  "Chyntia Johnson",
  "F",
  "Banyumas",
  "2023-11-14 17:00:00.000 Z",
  "Marcus Johnson",
  "Alice Johnson",
  "RW1",
  3.2,
  "Normal",
  50,
  "Normal",
  "Normal",
  10
);

createChildren(
  "C14",
  "P2",
  "Felix Williams",
  "M",
  "Banyumas",
  "2024-05-14 17:00:00.000 Z",
  `Bob Williams`,
  `Vey Williams`,
  "RW1",
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
