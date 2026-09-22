/*
 AI ANALYSIS CONTRACT — MONEV IE 2026
 AI is optional. The system's numeric calculations/statuses remain deterministic.
 AI may only narrate supplied evidence. It must not create indicators, targets,
 scores, rankings, or findings not present in evidence.
*/
window.MonevAIContract = {
  buildPrompt(evidence){
    return `Anda adalah penyusun narasi Laporan Pimpinan Monitoring IE 2026.
Gunakan HANYA evidence berikut. Jangan membuat angka, target, indikator, skor,
peringkat, status, atau temuan baru. Jika evidence tidak cukup, nyatakan data
belum cukup untuk dinilai. Buat narasi formal, panjang secukupnya, objektif,
dan dapat dipertanggungjawabkan.\n\nEVIDENCE:\n${JSON.stringify(evidence,null,2)}`;
  }
};
