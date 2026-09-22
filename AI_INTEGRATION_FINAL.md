# AI INTEGRATION FINAL — MONEV IE 2026

## Posisi AI
AI adalah **lapisan narasi**, bukan mesin evaluasi.

### Alur
DATA MONEV
→ app_final.js
→ mesin evaluasi
→ Evidence Builder
→ AI
→ analisis/rekomendasi/tindak lanjut
→ Report Engine

## Sumber AI
AI menerima `Evidence JSON`, bukan membaca source code `app_final.js`.

Evidence berisi:
- identitas Satker;
- status pengisian;
- nilai aktual yang sudah tersedia;
- target yang memang sudah berasal dari sumber;
- gap yang sudah dihitung mesin;
- capaian yang sudah dihitung mesin;
- status mesin;
- temuan;
- prioritas;
- dasar/Juknis;
- informasi kelengkapan.

## Proteksi
AI dilarang:
- menghitung ulang;
- membuat target baru;
- membuat indikator baru;
- mengubah status;
- membuat skor;
- membuat ranking;
- mengisi data yang kosong dengan tebakan;
- mengubah `null` menjadi angka.

## Fallback
Jika endpoint AI belum dikonfigurasi, evidence tetap dapat digunakan untuk laporan.
Tidak ada API key/provider yang ditanam ke paket final. Endpoint hanya dikonfigurasi setelah layanan AI resmi yang digunakan ditentukan.

## Level
- SATKER
- BNNP/PROVINSI
- DIREKTORAT/NASIONAL

Untuk level agregat, mesin membuat rekap terlebih dahulu. AI hanya menyusun narasi dari rekap tersebut.
