# NutriGrow REST API

Backend pemantauan gizi dan tumbuh kembang balita Posyandu Desa Jipang.

Express 5 · TypeScript · Prisma · PostgreSQL

---

## Menjalankan di CachyOS

### 1. Prasyarat

```bash
sudo pacman -S --needed nodejs postgresql
```

Proyek ini memakai **yarn** (`yarn.lock`), bukan npm. Bila belum ada:

```bash
sudo pacman -S --needed yarn
```

Periksa versi Node — minimal **20.12**, karena `process.loadEnvFile()` dipakai
untuk memuat `.env` tanpa paket tambahan:

```bash
node -v
```

### 2. Menyiapkan PostgreSQL

Klaster datanya perlu diinisialisasi lebih dulu:

```bash
sudo -u postgres initdb --locale=en_US.UTF-8 -E UTF8 -D /var/lib/postgres/data
sudo systemctl enable --now postgresql
```

Lalu buat basis data dan penggunanya:

```bash
sudo -u postgres psql <<'SQL'
CREATE USER nutrigrow WITH PASSWORD 'nutrigrow' CREATEDB;
CREATE DATABASE nutrigrow OWNER nutrigrow;
SQL
```

> `CREATEDB` diperlukan hanya bila kelak menjalankan `prisma migrate dev` untuk
> membuat migrasi baru — perintah itu membuat *shadow database* sementara untuk
> mendeteksi drift, dan gagal tanpa hak tersebut. Untuk sekadar menjalankan
> migrasi yang sudah ada (`db:deploy`), hak itu tidak dibutuhkan.

### 3. Konfigurasi

```bash
cp .env.example .env
```

Buka `.env` dan sesuaikan:

| Variabel | Keterangan |
|---|---|
| `DATABASE_URL` | `postgresql://nutrigrow:nutrigrow@localhost:5432/nutrigrow?schema=public` |
| `JWT_SECRET` | Wajib minimal 32 karakter. Buat dengan `openssl rand -base64 48` |
| `SMTP_USER` | **Harus berbentuk alamat surel yang sah** — divalidasi `z.string().email()`. Untuk uji lokal, alamat apa pun yang berformat benar sudah cukup |
| `SMTP_HOST`, `SMTP_PASSWORD` | Wajib terisi, tidak punya nilai bawaan. Untuk uji lokal boleh diisi apa saja |
| `ACCOUNT_ACTIVE_YEARS` | Masa aktif akun sejak pendaftaran |

Server menolak jalan bila ada variabel yang tidak valid, lengkap dengan
keterangan variabel mana yang bermasalah. Pengiriman surel baru benar-benar
dipanggil saat pendaftaran dan lupa kata sandi, jadi nilai SMTP palsu tidak
mengganggu pemakaian lain.

> **App Password Gmail.** Kredensial SMTP kini hanya berada di `.env`, yang
> tidak ikut ter-commit. Versi lama menuliskannya langsung di dalam kode
> sumber, sehingga nilainya masih terekam pada riwayat git di branch `main`
> (commit `87fd2b5`). Kalau sewaktu-waktu repo dibuka ke publik atau app
> password itu dicurigai bocor, cabut dan ganti lewat Google Account →
> Security → App passwords, lalu perbarui `.env` — riwayat git tidak perlu
> ikut dibersihkan asalkan kredensial lamanya sudah tidak berlaku.

### 4. Pasang, migrasi, semai

```bash
yarn install
yarn db:generate        # tipe Prisma Client — wajib sebelum typecheck
yarn db:deploy          # menerapkan prisma/migrations/0_init
npx prisma db seed      # mengisi data penelitian Desa Jipang
```

> **Jangan memakai `yarn db:seed` di sini.** Skrip itu menjalankan `tsx`
> langsung, dan **Prisma Client tidak membaca `.env`** — hanya Prisma CLI yang
> membacanya. Akibatnya `yarn db:seed` berhenti dengan "Environment variable
> not found: DATABASE_URL" meski `.env` sudah benar. `npx prisma db seed`
> memuat `.env` lebih dulu lalu memanggil skrip yang sama. Alternatifnya:
> `DATABASE_URL="..." yarn db:seed`.

