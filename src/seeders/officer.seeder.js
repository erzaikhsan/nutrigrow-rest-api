const { OfficerModel } = require("../models");
const logger = require("../utils/logger");

const officers = [];

const createOfficer = (
  user_id,
  full_name,
  gender,
  date_of_birth,
  phone_number,
  address,
  region
) => {
  const officer = {
    user_id,
    full_name,
    gender,
    date_of_birth,
    phone_number,
    address,
    region,
  };
  officers.push(officer);
};

createOfficer(
  "O1",
  "Super Admin",
  "M",
  "1995-05-14 17:00:00.000 Z",
  `+6281312323553`,
  `Jln. Merdeka, Surabaya, Indonesia`,
  "Village"
);
createOfficer(
  "O6",
  "Daniel Williams",
  "M",
  "1995-05-14 17:00:00.000 Z",
  `+6281312323553`,
  `Jln. Merdeka, Surabaya, Indonesia`,
  "RW1"
);
createOfficer(
  "O7",
  "Cornelia Vanisa",
  "F",
  "1995-05-14 17:00:00.000 Z",
  `+6281312345556`,
  `Jln. Merdeka, Surabaya, Indonesia`,
  "RW2"
);

const seedOfficers = async () => {
  try {
    await OfficerModel.bulkCreate(officers);
    logger.info("Officers seed data inserted successfully.");
  } catch (error) {
    logger.error("Error seeding officers data:", error);
  }
};

module.exports = seedOfficers;
