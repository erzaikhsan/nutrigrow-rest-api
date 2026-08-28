const { OfficerService } = require("../services");
const logger = require("../utils/logger");
const { handle404Response, handle500Response } = require("../utils/response");

async function getOfficers(req, res) {
  try {
    const uid = req.userdata.id;
    const result = await OfficerService.getOfficers(uid);
    res.status(200).json({
      success: true,
      message: "Get Officers Successful",
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

async function getOfficerAccount(req, res) {
  try {
    const result = await OfficerService.getOfficerAccount(req.params.id);
    res.status(200).json({
      success: true,
      message: "Get Officer Account Successful",
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

async function getOfficerById(req, res) {
  try {
    const result = await OfficerService.getOfficerById(req.params.id);
    res.status(200).json({
      success: true,
      message: "Get Officer By Id Successful",
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

async function getOfficersByRegion(req, res) {
  try {
    const result = await OfficerService.getOfficersByRegion(req.params.region);
    res.status(200).json({
      success: true,
      message: "Get Officer By Region Successful",
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

async function updateOfficer(req, res) {
  try {
    const id = req.userdata.id;
    const result = await OfficerService.updateOfficer(id, req.body);
    res.status(200).json({
      success: true,
      message: "Update Officer Successful",
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

async function deleteOfficer(req, res) {
  try {
    const id = req.params.id;
    const result = await OfficerService.deleteOfficer(id);
    res.status(200).json({
      success: true,
      message: "Delete Officer Successful",
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
  getOfficers,
  getOfficerAccount,
  getOfficerById,
  getOfficersByRegion,
  updateOfficer,
  deleteOfficer,
};
