const express = require("express");
const { api } = require("./config");
// const swaggerUi = require('swagger-ui-express');
// const specs = require('./utils/swagger');
const { MorganMiddleware } = require("./middlewares");
const routes = require("./routes");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

const corsOption = {
  origin: "*",
  credentials: true,
};
app.use(cors(corsOption));
app.use(cookieParser());
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use(MorganMiddleware);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(`/${api}`, routes);

module.exports = app;
