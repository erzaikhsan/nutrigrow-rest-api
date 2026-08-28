const validator = require("./validator");
const AuthMiddleware = require("./auth.middleware");
const MorganMiddleware = require("./morgan.middleware");

const authMiddleware = new AuthMiddleware();

module.exports = {
  validator,
  authMiddleware,
  MorganMiddleware,
};
