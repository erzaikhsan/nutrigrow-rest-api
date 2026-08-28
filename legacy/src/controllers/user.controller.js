const { UserService } = require("../services");
const logger = require("../utils/logger");
const { handle404Response, handle500Response } = require("../utils/response");

async function getUserById(req, res) {
  try {
    const result = await UserService.getUserById(req.params.id);
    res.status(200).json({
      success: true,
      message: "Get User By Id Successful",
      data: result,
    });
  } catch (err) {
    if (err.message == 404) {
      return handle404Response(res);
    }
    logger.error({ status: 500, error: err });
    handle500Response(res);
  }
}

module.exports = {
  getUserById,
};
