# NutriGrow REST API

Backend pemantauan gizi dan tumbuh kembang balita Posyandu Desa Jipang.

Express 5 · TypeScript · Prisma · PostgreSQL

---

## Menjalankan di CachyOS

### 1. Prasyarat

```bash
sudo pacman -S --needed nodejs npm postgresql
```

Periksa versinya — Prisma dan skrip di proyek ini butuh **Node 20.12 ke atas**
(`process.loadEnvFile` dipakai untuk memuat `.env` tanpa paket tambahan):

```bash
node -v
```

### 2. Menyiapkan PostgreSQL

Kalau PostgreSQL baru dipasang, klaster datanya perlu diinisialisasi lebih dulu:

```bash
sudo -u postgres initdb -D /var/lib/postgres/data
sudo systemctl enable --now postgresql
```

Lalu buat basis data dan penggunanya:

```bash
sudo -u postgres psql <<'SQL'
CREATE USER nutrigrow WITH PASSWORD 'nutrigrow';
CREATE DATABASE nutrigrow OWNER nutrigrow;
SQL
```

### 3. Konfigurasi

```bash
cp .env.example .env
```

Buka `.env` dan sesuaikan:

| Variabel | Keterangan |
|---|---|
| `DATABASE_URL` | `postgresql://nutrigrow:nutrigrow@localhost:5432/nutrigrow?schema=public` |
| `JWT_SECRET` | Wajib minimal 32 karakter. Buat dengan `openssl rand -base64 48` |
| `SMTP_*` | Kredensial pengirim OTP. Untuk uji coba lokal boleh diisi apa saja — pengiriman surel baru dipanggil saat mendaftar |
| `ACCOUNT_ACTIVE_YEARS` | Masa aktif akun sejak pendaftaran |

Server menolak jalan bila ada variabel yang tidak valid, lengkap dengan
keterangan variabel mana yang bermasalah.

### 4. Pasang, migrasi, semai

```bash
npm install
npm run db:migrate      # membuat tabel dan seluruh indeks
npm run db:seed         # mengisi data penelitian Desa Jipang
```

### 5. Jalankan

```bash
npm run dev
```

Server siap di `http://localhost:3000/api/v1`. Cek cepat:

```bash
curl http://localhost:3000/health
```

### 6. Menghubungkan aplikasi Android

Cari alamat IP laptop di jaringan lokal:

```bash
ip -4 addr show | grep inet
```

Lalu ubah `baseUrl` di `nutrigrow-app/app/src/main/java/com/project/labs/nutrigrow/data/remote/retrofit/ApiConfig.kt`
menjadi `http://<IP-laptop>:3000/api/v1/`. Ponsel dan laptop harus berada di
jaringan WiFi yang sama.

Bila firewall aktif, izinkan portnya:

```bash
sudo firewall-cmd --add-port=3000/tcp   # tanpa --permanent, hanya sesi ini
```

---

## Akun hasil penyemaian

Seluruh akun memakai kata sandi **`password123`**.

| Peran | Surel | Wilayah |
|---|---|---|
| Admin | `nutrigrow.ofc@gmail.com` | Village |
| Kader | `tarsiti@gmail.com` | RW1 |
| Kader | `mugiah@gmail.com` | RW2 |
| Orang tua | `uswatun@gmail.com` | RW1 |

---

## Perintah

| Perintah | Kegunaan |
|---|---|
| `npm run dev` | Server pengembangan dengan muat ulang otomatis |
| `npm run build` | Kompilasi TypeScript ke `dist/` |
| `npm start` | Menjalankan hasil kompilasi |
| `npm run typecheck` | Pemeriksaan tipe tanpa menghasilkan berkas |
| `npm run db:migrate` | Membuat dan menerapkan migrasi |
| `npm run db:reset` | Mengosongkan lalu memigrasi dan menyemai ulang |
| `npm run db:seed` | Menyemai ulang data |
| `npm run db:studio` | Penjelajah basis data berbasis web |
| `npm run who:import-hcfa` | Mengimpor tabel WHO lingkar kepala |

---

## Struktur

```
prisma/
  schema.prisma        Skema basis data beserta seluruh indeks
  seed/                Penyemaian; data penelitian ada di seed/data
src/
  config/              Validasi environment saat boot
  core/                Galat, respons, serialisasi, logger, klien Prisma
  domain/              Aturan gizi: standar WHO, z-score, LiLA, KMS
  middlewares/         Autentikasi, pembatas peran, penangan galat
  modules/             Satu folder per fitur: route, controller, service, skema
legacy/                Implementasi lama, disimpan sebagai rujukan
```

Ketergantungan mengalir satu arah: `modules` memakai `domain` dan `core`,
sementara `domain` tidak mengetahui apa pun tentang HTTP maupun basis data —
seluruh aturan gizi bisa diuji tanpa menyalakan server.

---

## Tabel WHO lingkar kepala

Lingkar kepala dinilai hanya setelah tabel rujukan WHO diimpor. Unduh berkas
*head circumference-for-age, expanded tables* (format txt) untuk anak laki-laki
dan perempuan dari situs WHO Child Growth Standards, lalu:

```bash
npm run who:import-hcfa -- hcfa-boys.txt hcfa-girls.txt
```

Sebelum diimpor, lingkar kepala tetap dicatat dan statusnya `Unknown`. Angkanya
sengaja tidak ditulis tangan agar tidak ada nilai rujukan yang tidak
terverifikasi masuk ke dalam analisis.

---

## Catatan untuk data penelitian

Dua hal yang perlu diperiksa pada data semai (keduanya berasal dari data lama
dan sengaja tidak diubah diam-diam):

1. **`birth_head_circum` bernilai 10 untuk seluruh balita.** Lingkar kepala bayi
   baru lahir normalnya sekitar 34–35 cm, dan baris penimbangan saat lahir pada
   data yang sama mencatat 34,5. Nilai 10 tampaknya lingkar lengan yang tersalin
   ke kolom lingkar kepala.

2. **Kegiatan "Posyandu Balita Pamuji 5" berwilayah `RW4`**, sementara empat
   posyandu lain berpasangan dengan RW-nya masing-masing.