> Penyemaian memanggil `clearDatabase()` yang mengosongkan seluruh tabel lebih
> dulu. Aman di basis data lokal, **tidak pernah** di produksi tanpa disengaja.

### 5. Jalankan

```bash
yarn dev
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

## Deploy ke Render + Neon

Aplikasi dijalankan sebagai proses Node biasa di Render (paket free), dengan
PostgreSQL terkelola di Neon. Berkas `render.yaml` di akar repo sudah memuat
seluruh konfigurasinya.

Yang wajib ikut ter-commit sebelum deploy pertama: **`yarn.lock`**,
**`prisma/migrations/`**, `render.yaml`, dan `.node-version`. Tanpa
`prisma/migrations/`, build akan sukses tetapi database produksi lahir tanpa
tabel sama sekali.

### 1. Database di Neon

Buat project baru, region Singapore. Salin connection string **direct
(unpooled)** — bukan yang pooled.

Pooler diperlukan hanya bila ada banyak proses; satu instans server berumur
panjang tidak membutuhkannya, dan `prisma migrate deploy` justru gagal bila
dijalankan lewat pgbouncer dalam mode transaksi.

### 2. Layanan di Render

Buat Blueprint baru dan arahkan ke repo ini. Render membaca `render.yaml`
otomatis. Empat nilai bertanda `sync: false` diisi lewat dashboard:

| Kunci | Isi |
|---|---|
| `DATABASE_URL` | Connection string direct dari Neon |
| `JWT_SECRET` | Buat baru: `openssl rand -base64 48`. Jangan pakai nilai yang sama dengan lokal |
| `SMTP_USER` | Alamat Gmail pengirim OTP |
| `SMTP_PASSWORD` | App password Google 16 karakter |

`PORT` **jangan diisi** — Render menyuntikkannya sendiri dan `src/config/env.ts`
sudah membacanya. `CORS_ORIGINS` dibiarkan kosong: Retrofit adalah klien HTTP
native, tidak mengirim header `Origin`, jadi CORS tidak berlaku baginya.

Build command menjalankan `yarn db:deploy` (`prisma migrate deploy`). Perintah
itu idempoten — hanya menerapkan migrasi yang belum pernah jalan — jadi aman
diulang setiap deploy.

> **Jangan hapus `--production=false` dari build command.** Yarn 1 tidak memasang
> `devDependencies` bila `NODE_ENV` bernilai `production`, dan `render.yaml`
> memang menyetel `NODE_ENV=production`. Tanpa bendera itu, `prisma`,
> `typescript`, dan `tsx` tidak ikut terpasang, lalu build berhenti pada
> `yarn db:generate` dengan pesan "prisma: command not found".

### 3. Semai data produksi

Dijalankan **manual dari laptop**, sekali saja, setelah deploy pertama berhasil:

```bash
DATABASE_URL="<connection-string-neon>" yarn db:seed
```

> `db:seed` memanggil `clearDatabase()` yang mengosongkan seluruh tabel lebih
> dulu. Itu tepat untuk database yang baru lahir dan berbahaya setelahnya.
> Inilah alasan penyemaian tidak pernah diletakkan di build command.

`db:recompute` **tidak perlu dijalankan** pada database yang baru disemai:
`db:seed` sudah menghitung status memakai ambang Permenkes yang berlaku
sekarang. Perintah itu hanya untuk database yang sudah berisi data lama.

### 4. Menahan instans agar tidak tidur

Instans free Render tidur setelah ~15 menit tanpa permintaan, dan permintaan
berikutnya menunggu 30–60 detik sampai bangun.

Daftarkan job di cron-job.org atau UptimeRobot: `GET https://<host>/health`
setiap 10 menit. Endpoint itu sudah dikecualikan dari log akses, jadi ping tidak
mengotori log.

