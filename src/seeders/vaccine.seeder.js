const { VaccineModel } = require("../models");
const logger = require("../utils/logger");
const { v4: uuidv4 } = require("uuid");

const vaccines = [];

const createVaccine = (id, children_id, date, vaccine_name) => {
  const vaccine = {
    id,
    children_id,
    date,
    vaccine_name,
  };
  vaccines.push(vaccine);
};

createVaccine(uuidv4(), "C13", "2024-09-08 17:00:00.000 Z", "HB-0");
createVaccine(uuidv4(), "C13", "2024-10-08 17:00:00.000 Z", "BCG");

createVaccine(uuidv4(), "C10", "2024-10-08 17:00:00.000 Z", "HB-0");
createVaccine(uuidv4(), "C10", "2024-12-08 17:00:00.000 Z", "BCG");

const seedVaccine = async () => {
  try {
    await VaccineModel.bulkCreate(vaccines);
    logger.info("Vaccine seed data inserted successfully.");
  } catch (error) {
    logger.error("Error seeding vaccine data:", error);
  }
};

module.exports = seedVaccine;
