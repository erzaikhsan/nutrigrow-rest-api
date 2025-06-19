const { VaccineService } = require("../services");
const logger = require("../utils/logger");
const {
  handle404Response,
  handle409Response,
  handle500Response,
} = require("../utils/response");

async function addVaccine(req, res) {
  try {
    const result = await VaccineService.addVaccine(req.body);
    res.status(201).json({
      success: true,
      message: "Add Vaccine Successful",
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

async function getVaccineById(req, res) {
  try {
    const result = await VaccineService.getVaccineById(req.params.id);
    res.status(200).json({
      success: true,
      message: "Get Vaccine By Id Successful",
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

async function getVaccineByChildId(req, res) {
  try {
    const result = await VaccineService.getVaccineByChildId(req.params.childId);
    res.status(200).json({
      success: true,
      message: "Get Vaccine By Children Id Successful",
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

async function updateVaccine(req, res) {
  try {
    const id = req.params.id;
    const { children_id, date, vaccine_name } = req.body;
    const result = await VaccineService.updateVaccine({
      id,
      children_id,
      date,
      vaccine_name,
    });
    res.status(200).json({
      success: true,
      message: "Update Vaccine Successful",
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

async function deleteVaccine(req, res) {
  try {
    const result = await VaccineService.deleteVaccine(req.params.id);
    res.status(200).json({
      success: true,
      message: "Delete Vaccine Successful",
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
  addVaccine,
  getVaccineById,
  getVaccineByChildId,
  updateVaccine,
  deleteVaccine,
};
