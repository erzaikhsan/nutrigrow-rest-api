const bcrypt = require("bcrypt");
const { UserModel } = require("../models");
const logger = require("../utils/logger");

const users = [];

const createUser = (id, email, password, role, is_active) => {
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = { id, email, password: hashedPassword, role, is_active };
  users.push(user);
};

createUser("P1", "alice.johnson@gmail.com", "password123", "Parent", true);
createUser("P2", "bob.williams@gmail.com", "password123", "Parent", false);
createUser("P3", "carol.davis@gmail.com", "password123", "Parent", false);
createUser("P4", "david.miller@gmail.com", "password123", "Parent", true);
createUser("P5", "eva.garcia@gmail.com", "password123", "Parent", false);

createUser("O1", "admin.ofc@gmail.com", "password123", "Admin", true);
createUser("O6", "daniel.ofc@gmail.com", "password123", "Officer", true);
createUser("O7", "cornelia.ofc@gmail.com", "password123", "Officer", true);

const seedUsers = async () => {
  try {
    await UserModel.bulkCreate(users);
    logger.info("User seed data inserted successfully.");
  } catch (error) {
    logger.error("Error seeding user data:", error);
  }
};

module.exports = seedUsers;
