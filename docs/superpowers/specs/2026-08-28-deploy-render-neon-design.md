# Desain: Deploy nutrigrow-rest-api ke Render + Neon

Tanggal: 2026-08-28
Status: berkas deploy sudah dibuat; menunggu pelaksanaan oleh user
Branch kerja: `dev`

---

## Tujuan

Menaikkan backend NutriGrow ke URL HTTPS publik yang stabil sampai sidang
skripsi selesai, tanpa biaya, dan **tanpa menyentuh apa pun di `src/`**.

Setelah ini selesai, aplikasi Android bisa menunjuk ke satu `baseUrl` tetap dan
fase peningkatan frontend bisa dimulai tanpa laptop harus menyala.

## Bukan tujuan

- Custom domain
- CI/CD, uji otomatis, atau gerbang mutu sebelum deploy
- Monitoring, alerting, atau agregasi log di luar log bawaan Render
- Backup terjadwal di luar bawaan Neon
- Ketahanan tingkat produksi sungguhan (satu instans, tanpa redundansi)

---

## Keadaan awal

Fakta yang sudah diperiksa di repo, dan yang membentuk desain ini:

| Fakta | Konsekuensi |
|---|---|
| Backend **belum pernah dikompilasi** — `dist` dan `.env` belum ada (`node_modules` sudah terpasang lewat yarn) | Kompilasi pertama adalah tahap 1, bukan tahap opsional |
| ~~`prisma/migrations/` **tidak ada**~~ | **Sudah diselesaikan 2026-08-28**: `0_init` dibuat lewat `prisma migrate diff`, tanpa perlu database |
| ~~`src/domain/hcfa-reference.ts` masih rintisan kosong~~ | **Sudah diselesaikan 2026-08-28**: 61 baris per jenis kelamin diimpor dari tabel WHO `hcfa-{boys,girls}-0-5-zscores.xlsx` |
| Tidak ada `multer`, `express.static`, maupun tulis-berkas di `src/` | Aplikasi **stateless** — tidak butuh volume, cocok untuk instans free yang filesystem-nya sementara |
| `/health` sudah ada di `src/app.ts` dan sudah dikecualikan dari log akses | Bisa langsung dipakai sebagai `healthCheckPath` sekaligus sasaran ping keep-alive, tanpa mengotori log |
| `app.set("trust proxy", 1)` sudah ada | Benar untuk di balik proksi Render; `express-rate-limit` akan membaca IP asli, bukan IP proksi |
| `env.ts` memvalidasi dengan zod lalu `process.exit(1)` bila gagal | Env produksi yang kurang akan menggagalkan boot dengan pesan jelas — ini yang diinginkan |
| `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD` **tidak punya nilai bawaan** | Ketiganya wajib diisi di Render, kalau tidak proses tidak akan hidup |
| `env.ts` memakai `process.loadEnvFile()` | Menuntut Node ≥ 20.12; versi Node harus dikunci |
| `prisma/seed/index.ts` memanggil `clearDatabase()` di awal | Penyemaian **tidak boleh** masuk build command |

---

## Arsitektur

```
HP Android ──HTTPS──▶ nutrigrow-api.onrender.com ──TLS──▶ Neon Postgres
                              ▲                            (region Singapore)
                              │
                    cron-job.org: GET /health tiap 10 menit
```

Satu proses Node berumur panjang di instans free Render, satu database Postgres
terkelola di Neon, satu penjadwal ping eksternal untuk menahan instans supaya
tidak tidur.

### Kenapa Render + Neon, bukan yang lain

- **Vercel (serverless)** menuntut `src/index.ts` dipecah jadi handler, mengubah
  cara `connectDatabase()` dipanggil, dan memerlukan connection pooler untuk
  Prisma. Itu berarti menyentuh kode yang belum pernah dikompilasi — dua kelas
  galat bercampur saat diagnosis.
- **Oracle Cloud Always Free (VPS)** paling stabil dan gratis permanen, tapi
  menuntut 3–5 jam setup dan tanggung jawab keamanan yang tidak sepadan untuk
  masa pakai sampai sidang.
