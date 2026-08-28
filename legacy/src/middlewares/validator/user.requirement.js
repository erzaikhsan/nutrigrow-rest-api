const { body, param } = require("express-validator");

const requirements = {
  updateUser: [
    param("id").isString(),
    body("email").isEmail(),
    body("password").isString().isLength({ min: 8 }),
  ],
};

module.exports = requirements;
