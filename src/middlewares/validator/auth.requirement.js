const { body } = require("express-validator");

const requirements = {
  login: [
    body("email").isEmail(),
    body("password").isString().isLength({ min: 8 }),
  ],

  registerParent: [
    body("full_name").isString().notEmpty(),
    body("gender").isIn(["F", "M"]),
    body("date_of_birth").isString(),
    body("phone_number").isNumeric().notEmpty(),
    body("address").isString(),
    body("region").isIn(["RW1", "RW2", "RW3", "RW4", "RW5"]),
  ],

  createAccount: [
    body("email").isEmail(),
    body("password").isString().isLength({ min: 8 }),
  ],

  registerOfficer: [
    body("email").isEmail(),
    body("password").isString().isLength({ min: 8 }),
    body("full_name").isString().notEmpty(),
    body("gender").isIn(["F", "M"]),
    body("date_of_birth").isString(),
    body("phone_number").isNumeric().notEmpty(),
    body("address").isString(),
    body("region").isIn(["RW1", "RW2", "RW3", "RW4", "RW5", "Village"]),
  ],
};

module.exports = requirements;
