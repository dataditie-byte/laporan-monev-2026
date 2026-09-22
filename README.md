# Sistem Monitoring Pelaksanaan Informasi & Edukasi 2026

Portal PWA Direktorat Informasi & Edukasi BNN.

## Struktur

-   `index.html` --- portal utama dengan 2 akses: Masuk Sistem dan Form
    Satker.
-   `evaluasi.html` --- ruang Monitoring & Evaluasi internal.
-   `app_final.js` --- mesin aplikasi evaluasi dan koneksi ke backend
    yang sudah berjalan.
-   `manifest.json` --- konfigurasi PWA.
-   `sw.js` --- service worker untuk ketahanan aplikasi/cache shell.
-   `assets/` --- logo, gedung BNN, Ananda Bersinar, dan ikon PWA.

## Alur

Portal utama → Masuk Sistem → login/evaluasi internal.

Portal utama → Form Satker → buka atau bagikan
`https://form-satker.dit-ie.my.id`.

## Deployment GitHub Pages

Upload seluruh isi repo ke repository baru. Aktifkan GitHub Pages dari
branch utama dan root (`/`).

Pastikan repository menggunakan HTTPS karena Service Worker/PWA
memerlukan secure context.

## Catatan penting

Backend/API monitoring yang sudah berjalan tidak diubah oleh repo
frontend ini.

Jangan mengubah `GAS_URL` di `app_final.js` kecuali memang ada keputusan
untuk memindahkan backend.

Setelah deployment, buka domain melalui HTTPS lalu lakukan reload sekali
agar Service Worker terpasang. Pada Android gunakan menu Install app/Add
to Home screen. Pada iPhone/iPad gunakan Safari → Share → Add to Home
Screen.

## Versi

Baseline awal: `v1.0.0`

Revisi monitoring: `v1.0.7` — sinkron dengan revisi Form Satker dan mesin analisis/rekomendasi.