Ping 24/7 selama sebulan memakai sekitar 730 dari 750 jam kuota bulanan.
Marginnya tipis dan kuota itu dibagi dengan layanan free lain di akun yang sama,
jadi **nyalakan ping menjelang sidang dan matikan setelahnya.**

### 5. Verifikasi

```bash
curl https://<host>/health
```

Harus mengembalikan `{"success":true,"message":"NutriGrow API aktif","data":null}`.

Lalu, lewat URL produksi:

1. Login sebagai Admin, Kader, dan Orang tua.
2. Ambil satu daftar penimbangan dan pastikan tanggalnya berformat
   `"2023-07-28 00:00:00.000 Z"` — bukan ISO 8601. Aplikasi Android menguraikan
   format ini dengan pola ketat; bila berubah, tiga layar berhenti bekerja.
3. Panggil satu endpoint daftar anak **tanpa** token dan pastikan ditolak 401.
   Database produksi memuat nama balita dan orang tua yang sebenarnya.
4. Uji `registerOfficer` memakai token Admin.

### 6. Menghubungkan aplikasi Android ke produksi

Ubah `baseUrl` di `ApiConfig.kt` menjadi `https://<host>/api/v1/`. Karena
HTTPS, aplikasi tidak memerlukan `usesCleartextTraffic` maupun network security
config — berbeda dengan menunjuk ke IP laptop di WiFi lokal.

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
| `yarn dev` | Server pengembangan dengan muat ulang otomatis |
| `yarn build` | Kompilasi TypeScript ke `dist/` |
| `yarn start` | Menjalankan hasil kompilasi |
| `yarn typecheck` | Pemeriksaan tipe tanpa menghasilkan berkas |
| `yarn db:generate` | Membuat tipe Prisma Client |
| `yarn db:migrate` | Membuat migrasi baru (butuh hak `CREATEDB`) |
| `yarn db:deploy` | Menerapkan migrasi yang sudah ada |
| `yarn db:reset` | Mengosongkan lalu memigrasi dan menyemai ulang |
| `npx prisma db seed` | Menyemai ulang data — **bukan** `yarn db:seed`, lihat bagian 4 |
| `yarn db:studio` | Penjelajah basis data berbasis web |
| `node scripts/import-who-hcfa.ts` | Mengimpor tabel WHO lingkar kepala |

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

`src/domain/hcfa-reference.ts` **sudah terisi**: 61 baris (umur 0–60 bulan)
untuk masing-masing jenis kelamin, diambil dari WHO Child Growth Standards.

Sumbernya, bila perlu diambil ulang:

```
https://cdn.who.int/media/docs/default-source/child-growth/child-growth-standards/
  indicators/head-circumference-for-age/hcfa-boys-0-5-zscores.xlsx
  indicators/head-circumference-for-age/hcfa-girls-0-5-zscores.xlsx
```

Dua jebakan pada langkah ini:

- **Alamat `.txt` lama di `who.int/childgrowth/…` sudah 404.** WHO kini hanya
  menyajikan `.xlsx`, jadi berkasnya perlu dikonversi ke teks berpemisah tab
  sebelum diumpankan ke skrip impor.
- **Jangan memakai berkas *expanded tables*.** Berkas itu disusun **per hari**
  (kolom `Day`, 1.857 baris) dan tidak punya kolom `Month`; skrip impor akan
  berhenti dengan "Kolom umur tidak ditemukan". Yang dipakai adalah tabel
  `0-5-zscores` yang berkolom `Month, L, M, S, SD, SD3neg … SD3`.

Setelah dikonversi jadi TSV:

```bash
node scripts/import-who-hcfa.ts hcfa-boys.txt hcfa-girls.txt
```

Skripnya menerima pemisah tab, spasi ganda, maupun spasi tunggal, dan mengenali
nama kolom `Month`/`Age`, `SD0`/`M`/`Median`, `SD1`–`SD3`, serta
`SD1neg`–`SD3neg`.

