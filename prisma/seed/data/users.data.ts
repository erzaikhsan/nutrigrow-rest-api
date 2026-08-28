/**
 * Data pengguna hasil penelitian di Desa Jipang.
 *
 * Blok pemanggilan di bawah disalin apa adanya dari seeder lama
 * (main:src/seeders/user.seeder.js) supaya isinya tidak berubah sedikit pun.
 * Yang diganti hanya fungsi penampungnya: kata sandi tidak lagi di-hash di
 * sini melainkan saat penyemaian, dan id lama seperti "P1" dipertahankan
 * sebagai penanda relasi lalu dipetakan ke UUID.
 */

export interface SeedUser {
  legacyId: string;
  email: string;
  password: string;
  role: "Parent" | "Officer" | "Admin";
  isActive: boolean;
  fullName: string;
  gender: "M" | "F";
  dateOfBirth: string;
  phoneNumber: string;
  address: string;
  region: "RW1" | "RW2" | "RW3" | "RW4" | "RW5" | "Village";
  activePeriod: Date;
}

export const users: SeedUser[] = [];

const createUser = (
  legacyId: string,
  email: string,
  password: string,
  role: SeedUser["role"],
  isActive: boolean,
  fullName: string,
  gender: SeedUser["gender"],
  dateOfBirth: string,
  phoneNumber: string,
  address: string,
  region: SeedUser["region"],
  activePeriod: Date,
): void => {
  users.push({
    legacyId,
    email,
    password,
    role,
    isActive,
    fullName,
    gender,
    dateOfBirth,
    phoneNumber,
    address,
    region,
    activePeriod,
  });
};

// ---------------------------------------------------------------------------
// Disalin dari seeder lama mulai dari sini.
// ---------------------------------------------------------------------------

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

