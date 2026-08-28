const { ParentModel } = require("../models");
const logger = require("../utils/logger");

const parents = [];

const createParent = (
  user_id,
  full_name,
  gender,
  date_of_birth,
  phone_number,
  address,
  region
) => {
  const parent = {
    user_id,
    full_name,
    gender,
    date_of_birth,
    phone_number,
    address,
    region,
  };
  parents.push(parent);
};

createParent(
  "P1",
  `Alice Johnson`,
  "F",
  "1995-05-14 17:00:00.000 Z",
  `+6281312345566`,
  `Jln. Merdeka, Surabaya, Indonesia`,
  "RW1"
);
createParent(
  "P2",
  `Bob Williams`,
  "M",
  "1985-08-19 17:00:00.000 Z",
  `+628131232355367`,
  `Jln. Kemerdekaan, Surabaya, Indonesia`,
  "RW1"
);
createParent(
  "P3",
  `Carol Davis`,
  "F",
  "1990-12-29 17:00:00.000 Z",
  `+6281312345522`,
  `Jln. Pancasila, Surabaya, Indonesia`,
  "RW1"
);
createParent(
  "P4",
  `David Miller`,
  "M",
  "1988-02-04 17:00:00.000 Z",
  `+6281312345569`,
  `Jln. Sudirman, Surabaya, Indonesia`,
  "RW1"
);
createParent(
  "P5",
  `Eva Garcia`,
  "F",
  "1993-06-09 17:00:00.000 Z",
  `+628131232355368`,
  `Jln. Gatot Subroto, Surabaya, Indonesia`,
  "RW1"
);

const seedParents = async () => {
  try {
    await ParentModel.bulkCreate(parents);
    logger.info("Parents seed data inserted successfully.");
  } catch (error) {
    logger.error("Error seeding parents data:", error);
  }
};

module.exports = seedParents;
