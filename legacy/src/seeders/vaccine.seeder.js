const { VaccineModel } = require("../models");
const logger = require("../utils/logger");
const { v4: uuidv4 } = require("uuid");

const vaccines = [];

const createVaccine = (id, children_id, date, vaccine_name, place) => {
  const vaccine = {
    id,
    children_id,
    date,
    vaccine_name,
    place,
  };
  vaccines.push(vaccine);
};

const balitaPerempuan = [
  { id: "C1", place: "Puskesmas Jipang" },
  { id: "C5", place: "Puskesmas Jipang" },
  { id: "C6", place: "Puskesmas Jipang" },
  { id: "C8", place: "Puskesmas Jipang" },
];

balitaPerempuan.forEach((child) => {
  createVaccine(
    uuidv4(),
    child.id,
    "2023-07-28 00:00:00.000 Z",
    "HB-0",
    child.place
  );
  createVaccine(
    uuidv4(),
    child.id,
    "2023-09-11 00:00:00.000 Z",
    "BCG",
    child.place
  );
  createVaccine(
    uuidv4(),
    child.id,
    "2023-09-11 00:00:00.000 Z",
    "Polio I",
    child.place
  );
  createVaccine(
    uuidv4(),
    child.id,
    "2023-10-15 00:00:00.000 Z",
    "DPT-HB-Hib I",
    child.place
  );
  createVaccine(
    uuidv4(),
    child.id,
    "2023-10-15 00:00:00.000 Z",
    "Polio II",
    child.place
  );
  createVaccine(
    uuidv4(),
    child.id,
    "2023-11-21 00:00:00.000 Z",
    "DPT-HB-Hib II",
    child.place
  );
  createVaccine(
    uuidv4(),
    child.id,
    "2023-11-21 00:00:00.000 Z",
    "Polio III",
    child.place
  );
  createVaccine(
    uuidv4(),
    child.id,
    "2023-12-10 00:00:00.000 Z",
    "DPT-HB-Hib III",
    child.place
  );
  createVaccine(
    uuidv4(),
    child.id,
    "2024-01-05 00:00:00.000 Z",
    "Polio IV",
    child.place
  );
  createVaccine(
    uuidv4(),
    child.id,
    "2024-01-12 00:00:00.000 Z",
    "IPV",
    child.place
  );
  createVaccine(
    uuidv4(),
    child.id,
    "2024-05-07 00:00:00.000 Z",
    "Campak",
    child.place
  );
  createVaccine(
    uuidv4(),
    child.id,
    "2025-02-16 00:00:00.000 Z",
    "DPT-HB-Hib Lanjutan",
    child.place
  );
});

const balitaLaki = [
  { id: "C2", place: "Puskesmas Jipang" },
  { id: "C3", place: "Puskesmas Jipang" },
  { id: "C4", place: "Puskesmas Jipang" },
  { id: "C7", place: "Puskesmas Jipang" },
  { id: "C9", place: "Puskesmas Jipang" },
];

balitaLaki.forEach((child) => {
  createVaccine(
    uuidv4(),
    child.id,
    "2022-06-28 00:00:00.000 Z",
    "HB-0",
    child.place
  );
  createVaccine(
    uuidv4(),
    child.id,
    "2022-08-11 00:00:00.000 Z",
    "BCG",
    child.place
  );
  createVaccine(
    uuidv4(),
    child.id,
    "2022-08-11 00:00:00.000 Z",
    "Polio I",
    child.place
  );
  createVaccine(
    uuidv4(),
    child.id,
    "2022-09-15 00:00:00.000 Z",
    "DPT-HB-Hib I",
    child.place
  );
  createVaccine(
    uuidv4(),
    child.id,
    "2022-09-15 00:00:00.000 Z",
    "Polio II",
    child.place
  );
  createVaccine(
    uuidv4(),
    child.id,
    "2022-10-21 00:00:00.000 Z",
    "DPT-HB-Hib II",
    child.place
  );
  createVaccine(
    uuidv4(),
    child.id,
    "2022-10-21 00:00:00.000 Z",
    "Polio III",
    child.place
  );
  createVaccine(
    uuidv4(),
    child.id,
    "2022-11-10 00:00:00.000 Z",
    "DPT-HB-Hib III",
    child.place
  );
  createVaccine(
    uuidv4(),
    child.id,
    "2023-12-05 00:00:00.000 Z",
    "Polio IV",
    child.place
  );
  createVaccine(
    uuidv4(),
    child.id,
    "2023-12-12 00:00:00.000 Z",
    "IPV",
    child.place
  );
  createVaccine(
    uuidv4(),
    child.id,
    "2023-06-07 00:00:00.000 Z",
    "Campak",
    child.place
  );
  createVaccine(
    uuidv4(),
    child.id,
    "2024-01-16 00:00:00.000 Z",
    "DPT-HB-Hib Lanjutan",
    child.place
  );
  createVaccine(
    uuidv4(),
    child.id,
    "2024-07-03 00:00:00.000 Z",
    "Campak Lanjutan",
    child.place
  );
});

const seedVaccine = async () => {
  try {
    await VaccineModel.bulkCreate(vaccines);
    logger.info("Vaccine seed data inserted successfully.");
  } catch (error) {
    logger.error("Error seeding vaccine data:", error);
  }
};

module.exports = seedVaccine;
