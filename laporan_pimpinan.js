
/* ============================================================
   LAPORAN PIMPINAN MONITORING IE 2026 — FINAL
   Tidak mengubah Form Satker / Code.gs.
   Membaca data yang sudah dimuat dashboard: data, gisPoints, analyses.
   ============================================================ */
(function(){
  const escR=v=>String(v??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
  const cleanR=v=>String(v??'').trim();
  const numR=v=>{
    const n=Number(v);
    return Number.isFinite(n)?n.toLocaleString('id-ID'):'—';
  };
  const safePct=(a,b)=>{
    const x=Number(a), y=Number(b);
    if(!Number.isFinite(x)||!Number.isFinite(y)||y===0)return null;
    return (x/y)*100;
  };
  const latestRecords=()=>{
    const rows=Array.isArray(window.data?.records)?window.data.records:[];
    const map=new Map();
    rows.forEach(r=>{
      const k=String(r.satker_id||r.kode_satker||r.nama_satker||r.pengisian_id);
      const old=map.get(k);
      if(!old || String(r.updated_at||r.created_at||'')>String(old.updated_at||old.created_at||'')) map.set(k,r);
    });
    return [...map.values()];
  };
  const gisBySatker=()=>{
    const m=new Map();
    (window.gisPoints||[]).forEach(p=>{
      const keys=[p.satker_id,p.kode_satker,p.nama_satker,p.name].filter(Boolean).map(String);
      keys.forEach(k=>m.set(k,p));
    });
    return m;
  };
  const provinceOf=r=>{
    const g=gisBySatker().get(String(r.satker_id||r.kode_satker||r.nama_satker))||{};
    return cleanR(r.provinsi||r.province||r.wilayah||g.provinsi||g.province||g.wilayah||g.nama_provinsi||g.region)||'Wilayah belum terpetakan';
  };
  const bnnpOf=r=>{
    const g=gisBySatker().get(String(r.satker_id||r.kode_satker||r.nama_satker))||{};
    return cleanR(r.bnnp||r.nama_bnnp||g.bnnp||g.nama_bnnp)||provinceOf(r);
  };
  const statusOf=r=>{
    if(typeof window.overallStatusForRecord==='function') return window.overallStatusForRecord(r);
    return cleanR(r.status_evaluasi||r.overall_status)||'BELUM DAPAT DINILAI';
  };
  const sectionExists=(r,s)=>!!r?.saved?.[s] || !!(r?.[s] && Object.keys(r[s]).length);
  const analysesFor=r=>{
    const arr=(window.analyses||[]).filter(a=>String(a.pengisian_id)===String(r.pengisian_id));
    if(arr.length)return arr;
    try{return typeof window.finalAnalysesForRecord==='function'?window.finalAnalysesForRecord(r):[];}catch(e){return []}
  };
  const collectStats=records=>{
    const submitted=records.filter(r=>String(r.status||'').toUpperCase()==='SELESAI').length;
    const draft=records.filter(r=>String(r.status||'').toUpperCase()!=='SELESAI').length;
    const total=216;
    const missing=Math.max(0,total-records.length);
    const status={MEMENUHI:0,'PERLU PENGUATAN':0,'PERLU PERHATIAN':0};
    records.forEach(r=>{const s=statusOf(r);if(status[s]!=null)status[s]++;});
    const sections={A:0,B:0,C:0};
    records.forEach(r=>Object.keys(sections).forEach(s=>{if(sectionExists(r,s))sections[s]++}));
    let high=0,med=0;
    records.forEach(r=>analysesFor(r).forEach(a=>{
      const p=cleanR(a.prioritas||a.priority).toUpperCase();
      if(p==='TINGGI'||p==='ATENSI')high++;
      else if(p==='SEDANG'||p==='PENDAMPINGAN'||p==='MONITORING')med++;
    }));
    return {total,submitted,draft,missing,status,sections,high,med};
  };
  const groupBNNP=records=>{
    const m={};
    records.forEach(r=>{
      const k=bnnPOf(r);
      (m[k]??=[]).push(r);
    });
    return m;
  };
  const findingThemes=records=>{
    const counts={};
    records.forEach(r=>analysesFor(r).forEach(a=>{
      const status=cleanR(a.status_bagian||a.status||'').toUpperCase();
      if(status==='MEMENUHI')return;
      const text=(cleanR(a.fokus)+' '+cleanR(a.gap)+' '+cleanR(a.analisis)).toLowerCase();
      let theme='Kesenjangan pelaksanaan';
      if(/sdm|personel|kompetensi|guru|fasilitator|pelatihan/.test(text))theme='SDM dan kompetensi';
      else if(/sarana|peralatan|komputer|internet|fasilitas/.test(text))theme='Sarana dan dukungan';
      else if(/jangkau|cakupan|peserta|sekolah sasaran|audiens/.test(text))theme='Cakupan dan jangkauan';
      else if(/bukti|dokumentasi|laporan|daftar hadir/.test(text))theme='Dokumentasi dan bukti';
      else if(/perencanaan|anggaran|dukungan|stakeholder|mitra/.test(text))theme='Perencanaan dan dukungan';
      counts[theme]=(counts[theme]||0)+1;
    }));
    return Object.entries(counts).sort((a,b)=>b[1]-a[1]);
  };
  const narrative=(records,level,name)=>{
    const s=collectStats(records);
    const themes=findingThemes(records).slice(0,5);
    const filledA=s.sections.A,filledB=s.sections.B,filledC=s.sections.C;
    const submittedPct=s.total?((s.submitted/s.total)*100):null;
    let p=[];
    p.push(`Monitoring ${level.toLowerCase()} ${name} mencakup ${numR(records.length)} Satker yang telah memiliki data pengisian terbaru dari populasi nasional ${numR(s.total)} Satker. ${s.submitted} Satker berstatus sudah mengisi, ${s.draft} masih belum selesai, dan ${s.missing} belum memiliki pengisian pada data yang tersedia.`);
    if(submittedPct!==null)p.push(`Proporsi Satker yang sudah mengisi terhadap populasi nasional tercatat ${submittedPct.toFixed(1).replace('.',',')}%.`);
    p.push(`Ketersediaan data per bagian menunjukkan Bagian Umum pada ${numR(filledA)} Satker, RTS pada ${numR(filledB)} Satker, dan Penyebarluasan Informasi & Edukasi pada ${numR(filledC)} Satker.`);
    if(themes.length)p.push(`Temuan yang paling sering muncul dalam hasil telaah yang tersedia berkaitan dengan ${themes.map(x=>x[0].toLowerCase()).join(', ')}.`);
    if(s.high)p.push(`Terdapat ${numR(s.high)} hasil telaah yang ditandai memerlukan perhatian berdasarkan analisis yang tersedia.`);
    if(s.med)p.push(`Selain itu terdapat ${numR(s.med)} hasil telaah yang memerlukan penguatan atau pendampingan.`);
    return p.join(' ');
  };
  const recommendation=(records)=>{
    const s=collectStats(records);
    const out=[];
    if(s.missing||s.draft)out.push('Menuntaskan pengisian pada Satker yang belum menyelesaikan atau belum memiliki data agar gambaran monitoring semakin utuh.');
    if(s.high)out.push('Memfokuskan tindak lanjut pada temuan yang secara eksplisit ditandai memerlukan perhatian, dengan menggunakan bukti dan data Satker sebagai dasar.');
    if(s.med)out.push('Melakukan penguatan dan pendampingan pada aspek yang teridentifikasi dalam hasil telaah.');
    if(!out.length)out.push('Mempertahankan pelaksanaan yang telah berjalan dan melanjutkan pemantauan terhadap kualitas serta konsistensi data.');
    return out;
  };
  const tableRows=records=>{
    return records.map(r=>{
      const a=analysesFor(r);
      const high=a.filter(x=>['TINGGI','ATENSI'].includes(cleanR(x.prioritas||x.priority).toUpperCase())).length;
      const med=a.filter(x=>['SEDANG','PENDAMPINGAN','MONITORING'].includes(cleanR(x.prioritas||x.priority).toUpperCase())).length;
      return `<tr><td>${escR(r.nama_satker||'—')}</td><td>${escR(bnnPOf(r))}</td><td>${escR(displayStatus?displayStatus(r.status):(r.status||'—'))}</td><td>${escR(statusOf(r))}</td><td>${high}</td><td>${med}</td></tr>`;
    }).join('');
  };
  const provinceTable=records=>{
    const groups=groupBNNP(records);
    return Object.entries(groups).sort((a,b)=>a[0].localeCompare(b[0])).map(([name,rs])=>{
      const s=collectStats(rs);
      return `<tr><td><b>${escR(name)}</b></td><td>${rs.length}</td><td>${s.submitted}</td><td>${s.draft}</td><td>${s.status.MENUHI||s.status.MEMENUHI}</td><td>${s.status['PERLU PENGUATAN']}</td><td>${s.status['PERLU PERHATIAN']}</td></tr>`;
    }).join('');
  };
  const buildHtml=(scope,name,records)=>{
    const s=collectStats(records);
    const themes=findingThemes(records);
    const recs=recommendation(records);
    const submittedPct=s.total?((s.submitted/s.total)*100):null;
    const summaryCards=`
      <div class="lp-cards">
        <div><b>${s.total}</b><span>Populasi Satker</span></div>
        <div><b>${s.submitted}</b><span>Sudah Mengisi</span></div>
        <div><b>${s.draft}</b><span>Belum Selesai</span></div>
        <div><b>${s.missing}</b><span>Belum Mengisi</span></div>
      </div>`;
    const themesHtml=themes.length?themes.map(x=>`<li><b>${escR(x[0])}</b> — muncul pada ${x[1]} hasil telaah.</li>`).join(''):'<li>Belum terdapat pola temuan yang cukup untuk diringkas dari data tersedia.</li>';
    const recHtml=recs.map((x,i)=>`<li>${i+1}. ${escR(x)}</li>`).join('');
    return `<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Laporan Pimpinan Monitoring IE 2026</title>
    <style>
    @page{size:A4;margin:18mm 16mm}body{font-family:Arial,sans-serif;color:#18324d;line-height:1.5;margin:0}
    h1{font-size:25px;margin:0 0 7px;color:#0a4f91}h2{font-size:18px;color:#0a4f91;border-bottom:2px solid #d9e6f2;padding-bottom:6px;margin-top:24px}
    h3{font-size:14px;color:#174d7a;margin:16px 0 6px}.cover{min-height:245mm;display:flex;flex-direction:column;justify-content:center;text-align:center;page-break-after:always}.cover .ey{font-size:13px;font-weight:700;letter-spacing:1.5px;color:#55708d}.cover h1{font-size:30px}.cover p{color:#5c7288}.lp-cards{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:14px 0}.lp-cards div{border:1px solid #d8e4ef;border-radius:8px;padding:12px;text-align:center}.lp-cards b{display:block;font-size:23px;color:#0a62ad}.lp-cards span{font-size:11px;color:#61778e}table{width:100%;border-collapse:collapse;margin:9px 0 15px;font-size:10.5px}th,td{border:1px solid #cbd8e4;padding:6px;vertical-align:top}th{background:#eef5fb;color:#173f65}.note{background:#f5f9fd;border-left:4px solid #1976c9;padding:10px;margin:10px 0}.page{page-break-before:always}.muted{color:#65788a;font-size:11px}.signature{margin-top:45px;text-align:right}.no-rank{font-size:11px;color:#64748b;font-style:italic}@media print{button{display:none!important}}
    </style></head><body>
      <section class="cover"><div class="ey">DIREKTORAT INFORMASI &amp; EDUKASI BNN</div><h1>LAPORAN PIMPINAN<br>MONITORING PELAKSANAAN INFORMASI &amp; EDUKASI<br>TAHUN ANGGARAN 2026</h1><p>${escR(scope)} · ${escR(name)}</p><p class="muted">Disusun berdasarkan data monitoring yang tersedia pada sistem.</p></section>
      <h2>1. Ringkasan Eksekutif</h2>${summaryCards}<p>${escR(narrative(records,scope,name))}</p>
      <div class="note"><b>Catatan data:</b> angka dan narasi hanya menggunakan data yang tersedia. Sistem tidak membuat kesimpulan ketika data atau penyebut tidak memadai.</div>
      <h2>2. Kondisi Monitoring</h2>
      <table><tr><th>Indikator</th><th>Jumlah</th></tr><tr><td>Populasi nasional</td><td>${s.total}</td></tr><tr><td>Sudah mengisi</td><td>${s.submitted}</td></tr><tr><td>Belum selesai</td><td>${s.draft}</td></tr><tr><td>Belum mengisi</td><td>${s.missing}</td></tr><tr><td>Bagian Umum tersedia</td><td>${s.sections.A}</td></tr><tr><td>RTS tersedia</td><td>${s.sections.B}</td></tr><tr><td>Penyebarluasan IE tersedia</td><td>${s.sections.C}</td></tr></table>
      <h2>3. Kondisi Berdasarkan Status Evaluasi</h2>
      <table><tr><th>Status</th><th>Jumlah Satker</th></tr><tr><td>MEMENUHI</td><td>${s.status.MEMENUHI}</td></tr><tr><td>PERLU PENGUATAN</td><td>${s.status['PERLU PENGUATAN']}</td></tr><tr><td>PERLU PERHATIAN</td><td>${s.status['PERLU PERHATIAN']}</td></tr></table>
      <h2>4. Temuan Utama</h2><ul>${themesHtml}</ul>
      <h2>5. Analisis Pimpinan</h2><p>${escR(narrative(records,scope,name))}</p>
      <h2>6. Rekomendasi dan Arah Tindak Lanjut</h2><ol>${recHtml}</ol>
      ${scope==='Nasional'?`<h2>7. Rekap BNNP/Provinsi</h2><table><tr><th>BNNP/Provinsi</th><th>Satker Data</th><th>Sudah Mengisi</th><th>Belum Selesai</th><th>Memenuhi</th><th>Perlu Penguatan</th><th>Perlu Perhatian</th></tr>${provinceTable(records)}</table>`:''}
      <h2>${scope==='Nasional'?'8':'7'}. Lampiran Rekap Satker</h2><p class="no-rank">Rekap berikut bersifat informatif dan tidak merupakan peringkat kinerja.</p>
      <table><tr><th>Satker</th><th>BNNP/Provinsi</th><th>Status Pengisian</th><th>Status Evaluasi</th><th>Perlu Perhatian</th><th>Perlu Pendampingan</th></tr>${tableRows(records)}</table>
      <p class="muted">Dokumen ini merupakan keluaran sistem Monitoring IE 2026 dan dapat digunakan sebagai bahan telaah pimpinan serta tindak lanjut sesuai kewenangan.</p>
    </body></html>`;
  };
  const openModal=()=>{
    if(document.getElementById('lpModal'))return;
    const d=document.createElement('div');d.id='lpModal';d.innerHTML=`<div class="lp-back"><div class="lp-dialog">
      <div class="lp-head"><div><h2 style="margin:0">Laporan Pimpinan Monitoring IE 2026</h2><p>Pilih tingkat laporan lalu cetak atau buka pratinjau.</p></div><button id="lpClose">×</button></div>
      <div class="lp-controls"><label>Tingkat <select id="lpScope"><option value="Nasional">Nasional</option><option value="BNNP">BNNP / Provinsi</option></select></label><label id="lpRegionWrap" style="display:none">BNNP/Provinsi <select id="lpRegion"></select></label></div>
      <div class="lp-actions"><button id="lpPreview" class="btn secondary">👁 Pratinjau</button><button id="lpPrint" class="btn">🖨 Cetak / PDF</button><button id="lpWord" class="btn secondary">📄 Word</button></div>
      <div id="lpHint" class="small muted"></div>
    </div></div>`;
    const st=document.createElement('style');st.textContent=`#lpModal{position:fixed;inset:0;z-index:10000}.lp-back{position:absolute;inset:0;background:rgba(9,32,55,.55);display:flex;align-items:center;justify-content:center;padding:18px}.lp-dialog{width:min(720px,100%);background:#fff;border-radius:16px;padding:20px;box-shadow:0 20px 70px rgba(0,0,0,.3)}.lp-head{display:flex;justify-content:space-between;gap:15px}.lp-head button{border:0;background:#eef4fa;border-radius:50%;width:34px;height:34px;font-size:22px;cursor:pointer}.lp-controls{display:flex;gap:12px;flex-wrap:wrap;margin:18px 0}.lp-controls label{font-weight:700;font-size:13px;display:flex;flex-direction:column;gap:5px}.lp-controls select{min-width:240px;padding:10px;border:1px solid #cbd8e4;border-radius:8px}.lp-actions{display:flex;gap:8px;flex-wrap:wrap}`;document.head.appendChild(st);document.body.appendChild(d);
    const fillRegions=()=>{
      const rs=latestRecords(), groups=groupBNNP(rs), sel=document.getElementById('lpRegion');
      sel.innerHTML=Object.keys(groups).sort((a,b)=>a.localeCompare(b)).map(x=>`<option>${escR(x)}</option>`).join('');
    };
    const update=()=>{
      const scope=document.getElementById('lpScope').value, wrap=document.getElementById('lpRegionWrap');
      wrap.style.display=scope==='BNNP'?'flex':'none';if(scope==='BNNP'&&!document.getElementById('lpRegion').options.length)fillRegions();
      document.getElementById('lpHint').textContent=scope==='Nasional'?'Laporan menggabungkan data nasional dan rekap BNNP/Provinsi.':'Laporan difokuskan pada BNNP/Provinsi yang dipilih.';
    };
    fillRegions();update();
    document.getElementById('lpScope').onchange=update;
    document.getElementById('lpRegion').onchange=update;
    const currentReport=()=>{
      const rs=latestRecords(),scope=document.getElementById('lpScope').value;
      if(scope==='Nasional')return {html:buildHtml('Nasional','Seluruh Indonesia',rs),name:'Nasional'};
      const reg=document.getElementById('lpRegion').value;
      return {html:buildHtml('BNNP / Provinsi',reg,rs.filter(r=>bnnPOf(r)===reg)),name:reg};
    };
    const showPreview=()=>{
      const x=currentReport(),w=window.open('','_blank');if(!w){alert('Izinkan pop-up untuk melihat laporan.');return}w.document.open();w.document.write(x.html);w.document.close();
    };
    document.getElementById('lpPreview').onclick=showPreview;
    document.getElementById('lpPrint').onclick=()=>{
      const x=currentReport(),w=window.open('','_blank');if(!w){alert('Izinkan pop-up untuk mencetak.');return}w.document.open();w.document.write(x.html);w.document.close();setTimeout(()=>w.print(),500);
    };
    document.getElementById('lpWord').onclick=()=>{
      const x=currentReport();
      if(typeof window.downloadReport==='function')window.downloadReport(x.html,`Laporan_Pimpinan_Monitoring_IE_2026_${x.name.replace(/[^a-z0-9]+/gi,'_')}.docx`);
      else alert('Generator Word belum tersedia.');
    };
    document.getElementById('lpClose').onclick=()=>d.remove();
  };
  const inject=()=>{
    if(document.getElementById('btnLaporanPimpinan'))return;
    const candidates=[document.querySelector('#dashboardMsg')?.parentElement,document.querySelector('#metrics')?.parentElement,document.querySelector('#app .panel')];
    const host=candidates.find(Boolean);if(!host)return;
    const b=document.createElement('button');b.id='btnLaporanPimpinan';b.className='btn';b.textContent='📘 Laporan Pimpinan';b.style.marginLeft='8px';b.onclick=openModal;
    host.querySelector('.toolbar')?.appendChild(b);
  };
  const wait=()=>{
    inject();
    if(document.getElementById('app')?.classList.contains('hidden')){setTimeout(wait,800);}
    else if(!document.getElementById('btnLaporanPimpinan'))setTimeout(wait,500);
  };
  window.addEventListener('load',wait);
})();
