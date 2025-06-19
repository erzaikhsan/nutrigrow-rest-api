const { ParentService } = require("../services");
const logger = require("../utils/logger");
const { handle404Response, handle500Response } = require("../utils/response");

async function getParents(req, res) {
  try {
    const result = await ParentService.getParents();
    res.status(200).json({
      success: true,
      message: "Get Parents Successful",
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

async function getParentAccount(req, res) {
  try {
    const result = await ParentService.getParentAccount(req.params.id);
    res.status(200).json({
      success: true,
      message: "Get Parent Account Successful",
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

async function getParentById(req, res) {
  try {
    const result = await ParentService.getParentById(req.params.id);
    res.status(200).json({
      success: true,
      message: "Get Parent By Id Successful",
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

async function getParentByName(req, res) {
  try {
    const result = await ParentService.getParentByName(req.query.name);
    res.status(200).json({
      success: true,
      message: "Get Parent By Name Successful",
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

async function getParentsByRegion(req, res) {
  try {
    const result = await ParentService.getParentsByRegion(req.params.region);
    res.status(200).json({
      success: true,
      message: "Get Parent By Region Successful",
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

async function updateParent(req, res) {
  try {
    const id = req.userdata.id;
    const result = await ParentService.updateParent(id, req.body);
    res.status(200).json({
      success: true,
      message: "Update Parent Successful",
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

async function deleteParent(req, res) {
  try {
    const id = req.params.id;
    const result = await ParentService.deleteParent(id);
    res.status(200).json({
      success: true,
      message: "Delete Parent Successful",
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
  getParents,
  getParentAccount,
  getParentById,
  getParentByName,
  getParentsByRegion,
  updateParent,
  deleteParent,
};
