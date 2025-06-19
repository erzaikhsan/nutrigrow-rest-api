const { body, param } = require("express-validator");

const requirements = {
  getOfficerById: [param("id").isString()],

  updateOfficerById: [
    body("full_name").isString().notEmpty(),
    body("gender").isIn(["F", "M"]),
    body("date_of_birth").isString(),
    body("phone_number").notEmpty(),
    body("address").isString(),
    body("region")
      .isIn(["RW1", "RW2", "RW3", "RW4", "RW5", "Village"])
      .notEmpty(),
  ],
};

module.exports = requirements;
