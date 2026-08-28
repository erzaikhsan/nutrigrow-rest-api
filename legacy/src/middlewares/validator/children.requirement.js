const { query, body, param } = require("express-validator");

const requirements = {
  getChildren: [query("page").isInt({ min: 1 }).optional({ nullable: true })],

  getChildrenByParentId: [param("parentId").isString()],

  getChildrenById: [param("childId").isString()],

  createChildren: [
    body("parents_id").isString().notEmpty(),
    body("full_name").isString().notEmpty(),
    body("gender").isIn(["F", "M"]),
    body("place_of_birth").isString(),
    body("date_of_birth").isString(),
    body("father").isString(),
    body("mother").isString(),
    body("region").isIn(["RW1", "RW2", "RW3", "RW4", "RW5", "RW6"]),
    body("birth_weight").isFloat({ min: 0 }),
    body("birth_height").isFloat({ min: 0 }),
  ],

  updateChildren: [
    body("full_name").isString().optional({ nullable: true }),
    body("gender").isIn(["F", "M"]).optional({ nullable: true }),
    body("place_of_birth").isString().optional({ nullable: true }),
    body("date_of_birth").isString().optional({ nullable: true }),
    body("father").isString(),
    body("mother").isString(),
    body("region")
      .isIn(["RW1", "RW2", "RW3", "RW4", "RW5", "RW6"])
      .optional({ nullable: true }),
    body("birth_weight").isFloat({ min: 0 }).optional({ nullable: true }),
    body("birth_height").isFloat({ min: 0 }).optional({ nullable: true }),
  ],

  deleteChildren: [param("childId").isString()],
};

module.exports = requirements;
