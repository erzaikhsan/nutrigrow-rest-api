const { EventModel } = require("../models");
const { Op } = require("sequelize");

async function addEvent(params) {
  const { id, title, date, start_time, end_time, place, description, region } =
    params;

  const event = await EventModel.create({
    id,
    title,
    date,
    start_time,
    end_time,
    place,
    description,
    region,
  });

  return event;
}

async function getEvents() {
  return EventModel.findAll({
    attributes: [
      "id",
      "title",
      "date",
      "start_time",
      "end_time",
      "place",
      "description",
      "region",
    ],
    order: [["date", "DESC"]],
  });
}

async function getEventById(id) {
  return EventModel.findByPk(id, {
    attributes: [
      "id",
      "title",
      "date",
      "start_time",
      "end_time",
      "place",
      "description",
      "region",
    ],
  });
}

async function getEventByRegion(region) {
  return EventModel.findAll({
    attributes: [
      "id",
      "title",
      "date",
      "start_time",
      "end_time",
      "place",
      "description",
      "region",
    ],
    where: {
      [Op.or]: [{ region: region }, { region: "Village" }],
    },
    order: [["date", "DESC"]],
  });
}

async function getEventByMonth(month, year, region) {
  return EventModel.findAll({
    attributes: [
      "id",
      "title",
      "date",
      "start_time",
      "end_time",
      "place",
      "description",
      "region",
    ],
    where: {
      date: {
        [Op.gte]: new Date(year, month, 1),
        [Op.lt]: new Date(year, month + 1, 1),
      },
      [Op.or]: [{ region: region }, { region: "Village" }],
    },
    order: [["date", "DESC"]],
  });
}

async function getEventToday(currentDate, region) {
  const startOfDay = new Date(currentDate);
  startOfDay.setUTCHours(0, 0, 0, 0); // awal hari

  const endOfDay = new Date(currentDate);
  endOfDay.setUTCHours(23, 59, 59, 999); // akhir hari

  return EventModel.findAll({
    attributes: [
      "id",
      "title",
      "date",
      "start_time",
      "end_time",
      "place",
      "description",
      "region",
    ],
    where: {
      date: {
        [Op.between]: [startOfDay, endOfDay],
      },
      [Op.or]: [{ region: region }, { region: "Village" }],
    },
    order: [["date", "DESC"]],
  });
}

async function updateEvent(data) {
  const { id, title, date, start_time, end_time, place, description, region } =
    data;

  const [rowsUpdated, updatedData] = await EventModel.update(
    {
      id,
      title,
      date,
      start_time,
      end_time,
      place,
      description,
      region,
    },
    {
      where: {
        id,
      },
      returning: true,
    }
  );

  return updatedData[0];
}

async function deleteEvent(id) {
  return await EventModel.destroy({
    where: {
      id: id,
    },
  });
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
