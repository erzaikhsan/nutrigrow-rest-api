const {
  UserModel,
  ParentModel,
  OfficerModel,
  ChildrenModel,
  GrowthModel,
  EventModel,
  VaccineModel,
  OtpModel,
} = require("../models");

const {
  UserSeeder,
  ParentSeeder,
  OfficerSeeder,
  ChildrenSeeder,
  GrowthSeeder,
  EventSeeder,
  VaccineSeeder,
} = require("../seeders");
const logger = require("./logger");

async function migrateTables() {
  await UserModel.sync({ force: true });
  await ParentModel.sync({ force: true });
  await OfficerModel.sync({ force: true });
  await ChildrenModel.sync({ force: true });
  await GrowthModel.sync({ force: true });
  await EventModel.sync({ force: true });
  await VaccineModel.sync({ force: true });
  await OtpModel.sync({ force: true });
  // await CheckModel.sync({ force: true });
}

async function seedData() {
  await UserSeeder();
  await ParentSeeder();
  await OfficerSeeder();
  await ChildrenSeeder();
  await GrowthSeeder();
  await EventSeeder();
  await VaccineSeeder();
  // await CheckSeeder();
}

async function syncDatabase() {
  try {
    await migrateTables();
    await seedData();

    logger.info("Database synced successfully.");
  } catch (error) {
    logger.error("Error syncing tables:", error);
  }
}

syncDatabase();