- **Postgres bawaan Render** kedaluwarsa setelah satu bulan pada paket free.
  Neon tidak, jadi database dipisah ke Neon.

---

## Berkas yang bertambah

Semuanya di luar `src/`. Tidak ada satu pun berkas di `src/`, `prisma/schema.prisma`,
atau `prisma/seed/` yang disunting.

### 1. `render.yaml`

```yaml
services:
  - type: web
    name: nutrigrow-api
    runtime: node
    plan: free
    region: singapore
    branch: dev
    buildCommand: yarn install --frozen-lockfile && yarn db:generate && yarn db:deploy && yarn build
    startCommand: yarn start
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: API_PREFIX
        value: api/v1
      - key: CORS_ORIGINS
        value: ""
      - key: SMTP_FROM_NAME
        value: NutriGrow
      - key: SMTP_HOST
        value: smtp.gmail.com
      - key: SMTP_PORT
        value: "587"
      - key: DATABASE_URL
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: SMTP_USER
        sync: false
      - key: SMTP_PASSWORD
        sync: false
```

`sync: false` berarti nilainya diisi lewat dashboard Render, tidak pernah masuk
git. `PORT` sengaja tidak dicantumkan — Render menyuntikkannya sendiri dan
`env.ts` sudah membacanya.

`prisma migrate deploy` diletakkan di build command karena paket free Render
tidak menyediakan pre-deploy command. Perintah ini idempoten: hanya menerapkan
migrasi yang belum pernah jalan, jadi aman diulang setiap deploy.

**Verifikasi saat setup:** ketersediaan `region: singapore` untuk paket free dan
nama kunci `runtime`/`env` pada skema blueprint Render bisa berubah sewaktu-waktu.
Kalau blueprint ditolak, ikuti pesan galat dari Render — struktur di atas adalah
titik awal, bukan patokan mati.

### 2. `.node-version`

Berisi satu baris: `24` (LTS aktif).

Mengunci runtime supaya rebuild di kemudian hari tidak diam-diam berpindah ke
versi Node yang berbeda. Batas bawahnya nyata: `process.loadEnvFile()` di
`src/config/env.ts` baru ada sejak Node 20.12.

### 3. README bagian "Deploy ke Render + Neon"

Langkah-langkah yang bisa diulang dari nol, ditaruh setelah bagian "Menjalankan
di CachyOS". Termasuk daftar env yang harus diisi dan cara menyemai produksi.

### 4. `prisma/migrations/0_init/` — hasil generate

Dibuat dengan `prisma migrate diff --from-empty --to-schema-datamodel` sehingga
tidak memerlukan database sama sekali. Berisi 8 tabel, 11 enum, 4 indeks unik,
6 foreign key. **Wajib ikut ter-commit** bersama `prisma/migrations/migration_lock.toml` — tanpa berkas ini, build di Render
tidak punya apa pun untuk diterapkan dan database produksi akan kosong tanpa
tabel.

---

## Konfigurasi environment produksi

| Kunci | Sumber | Catatan |
|---|---|---|
| `DATABASE_URL` | Neon | Pakai connection string **direct (unpooled)** |
| `JWT_SECRET` | `openssl rand -base64 48` | **Bikin baru.** Jangan pakai nilai yang sama dengan lokal |
| `SMTP_HOST` | Gmail | `smtp.gmail.com` |
| `SMTP_PORT` | Gmail | `587` |
| `SMTP_USER` | Akun Gmail NutriGrow | Wajib — tanpa ini proses tidak hidup |
| `SMTP_PASSWORD` | App password Google | Wajib |
| `SMTP_FROM_NAME` | — | `NutriGrow` |
| `NODE_ENV` | — | `production` |
| `API_PREFIX` | — | `api/v1`, harus sama dengan yang dipakai aplikasi Android |
| `CORS_ORIGINS` | — | Dikosongkan |
| `PORT` | Render | **Jangan diisi manual** |

### Kenapa direct URL, bukan pooled

