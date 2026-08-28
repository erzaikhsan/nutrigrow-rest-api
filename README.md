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

> **App Password Gmail.** Kredensial SMTP kini hanya berada di `.env`, yang
> tidak ikut ter-commit. Versi lama menuliskannya langsung di dalam kode
> sumber, sehingga nilainya masih terekam pada riwayat git di branch `main`
> (commit `87fd2b5`). Kalau sewaktu-waktu repo dibuka ke publik atau app
> password itu dicurigai bocor, cabut dan ganti lewat Google Account →
> Security → App passwords, lalu perbarui `.env` — riwayat git tidak perlu
> ikut dibersihkan asalkan kredensial lamanya sudah tidak berlaku.

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
scripts/               Perkakas sekali jalan, mis. impor tabel WHO
```

Implementasi lama berbasis Sequelize tidak lagi ikut di branch ini. Riwayatnya
tetap utuh di branch `main` bila sewaktu-waktu perlu dirujuk:

```bash
git show main:src/services/report.service.js
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

`src/domain/hcfa-reference.ts` adalah **berkas hasil generate** — jangan
disunting manual, karena akan tertimpa saat perintah di atas dijalankan lagi.

---

## Catatan metodologi

Keputusan perhitungan yang berpengaruh langsung ke hasil analisis. Seluruhnya
terpusat di `src/domain/`, sehingga perubahan cukup pada satu tempat.

**Z-score dihitung, bukan hanya kategorinya.** Tabel WHO di proyek ini memuat
garis SD (−3 sampai +3), bukan parameter LMS. Nilai di antara dua garis
diperoleh lewat interpolasi linear; nilai di luar ±3 SD diekstrapolasi memakai
lebar pita SD terluar, sesuai anjuran WHO. Hasilnya dibulatkan dua angka di
belakang koma.

**Kategori diturunkan dari z-score.** Ambangnya mengikuti WHO: `z < −3` sangat
kurang, `−3 ≤ z < −2` kurang, `−2 ≤ z ≤ 2` normal, `z > 2` lebih. Implementasi
sebelumnya membandingkan langsung ke garis SD dan tanpa sengaja memakai batas
berbeda antar indikator — tinggi tepat di −2 SD dinilai *stunted*, sedangkan
berat tepat di −2 SD dinilai normal. Kini keduanya konsisten.

**Umur dalam bulan penuh terlampaui.** Balita lahir 28 Juli yang ditimbang
1 Agustus berumur 0 bulan, dan baru 1 bulan pada 28 Agustus. Implementasi
sebelumnya memakai selisih bulan kalender sehingga baris tabel WHO yang dipakai
bergeser satu bulan.

**Ambang LiLA (MUAC)** untuk umur 6–59 bulan: `< 11,5 cm` gizi buruk akut,
`11,5–12,5 cm` gizi kurang akut. Di luar rentang umur itu tidak dinilai, dan
statusnya dibedakan dari "normal".

**Penandaan data meragukan.** Nilai dengan `|z| > 6` tetap disimpan tetapi
ditandai untuk diverifikasi, mengikuti praktik WHO Anthro. Menolaknya berisiko
membuang kasus gizi buruk yang justru paling perlu tercatat.

> **Perlu diverifikasi.** Tabel Kenaikan Berat Badan Minimum (KBM) di
> `src/domain/weight-gain.ts` mengikuti angka yang lazim dipakai pada Petunjuk
> Teknis Pemantauan Pertumbuhan Balita Kementerian Kesehatan RI. Mohon
> dicocokkan dengan edisi pedoman yang Anda rujuk di skripsi sebelum dipakai
> untuk analisis. Seluruh tabelnya berada pada satu konstanta agar koreksinya
> cukup satu tempat.

---

## Koreksi pada data semai

Dua ketidakcocokan pada data lama sudah diperbaiki. Keduanya dicatat di sini
dan pada komentar berkas datanya agar tetap dapat ditelusuri.

**1. Ukuran saat lahir berselisih antar tabel.** Data balita dan baris
penimbangan kelahiran mencatat angka berbeda untuk peristiwa yang sama:

| Kolom | Sebelum | Sesudah |
|---|---|---|
| Berat lahir | 3,2 kg | 3,4 kg |
| Tinggi lahir | 50 cm | 50,2 cm |
| Lingkar kepala lahir | 10 cm | 34,5 cm |

Nilai lama seragam untuk seluruh balita, jadi bukan hasil pengukuran per anak
melainkan nilai bawaan saat pengembangan. Angka 10 pada kolom lingkar kepala
berasal dari lingkar lengan (10,5 cm) — lingkar kepala bayi baru lahir tidak
mungkin 10 cm. Ketiganya kini mengikuti baris penimbangan kelahiran, yang
menjadi titik awal grafik pertumbuhan.

**2. Wilayah Posyandu Pamuji 5** semula `RW4`, kini `RW5`, sesuai empat
posyandu lainnya dan wilayah kadernya.
