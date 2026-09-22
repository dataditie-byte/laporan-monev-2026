/* ============================================================
   AI ANALYSIS ENGINE — MONEV IE 2026 FINAL
   ------------------------------------------------------------
   AI is a narrative layer only.
   Machine/evidence layer remains authoritative for:
   - actual values
   - targets that already exist in source/Juknis mapping
   - gap
   - achievement
   - status
   - findings
   - completeness
   No new indicator, target, score, ranking, or formula is created here.
   ============================================================ */
(function(global){
  'use strict';

  const VERSION = 'Monev IE 2026 AI Evidence Layer 1.0';

  function clean(v){
    if(v === undefined || v === null || String(v).trim() === '') return null;
    return String(v).trim();
  }

  function finite(v){
    if(v === undefined || v === null || v === '') return null;
    const n = Number(String(v).replace(/,/g,'').trim());
    return Number.isFinite(n) ? n : null;
  }

  function safePct(value, denominator){
    const a = finite(value), b = finite(denominator);
    if(a === null || b === null || b === 0) return null;
    return (a / b) * 100;
  }

  function pctText(value){
    const n = finite(value);
    return n === null ? 'BELUM DAPAT DIHITUNG' : `${n.toFixed(1)}%`;
  }

  /*
    Converts an already-calculated analysis object into an AI-safe evidence item.
    The function deliberately does NOT calculate a new result.
  */
  function evidenceItem(x){
    x = x || {};
    return {
      fokus: clean(x.fokus),
      indikator: clean(x.indikator || x.kode_indikator),
      nilai_aktual: x.nilai_aktual !== undefined ? x.nilai_aktual :
                     x.nilai !== undefined ? x.nilai : null,
      target: x.target !== undefined ? x.target : null,
      gap: x.gap !== undefined ? x.gap : null,
      capaian: x.capaian !== undefined ? x.capaian : null,
      capaian_tampil: x.capaian !== undefined ? pctText(x.capaian) : null,
      status: clean(x.status),
      temuan: clean(x.temuan || x.temuan_kandidat),
      prioritas: clean(x.prioritas || x.priority),
      dasar: clean(x.dasar_juknis || x.basis),
      kelengkapan: clean(x.kelengkapan)
    };
  }

  function buildSatkerEvidence(record, analyses){
    record = record || {};
    const list = (analyses || []).map(evidenceItem);
    return {
      schema_version: VERSION,
      level: 'SATKER',
      identity: {
        pengisian_id: clean(record.pengisian_id),
        nomor_pengisian: clean(record.nomor_pengisian),
        satker_id: clean(record.satker_id),
        kode_satker: clean(record.kode_satker),
        nama_satker: clean(record.nama_satker),
        provinsi: clean(record.provinsi),
        status_pengisian: clean(record.status)
      },
      sections: list,
      rules: [
        'AI hanya menyusun narasi dari evidence yang tersedia.',
        'AI tidak menghitung ulang angka.',
        'AI tidak membuat target atau indikator baru.',
        'AI tidak mengubah status mesin.',
        'Jika evidence tidak cukup, AI harus menyatakan data belum cukup.'
      ]
    };
  }

  function buildAggregateEvidence(dataset, analysesBySatker){
    dataset = dataset || [];
    const counts = {};
    dataset.forEach(x => {
      const s = clean(x.status) || 'TIDAK TERIDENTIFIKASI';
      counts[s] = (counts[s] || 0) + 1;
    });

    const provinces = {};
    dataset.forEach(x => {
      const p = clean(x.gis && x.gis.provinsi) ||
                clean(x.record && x.record.provinsi) ||
                'TIDAK TERIDENTIFIKASI';
      if(!provinces[p]) provinces[p] = {
        provinsi:p,
        total:0,
        sudah_mengisi:0,
        belum_selesai:0,
        belum_mengisi:0
      };
      provinces[p].total++;
      if(x.status === 'SUDAH MENGISI') provinces[p].sudah_mengisi++;
      else if(x.status === 'BELUM SELESAI') provinces[p].belum_selesai++;
      else if(x.status === 'BELUM MENGISI') provinces[p].belum_mengisi++;
    });

    return {
      schema_version: VERSION,
      level: 'AGGREGATE',
      population: {
        total: dataset.length,
        status: counts
      },
      provinces: Object.values(provinces),
      satker_evidence: analysesBySatker || [],
      rules: [
        'Rekap agregat berasal dari data yang sudah dihitung mesin.',
        'AI tidak boleh membuat ranking Satker.',
        'AI tidak boleh membuat skor kinerja baru.',
        'AI harus membedakan data kosong dari capaian rendah.'
      ]
    };
  }

  function buildPrompt(evidence, level){
    const scope = level === 'NATIONAL'
      ? 'laporan Direktorat/Nasional'
      : level === 'BNNP'
        ? 'laporan BNNP/provinsi'
        : 'laporan Satker';

    return [
      'Anda adalah penyusun narasi laporan Monitoring Pelaksanaan Informasi & Edukasi Tahun Anggaran 2026.',
      `Susun analisis untuk ${scope} berdasarkan EVIDENCE JSON yang diberikan.`,
      '',
      'ATURAN WAJIB:',
      '1. Jangan menghitung ulang angka.',
      '2. Jangan mengubah angka, gap, capaian, atau status.',
      '3. Jangan membuat indikator atau target baru.',
      '4. Jangan membuat skor, peringkat, atau ranking.',
      '5. Jangan menyatakan sebab yang tidak terdapat dalam evidence sebagai fakta.',
      '6. Jika data belum cukup, nyatakan secara eksplisit bahwa data belum cukup untuk penilaian.',
      '7. Rekomendasi harus berhubungan langsung dengan temuan yang tersedia.',
      '8. Gunakan bahasa laporan pemerintahan yang formal, jelas, dan tidak terlalu pendek.',
      '9. Jangan menggunakan NaN, Infinity, undefined, atau angka hasil tebakan.',
      '',
      'FORMAT OUTPUT:',
      'A. Analisis kondisi',
      'B. Temuan utama',
      'C. Rekomendasi',
      'D. Tindak lanjut yang dapat diverifikasi',
      '',
      'EVIDENCE JSON:',
      JSON.stringify(evidence, null, 2)
    ].join('\n');
  }

  /*
    Optional AI transport.
    Set window.MONEV_AI_CONFIG = {
      endpoint: '...',
      headers: {...}
    }
    when an approved AI endpoint is available.
    No provider/key is hard-coded into this package.
  */
  async function requestAI(evidence, level, config){
    config = config || global.MONEV_AI_CONFIG || {};
    if(!config.endpoint){
      return {
        ok:false,
        mode:'EVIDENCE_ONLY',
        message:'Endpoint AI belum dikonfigurasi. Evidence tetap tersedia untuk laporan.'
      };
    }

    const payload = {
      level: level || 'SATKER',
      prompt: buildPrompt(evidence, level || 'SATKER'),
      evidence
    };

    const headers = Object.assign(
      {'Content-Type':'application/json'},
      config.headers || {}
    );

    const response = await fetch(config.endpoint, {
      method:'POST',
      headers,
      body:JSON.stringify(payload)
    });

    if(!response.ok){
      throw new Error(`AI endpoint HTTP ${response.status}`);
    }

    const data = await response.json();
    return {ok:true, mode:'AI', data};
  }

  global.MonevAIEngine = {
    VERSION,
    safePct,
    pctText,
    evidenceItem,
    buildSatkerEvidence,
    buildAggregateEvidence,
    buildPrompt,
    requestAI
  };
})(window);