Angka rujukannya sengaja tidak pernah ditulis tangan, agar tidak ada nilai yang
tidak terverifikasi masuk ke dalam analisis. Bila berkas rujukan dikosongkan
lagi, lingkar kepala tetap dicatat tetapi statusnya menjadi `Unknown` dan
z-score-nya `null` — bukan galat.

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

**Kategori diturunkan dari z-score, mengikuti Permenkes 2/2020.** Ambangnya
diambil dari Lampiran B "Kategori dan Ambang Batas Status Gizi Anak":

| Indeks | Kategori | Ambang |
|---|---|---|
| BB/U | Berat badan sangat kurang | `z < −3` |
| | Berat badan kurang | `−3 ≤ z < −2` |
| | Berat badan normal | `−2 ≤ z ≤ +1` |
| | Risiko berat badan lebih | `z > +1` |
| TB/U | Sangat pendek | `z < −3` |
| | Pendek | `−3 ≤ z < −2` |
| | Normal | `−2 ≤ z ≤ +3` |
| | Tinggi | `z > +3` |
| BB/TB | Gizi buruk | `z < −3` |
| | Gizi kurang | `−3 ≤ z < −2` |
| | Gizi baik | `−2 ≤ z ≤ +1` |
| | Berisiko gizi lebih | `+1 < z ≤ +2` |
| | Gizi lebih | `+2 < z ≤ +3` |
| | Obesitas | `z > +3` |

Implementasi sebelumnya memakai pembagian WHO — normal sampai `+2` pada BB/U dan
BB/TB, tanpa kategori "Tinggi" pada TB/U, dan menggabungkan gizi lebih dengan
obesitas. Padahal label yang ditampilkan aplikasi Android sudah memakai istilah
Permenkes, sehingga balita dengan BB/U `z = +1,5` tampil sebagai "Berat Badan
Normal" walaupun menurut Permenkes ia "Risiko Berat Badan Lebih". Ambang dan
label kini sejalan.

Implementasi yang lebih lama lagi membandingkan langsung ke garis SD dan tanpa
sengaja memakai batas berbeda antar indikator — tinggi tepat di −2 SD dinilai
*stunted*, sedangkan berat tepat di −2 SD dinilai normal. Keduanya sudah
konsisten sejak penulisan ulang v2.

> **Sesudah mengubah ambang, jalankan `npm run db:recompute`.** Z-score yang
> tersimpan tidak berubah, tetapi kategorinya perlu dinilai ulang untuk seluruh
> baris penimbangan yang sudah ada.

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

**Umur 24 bulan memakai tabel telentang.** Permenkes memuat umur 24 bulan pada
dua tabel: PB/U (diukur telentang) dan TB/U (diukur berdiri), yang berbeda
sekitar 0,7 cm. Karena aplikasi hanya menyimpan satu kolom tinggi tanpa penanda
cara pengukuran, bulan ke-24 memakai tabel telentang dan beralih ke tabel berdiri
mulai bulan ke-25. BB/PB dan BB/TB memakai pembagian yang sama.

### Hasil validasi terhadap sumber resmi

Seluruh tabel rujukan sudah dicocokkan baris per baris, bukan sampel:

| Tabel | Sumber pembanding | Baris | Selisih |
|---|---|---|---|
| BB/U, PB/U, TB/U, BB/PB, BB/TB | Permenkes 2/2020, Tabel 1–5 dan 8–12 | 730 | 0 |
| LK/U | WHO *head circumference-for-age z-scores* | 122 | 0 |

Galat interpolasi terhadap rumus LMS, diuji pada 244.061 titik per indikator:
rata-rata **0,015–0,020 SD** di dalam ±3 SD, naik menjadi **0,03–0,07 SD** di
luar ±3 SD dengan maksimum 0,29 SD. Beda kategori 1,2–1,7 %, dan hampir
seluruhnya terjadi tepat di garis SD karena tabel Permenkes sendiri dibulatkan
satu angka di belakang koma — kader yang menghitung manual dengan tabel cetak
akan memperoleh jawaban yang sama dengan aplikasi.

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