Satu instans server berumur panjang hanya membuka sedikit koneksi, jadi
pooler tidak memberi keuntungan berarti. Sebaliknya, `prisma migrate deploy`
gagal bila dijalankan lewat pgbouncer dalam mode transaksi — dan migrasi
dijalankan dari build command yang memakai `DATABASE_URL` yang sama. Kalau
kelak koneksi benar-benar jadi masalah, jalan keluarnya adalah menambahkan
`directUrl` di `schema.prisma` dan memisahkan kedua URL, bukan menukar yang
sekarang.

### Kenapa `CORS_ORIGINS` dikosongkan

Retrofit adalah klien HTTP native, bukan browser — ia tidak mengirim header
`Origin` dan tidak melakukan preflight. CORS tidak berlaku baginya. Kalau kelak
ada dasbor web, barulah kunci ini diisi.

---

## Urutan pelaksanaan

Berurutan, dan urutannya penting: setiap tahap memperkecil ruang galat tahap
berikutnya.

### Tahap 1 — Kompilasi pertama (lokal)

```bash
yarn install
yarn db:generate
yarn typecheck
```

`db:generate` harus lebih dulu, kalau tidak layar akan penuh galat
"Cannot find module '@prisma/client'" yang menyesatkan.

Galat yang muncul diperbaiki bergantian: user menjalankan perintah dan
melaporkan keluarannya, agent menyunting. Sebagian besar diperkirakan berupa
penjagaan `undefined` akibat `noUncheckedIndexedAccess`.

**Kriteria selesai:** `yarn typecheck` keluar tanpa galat.

### Tahap 2 — Migrasi awal dan jalan lokal

```bash
cp .env.example .env      # isi DATABASE_URL lokal dan JWT_SECRET
yarn db:deploy            # menerapkan prisma/migrations/0_init yang sudah ada
yarn db:seed
yarn dev
```

**Kriteria selesai:** server hidup,
login dengan `nutrigrow.ofc@gmail.com` / `password123` mengembalikan token, dan
satu endpoint growth mengembalikan data.

### Tahap 3 — Neon

Buat project baru, region Singapore, salin connection string direct.

**Kriteria selesai:** `psql <url>` dari laptop berhasil tersambung.

### Tahap 4 — Render

Sambungkan repo GitHub, Render membaca `render.yaml`, isi empat nilai `sync: false`
lewat dashboard (`DATABASE_URL`, `JWT_SECRET`, `SMTP_USER`, `SMTP_PASSWORD`),
jalankan deploy pertama.

**Kriteria selesai:** `GET https://<host>/health` mengembalikan
`{"success":true,"message":"NutriGrow API aktif","data":null}`, dan log build
menunjukkan migrasi diterapkan.

### Tahap 5 — Semai produksi

Dijalankan **manual dari laptop**, sekali saja:

```bash
DATABASE_URL="<url-neon>" yarn db:seed
```

Perintah ini memanggil `clearDatabase()` yang mengosongkan seluruh tabel lebih
dulu. Itu tepat untuk database yang baru lahir, dan berbahaya setelahnya.
Inilah alasan penyemaian tidak pernah diletakkan di build command.

**Kriteria selesai:** login lewat URL produksi berhasil, dan daftar anak
terisi.

### Tahap 6 — Keep-alive

Daftarkan job di cron-job.org: `GET https://<host>/health` tiap 10 menit.

Instans free Render tidur setelah ~15 menit tanpa permintaan, dan permintaan
berikutnya menunggu 30–60 detik sampai bangun — saat sidang itu tampak seperti
aplikasi yang hang.

Ping 24/7 selama sebulan memakai ~730 dari 750 jam kuota bulanan. Marginnya
tipis, dan kuota itu dibagi dengan layanan free lain di akun yang sama.
**Nyalakan ping menjelang sidang, matikan setelahnya.**

### Tahap 7 — Verifikasi

1. Login sebagai ketiga peran (Admin, Kader, Orang tua) lewat URL produksi.
2. Ambil satu daftar penimbangan; pastikan tanggalnya berformat
   `"2023-07-28 00:00:00.000 Z"` — bukan ISO 8601. Format ini yang diurai
   aplikasi Android dengan pola ketat; kalau berubah, tiga layar mati.
