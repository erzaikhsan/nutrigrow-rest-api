const bcrypt = require("bcrypt");
const { UserModel } = require("../models");
const logger = require("../utils/logger");
const { v4: uuidv4 } = require("uuid");

const users = [];

// const createUser = (id, email, password, role, is_active) => {
//   const hashedPassword = bcrypt.hashSync(password, 10);
//   const user = { id, email, password: hashedPassword, role, is_active };
//   users.push(user);
// };

const createUser = (
  id,
  email,
  password,
  role,
  is_active,
  full_name,
  gender,
  date_of_birth,
  phone_number,
  address,
  region,
  active_period
) => {
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = {
    id,
    email,
    password: hashedPassword,
    role,
    is_active,
    full_name,
    gender,
    date_of_birth,
    phone_number,
    address,
    region,
    active_period,
  };
  users.push(user);
};

// createUser("P1", "alice.johnson@gmail.com", "password123", "Parent", true);
// createUser("P2", "bob.williams@gmail.com", "password123", "Parent", false);
// createUser("P3", "carol.davis@gmail.com", "password123", "Parent", false);
// createUser("P4", "david.miller@gmail.com", "password123", "Parent", true);
// createUser("P5", "eva.garcia@gmail.com", "password123", "Parent", false);

// createUser("O1", "admin.ofc@gmail.com", "password123", "Admin", true);
// createUser("O6", "daniel.ofc@gmail.com", "password123", "Officer", true);
// createUser("O7", "cornelia.ofc@gmail.com", "password123", "Officer", true);

// Create Admin User
createUser(
  "A1",
  "nutrigrow.ofc@gmail.com",
  "password123",
  "Admin",
  true,
  "Super Admin",
  "M",
  "1995-05-14 17:00:00.000 Z",
  `+081234567890`,
  `Desa Jipang, Kecamatan Karanglewas, Kabupaten Banyumas`,
  "Village",
  new Date("9999-12-31 23:59:59.000 Z")
);

// Create Parent Users
//RW1
createUser(
  "P1",
  "uswatun@gmail.com",
  "password123",
  "Parent",
  true,
  "Uswatun Khasanah",
  "F",
  "1999-03-15 00:00:00.000 Z",
  "081234567890",
  "Desa Jipang Rt 01/01",
  "RW1",
  new Date("2045-07-16 00:00:00.000 Z")
);
createUser(
  "P2",
  "dwiratna@gmail.com",
  "password123",
  "Parent",
  true,
  "Dwi Ratna Sari",
  "F",
  "1997-07-22 00:00:00.000 Z",
  "081234567891",
  "Desa Jipang Rt 01/01",
  "RW1",
  new Date("2045-07-16 00:00:00.000 Z")
);
createUser(
  "P3",
  "miladia@gmail.com",
  "password123",
  "Parent",
  true,
  "Miladia Nur Khasanah",
  "F",
  "1998-11-08 00:00:00.000 Z",
  "081234567892",
  "Desa Jipang Rt 03/01",
  "RW1",
  new Date("2045-07-16 00:00:00.000 Z")
);
createUser(
  "P4",
  "sitinur@gmail.com",
  "password123",
  "Parent",
  true,
  "Siti Nurhaliza",
  "F",
  "1999-05-12 00:00:00.000 Z",
  "081234567893",
  "Desa Jipang Rt 02/01",
  "RW1",
  new Date("2045-07-16 00:00:00.000 Z")
);

//RW2
createUser(
  "P5",
  "rinawati@gmail.com",
  "password123",
  "Parent",
  true,
  "Rina Wati",
  "F",
  "1999-03-15 00:00:00.000 Z",
  "081234567890",
  "Desa Jipang Rt 01/02",
  "RW2",
  new Date("2045-07-16 00:00:00.000 Z")
);
createUser(
  "P6",
  "mayasari@gmail.com",
  "password123",
  "Parent",
  true,
  "Maya Sari",
  "F",
  "1996-01-07 00:00:00.000 Z",
  "081234567890",
  "Desa Jipang Rt 03/02",
  "RW2",
  new Date("2045-07-16 00:00:00.000 Z")
);
createUser(
  "P7",
  "indahpermata@gmail.com",
  "password123",
  "Parent",
  true,
  "Indah Permata",
  "F",
  "1998-09-10 00:00:00.000 Z",
  "081234567890",
  "Desa Jipang Rt 01/02",
  "RW2",
  new Date("2045-07-16 00:00:00.000 Z")
);

//RW3
createUser(
  "P8",
  "intan@gmail.com",
  "password123",
  "Parent",
  true,
  "Intan Ayu Sari",
  "F",
  "1998-09-13 00:00:00.000 Z",
  "081234567890",
  "Desa Jipang Rt 01/03",
  "RW3",
  new Date("2045-07-16 00:00:00.000 Z")
);

// Create Officer Users
createUser(
  "O1",
  "tarsiti@gmail.com",
  "password123",
  "Officer",
  true,
  "Tarsiti",
  "F",
  "1990-05-20 00:00:00.000 Z",
  "081234567890",
  "Desa Jipang Rt 01/01",
  "RW1",
  new Date("2045-07-16 00:00:00.000 Z")
);
createUser(
  "O2",
  "mugiah@gmail.com",
  "password123",
  "Officer",
  true,
  "Mugiah",
  "F",
  "1992-07-28 00:00:00.000 Z",
  "081234567890",
  "Desa Jipang Rt 02/02",
  "RW2",
  new Date("2045-07-16 00:00:00.000 Z")
);
createUser(
  "O3",
  "lasmini@gmail.com",
  "password123",
  "Officer",
  true,
  "Lasmini",
  "F",
  "1994-02-05 00:00:00.000 Z",
  "081234567890",
  "Desa Jipang Rt 02/03",
  "RW3",
  new Date("2045-07-16 00:00:00.000 Z")
);
createUser(
  "O4",
  "wiwindar@gmail.com",
  "password123",
  "Officer",
  true,
  "Wiwi Indarwati",
  "F",
  "1996-01-25 00:00:00.000 Z",
  "081234567890",
  "Desa Jipang Rt 01/04",
  "RW4",
  new Date("2045-07-16 00:00:00.000 Z")
);
createUser(
  "O5",
  "yulitri@gmail.com",
  "password123",
  "Officer",
  true,
  "Yuli Triawati",
  "F",
  "1994-01-16 00:00:00.000 Z",
  "081234567890",
  "Desa Jipang Rt 02/05",
  "RW5",
  new Date("2045-07-16 00:00:00.000 Z")
);

const seedUsers = async () => {
  try {
    await UserModel.bulkCreate(users);
    logger.info("User seed data inserted successfully.");
  } catch (error) {
    logger.error("Error seeding user data:", error);
  }
};

module.exports = seedUsers;
