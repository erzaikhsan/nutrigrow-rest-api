const { Sequelize } = require("sequelize");
require("dotenv").config();

const db = new Sequelize({
  dialect: "postgres",
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  //   dialectOptions: {
  //     ssl: {
  //       rejectUnauthorized: false
  //     }
  //   }
});

const port = process.env.PORT_APP || 3000;
const api = process.env.API_PATH || "api/v1";
const secretKey = process.env.SECRET_KEY;

module.exports = {
  db,
  port,
  api,
  secretKey,
};