3. Panggil satu endpoint daftar anak **tanpa** token dan pastikan ditolak 401.
   Database produksi memuat nama balita dan orang tua asli Desa Jipang di
   server yang bukan milik sendiri; ini memastikan tidak ada jalur baca tanpa
   autentikasi.
4. Uji `registerOfficer` dengan token Admin — endpoint ini yang perubahannya
   sedang menunggu di sisi aplikasi.

---

## Risiko dan mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Galat tipe di tahap 1 lebih banyak dari perkiraan | Tahap 1 molor | Diselesaikan lokal, tidak memblokir apa pun selain deploy |
| Kuota 750 jam Render terlampaui | Layanan mati di tengah bulan | Ping hanya dinyalakan menjelang sidang; tidak ada layanan free lain di akun yang sama |
| Ping gagal diam-diam | Permintaan pertama saat sidang menunggu ~50 detik | Buka aplikasi 2 menit sebelum demo untuk membangunkan |
| Neon free scale-to-zero setelah idle | Permintaan pertama +~0,5 detik | Diterima; tidak terlihat oleh pengguna |
| Neon free dibatasi 0,5 GB | Tidak tercapai — data semai jauh di bawah itu | — |
| Skema blueprint Render berubah | Deploy pertama ditolak | Ikuti pesan galat Render; `render.yaml` adalah titik awal |
| ~~Lingkar kepala berstatus `Unknown`~~ | — | Tidak berlaku lagi; tabel WHO sudah diimpor |

---

## Serah terima ke fase frontend

Setelah tahap 7 lolos, satu-satunya yang dibutuhkan sisi Android adalah URL
produksi. `baseUrl` di `data/remote/retrofit/ApiConfig.kt` sekarang masih
dipatok ke sebuah devtunnel — diganti ke `https://<host>/api/v1/`.

Karena host-nya HTTPS, aplikasi **tidak** memerlukan `usesCleartextTraffic`
maupun network security config. Itu keuntungan tambahan dibanding menunjuk ke
IP laptop di WiFi lokal.

Penggantian `baseUrl` ini adalah butir pertama pada rencana peningkatan frontend
(`ApiConfig` jadi singleton + interceptor autentikasi), jadi dikerjakan di sana,
bukan di sini.

---

## Adendum 2026-08-29 — koreksi sebelum deploy pertama

Diperiksa ulang menjelang pelaksanaan. Tiga catatan.

### 1. Build command diperbaiki — ini akan menggagalkan deploy

`buildCommand` semula:

```
yarn install --frozen-lockfile && yarn db:generate && yarn db:deploy && yarn build
```

Dokumentasi Yarn 1 menyatakan: *"Yarn will not install any package listed in
`devDependencies` if the `NODE_ENV` environment variable is set to `production`."*
`render.yaml` memang menyetel `NODE_ENV=production`, dan Render menyediakan
env var itu sejak tahap build. Akibatnya `prisma`, `typescript`, dan `tsx` —
ketiganya `devDependencies` — tidak ikut terpasang, lalu build berhenti pada
`yarn db:generate` dengan `prisma: command not found`.

Sudah diperbaiki menjadi:

```
yarn install --frozen-lockfile --production=false && ...
```

Bendera itu **tidak boleh dihapus** selama `NODE_ENV=production` masih ada di
`render.yaml`.

### 2. Skema blueprint terverifikasi

Terhadap dokumentasi Render per 29 Agustus 2026: `runtime:` memang kunci yang
berlaku (`env:` sudah usang), `singapore` termasuk region yang sah, dan
`plan: free` sah untuk web service. Halaman paket free tidak menyebut pembatasan
region, jadi asumsi region tetap dipertahankan — bila blueprint ditolak, region
adalah hal pertama yang diganti.

Batasan free yang dikonfirmasi ulang: 750 jam per bulan per workspace, tidur
setelah 15 menit tanpa lalu lintas, dan sekitar satu menit untuk bangun.

