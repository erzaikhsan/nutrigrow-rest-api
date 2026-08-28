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
  "Imunisasi Balita",
  "2025-07-19 00:00:00.000 Z",
  "09:00",
  "11:00",
  "Balai Desa Jipang",
  "Program imunisasi balita di Balai Desa Jipang, tersedia semua jenis vaksin untuk anak. Seluruh orang tua diharapkan membawa anaknya dan FotoCopy KK.",
  "Village"
);

createEvent(
  uuidv4(),
  "Sosialisasi Kesehatan Gizi Balita",
  "2025-07-14 00:00:00.000 Z",
  "09:00",
  "11:00",
  "Balai Desa Jipang",
  "Sosialisasi kesehatan gizi balita di Balai Desa Jipang, silahkan hadir untuk mendapatkan informasi seputar gizi balita.",
  "Village"
);

createEvent(
  uuidv4(),
  "Kelas Ibu Hamil",
  "2025-07-18 00:00:00.000 Z",
  "10:00",
  "11:00",
  "Balai Desa Jipang",
  "Kelas ibu hamil di Balai Desa Jipang, silahkan hadir untuk mendapatkan informasi seputar kehamilan dan persalinan.",
  "Village"
);

createEvent(
  uuidv4(),
  "Kelas Ibu Balita",
  "2025-07-21 00:00:00.000 Z",
  "09:00",
  "11:00",
  "Balai Desa Jipang",
  "Kelas ibu balita di Balai Desa Jipang, silahkan hadir untuk mendapatkan informasi seputar perawatan balita.",
  "Village"
);

createEvent(
  uuidv4(),
  "Posyandu Balita Pamuji 1",
  "2025-07-19 00:00:00.000 Z",
  "09:00",
  "11:00",
  "Rumah Ibu Tarsiti",
  "Posyandu balita di RW 1, silahkan bawa anak anda untuk di cek kesehatannya.",
  "RW1"
);

createEvent(
  uuidv4(),
  "Posyandu Balita Pamuji 2",
  "2025-07-02 00:00:00.000 Z",
  "09:00",
  "11:00",
  "Rumah Ibu Mugiah",
  "Posyandu balita di RW 2, silahkan bawa anak anda untuk di cek kesehatannya.",
  "RW2"
);

createEvent(
  uuidv4(),
  "Posyandu Balita Pamuji 3",
  "2025-07-12 00:00:00.000 Z",
  "09:00",
  "11:00",
  "Rumah Ibu Lasmini",
  "Posyandu balita di RW 3, silahkan bawa anak anda untuk di cek kesehatannya.",
  "RW3"
);

createEvent(
  uuidv4(),
  "Posyandu Balita Pamuji 4",
  "2025-07-10 00:00:00.000 Z",
  "09:00",
  "11:00",
  "Rumah Ibu Wiwi",
  "Posyandu balita di RW 4, silahkan bawa anak anda untuk di cek kesehatannya.",
  "RW4"
);

createEvent(
  uuidv4(),
  "Posyandu Balita Pamuji 5",
  "2025-07-05 00:00:00.000 Z",
  "09:00",
  "11:00",
  "Rumah Ibu Yuli",
  "Posyandu balita di RW 5, silahkan bawa anak anda untuk di cek kesehatannya.",
  "RW4"
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
