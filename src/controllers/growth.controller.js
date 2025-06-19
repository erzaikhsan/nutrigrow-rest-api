const { GrowthService } = require("../services");
const logger = require("../utils/logger");
const {
  handle404Response,
  handle409Response,
  handle500Response,
} = require("../utils/response");

async function addGrowth(req, res) {
  try {
    const result = await GrowthService.addGrowth(req.body);
    res.status(201).json({
      success: true,
      message: "Add Growth Successful",
      data: result,
    });
  } catch (err) {
    if (err.message == 404) {
      return handle404Response(res);
    }
    if (err.message == 409) {
      return handle409Response(res);
    }
    logger.error({ status: 500, error: err });
    handle500Response(res);
  }
}

async function getGrowth(req, res) {
  try {
    const result = await GrowthService.getGrowth();
    res.status(200).json({
      success: true,
      message: "Get Growth Successful",
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

async function getGrowthById(req, res) {
  try {
    const result = await GrowthService.getGrowthById(req.params.id);
    res.status(200).json({
      success: true,
      message: "Get Growth By Id Successful",
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

async function getGrowthByChildId(req, res) {
  try {
    const result = await GrowthService.getGrowthByChildId(req.params.childId);
    res.status(200).json({
      success: true,
      message: "Get Growth By Children Id Successful",
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

async function getGrowthByMonthYearAndChildId(req, res) {
  try {
    const result = await GrowthService.getGrowthByMonthYearAndChildId(
      req.params.childId,
      req.body.date
    );
    res.status(200).json({
      success: true,
      message: "Get Growth By Time Successful",
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

async function getLastGrowthByChildId(req, res) {
  try {
    const result = await GrowthService.getLastGrowthByChildId(
      req.params.childId
    );
    res.status(200).json({
      success: true,
      message: "Get Last Growth Successful",
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

// async function getGrowthOnMonth(req, res) {
//   try {
//     const result = await GrowthService.getGrowthOnMonth(req.body.date);
//     res.status(200).json({
//       success: true,
//       message: "Get Growth By Date Successful",
//       data: result,
//     });
//   } catch (err) {
//     if (err.message == 404) {
//       return handle404Response(res);
//     }
//     logger.error({ status: 500, error: err });
//     handle500Response(res);
//   }
// }

async function updateGrowth(req, res) {
  try {
    const id = req.params.id;
    const { children_id, date, weight, height, head_circum, arm_circum, note } =
      req.body;
    const result = await GrowthService.updateGrowth({
      id,
      children_id,
      date,
      weight,
      height,
      head_circum,
      arm_circum,
      note,
    });
    res.status(200).json({
      success: true,
      message: "Update Growth Successful",
      data: result,
    });
  } catch (err) {
    if (err.message == 404) {
      return handle404Response(res);
    }
    if (err.message == 409) {
      return handle404Response(res);
    }
    logger.error({ status: 500, error: err });
    handle500Response(res);
  }
}

async function deleteGrowth(req, res) {
  try {
    const result = await GrowthService.deleteGrowth(req.params.id);
    res.status(200).json({
      success: true,
      message: "Delete Growth Successful",
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
  addGrowth,
  getGrowth,
  getGrowthById,
  getGrowthByChildId,
  getGrowthByMonthYearAndChildId,
  // getGrowthOnMonth,
  updateGrowth,
  getLastGrowthByChildId,
  deleteGrowth,
};
