const { EventService } = require("../services");
const logger = require("../utils/logger");
const {
  handle404Response,
  handle409Response,
  handle500Response,
} = require("../utils/response");

async function addEvent(req, res) {
  try {
    const result = await EventService.addEvent(req.body);
    res.status(201).json({
      success: true,
      message: "Add Event Successful",
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

async function getEvents(req, res) {
  try {
    const result = await EventService.getEvents();
    res.status(200).json({
      success: true,
      message: "Get All Events Successful",
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

async function getEventById(req, res) {
  try {
    const result = await EventService.getEventById(req.params.id);
    res.status(200).json({
      success: true,
      message: "Get Event By Id Successful",
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

async function getEventByRegion(req, res) {
  try {
    const result = await EventService.getEventByRegion(req.params.region);
    res.status(200).json({
      success: true,
      message: "Get Event By Region Successful",
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

async function getEventByMonth(req, res) {
  try {
    const result = await EventService.getEventByMonth(
      req.query.date,
      req.query.region
    );
    res.status(200).json({
      success: true,
      message: "Get Event By Month Successful",
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

async function getEventToday(req, res) {
  try {
    const result = await EventService.getEventToday(
      req.query.date,
      req.query.region
    );
    res.status(200).json({
      success: true,
      message: "Get Event Today Successful",
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

async function updateEvent(req, res) {
  try {
    const { title, date, start_time, end_time, place, description, region } =
      req.body;
    const result = await EventService.updateEvent({
      id: req.params.id,
      title,
      date,
      start_time,
      end_time,
      place,
      description,
      region,
    });
    res.status(200).json({
      success: true,
      message: "Update Event Successful",
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

async function deleteEvent(req, res) {
  try {
    const result = await EventService.deleteEvent(req.params.id);
    res.status(200).json({
      success: true,
      message: "Delete Event Successful",
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
  addEvent,
  getEvents,
  getEventById,
  getEventByRegion,
  getEventByMonth,
  getEventToday,
  updateEvent,
  deleteEvent,
};
