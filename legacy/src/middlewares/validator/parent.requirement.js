const { body, param, query } = require("express-validator");

const requirements = {
  getChildren: [query("page").isInt({ min: 1 }).optional({ nullable: true })],

  getParentById: [param("id").isString()],

  updateParentById: [
    body("full_name").isString().notEmpty(),
    body("gender").isIn(["F", "M"]),
    body("date_of_birth").isString(),
    body("phone_number").notEmpty(),
    body("address").isString(),
    body("region").isIn(["RW1", "RW2", "RW3", "RW4", "RW5"]).notEmpty(),
  ],
};

module.exports = requirements;
