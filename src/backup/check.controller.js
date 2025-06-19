const { CheckService } = require("../services");
const logger = require("../utils/logger");
const {
  handle404Response,
  handle409Response,
  handle500Response,
} = require("../utils/response");

async function addCheckUp(req, res) {
  try {
    const result = await CheckService.addCheckUp(req.body);
    res.status(201).json({
      success: true,
      message: "Add Check Up Successful",
      data: result,
    });
  } catch (err) {
    if (err.message == 409) {
      return handle409Response(res);
    }
    logger.error({ status: 500, error: err });
    handle500Response(res);
  }
}

async function getCheckUpById(req, res) {
  try {
    const result = await CheckService.getCheckUpById(req.params.id);
    res.status(200).json({
      success: true,
      message: "Get Check Up By Id Successful",
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

async function getCheckUpByParentId(req, res) {
  try {
    const result = await CheckService.getCheckUpByParentId(req.params.parentId);
    res.status(200).json({
      success: true,
      message: "Get Check Up By Parent Id Successful",
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
  addCheckUp,
  getCheckUpById,
  getCheckUpByParentId,
};
