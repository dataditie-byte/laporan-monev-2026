MONEV IE 2026 — FINAL PIMPINAN

ISI PAKET
1. index.html
   Portal satu pintu. Tidak lagi menampilkan Form Satker.
2. evaluasi.html
   Ruang Monitoring + GIS + analisis + rekomendasi + Laporan Pimpinan.
3. app_final.js
   Mesin dashboard/evaluasi.
4. laporan_pimpinan.js
   Modul laporan pimpinan Nasional dan BNNP/Provinsi, preview, cetak/PDF browser, Word.
5. ai_analysis_engine.js
   Kontrak AI opsional. Tidak berisi API key/provider.

ALUR
Portal → Akses Monitoring → Dashboard Nasional → GIS 216 Satker
→ Rekap BNNP/Provinsi → BNNK/Satker → Analisis → Temuan
→ Rekomendasi → Laporan Pimpinan → Preview / Cetak PDF / Word.

CATATAN PENTING
- Form Satker tidak ditampilkan lagi di portal.
- Backend Form Satker / Code.gs production TIDAK diubah oleh paket ini.
- Data yang dipakai berasal dari data monitoring yang sudah dimuat dashboard.
- Tidak ada skor atau peringkat antar-Satker.
- Sistem tidak membuat target/indikator baru.
- Bila penyebut tidak valid/0, persentase tidak dihitung.
- Laporan pimpinan bersifat agregat; detail Satker menjadi lampiran.
- Sebelum upload produksi, uji login, data 216 Satker, GIS, BNNP/BNNK,
  analisis, preview, Word, dan cetak/PDF.

DEPLOY FRONTEND
Upload/replace file berikut pada repo frontend:
index.html
evaluasi.html
app_final.js
laporan_pimpinan.js
ai_analysis_engine.js

JANGAN mengganti Code.gs Form Satker dengan file dari paket ini.