### 3. `.node-version` tetap 24

Sempat dipertimbangkan turun ke 22 karena Prisma 6.3 terbit sebelum Node 24 ada.
Tidak jadi: Node 24 sudah LTS aktif, dan `node_modules` di mesin pengembangan
terpasang serta menghasilkan Prisma Client di bawah Node 26 tanpa masalah.

### Yang berubah pada isi database sejak spec ditulis

Migrasi kedua bertambah: `20260829120000_permenkes_status_categories`, yang
menyelaraskan kategori status gizi dengan Permenkes 2/2020. `prisma migrate
deploy` akan menerapkan `0_init` lalu migrasi itu secara berurutan pada database
Neon yang baru — urutannya benar dan tidak memerlukan langkah tambahan.

`db:recompute` tidak perlu dijalankan pada database yang baru disemai, karena
`db:seed` sudah menghitung status memakai ambang yang berlaku sekarang.

### 4. Blueprint diganti pembuatan service manual

Blueprint menuntut metode pembayaran terpasang di workspace, dan itu tidak
tersedia. Jalur yang dipakai: `New +` → `Web Service` lewat dashboard, paket
free, tanpa kartu.

Konsekuensi yang perlu diingat: **service yang dibuat manual tidak membaca
`render.yaml` sama sekali.** Berkas itu hanya dipakai Blueprint. Build command,
start command, health check path, dan **seluruh** environment variable harus
diisi lewat dashboard. Yang paling mudah terlewat adalah `SMTP_HOST`,
`SMTP_USER`, dan `SMTP_PASSWORD` — ketiganya tidak punya nilai bawaan di
`env.ts`, sehingga proses langsung keluar dengan kode 1 saat boot.

`render.yaml` tetap disimpan di repo: ia menjadi rujukan nilai yang harus
diketik, dan langsung terpakai bila kelak workspace-nya sudah punya kartu.

`.node-version` tetap berlaku pada service manual, karena Render membacanya dari
repo, bukan dari blueprint.

---

## Adendum 2026-08-29 (2) — pindah dari Render ke Vercel

Render dibatalkan sepenuhnya: metode pembayaran tetap diminta, baik lewat
Blueprint maupun pembuatan web service manual. Koyeb juga gugur — sejak
diakuisisi Mistral pada Februari 2026, pendaftar baru langsung masuk paket Pro
$29/bulan tanpa tier gratis.

Platform baru: **Vercel Hobby + Neon**. Hobby gratis tanpa kartu; kartu hanya
diminta saat menaikkan ke Pro.

### Yang membuat pemindahan ini murah

Spec asli menolak Vercel karena "menuntut `src/index.ts` dipecah jadi handler".
Keberatan itu ternyata jauh lebih ringan dari perkiraan, karena dua hal:

1. `src/app.ts` sudah memisahkan `createApp()` dari `listen()` sejak awal.
2. Vercel kini mendeteksi server Node tanpa konfigurasi: bila ada `server.ts` di
   akar repo yang memanggil `app.listen()` saat modul dimuat, seluruh aplikasi
   Express menjadi satu Function yang merutekan sendiri. Tidak perlu
   `vercel.json`, tidak perlu aturan rewrite.

Jadi seluruh adaptasinya adalah satu berkas baru berisi enam baris.

### Berkas yang berubah

| Berkas | Perubahan |
|---|---|
| `server.ts` | **Baru.** Entrypoint Vercel: `createApp()` lalu `listen()`. Sengaja terpisah dari `src/index.ts`, yang masih memanggil `connectDatabase()` dan memasang penangan `SIGTERM` — keduanya hanya berguna untuk proses berumur panjang |
| `prisma/schema.prisma` | `directUrl` ditambahkan; `binaryTargets` diberi `rhel-openssl-3.0.x` |
| `package.json` | `postinstall: prisma generate` |
| `.env.example` | `DIRECT_URL` ditambahkan |
| `README.md` | Bagian deploy ditulis ulang untuk Vercel |

