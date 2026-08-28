const { ChildrenService } = require("../services");
const logger = require("../utils/logger");
const {
  handle404Response,
  handle409Response,
  handle500Response,
} = require("../utils/response");

async function addChildren(req, res) {
  try {
    const result = await ChildrenService.addChildren(req.body);
    res.status(201).json({
      success: true,
      message: "Add Children Successful",
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

async function getChildren(req, res) {
  try {
    const result = await ChildrenService.getChildren();
    res.status(200).json({
      success: true,
      message: "Get Children Successful",
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

async function getChildrenById(req, res) {
  try {
    const result = await ChildrenService.getChildrenById(req.params.id);
    res.status(200).json({
      success: true,
      message: "Get Children By Id Successful",
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

async function getChildrenByParentId(req, res) {
  try {
    const result = await ChildrenService.getChildrenByParentId(
      req.params.parentId
    );
    res.status(200).json({
      success: true,
      message: "Get Children By Parent Id Successful",
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

async function getChildrenByName(req, res) {
  try {
    const result = await ChildrenService.getChildrenByName(req.query.name);
    res.status(200).json({
      success: true,
      message: "Get Children By Name Successful",
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

async function getChildrenByRegion(req, res) {
  try {
    const result = await ChildrenService.getChildrenByRegion(req.params.region);
    res.status(200).json({
      success: true,
      message: "Get Children By Region Successful",
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

async function getChildrenByNameAndRegion(req, res) {
  try {
    const result = await ChildrenService.getChildrenByNameAndRegion(
      req.query.name,
      req.params.region
    );
    res.status(200).json({
      success: true,
      message: "Get Children By Name And Region Successful",
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

async function updateChildren(req, res) {
  try {
    const children_id = req.params.id;
    const {
      parents_id,
      full_name,
      gender,
      place_of_birth,
      date_of_birth,
      father,
      mother,
      order_of_child,
      region,
      birth_weight,
      birth_height,
      birth_head_circum,
    } = req.body;
    const result = await ChildrenService.updateChildren({
      children_id,
      parents_id,
      full_name,
      gender,
      place_of_birth,
      date_of_birth,
      father,
      mother,
      order_of_child,
      region,
      birth_weight,
      birth_height,
      birth_head_circum,
    });
    res.status(200).json({
      success: true,
      message: "Update Children Successful",
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

module.exports = {
  addChildren,
  getChildren,
  getChildrenById,
  getChildrenByParentId,
  getChildrenByName,
  getChildrenByRegion,
  getChildrenByNameAndRegion,
  updateChildren,
};
