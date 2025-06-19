const { CheckModel } = require("../models");
const logger = require("../utils/logger");
const { v4: uuidv4 } = require("uuid");

const checkes = [];

const createCheck = (id, parents_id, gender, age, height, hfa_status) => {
  const check = {
    id,
    parents_id,
    gender,
    age,
    height,
    hfa_status,
  };
  checkes.push(check);
};

createCheck(uuidv4(), "P1", "M", 26, 80, "Stunted");
createCheck(uuidv4(), "P1", "M", 26, 90, "Normal");

const seedCheck = async () => {
  try {
    await CheckModel.bulkCreate(checkes);
    logger.info("Check Up seed data inserted successfully.");
  } catch (error) {
    logger.error("Error seeding check up data:", error);
  }
};

module.exports = seedCheck;
