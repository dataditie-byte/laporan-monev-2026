/* MONEV IE 2026 — AI evidence contract */
(function(w){
'use strict';
w.MonevAIEngine={
  version:'1.0',
  buildPrompt:function(evidence,level){
    return [
      'Susun narasi laporan Monitoring Pelaksanaan Informasi & Edukasi BNN Tahun 2026.',
      'Gunakan hanya evidence yang diberikan.',
      'Jangan menghitung ulang angka.',
      'Jangan membuat indikator atau target baru.',
      'Jangan mengubah status.',
      'Jangan membuat skor atau ranking.',
      'Jika capaian tidak dapat dihitung, tuliskan bahwa data belum dapat dihitung.',
      'Rekomendasi harus terkait langsung dengan temuan.',
      'Level laporan: '+(level||'SATKER'),
      'EVIDENCE:',JSON.stringify(evidence,null,2)
    ].join('\\n');
  }
};
})(window);