### Keputusan pooler dibalik

Spec asli memilih connection string direct dan menolak `directUrl`, dengan alasan
satu instans berumur panjang tidak membutuhkan pooler. Alasan itu **tidak lagi
berlaku di serverless**: setiap permintaan dapat membangunkan instans baru, dan
tanpa pooler koneksi Neon akan habis.

Karena itu sekarang dipakai keduanya: `DATABASE_URL` menunjuk endpoint berpooler
untuk kueri aplikasi, `DIRECT_URL` menunjuk endpoint langsung untuk
`prisma migrate` — yang memang tidak bisa berjalan lewat pgbouncer mode transaksi.

Konsekuensi untuk pengembangan lokal: `.env` sekarang wajib memuat `DIRECT_URL`
juga. Untuk Postgres lokal isinya sama persis dengan `DATABASE_URL`.

### Migrasi tidak lagi di build

Di Render, `prisma migrate deploy` diletakkan pada build command. Di Vercel
migrasi dijalankan manual dari laptop, karena build Vercel tidak dimaksudkan
untuk menyentuh database dan migrasi yang gagal di tengah build akan
meninggalkan database setengah jadi.

### Yang hilang, dan itu bagus

Tahap 6 spec asli — keep-alive lewat cron-job.org — **tidak diperlukan lagi**.
Tidak ada instans yang tidur 15 menit dan tidak ada kuota 750 jam yang perlu
dijaga. Risiko "permintaan pertama saat sidang menunggu 50 detik" hilang
sepenuhnya.

### Yang menjadi lebih lemah

`express-rate-limit` menyimpan hitungan di memori, dan tiap instans serverless
punya memorinya sendiri. Batas laju kini berlaku per instans, bukan global.
Untuk beban Posyandu ini tidak menjadi masalah, tetapi tidak boleh diandalkan
sebagai pertahanan sungguhan.

### Verifikasi yang bertambah

Unduh satu laporan PDF lewat URL produksi. Itu satu-satunya jalur yang
berpeluang menyentuh batas waktu Function. Paket Hobby memberi 300 detik, jauh
di atas kebutuhan, tetapi tetap perlu dibuktikan sekali.

---

## Adendum 4 — 29 Agustus 2026: entrypoint ditunjuk eksplisit, `server.ts` dihapus

Keputusan di Adendum 3 — "tidak perlu `vercel.json`, Vercel akan mendeteksi
`server.ts`" — **terbukti salah dan dibatalkan.**

### Yang terjadi

Deploy berhasil, tetapi setiap permintaan ke `/health` menjawab
`500 FUNCTION_INVOCATION_FAILED`. Runtime Logs menunjukkan sebabnya:

```
Invalid export found in module "/var/task/src/app.js".
The default export must be a function or server.
```

Vercel memilih `src/app.ts` sebagai entrypoint fungsi, bukan `server.ts` di akar
repo. `src/app.ts` sengaja hanya mengekspor `createApp` supaya bisa dipakai
bersama oleh server lokal dan test, jadi ia memang tidak punya default export.
Deteksi otomatis itu tidak bisa diarahkan dari dalam kode.

### Bentuk yang dipakai sekarang

| Berkas | Isi |
|---|---|
| `api/index.ts` | **Baru.** `export default createApp()` — satu fungsi untuk seluruh rute |
| `vercel.json` | **Baru.** `rewrites` dari `/(.*)` ke `/api`; tanpa ini hanya `/api` yang terlayani |
| `server.ts` | **Dihapus.** Menyisakannya berarti ada dua kandidat entrypoint yang bersaing |

`src/index.ts` tidak berubah dan tetap menjadi entrypoint untuk pengembangan
lokal, lengkap dengan `connectDatabase()` dan penangan `SIGTERM`.

### Pelajaran

Deteksi otomatis platform gagal secara diam-diam pada tahap build dan baru
terlihat saat runtime. Untuk repo dengan lebih dari satu berkas yang tampak
seperti entrypoint, entrypoint harus ditunjuk eksplisit sejak awal.
