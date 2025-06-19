const { body, param } = require("express-validator");

const requirements = {
  addEvent: [
    body("title").isString().notEmpty(),
    body("date").isString().notEmpty(),
    body("start_time").isString(),
    body("end_time").isString(),
    body("place").isString(),
    body("description").isString(),
    body("region").isIn(["RW1", "RW2", "RW3", "RW4", "RW5", "Village"]),
  ],

  updateEvent: [
    param("id").isString(),
    body("full_name").isString().optional({ nullable: true }),
    body("title").isString().optional({ nullable: true }),
    body("date").isString().optional({ nullable: true }),
    body("start_time").isString().optional({ nullable: true }),
    body("end_time").isString().optional({ nullable: true }),
    body("place").isString().optional({ nullable: true }),
    body("description").isString().optional({ nullable: true }),
    body("region")
      .isIn(["RW1", "RW2", "RW3", "RW4", "RW5", "Village"])
      .optional({ nullable: true }),
  ],

  deleteEvent: [param("id").isString()],
};

module.exports = requirements;
