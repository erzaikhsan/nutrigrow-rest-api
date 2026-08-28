const { EventRepository } = require("../repositories");
// const { parseISO, getMonth, getYear } = require("date-fns");
const { v4: uuidv4 } = require("uuid");

async function addEvent(params) {
  const { title, date, start_time, end_time, place, description, region } =
    params;

  const event = await EventRepository.addEvent({
    id: uuidv4(),
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
  const events = await EventRepository.getEvents();
  if (!events) {
    throw new Error(404);
  }

  return events;
}

async function getEventById(id) {
  const event = await EventRepository.getEventById(id);
  if (!event) {
    throw new Error(404);
  }

  return event;
}

async function getEventByRegion(region) {
  const event = await EventRepository.getEventByRegion(region);
  if (!event) {
    throw new Error(404);
  }

  return event;
}

async function getIncomingEvent(date, region) {
  const events = await EventRepository.getIncomingEvent(date, region);
  if (!events) {
    throw new Error(404);
  }

  return events;
}

// async function getEventByMonth(date, region) {
//   const month = new Date(date).getMonth();
//   const year = new Date(date).getFullYear();

//   const events = await EventRepository.getEventByMonth(month, year, region);
//   if (!events) {
//     throw new Error(404);
//   }

//   return events;
// }

async function getEventToday(date, region) {
  const events = await EventRepository.getEventToday(date, region);
  if (!events) {
    throw new Error(404);
  }

  return events;
}

async function updateEvent(data) {
  const { id, title, date, start_time, end_time, place, description, region } =
    data;

  const event = await EventRepository.getEventById(id);
  if (!event) {
    throw new Error(404);
  }

  return EventRepository.updateEvent({
    id,
    title,
    date,
    start_time,
    end_time,
    place,
    description,
    region,
  });
}

async function deleteEvent(id) {
  const event = await EventRepository.getEventById(id);
  if (!event) {
    throw new Error(404);
  }

  await EventRepository.deleteEvent(id);

  return event;
}

module.exports = {
  addEvent,
  getEvents,
  getEventById,
  getEventByRegion,
  getIncomingEvent,
  getEventToday,
  updateEvent,
  deleteEvent,
};
