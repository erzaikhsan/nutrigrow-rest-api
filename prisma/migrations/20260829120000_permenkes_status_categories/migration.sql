-- Menyelaraskan kategori status gizi dengan Permenkes RI No. 2 Tahun 2020,
-- Lampiran B "Kategori dan Ambang Batas Status Gizi Anak".
--
-- BB/U   : ambang atas turun dari > +2 SD menjadi > +1 SD, dan kategorinya
--          berganti nama menjadi "Risiko berat badan lebih".
-- TB/U   : bertambah kategori "Tinggi" untuk z > +3 SD.
-- BB/TB  : satu kategori atas dipecah menjadi tiga, yaitu berisiko gizi lebih
--          (> +1 s.d. +2 SD), gizi lebih (> +2 s.d. +3 SD), dan obesitas (> +3 SD).
--
-- Nilai enum lama hanya diganti nama, tidak dihapus, sehingga baris yang sudah
-- tersimpan tetap terbaca. Nilai z-score tidak berubah sama sekali; yang berubah
-- hanya kategorinya. Jalankan `npm run db:recompute` sesudah migrasi ini agar
-- seluruh baris penimbangan lama dinilai ulang dengan ambang yang baru.

ALTER TYPE "enum_wfa_status" RENAME VALUE 'Overweight and Obese' TO 'Risk of Overweight';

ALTER TYPE "enum_hfa_status" ADD VALUE IF NOT EXISTS 'Tall' AFTER 'Normal';

ALTER TYPE "enum_wfh_status" RENAME VALUE 'Overweight and Obese' TO 'Overweight';
ALTER TYPE "enum_wfh_status" ADD VALUE IF NOT EXISTS 'Possible Risk of Overweight' BEFORE 'Overweight';
ALTER TYPE "enum_wfh_status" ADD VALUE IF NOT EXISTS 'Obese' AFTER 'Overweight';
