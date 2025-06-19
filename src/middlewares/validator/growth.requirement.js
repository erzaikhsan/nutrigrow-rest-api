const { query, body, param } = require("express-validator");

const requirements = {
  getGrowth: [query("page").isInt({ min: 1 }).optional({ nullable: true })],

  getGrowthByChildrenId: [param("childId").isString()],

  getGrowthById: [param("growthId").isString()],

  createGrowth: [
    body("children_id").isString(),
    body("date").isString(),
    body("weight").isFloat({ min: 0 }),
    body("height").isFloat({ min: 0 }),
  ],

  updateGrowth: [
    body("children_id").isString(),
    body("date").isString().optional({ nullable: true }),
    body("weight").isFloat({ min: 0 }).optional({ nullable: true }),
    body("height").isFloat({ min: 0 }).optional({ nullable: true }),
  ],
};

module.exports = requirements;
