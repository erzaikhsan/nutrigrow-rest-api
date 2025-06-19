const { EventModel } = require("../models");
const logger = require("../utils/logger");
const { v4: uuidv4 } = require("uuid");

const events = [];

const createEvent = (
  id,
  title,
  date,
  start_time,
  end_time,
  place,
  description,
  region
) => {
  const event = {
    id,
    title,
    date,
    start_time,
    end_time,
    place,
    description,
    region,
  };
  events.push(event);
};

createEvent(
  uuidv4(),
  "Imunisasi Bayi Dan Balita",
  "2025-06-17 17:00:00.000 Z",
  "09:00",
  "11:00",
  "Balai Desa Jipang",
  "Program imunisasi bayi dan balita di Balai Desa Jipang, tersedia semua jenis vaksin untuk anak. Seluruh orang tua diharapkan membawa anaknya dan jangan lupa membawa buku KIA dan FotoCopy KK yang sudah diberi Nomor HP.",
  "Village"
);
createEvent(
  uuidv4(),
  "Posyandu Balita RW 1",
  "2025-06-16 17:00:00.000 Z",
  "08:00",
  "10:00",
  "Posyandu RW 1",
  "Posyandu balita di RW1, silahkan bawa anak anda untuk di cek kesehatannya.",
  "RW1"
);
createEvent(
  uuidv4(),
  "Posyandu Balita RW 2",
  "2025-06-08 17:00:00.000 Z",
  "08:00",
  "10:00",
  "Posyandu RW 2",
  "Posyandu balita di RW2, silahkan bawa anak anda untuk di cek kesehatannya.",
  "RW2"
);
createEvent(
  uuidv4(),
  "Posyandu Balita RW 3",
  "2025-06-10 17:00:00.000 Z",
  "08:00",
  "10:00",
  "Posyandu RW 3",
  "Posyandu balita di RW3, silahkan bawa anak anda untuk di cek kesehatannya.",
  "RW3"
);
createEvent(
  uuidv4(),
  "Posyandu Balita RW 4",
  "2025-06-14 17:00:00.000 Z",
  "08:00",
  "10:00",
  "Posyandu RW 4",
  "Posyandu balita di RW4, silahkan bawa anak anda untuk di cek kesehatannya.",
  "RW4"
);

createEvent(
  uuidv4(),
  "Sosialisasi Kesehatan Gizi Balita",
  "2025-06-09 17:00:00.000 Z",
  "08:00",
  "10:00",
  "Balai Desa Jipang",
  "Sosialisasi kesehatan gizi balita di Balai Desa Jipang, silahkan hadir untuk mendapatkan informasi seputar gizi balita.",
  "Village"
);

const seedEvent = async () => {
  try {
    await EventModel.bulkCreate(events);
    logger.info("Event seed data inserted successfully.");
  } catch (error) {
    logger.error("Error seeding Event data:", error);
  }
};

module.exports = seedEvent;
