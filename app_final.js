/* Evaluasi Dit IE V2.4 — Safe Metrics + Resilient API + GIS */
const GAS_URL='https://script.google.com/macros/s/AKfycbxC4kjW2svVJm7cWa0j4USUevdXXVJyLGsZPfWA3cGLFp24cZqV_dlB8CP2IMLspBy_xQ/exec';
let key='',data=null,evals=[],standards=[],analyses=[],analysisMap={},gisPoints=[],map=null,mapLayer=null,current=null,filterCard='';
let editEvalId='', editStdId='';
const $=id=>document.getElementById(id), clean=v=>String(v??'').trim(), esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const _toNumber=v=>{
  if(v===null||v===undefined)return null;
  let s=String(v).trim(); if(!s)return null;
  s=s.replace(/[^0-9,.-]/g,''); if(!s)return null;
  const comma=s.lastIndexOf(','), dot=s.lastIndexOf('.');
  if(comma>-1 && dot>-1){
    s=comma>dot?s.replace(/\./g,'').replace(',','.'):s.replace(/,/g,'');
  }else if(comma>-1){
    const tail=s.length-comma-1; s=tail<=2?s.replace(',','.'):s.replace(/,/g,'');
  }else if(dot>-1){
    const tail=s.length-dot-1; s=tail===3?s.replace(/\./g,''):s;
  }
  const n=Number(s); return Number.isFinite(n)?n:null;
};
const num=v=>{const n=_toNumber(v); return n===null?'—':n.toLocaleString('id-ID')};
const pctSafe=(part,total,digits=1)=>{const a=_toNumber(part),b=_toNumber(total); if(a===null||b===null||b<=0)return null; const p=(a/b)*100; return Number.isFinite(p)?p:null};
const pctText=(part,total,digits=1)=>{const p=pctSafe(part,total,digits); return p===null?'Belum dapat dihitung':`${p.toFixed(digits).replace('.',',')}%`};

const A_LABELS={
 a1:'Jumlah SDM JF Penyuluh',a2:'Pelaksana pencegahan lainnya',a3:'Kebutuhan personel',
 a4:'Kecukupan SDM',a5:'Kompetensi yang tersedia',a6:'Kompetensi yang perlu diperkuat',
 a7:'Alat peraga',a8:'Peralatan pendukung',a9:'Komputer dan internet',a10:'Sarana umum lainnya',
 a11:'Dukungan pemangku kepentingan',a12:'Jumlah pemangku kepentingan',a13:'Kegiatan yang didukung',
 a14:'Bentuk dukungan',a15:'Perencanaan daerah',a16:'Usulan yang didukung',a17:'Jumlah usulan',
 a18:'Bentuk dukungan / proposal',a19:'Dukungan dana atau sarana',a20:'Jumlah kegiatan yang didukung',
 a21:'Nilai dukungan',a22:'Sumber / bentuk dukungan',a23:'Dana hibah pencegahan',a24:'Tahun hibah',
 a25:'Jumlah hibah',a26:'Sumber / penggunaan',a27:'Kendala umum',a28:'Kebutuhan dukungan Dit IE',
 a29:'Prioritas kebutuhan',
 a30:'DEKTARI — Kendala',a31:'DEKTARI — Saran/Masukan',
 a32:'SIPAREL — Kendala',a33:'SIPAREL — Saran/Masukan',
 a34:'SIDePE — Kendala',a35:'SIDePE — Saran/Masukan',
 a36:'REAN — Kendala',a37:'REAN — Saran/Masukan'
};
const B_LABELS={
 b01a:'Jumlah sekolah sasaran/calon RTS',b01b:'Jumlah sekolah yang sudah melaksanakan RTS',b01c:'Jumlah sekolah yang sudah dinilai kesiapan',
 b01d:'Status umum cakupan',b01e:'Catatan singkat cakupan/konteks',
 b02_1:'1. Kesediaan sekolah melaksanakan RTS',b02_2:'2. Kesediaan mengalokasikan waktu pelaksanaan',
 b02_3:'3. Dukungan sekolah terhadap kegiatan',b02_4:'4. Ketersediaan/penetapan guru pendamping',
 b02_5:'5. Ketersediaan/penetapan siswa/fasilitator remaja',b02_6:'6. Dukungan anggaran',
 b02_7:'7. Dukungan sarana/perlengkapan',b02_8:'8. Ketersediaan ruang peer education',
 b02_9:'9. Kesediaan berkolaborasi dalam monitoring dan RTL',b02note:'Aspek kesiapan yang paling perlu diperkuat',
 b03a:'Jumlah sekolah yang sudah dikoordinasikan',b03b:'Koordinasi berjalan?',b03c:'Guru pendamping tersedia',
 b03d:'Jadwal pelaksanaan tersedia',b03e:'Anggaran/sarana pendukung tersedia',b03f:'Catatan dukungan/gap sumber daya',
 b04a:'Jumlah guru pendamping',b04b:'Guru pendamping sudah ditetapkan',b04c:'Jumlah fasilitator remaja',
 b04d:'Fasilitator sesuai kriteria',b04e:'Sudah mendapat pelatihan/pembekalan',b04f:'Catatan personel/gap pembekalan',
 b05a:'Jumlah pelatihan/pembekalan RTS',b05b:'Total peserta pelatihan',b05c:'Pre-test digunakan?',
 b05d:'Post-test digunakan?',b05f:'Ringkasan hasil/perubahan bila tersedia',
 b06a:'Jumlah sekolah dengan RTL',b06b:'Jumlah kegiatan yang direncanakan dalam RTL',b06c:'Jumlah kegiatan RTL yang terlaksana',
 b06d:'Jumlah siswa yang dijangkau',b06e:'Jumlah sekolah yang mencapai acuan minimal 30 siswa',b06f:'Catatan capaian/gap pelaksanaan RTL',
 b07a:'Pelaksanaan yang pernah diobservasi',b07b:'Kualitas fasilitator secara umum',b07c:'Kesesuaian materi/metode',
 b07d:'Bukti pelaksanaan tersedia',b07e:'Hal yang baik / aspek yang perlu diperbaiki',
 b08a:'Jumlah kunjungan/monitoring RTS',b08b:'Jumlah sekolah yang dimonitor',b08c:'Monitoring berkala dilakukan',
 b08d:'Forum komunikasi/Community of Practice',b08e:'Hasil pendampingan/forum dan rekomendasi teknis',
 b09a:'Kendala utama RTS',b09b:'Upaya/solusi yang sudah dilakukan',b09c:'Dukungan yang masih dibutuhkan'
};
const C_LABELS={
 c01a:'Jumlah kegiatan',c01b:'Total target peserta',c01c:'Total peserta hadir',c01d:'Kelompok sasaran utama',c01e:'Output/hasil langsung yang paling menonjol',
 c02a:'Jumlah kegiatan kampanye',c02b:'Total sasaran/target',c02c:'Estimasi orang terjangkau',c02d:'Lokasi/wilayah utama',c02e:'Output/hasil langsung',
 c03a:'Jumlah aktivitas/publikasi media',c03b:'Estimasi total reach/audiens',c03c:'Jenis media utama',c03d:'Frekuensi/durasi tayang',c03e:'Output/media yang dihasilkan',
 c04a:'Jumlah konten/publikasi',c04b:'Platform utama',c04d:'Total reach',c04f:'Konten/format utama dan catatan statistik',
 c06a:'Kegiatan yang dievaluasi/diambil feedback',c06b:'Jumlah responden',c06c:'Kepuasan (bila diukur)',
 c06d:'Pemahaman (bila diukur)',c06e:'Perubahan pengetahuan/sikap/perilaku',c06f:'Ringkasan feedback/temuan evaluasi',
 c08a:'Videotron dimiliki/dikelola/digunakan?',c08b:'Frekuensi/durasi/kondisi videotron',
 c08c:'Mobil sosialisasi dimiliki/digunakan?',c08d:'Frekuensi/lokasi/kondisi mobil',c08e:'Media gratis/dukungan eksternal',
 c08f:'Stakeholder/mitra dan bentuk kontribusi',
 c09a:'Surat tugas/penugasan',c09b:'Rencana/TOR',c09c:'Daftar hadir bila relevan',c09d:'Dokumentasi',
 c09e:'Laporan kegiatan',c09f:'Rekap feedback',c09g:'Lokasi/link bukti atau keterangan penyimpanan dokumen',
 c10a:'Kendala utama',c10b:'Upaya/solusi',c10c:'Dukungan yang dibutuhkan dari Dit IE'
};
const FRIENDLY_SECTION={
 A:'Bagian Umum',
 B:'Remaja Teman Sebaya (RTS)',
 C:'Penyebarluasan Informasi & Edukasi'
};
const API_TIMEOUT_MS=20000;
const API_RETRIES=3;
const RETRYABLE_STATUS=new Set([404,408,425,429,500,502,503,504]);
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function requestJson(url,label){
  let lastError=null;
  for(let attempt=1;attempt<=API_RETRIES;attempt++){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),API_TIMEOUT_MS);
    const started=performance.now();
    try{
      const r=await fetch(url,{
        cache:'no-store',
        credentials:'omit',
        redirect:'follow',
        headers:{'Accept':'application/json'},
        signal:controller.signal
      });
      const t=await r.text();
      let j=null;
      try{j=JSON.parse(t)}catch(_e){}
      const ms=Math.round(performance.now()-started);
      if(r.ok&&j&&j.ok){
        console.debug('[Evaluasi Dit IE] OK',label,{attempt,http:r.status,ms});
        return j;
      }
      const transient=RETRYABLE_STATUS.has(r.status)||!j;
      lastError=new Error(j?.error||`HTTP ${r.status}`);
      console.warn('[Evaluasi Dit IE] respons tidak siap',label,{attempt,http:r.status,json:!!j,ms,transient});
      if(!transient || attempt===API_RETRIES) break;
    }catch(e){
      const ms=Math.round(performance.now()-started);
      lastError=e?.name==='AbortError'?new Error('Waktu koneksi habis'):e;
      console.warn('[Evaluasi Dit IE] koneksi gagal',label,{attempt,error:String(lastError.message||lastError),ms});
      if(attempt===API_RETRIES) break;
    }finally{
      clearTimeout(timer);
    }
    await sleep(700*Math.pow(2,attempt-1));
  }
  throw new Error(`Sistem belum dapat dihubungi untuk ${label}. Silakan coba kembali.`);
}
async function get(action,params={}){
  const q=new URLSearchParams({action,...params,t:String(Date.now())});
  return requestJson(GAS_URL+'?'+q.toString(),'action '+action);
}
async function getFrom(url,action,params={}){
  const q=new URLSearchParams({action,...params,t:String(Date.now())});
  return requestJson(url+'?'+q.toString(),'GIS '+action);
}

function normalizeSummaryResponse(raw){
  const candidates=[
    raw,
    raw?.summary,
    raw?.data,
    raw?.result,
    raw?.payload,
    raw?.summary?.data,
    raw?.result?.data
  ].filter(Boolean);
  for(const x of candidates){
    if(Array.isArray(x.records)) return {
      ...x,
      records:x.records,
      stats:x.stats||raw?.stats||raw?.summary?.stats||{}
    };
  }
  // Some versions may expose items instead of records.
  for(const x of candidates){
    if(Array.isArray(x.items)) return {
      ...x,
      records:x.items,
      stats:x.stats||raw?.stats||{}
    };
  }
  return raw||{};
}
async function loadAll(){
  const summaryCacheKey='mie2026_summary_v1';
  const now=Date.now();
  let cached=null;
  try{
    const c=JSON.parse(localStorage.getItem(summaryCacheKey)||'null');
    if(c&&c.data&&now-Number(c.ts||0)<2*60*1000) cached=c.data;
  }catch(_e){}

  if(cached){
    data=normalizeSummaryResponse(cached); evals=[]; analyses=[]; analysisMap={};
    renderAll();
    if($('dashboardMsg')) $('dashboardMsg').textContent='Data terakhir ditampilkan. Memperbarui data…';
  }else{
    data={stats:{},records:[]}; evals=[]; analyses=[]; analysisMap={};
    renderAll();
    if($('dashboardMsg')) $('dashboardMsg').textContent='Mengambil data monitoring terbaru…';
  }

  // Summary is the only request that gates the authenticated dashboard.
  // When a cache exists, the dashboard is usable immediately while fresh data loads.
  const rawSummary=await get('adminSummary',{key});
  const s=normalizeSummaryResponse(rawSummary);
  if(!Array.isArray(s.records)){
    throw new Error('Respons monitoring diterima, tetapi daftar data Satker tidak tersedia.');
  }
  // If a transient/deployed wrapper returned no records while a valid cache exists,
  // keep the valid cache rather than displaying a false zero state.
  if(s.records.length===0 && cached?.records?.length){
    data=normalizeSummaryResponse(cached);
    if($('dashboardMsg')) $('dashboardMsg').textContent='Data terakhir ditampilkan. Data terbaru belum tersedia.';
  }else{
    data=s;
  }
  try{localStorage.setItem(summaryCacheKey,JSON.stringify({ts:Date.now(),data:data}))}catch(_e){}
  // Local/Juknis analysis is available immediately, even when the optional
  // server analysis endpoint has no saved analysis rows.
  analyses=buildLocalAnalyses();
  analysisMap={};
  analyses.forEach(x=>{
    const pid=String(x.pengisian_id||'');
    const cur=analysisMap[pid];
    const pr=String(x.prioritas||x.priority||'').toUpperCase();
    const rank=(pr==='ATENSI'||pr==='TINGGI')?3:((pr==='PENDAMPINGAN'||pr==='MONITORING'||pr==='SEDANG')?2:(pr==='BAIK'?1:0));
    if(!cur || rank>cur._rank) analysisMap[pid]=Object.assign({},x,{_rank:rank,priority:pr});
  });
  renderAll();
  if($('dashboardMsg')) $('dashboardMsg').textContent=`Data monitoring terbaru berhasil dimuat: ${data.records.length} pengisian Satker dari populasi 216 Satker.`;

  // GIS is the primary dashboard visual. Start it before secondary enrichment.
  if($('gisMsg')) $('gisMsg').textContent='Menyiapkan peta 216 Satker…';
  loadGIS();

  // Secondary enrichment remains non-blocking.
  get('adminEvaluations',{key}).then(e=>{
    evals=e.records||[];
    renderMetrics(); renderList(); renderTable();
    if(current)showDetail(current.pengisian_id);
  }).catch(_e=>{});

  get('analysis',{key}).then(a=>{
    const remote=Array.isArray(a?.analyses)?a.analyses:[];
    // A successful but empty analysis response must NOT erase the local/Juknis analysis.
    if(remote.length){
      analyses=remote;
      analysisMap={};
      analyses.forEach(x=>{
        const pid=String(x.pengisian_id||'');
        const cur=analysisMap[pid];
        const pr=String(x.prioritas||x.priority||'').toUpperCase();
        const rank=(pr==='ATENSI'||pr==='TINGGI')?3:((pr==='PENDAMPINGAN'||pr==='MONITORING'||pr==='SEDANG')?2:(pr==='BAIK'?1:0));
        if(!cur || rank>cur._rank) analysisMap[pid]=Object.assign({},x,{_rank:rank,priority:pr});
      });
      renderMetrics(); renderList(); renderTable();
      if(current)showDetail(current.pengisian_id);
    }
  }).catch(_e=>{});

}
function statusClass(s){return String(s||'').toUpperCase()==='SELESAI'?'ok':String(s||'').toUpperCase()==='DRAFT'?'warn':''}
function displayStatus(s){const x=String(s||'').toUpperCase();if(x==='SELESAI')return'Sudah Mengisi';if(x==='DRAFT')return'Belum Selesai';return s||'Belum Ada Status'}
function priorityFor(r){
  const a=analysisMap[String(r.pengisian_id||'')];
  return String(a?.priority||a?.prioritas||'').toUpperCase();
}

function sectionStatusForRecord(r, section){
  const obj=(r?.[section]&&typeof r[section]==='object')?r[section]:{};
  const exists=!!r?.saved?.[section] || Object.keys(obj).length>0;
  if(!exists) return 'PERLU PERHATIAN';
  const items=(analyses||[]).filter(a=>String(a.pengisian_id)===String(r.pengisian_id));
  let related=[];
  if(section==='B') related=items.filter(a=>/RTS|Remaja Teman Sebaya/i.test(String(a.fokus||'')));
  if(section==='C') related=items.filter(a=>/Penyebarluasan|Performa Digital|Peserta Tatap Muka/i.test(String(a.fokus||'')));
  const high=related.some(a=>['TINGGI','ATENSI'].includes(String(a.prioritas||a.priority||'').toUpperCase()));
  const med=related.some(a=>['SEDANG','PENDAMPINGAN','MONITORING'].includes(String(a.prioritas||a.priority||'').toUpperCase()));
  if(high)return 'PERLU PERHATIAN';
  if(med)return 'PERLU PENGUATAN';
  return 'MEMENUHI';
}
function overallStatusForRecord(r){
  const sts=['A','B','C'].map(x=>sectionStatusForRecord(r,x));
  if(sts.includes('PERLU PERHATIAN'))return 'PERLU PERHATIAN';
  if(sts.includes('PERLU PENGUATAN'))return 'PERLU PENGUATAN';
  return 'MEMENUHI';
}
function statusClassNew(s){
  const x=String(s||'').toUpperCase();
  return x==='MEMENUHI'?'status-ok':x==='PERLU PENGUATAN'?'status-strengthen':'status-attention';
}
function statusCardFilter(r){
  if(filterCard==='status_memenuhi')return overallStatusForRecord(r)==='MEMENUHI';
  if(filterCard==='status_penguat')return overallStatusForRecord(r)==='PERLU PENGUATAN';
  if(filterCard==='status_perhatian')return overallStatusForRecord(r)==='PERLU PERHATIAN';
  return true;
}


function _recordSatkerKey(r){
  return String(r?.kode_satker||r?.satker_id||r?.nama_satker||'').trim().toLowerCase();
}
function _recordTime(r){
  const vals=[r?.updated_at,r?.created_at,r?.timestamp,r?.submitted_at,r?.waktu_pengisian,r?.tanggal_pengisian];
  for(const v of vals){
    const t=Date.parse(String(v||''));
    if(Number.isFinite(t)) return t;
  }
  return 0;
}
function _groupRecordsBySatker(records){
  const groups={};
  (records||[]).forEach(r=>{
    const k=_recordSatkerKey(r);
    if(!k)return;
    (groups[k]??=[]).push(r);
  });
  Object.values(groups).forEach(list=>list.sort((a,b)=>{
    const tb=_recordTime(b), ta=_recordTime(a);
    if(tb!==ta)return tb-ta;
    return String(b?.pengisian_id||'').localeCompare(String(a?.pengisian_id||''));
  }));
  return groups;
}
function _latestRecordForSatker(list){
  return (list||[])[0]||null;
}
function _inputCountForRecord(r){
  const k=_recordSatkerKey(r);
  if(!k)return 0;
  const list=_groupRecordsBySatker(data?.records||[])[k]||[];
  return list.length;
}
function _historyRecordsForSatker(r){
  const k=_recordSatkerKey(r);
  return (_groupRecordsBySatker(data?.records||[])[k]||[]);
}
function _formatRecordDate(r){
  const t=_recordTime(r);
  if(!t)return 'Tanggal tidak tersedia';
  try{return new Date(t).toLocaleString('id-ID',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});}catch(_e){return String(r?.updated_at||r?.created_at||'Tanggal tidak tersedia')}
}
function _historyStatusLabel(r,idx){
  const list=_historyRecordsForSatker(r);
  return idx===0 && list.length>1 ? 'Input terbaru' : (list.length>1 ? 'Histori' : 'Input');
}
function _showSubmissionHistory(pid){
  const base=(data?.records||[]).find(x=>String(x.pengisian_id)===String(pid));
  if(!base)return;
  const list=_historyRecordsForSatker(base);
  const title=esc(base.nama_satker||'Satker');
  let box=document.getElementById('submissionHistoryModal');
  if(!box){
    box=document.createElement('div');
    box.id='submissionHistoryModal';
    box.className='history-modal';
    document.body.appendChild(box);
  }
  box.innerHTML=`<div class="history-backdrop" data-history-close></div>
    <div class="history-dialog" role="dialog" aria-modal="true" aria-labelledby="historyTitle">
      <div class="history-head"><div><h3 id="historyTitle" style="margin:0">Histori Pengisian</h3><div class="small muted">${title} · ${list.length} input</div></div><button class="btn secondary" type="button" data-history-close>Tutup</button></div>
      <div class="history-note">Semua pengisian tetap dipertahankan. Sistem hanya menampilkan histori dan tidak menghapus atau menolak input. Belum ada data yang ditetapkan sebagai basis evaluasi dari halaman ini.</div>
      <div class="history-list">
        ${list.map((x,i)=>`<div class="history-row">
          <div><div class="history-main"><b>Input #${list.length-i}</b><span class="history-tag">${esc(_historyStatusLabel(x,i))}</span></div>
          <div class="small muted">${esc(_formatRecordDate(x))} · ${esc(x.nomor_pengisian||x.pengisian_id||'ID tidak tersedia')}</div>
          <div class="small">${esc(displayStatus(x.status))}</div></div>
          <button class="btn secondary history-open" type="button" data-pid="${esc(x.pengisian_id)}">Lihat Data</button>
        </div>`).join('')}
      </div>
    </div>`;
  box.classList.add('show');
  box.querySelectorAll('[data-history-close]').forEach(el=>el.onclick=()=>box.classList.remove('show'));
  box.querySelectorAll('.history-open').forEach(el=>el.onclick=()=>{
    box.classList.remove('show');
    showDetail(el.dataset.pid);
  });
}

function renderMetrics(){
  const all=data?.records||[], groups=_groupRecordsBySatker(all);
  const records=Object.values(groups).map(_latestRecordForSatker).filter(Boolean);
  const selesai=records.filter(r=>String(r.status||'').toUpperCase()==='SELESAI').length;
  const belumSelesai=records.filter(r=>String(r.status||'').toUpperCase()!=='SELESAI').length;
  const totalSatker=216, belumMengisi=Math.max(0,totalSatker-records.length);
  const pend=records.filter(r=>['PENDAMPINGAN','MONITORING','SEDANG'].includes(priorityFor(r))).length;
  const att=records.filter(r=>['ATENSI','TINGGI'].includes(priorityFor(r))).length;
  const items=[[totalSatker,'Total Satker','all'],[selesai,'Sudah Mengisi','selesai'],[belumSelesai,'Belum Selesai','belum_selesai'],[belumMengisi,'Belum Mengisi','belum_mengisi'],[pend,'Perlu Pendampingan','pendampingan'],[att,'Perlu Perhatian','perhatian']];
  $('metrics').innerHTML=items.map(x=>`<div class="metric ${filterCard===x[2]?'active':''}" data-card="${x[2]}"><div class="n">${num(x[0])}</div><div class="l">${x[1]}</div></div>`).join('');
  const sc=[
    ['MEMENUHI',records.filter(r=>overallStatusForRecord(r)==='MEMENUHI').length,'status_memenuhi'],
    ['PERLU PENGUATAN',records.filter(r=>overallStatusForRecord(r)==='PERLU PENGUATAN').length,'status_penguat'],
    ['PERLU PERHATIAN',records.filter(r=>overallStatusForRecord(r)==='PERLU PERHATIAN').length,'status_perhatian']
  ];
  if($('statusMetrics')) $('statusMetrics').innerHTML=sc.map(x=>`<div class="status-card ${statusClassNew(x[0])} ${filterCard===x[2]?'active':''}" data-card="${x[2]}"><div class="status-n">${num(x[1])}</div><div class="status-l">${x[0]}</div><div class="status-h">Klik untuk melihat Satker</div></div>`).join('');
  document.querySelectorAll('.metric,.status-card').forEach(m=>m.onclick=()=>{
    filterCard=m.dataset.card;renderMetrics();renderList();renderTable();renderMap();
  });
}
function cardFilter(r){
  if(!statusCardFilter(r))return false;
  const st=String(r.status||'').toUpperCase(), p=priorityFor(r);
  if(filterCard==='selesai')return st==='SELESAI';
  if(filterCard==='belum_selesai')return st!=='SELESAI';
  if(filterCard==='pendampingan')return ['PENDAMPINGAN','MONITORING','SEDANG'].includes(p);
  if(filterCard==='perhatian')return p==='ATENSI'||p==='TINGGI';
  return true;
}
function filteredRows(){
  const q=clean($('search').value).toLowerCase(),f=clean($('statusFilter').value).toUpperCase();
  const groups=_groupRecordsBySatker(data?.records||[]);
  return Object.values(groups).map(_latestRecordForSatker).filter(Boolean).filter(x=>{
    if(!cardFilter(x))return false;
    const p=priorityFor(x), st=String(x.status||'').toUpperCase();
    const ok=!f||(f==='SELESAI'&&st==='SELESAI')||(f==='DRAFT'&&st!=='SELESAI')||(f==='PERLU_MENGISI'&&false)||(f==='PERLU_PENDAMPINGAN'&&['PENDAMPINGAN','MONITORING','SEDANG'].includes(p))||(f==='PERLU_PERHATIAN'&&['ATENSI','TINGGI'].includes(p));
    return ok&&(!q||[x.nama_satker,x.nomor_pengisian,x.kode_satker].some(v=>String(v||'').toLowerCase().includes(q)));
  });
}
function renderList(){
  const rows=filteredRows();
  $('listHint').textContent=filterCard?'Filter aktif: '+({selesai:'Sudah Mengisi',belum_selesai:'Belum Selesai',belum_mengisi:'Belum Mengisi',pendampingan:'Perlu Pendampingan',perhatian:'Perlu Perhatian'}[filterCard]||''):'Klik kartu atau titik peta untuk memfilter';
  $('satkerList').innerHTML=rows.map(x=>{
    const count=_inputCountForRecord(x);
    return `<div class="satrow" data-pid="${esc(x.pengisian_id)}"><b>${esc(x.nama_satker||'—')}</b><span class="small muted">${esc(x.kode_satker||'')} · ${esc(x.nomor_pengisian||'')}</span><br><span class="badge ${statusClass(x.status)}">${esc(displayStatus(x.status))}</span> ${count>1?`<span class="badge warn">${count} input</span>`:''}</div>`;
  }).join('')||'<div class="muted">Tidak ada Satker sesuai filter.</div>';
  document.querySelectorAll('.satrow').forEach(el=>el.onclick=()=>showDetail(el.dataset.pid));
}
function renderTable(){
  const rows=filteredRows();
  $('satkerBody').innerHTML=rows.map(x=>{
    const count=_inputCountForRecord(x);
    const multi=count>1;
    return `<tr>
      <td><b>${esc(x.nama_satker||'—')}</b><br><span class="small muted">${esc(x.kode_satker||'')}</span></td>
      <td>${multi?`<button class="history-count" type="button" data-history="${esc(x.pengisian_id)}">${count} input</button>`:'<span class="small muted">1 input'}</td>
      <td><span class="badge ${statusClass(x.status)}">${esc(displayStatus(x.status))}</span></td>
      <td>${x.saved?.A?'<span class="badge ok">Tersedia</span>':'<span class="badge warn">Belum ada</span>'}</td>
      <td>${x.saved?.B?'<span class="badge ok">Tersedia</span>':'<span class="badge warn">Belum ada</span>'}</td>
      <td>${x.saved?.C?'<span class="badge ok">Tersedia</span>':'<span class="badge warn">Belum ada</span>'}</td>
      <td><div class="action-group">
        <button class="btn secondary actionOpen" data-pid="${esc(x.pengisian_id)}">Buka</button>
        <button class="btn secondary actionEval" data-pid="${esc(x.pengisian_id)}">Analisis &amp; Rekomendasi</button>
        ${multi?`<button class="btn secondary actionHistory" data-pid="${esc(x.pengisian_id)}">Histori</button>`:''}
        <button class="btn danger actionDelete" data-pid="${esc(x.pengisian_id)}">Hapus</button>
      </div></td>
    </tr>`;
  }).join('')||'<tr><td colspan="7" class="muted">Tidak ada data.</td></tr>';
  document.querySelectorAll('.history-count,.actionHistory').forEach(el=>el.onclick=()=>_showSubmissionHistory(el.dataset.history||el.dataset.pid));
  document.querySelectorAll('.actionOpen').forEach(el=>el.onclick=()=>showDetail(el.dataset.pid));
  document.querySelectorAll('.actionEval').forEach(el=>el.onclick=()=>{
    showDetail(el.dataset.pid);
    setTimeout(()=>document.querySelector('#detailData .analysis-item')?.scrollIntoView({behavior:'smooth',block:'start'}),180);
  });
  document.querySelectorAll('.actionDelete').forEach(el=>el.onclick=()=>deleteMonitoring(el.dataset.pid));
}
function renderAll(){renderMetrics();renderList();renderTable();renderAnalysis();if(current)showDetail(current.pengisian_id)}
function mapStatusForPoint(p){
  const code=String(p.kode_satker||p.satker_id||'').trim().toLowerCase();
  const r=(data?.records||[]).find(x=>String(x.kode_satker||'').trim().toLowerCase()===code);
  const pr=r?priorityFor(r):'';
  if(pr==='ATENSI'||pr==='TINGGI') return {label:'PERLU PERHATIAN', cls:'attention', color:'#c52828', record:r};
  if(pr==='PENDAMPINGAN'||pr==='MONITORING'||pr==='SEDANG') return {label:'PERLU PENDAMPINGAN', cls:'assist', color:'#f39c12', record:r};
  if(r && String(r.status||'').toUpperCase()==='SELESAI') return {label:'SUDAH MENGISI', cls:'done', color:'#0b8f68', record:r};
  if(r) return {label:'BELUM SELESAI', cls:'draft', color:'#f39c12', record:r};
  return {label:'BELUM MENGISI', cls:'notyet', color:'#c52828', record:null};
}
function renderMap(){
  if(!window.L){$('gisMsg').textContent='Library GIS belum termuat.';return}
  if(!map){
    map=L.map('map',{preferCanvas:true}).setView([-2.2,118],4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors',maxZoom:18}).addTo(map);
  }
  if(mapLayer)map.removeLayer(mapLayer);
  mapLayer=L.layerGroup();
  const bounds=[];
  const f=filterCard;
  gisPoints.forEach(p=>{
    const st=mapStatusForPoint(p);
    if(f==='selesai' && st.label!=='SUDAH MENGISI')return;
    if(f==='belum' && st.label==='SUDAH MENGISI')return;
    if(f==='pendampingan' && st.label!=='PERLU PENDAMPINGAN')return;
    if(f==='perhatian' && st.label!=='PERLU PERHATIAN')return;
    const lat=Number(p.lat??p.latitude),lng=Number(p.lng??p.longitude);
    if(!Number.isFinite(lat)||!Number.isFinite(lng))return;
    const marker=L.circleMarker([lat,lng],{radius:6,weight:1,color:'#fff',fillColor:st.color,fillOpacity:.9});
    const pid=st.record?.pengisian_id||'';
    marker.bindPopup(`<b>${esc(p.nama_satker||p.name||'Satker')}</b><br><span style="font-weight:700;color:${st.color}">${st.label}</span>${pid?`<br><button type="button" data-pid="${esc(pid)}" class="mapOpen">Buka Evaluasi</button>`:''}`);
    marker.on('popupopen',()=>{
      const b=document.querySelector('.mapOpen');
      if(b)b.onclick=()=>showDetail(b.dataset.pid);
    });
    marker.addTo(mapLayer);bounds.push([lat,lng]);
  });
  mapLayer.addTo(map);
  $('gisMsg').textContent=gisPoints.length?`${gisPoints.length} titik Satker. Warna titik mengikuti status monitoring dan hasil evaluasi.`:'Belum ada titik GIS.';
  if(bounds.length)map.fitBounds(bounds,{padding:[20,20],maxZoom:7});
  setTimeout(()=>map.invalidateSize(),100);
}
function block(title,obj){
  const labels = title===FRIENDLY_SECTION.A?A_LABELS:title===FRIENDLY_SECTION.B?B_LABELS:C_LABELS;
  const rows=Object.keys(obj||{})
    .filter(k=>!['payload_json','pengisian_id','nomor_pengisian','satker_id','kode_satker','nama_satker','progress','created_at','updated_at'].includes(k))
    .map(k=>`<tr><th>${esc(labels[k]||'Informasi lainnya')}</th><td>${esc(obj[k]===''?'—':obj[k])}</td></tr>`).join('');
  return `<div class="panel data-section"><h3>${title}</h3><table>${rows||'<tr><td class="muted">Belum ada data yang tersedia.</td></tr>'}</table></div>`;
}

async function deleteMonitoring(pid){
  const r=(data.records||[]).find(x=>String(x.pengisian_id)===String(pid));
  if(!r)return;
  const name=r.nama_satker||r.kode_satker||r.nomor_pengisian||'data ini';
  const ok=confirm(
    `Hapus data pengisian "${name}"?\n\n`+
    `Tindakan ini menghapus data pengisian beserta data Bagian Umum, RTS, Penyebarluasan Informasi & Edukasi, serta hasil evaluasi yang terkait.\n\n`+
    `Tindakan ini permanen dan sebaiknya hanya digunakan untuk data uji/coba.`
  );
  if(!ok)return;
  try{
    document.querySelectorAll('.actionDelete').forEach(b=>b.disabled=true);
    const res=await get('deletePengisian',{key,pengisian_id:pid});
    if(!res.ok)throw new Error(res.error||'Data tidak berhasil dihapus.');
    if(current&&String(current.pengisian_id)===String(pid)){
      $('detailPanel').classList.remove('show');
      current=null;
    }
    await loadAll();
    if($('dashboardMsg'))$('dashboardMsg').textContent='Data uji berhasil dihapus.';
  }catch(e){
    alert(e.message||'Data tidak berhasil dihapus.');
    console.error(e);
  }finally{
    document.querySelectorAll('.actionDelete').forEach(b=>b.disabled=false);
  }
}
function showDetail(pid){
  current=(data.records||[]).find(x=>String(x.pengisian_id)===String(pid));
  if(!current)return;
  $('detailPanel').classList.add('show');
  $('detailTitle').textContent=current.nama_satker||'Satker';
  $('detailMeta').textContent=`${current.kode_satker||'—'} · ${current.nomor_pengisian||'—'} · ${friendlyStatus(current.status)}`;
  const _detailCount=_inputCountForRecord(current);
  const _historyButton=_detailCount>1?`<button class="btn secondary" type="button" onclick="_showSubmissionHistory('${esc(current.pengisian_id)}')">🗂 ${_detailCount} Input · Lihat Histori</button>`:'';
  $('detailData').innerHTML=
    `<div class="detail-intro"><strong>Ringkasan Monitoring dan Analisis</strong><span>Data berikut menjadi dasar telaah dan rekomendasi untuk Satker.</span>${_historyButton}</div>`+
    block(FRIENDLY_SECTION.A,current.A)+block(FRIENDLY_SECTION.B,current.B)+block(FRIENDLY_SECTION.C,current.C)+
    selectedAnalysisHtml(current.pengisian_id);
}
function selectedAnalysisHtml(pid){
  const r=(data?.records||[]).find(x=>String(x.pengisian_id)===String(pid));
  if(!r)return `<div class="panel data-section"><h3>Analisis &amp; Rekomendasi</h3><p class="muted">Data Satker tidak ditemukan.</p></div>`;
  const items=finalAnalysesForRecord(r), overall=overallStatusForRecord(r);
  return `<div class="panel data-section executive-analysis"><div class="analysis-section-title"><div><h3>Analisis &amp; Rekomendasi</h3><p class="small muted">Telaah eksekutif berdasarkan tiga bagian monitoring.</p></div><span class="status-pill ${statusClassNew(overall)}">${esc(overall)}</span></div>
    ${items.map(x=>`<div class="analysis-item" style="margin-top:10px"><div class="analysis-item-head"><div><h4>${esc(x.fokus)}</h4></div><span class="badge ${statusClassNew(x.status_bagian)}">${esc(x.status_bagian)}</span></div><p><b>Analisa:</b> ${esc(x.analisis)}</p><p><b>Kondisi:</b> ${esc(x.gap)}</p><div class="recommendation"><b>Rekomendasi:</b> ${esc(x.rekomendasi)}</div><p class="small muted"><b>Dasar:</b> ${esc(x.dasar_juknis)}</p></div>`).join('')}
    <div class="attention-box"><b>ATENSI / PRIORITAS PIMPINAN</b><p>${esc(finalOverallRecommendation(r))}</p></div>
    <div class="report-bottom"><div><b>Laporan analisis telah selesai.</b><span>Gunakan tombol berikut untuk dokumentasi dan tindak lanjut.</span></div><button class="btn" type="button" onclick="wordReport()">📄 Cetak Laporan Word</button></div>
  </div>`;
}

function friendlyStatus(s){
  const x=String(s||'').toUpperCase();
  if(x==='SELESAI')return'Sudah Mengisi';
  if(x==='DRAFT')return'Belum Selesai';
  return s||'Belum ada status';
}

function renderStandards(){
  $('stdBody').innerHTML=standards.map(s=>`<tr>
    <td><b>${esc(s.nama_indikator||'—')}</b></td>
    <td>${num(s.target_2026??s.target)}</td>
    <td>${esc(s.satuan||'—')}</td>
    <td>${esc(s.sumber_target||'Acuan Juknis / keputusan internal')}</td>
    <td><div class="action-group">
      <button class="btn secondary editStd" data-id="${esc(s.standard_id)}">Edit</button>
      <button class="btn danger delStd" data-id="${esc(s.standard_id)}">Hapus</button>
    </div></td>
  </tr>`).join('')||'<tr><td colspan="5" class="muted">Belum ada acuan penilaian yang ditetapkan.</td></tr>';
  document.querySelectorAll('.editStd').forEach(b=>b.onclick=()=>editStd(b.dataset.id));
  document.querySelectorAll('.delStd').forEach(b=>b.onclick=()=>delStd(b.dataset.id));
}



function localAnalysisForRecord(r){
  const A=(r?.A&&typeof r.A==='object')?r.A:{},B=(r?.B&&typeof r.B==='object')?r.B:{},C=(r?.C&&typeof r.C==='object')?r.C:{};
  const out=[];
  const n=v=>_toNumber(v);
  const has=v=>String(v??'').trim()!=='';
  const yes=v=>/^(ya|iya|sudah|ada|tersedia|sesuai|terpenuhi|baik|dilaksanakan|memadai)$/i.test(String(v??'').trim());

  // RTS: Surat Pelaksanaan PN T.A. 2026 menetapkan 10 peserta pelatihan.
  const rtsParticipants=n(B.b05b);
  if(rtsParticipants!==null){
    const target=10, gap=rtsParticipants-target, cap=pctSafe(rtsParticipants,target);
    const capText=cap===null?'Belum dapat dihitung':`${cap.toFixed(1).replace('.',',')}%`;
    out.push({
      analysis_id:'LOCAL-'+r.pengisian_id+'-RTS10',pengisian_id:r.pengisian_id,
      nama_satker:r.nama_satker,fokus:'RTS – Peserta Pelatihan',
      analisis:`Peserta pelatihan RTS tercatat ${num(rtsParticipants)} orang dibandingkan acuan ${num(target)} orang dalam Surat Pelaksanaan PN T.A. 2026 (${capText}).`,
      gap:gap>=0?`Lebih ${num(gap)} orang dari acuan.`:`Kurang ${num(Math.abs(gap))} orang dari acuan.`,
      dasar_juknis:'Surat Pelaksanaan Program PN T.A. 2026: jumlah peserta kegiatan pelatihan 10 orang, 1 orang mewakili 1 Komunitas Sekolah.',
      rekomendasi:gap>=0?'Pertahankan keterwakilan peserta dan pastikan keterkaitan peserta dengan komunitas sekolah terdokumentasi.':'Lengkapi peserta pelatihan hingga minimal 10 orang dengan memperhatikan keterwakilan komunitas sekolah.',
      prioritas:gap<0?(cap<75?'TINGGI':'SEDANG'):'RENDAH',status:gap<0?'BELUM MEMENUHI':'SESUAI ACUAN'
    });
  }

  // RTS: 30 students per school dampingan when both quantities exist.
  const schools=n(B.b01a), students=n(B.b06d);
  if(schools!==null && schools>0 && students!==null){
    const target=schools*30, gap=students-target, cap=pctSafe(students,target);
    const capText=cap===null?'Belum dapat dihitung':`${cap.toFixed(1).replace('.',',')}%`;
    out.push({
      analysis_id:'LOCAL-'+r.pengisian_id+'-RTS30',pengisian_id:r.pengisian_id,
      nama_satker:r.nama_satker,fokus:'RTS – Jangkauan Siswa',
      analisis:`Terdapat ${num(students)} siswa yang dijangkau dari acuan minimum ${num(target)} siswa untuk ${num(schools)} sekolah dampingan (${capText}).`,
      gap:gap>=0?`Lebih ${num(gap)} siswa dari acuan minimum.`:`Kurang ${num(Math.abs(gap))} siswa dari acuan minimum.`,
      dasar_juknis:'Juknis RTS dan Surat Pelaksanaan Program PN T.A. 2026: jumlah siswa yang mendapatkan pengimbasan/jangkauan RTL minimal 30 orang.',
      rekomendasi:gap>=0?'Pertahankan pelaksanaan pengimbasan dan dokumentasikan jangkauan per sekolah.':'Prioritaskan pendampingan pada sekolah yang jangkauannya belum mencapai acuan minimum.',
      prioritas:gap<0?(cap<75?'TINGGI':'SEDANG'):'RENDAH',status:gap<0?'BELUM MEMENUHI':'SESUAI ACUAN'
    });
  }

  // IE: target peserta vs hadir.
  const tp=n(C.c01b), ph=n(C.c01c);
  if(tp!==null && tp>0 && ph!==null){
    const gap=ph-tp,cap=pctSafe(ph,tp);
    const capText=cap===null?'Belum dapat dihitung':`${cap.toFixed(1).replace('.',',')}%`;
    out.push({
      analysis_id:'LOCAL-'+r.pengisian_id+'-IEPESERTA',pengisian_id:r.pengisian_id,
      nama_satker:r.nama_satker,fokus:'Penyebarluasan IE – Peserta Tatap Muka',
      analisis:`Peserta hadir ${num(ph)} dari target ${num(tp)} peserta (${capText}).`,
      gap:gap>=0?`Lebih ${num(gap)} peserta dari target.`:`Kurang ${num(Math.abs(gap))} peserta dari target.`,
      dasar_juknis:'Juknis Penyebarluasan Informasi & Edukasi: jumlah peserta hadir menjadi bagian dari penilaian efektivitas kegiatan.',
      rekomendasi:gap>=0?'Pertahankan strategi penjangkauan sasaran dan kelengkapan daftar hadir.':'Perkuat strategi penjangkauan dan mobilisasi sasaran agar capaian peserta mendekati target kegiatan.',
      prioritas:gap<0?(cap<75?'TINGGI':'SEDANG'):'RENDAH',status:gap<0?'BELUM MENCAPAI':'SESUAI TARGET'
    });
  }

  // IE: media reach. No invented target.
  const reach=n(C.c03b)!==null?n(C.c03b):n(C.c02c);
  if(reach!==null){
    out.push({
      analysis_id:'LOCAL-'+r.pengisian_id+'-REACH',pengisian_id:r.pengisian_id,
      nama_satker:r.nama_satker,fokus:'Penyebarluasan IE – Jangkauan Media',
      analisis:`Jangkauan audiens yang tercatat sebesar ${num(reach)} orang/akun terpapar.`,
      gap:'Realisasi reach tersedia; sistem tidak membuat target pembanding fiktif.',
      dasar_juknis:'Juknis Penyebarluasan Informasi & Edukasi menggunakan audience reach sebagai ukuran jangkauan kampanye media.',
      rekomendasi:'Tetapkan sasaran jangkauan pada perencanaan berikutnya dan simpan rekap/insight media agar perkembangan dapat dibandingkan.',
      prioritas:'NORMAL',status:'TERCATAT'
    });
  }

  // C04 tetap dianalisis melalui jumlah konten, platform, total reach, dan catatan konten.
  // Metrik Total Impressions/Views dan Total Engagement sudah dihapus dari Form Satker,
  // sehingga mesin monitoring tidak lagi membaca metrik yang sudah dihapus.

  // Completeness analysis: always useful even with sparse data.
  const sections=[
    ['Bagian Umum',r.saved?.A,A],
    ['Remaja Teman Sebaya (RTS)',r.saved?.B,B],
    ['Penyebarluasan Informasi & Edukasi',r.saved?.C,C]
  ];
  const available=sections.filter(x=>x[1]||Object.keys(x[2]||{}).length);
  const missing=sections.filter(x=>!x[1]&&!Object.keys(x[2]||{}).length).map(x=>x[0]);
  if(missing.length){
    out.push({
      analysis_id:'LOCAL-'+r.pengisian_id+'-KELENGKAPAN',pengisian_id:r.pengisian_id,
      nama_satker:r.nama_satker,fokus:'Kelengkapan Data Monitoring',
      analisis:`Data monitoring untuk Satker ini belum lengkap pada ${missing.join(', ')}.`,
      gap:`Masih ada ${missing.length} bagian yang belum memiliki data monitoring.`,
      dasar_juknis:'Analisis evaluasi dilakukan berdasarkan data monitoring yang tersedia dan bukti pelaksanaan yang dapat ditelaah.',
      rekomendasi:'Lengkapi data dan bukti pelaksanaan pada bagian yang belum tersedia agar capaian dan efektivitas dapat dinilai secara lebih utuh.',
      prioritas:missing.length>=2?'TINGGI':'SEDANG',status:'DATA BELUM LENGKAP'
    });
  }

  // Guarantee at least one Satker-level result, even for very sparse/test data.
  if(!out.length){
    const filled=available.length;
    out.push({
      analysis_id:'LOCAL-'+r.pengisian_id+'-TELAAH',pengisian_id:r.pengisian_id,
      nama_satker:r.nama_satker,fokus:'Telaah Data Monitoring',
      analisis:`Data monitoring Satker tersedia pada ${filled} dari 3 bagian. Data yang tersedia tetap dapat digunakan sebagai bahan telaah awal.`,
      gap:'Belum terdapat data kuantitatif yang cukup untuk menghitung capaian pada indikator yang terpetakan.',
      dasar_juknis:'Analisis dilakukan berdasarkan ketentuan Juknis yang dapat dipetakan langsung ke data monitoring; sistem tidak membuat target atau kesimpulan tanpa bukti.',
      rekomendasi:'Gunakan data yang tersedia sebagai bahan telaah awal dan lengkapi data pendukung agar analisis berikutnya lebih terukur.',
      prioritas:'NORMAL',status:'BELUM DAPAT DINILAI'
    });
  }
  return out;
}


/* === Executive narrative engine: 15 deterministic patterns + data evidence enrichment ===
   Scope: narrative generation only. No API/data-loading/login/GIS logic is changed. */
const NARRATIVE_PATTERNS={
  1:'Sangat Baik / Memenuhi Konsisten',
  2:'Memenuhi dengan Ruang Pengembangan',
  3:'Memenuhi dengan Data Lengkap',
  4:'Memenuhi tetapi Belum Merata',
  5:'Perlu Penguatan Ringan',
  6:'Perlu Penguatan SDM',
  7:'Perlu Penguatan Sarana',
  8:'Perlu Penguatan Cakupan/Jangkauan',
  9:'Perlu Penguatan Kualitas',
 10:'Perlu Penguatan Dokumentasi',
 11:'Perlu Penguatan Perencanaan/Dukungan',
 12:'Perlu Perhatian Terbatas',
 13:'Perlu Perhatian Multi-Aspek',
 14:'Perlu Perhatian Prioritas',
 15:'Perlu Perhatian Intensif'
};
const _hasVal=v=>v!==undefined&&v!==null&&String(v).trim()!=='';
const _truthy=v=>/^(ya|yes|sudah|tersedia|lengkap|memadai|baik|aktif|terpenuhi|terlaksana|berjalan|ada)$/i.test(String(v||'').trim());
const _negative=v=>/^(tidak|belum|belum tersedia|belum lengkap|kurang|tidak memadai|tidak tersedia|tidak ada|belum terpenuhi|belum terlaksana|tidak berjalan|perlu diperkuat|perlu penguatan)$/i.test(String(v||'').trim()) || /\b(kurang|belum|tidak|perlu diperkuat|perlu penguatan|terbatas)\b/i.test(String(v||''));
function _filledRatio(obj){
  const vals=Object.values(obj||{}).filter(v=>_hasVal(v));
  const total=Object.keys(obj||{}).length||1;
  return vals.length/total;
}
function _negativeKeys(obj,keys){return keys.filter(k=>_hasVal(obj?.[k])&&_negative(obj[k]));}
function _firstText(obj,keys){for(const k of keys){if(_hasVal(obj?.[k]))return String(obj[k]).trim()}return'';}
function _num(v){return _toNumber(v);}
function _patternForSection(code,st,obj,exists,negativeCount,filledRatio){
  if(!exists) return {id:15,name:NARRATIVE_PATTERNS[15],reason:'data tidak tersedia'};
  if(st==='MEMENUHI'){
    if(filledRatio>=.88) return {id:3,name:NARRATIVE_PATTERNS[3],reason:'data relatif lengkap'};
    if(negativeCount===0) return {id:1,name:NARRATIVE_PATTERNS[1],reason:'tidak ada temuan negatif terpetakan'};
    return {id:4,name:NARRATIVE_PATTERNS[4],reason:'capaian baik tetapi belum merata'};
  }
  const keys=Object.keys(obj||{}).join(' ').toLowerCase();
  const values=Object.values(obj||{}).map(String).join(' ').toLowerCase();
  const all=keys+' '+values;
  if(st==='PERLU PENGUATAN'){
    if(/sdm|personel|kompetensi|guru|fasilitator|pelatihan/.test(all)) return {id:6,name:NARRATIVE_PATTERNS[6],reason:'temuan dominan SDM/kompetensi'};
    if(/sarana|peralatan|komputer|internet|ruang|videotron|mobil/.test(all)) return {id:7,name:NARRATIVE_PATTERNS[7],reason:'temuan dominan sarana'};
    if(/jangkau|cakupan|sekolah sasaran|peserta|reach|audiens/.test(all)) return {id:8,name:NARRATIVE_PATTERNS[8],reason:'temuan dominan cakupan/jangkauan'};
    if(/kualitas|materi|metode|evaluasi|feedback|pemahaman|pengetahuan|sikap|perilaku/.test(all)) return {id:9,name:NARRATIVE_PATTERNS[9],reason:'temuan dominan kualitas/evaluasi'};
    if(/bukti|dokumentasi|laporan|daftar hadir|surat tugas|tor|rekap/.test(all)) return {id:10,name:NARRATIVE_PATTERNS[10],reason:'temuan dominan dokumentasi'};
    if(/perencanaan|usulan|proposal|anggaran|dukungan|stakeholder|mitra|hibah/.test(all)) return {id:11,name:NARRATIVE_PATTERNS[11],reason:'temuan dominan perencanaan/dukungan'};
    return {id:5,name:NARRATIVE_PATTERNS[5],reason:'kesenjangan terbatas'};
  }
  if(negativeCount>=4 || filledRatio<.45) return {id:15,name:NARRATIVE_PATTERNS[15],reason:'kesenjangan luas atau data sangat terbatas'};
  if(negativeCount>=2) return {id:13,name:NARRATIVE_PATTERNS[13],reason:'beberapa aspek memerlukan perhatian'};
  if(negativeCount===1) return {id:12,name:NARRATIVE_PATTERNS[12],reason:'satu kesenjangan utama terpetakan'};
  return {id:14,name:NARRATIVE_PATTERNS[14],reason:'kesenjangan prioritas'};
}
function _findingsForSection(code,obj){
  const out=[];
  const groups={
    A:{sdm:['a3','a4','a5','a6'],sarana:['a7','a8','a9','a10'],dukungan:['a11','a12','a13','a14','a19','a20','a21','a22','a23','a24','a25','a26'],perencanaan:['a15','a16','a17','a18'],kendala:['a27','a28','a29'],aplikasi:['a30','a32','a34','a36']},
    B:{cakupan:['b01a','b01b','b01c','b01d','b01e'],sdm:['b03c','b04a','b04b','b04c','b04d','b04e','b04f','b05a','b05b','b05c','b05d'],sarana:['b02_6','b02_7'],kualitas:['b02_9','b07b','b07c','b08c','b08e'],dukungan:['b02_1','b02_2','b02_3','b02_8','b03a','b03b','b03d','b03e'],bukti:['b07d'],kendala:['b09a','b09b','b09c']},
    C:{cakupan:['c01a','c01b','c01c','c02a','c02b','c02c','c03a','c03b','c04a','c04d'],kualitas:['c06a','c06b','c06c','c06d','c06e','c06f'],sarana:['c08a','c08b','c08c','c08d'],bukti:['c09a','c09b','c09c','c09d','c09e','c09f','c09g'],dukungan:['c10a','c10b','c10c','c08e','c08f']}
  }[code]||{};
  for(const [name,keys] of Object.entries(groups)){
    const neg=_negativeKeys(obj,keys);
    if(neg.length){
      const labels=neg.slice(0,3).map(k=>code==='A'?A_LABELS[k]:code==='B'?B_LABELS[k]:C_LABELS[k]).filter(Boolean);
      out.push({name,keys:neg,labels});
    }
  }
  return out;
}
function _pctChange(current, previous){
  const c=_num(current), p=_num(previous);
  if(c===null || p===null || p===0) return null;
  const pct=((c-p)/Math.abs(p))*100;
  return Number.isFinite(pct)?pct:null;
}
function _trendSentence(label,current,previous){
  const c=_num(current), p=_num(previous);
  const pct=_pctChange(c,p);
  if(c===null || p===null || pct===null) return '';
  if(pct>0.01) return `${label} meningkat dari ${num(p)} menjadi ${num(c)}, bertambah ${num(c-p)} atau ${Math.abs(pct).toFixed(1).replace('.',',')}% dibandingkan periode sebelumnya.`;
  if(pct<-0.01) return `${label} menurun dari ${num(p)} menjadi ${num(c)}, berkurang ${num(Math.abs(c-p))} atau ${Math.abs(pct).toFixed(1).replace('.',',')}% dibandingkan periode sebelumnya.`;
  return `${label} relatif stabil pada ${num(c)} dibandingkan periode sebelumnya (${num(p)}).`;
}
function _latestPreviousRecord(r){
  const list=_historyRecordsForSatker(r);
  if(!list.length) return null;
  const idx=list.findIndex(x=>String(x.pengisian_id)===String(r.pengisian_id));
  return idx>=0 ? (list[idx+1]||null) : (list[1]||null);
}
function _evidenceFacts(r,code){
  const obj=(r?.[code]&&typeof r[code]==='object')?r[code]:{};
  const prev=_latestPreviousRecord(r);
  const po=(prev?.[code]&&typeof prev[code]==='object')?prev[code]:{};
  const facts=[];
  if(code==='A'){
    const sdm=_num(obj.a1), kebutuhan=_num(obj.a3);
    if(sdm!==null) facts.push(`Jumlah SDM JF Penyuluh tercatat ${num(sdm)} orang.`);
    if(sdm!==null && kebutuhan!==null && kebutuhan>0){
      const pct=pctSafe(sdm,kebutuhan);
      facts.push(`Ketersediaan SDM berada pada ${pct===null?'Belum dapat dihitung':pct.toFixed(1).replace('.',',')}% dari kebutuhan ${num(kebutuhan)} orang.`);
    }
    if(_hasVal(obj.a4)) facts.push(`Kecukupan SDM dilaporkan "${String(obj.a4).trim()}".`);
    if(_hasVal(obj.a6)) facts.push(`Kompetensi yang perlu diperkuat: ${String(obj.a6).trim()}.`);
    if(_hasVal(obj.a11)) facts.push(`Dukungan pemangku kepentingan: ${String(obj.a11).trim()}.`);
    if(_hasVal(obj.a27)) facts.push(`Kendala umum yang tercatat: ${String(obj.a27).trim()}.`);
    const appPairs=[
      ['DEKTARI','a30','a31'],['SIPAREL','a32','a33'],['SIDePE','a34','a35'],['REAN','a36','a37']
    ];
    appPairs.forEach(([name,k,s])=>{
      if(_hasVal(obj[k])) facts.push(`Kendala ${name}: ${String(obj[k]).trim()}.`);
      if(_hasVal(obj[s])) facts.push(`Saran/masukan ${name}: ${String(obj[s]).trim()}.`);
    });
  }
  if(code==='B'){
    const schools=_num(obj.b01a), done=_num(obj.b01b), ready=_num(obj.b01c);
    const trainings=_num(obj.b05a), participants=_num(obj.b05b), students=_num(obj.b06d);
    if(schools!==null) facts.push(`Terdapat ${num(schools)} sekolah sasaran/calon RTS.`);
    if(done!==null && schools!==null && schools>0) facts.push(`${num(done)} sekolah telah melaksanakan RTS atau ${pctText(done,schools)} dari sekolah sasaran.`);
    if(ready!==null && schools!==null && schools>0) facts.push(`${num(ready)} sekolah telah dinilai kesiapan atau ${pctText(ready,schools)} dari sekolah sasaran.`);
    if(trainings!==null) facts.push(`Jumlah pelatihan/pembekalan RTS tercatat ${num(trainings)} kegiatan.`);
    if(participants!==null){
      const gap10=participants-10;
      facts.push(`Peserta pelatihan tercatat ${num(participants)} orang, dengan acuan Surat Pelaksanaan PN T.A. 2026 sebesar 10 orang${gap10>=0?` (lebih ${num(gap10)} orang dari acuan)`: ` (masih kurang ${num(Math.abs(gap10))} orang dari acuan)`}.`);
    }
    if(students!==null && schools!==null && schools>0){
      const target=schools*30, gap=students-target;
      facts.push(`Jangkauan pengimbasan/RTL tercatat ${num(students)} siswa dari acuan ${num(target)} siswa untuk ${num(schools)} sekolah (${pctText(students,target)}); ${gap>=0?`lebih ${num(gap)} siswa`: `masih kurang ${num(Math.abs(gap))} siswa`}.`);
    }
    const tr=_trendSentence('Jangkauan siswa RTS',students,_num(po.b06d));
    if(tr) facts.push(tr);
    if(_hasVal(obj.b09a)) facts.push(`Kendala utama RTS: ${String(obj.b09a).trim()}.`);
  }
  if(code==='C'){
    const faceTarget=_num(obj.c01b), facePresent=_num(obj.c01c);
    const campTarget=_num(obj.c02b), campReach=_num(obj.c02c);
    const mediaActs=_num(obj.c03a), mediaReach=_num(obj.c03b);
    const contents=_num(obj.c04a), reach=_num(obj.c04d);
    if(faceTarget!==null && facePresent!==null){
      const pct=pctSafe(facePresent,faceTarget);
      facts.push(`Kegiatan tatap muka mencatat ${num(facePresent)} peserta hadir dari target ${num(faceTarget)} (${pct===null?'Belum dapat dihitung':pct.toFixed(1).replace('.',',')}%).`);
      const tr=_trendSentence('Peserta hadir tatap muka',facePresent,_num(po.c01c));
      if(tr) facts.push(tr);
    }
    if(campTarget!==null && campReach!==null){
      facts.push(`Kegiatan kampanye mencatat jangkauan ${num(campReach)} dari target ${num(campTarget)} (${pctText(campReach,campTarget)}).`);
    }
    if(mediaActs!==null) facts.push(`Aktivitas/publikasi media tercatat ${num(mediaActs)} kegiatan.`);
    if(mediaReach!==null) facts.push(`Estimasi reach/audiens media tercatat ${num(mediaReach)}.`);
    if(contents!==null) facts.push(`Konten/publikasi digital tercatat ${num(contents)} konten.`);
    if(reach!==null) facts.push(`Total reach digital tercatat ${num(reach)}.`);
    if(_hasVal(obj.c04f)) facts.push(`Catatan konten/format/statistik: ${String(obj.c04f).trim()}.`);
    if(_hasVal(obj.c06e)) facts.push(`Perubahan pengetahuan/sikap/perilaku yang tercatat: ${String(obj.c06e).trim()}.`);
    if(_hasVal(obj.c10a)) facts.push(`Kendala utama penyebarluasan: ${String(obj.c10a).trim()}.`);
  }
  return facts.filter(Boolean);
}
function _dynamicNarrative(code,title,st,obj,pattern,findings,exists,r){
  const facts=_evidenceFacts(r,code);
  const evidence=facts.slice(0,7).join(' ');
  if(!exists) return {
    anal:`Data ${title} belum tersedia pada Satker ini. Kondisi tersebut membuat capaian pada bagian ini belum dapat dinilai secara utuh.`,
    gap:'Data bagian belum tersedia untuk telaah yang memadai.',
    rekom:`Lengkapi data monitoring dan bukti pelaksanaan ${title} agar capaian dapat dinilai secara objektif dan menjadi dasar tindak lanjut.`,
    basis:'Analisis hanya menggunakan data yang tersedia; sistem tidak membuat kesimpulan tanpa data pendukung.'
  };
  const labels=[...new Set(findings.flatMap(x=>x.labels||[]))].slice(0,4);
  const labelText=labels.length?labels.join(', '):'';
  const baseEvidence=evidence?` Berdasarkan data yang tersedia, ${evidence}`:'';
  if(st==='MEMENUHI'){
    if(pattern.id===3) return {
      anal:`Pelaksanaan ${title} menunjukkan kondisi yang memenuhi standar berdasarkan data monitoring yang tersedia. Data pada bagian ini relatif lengkap sehingga penilaian dapat dilakukan secara lebih utuh.${baseEvidence}`,
      gap:'Tidak terdapat kesenjangan prioritas yang teridentifikasi dari data yang tersedia.',
      rekom:`Pertahankan capaian ${title}, jaga konsistensi pelaksanaan, dan terus tingkatkan kualitas serta kelengkapan bukti pendukung.`,
      basis:'Data monitoring Satker, Juknis 2026, dan Surat Pelaksanaan PN T.A. 2026.'
    };
    if(pattern.id===4) return {
      anal:`Pelaksanaan ${title} secara umum memenuhi standar, namun capaian belum sepenuhnya merata pada seluruh aspek yang terpetakan.${baseEvidence}`,
      gap:labelText?`Aspek yang masih perlu dicermati: ${labelText}.`:'Masih terdapat ruang pengembangan pada sebagian aspek.',
      rekom:labelText?`Pertahankan capaian yang telah memenuhi standar dan lakukan penyempurnaan pada aspek ${labelText}.`:`Pertahankan capaian dan tingkatkan kualitas pada aspek yang masih memiliki ruang pengembangan.`,
      basis:'Data monitoring Satker, Juknis 2026, dan Surat Pelaksanaan PN T.A. 2026.'
    };
    return {
      anal:`Pelaksanaan ${title} memenuhi standar berdasarkan data monitoring yang tersedia dan tidak menunjukkan kesenjangan prioritas yang terpetakan oleh sistem.${baseEvidence}`,
      gap:'Tidak terdapat kesenjangan prioritas yang teridentifikasi dari data yang tersedia.',
      rekom:`Pertahankan capaian ${title} dan tingkatkan kualitas, konsistensi, serta kelengkapan bukti pelaksanaan.`,
      basis:'Data monitoring Satker, Juknis 2026, dan Surat Pelaksanaan PN T.A. 2026.'
    };
  }
  if(st==='PERLU PENGUATAN'){
    const map={
      6:['SDM dan kompetensi pelaksana','penguatan personel, kompetensi, atau pembekalan sesuai aspek yang tercatat'],
      7:['sarana dan dukungan fasilitas','pemenuhan atau penguatan sarana yang tercatat masih diperlukan'],
      8:['cakupan dan jangkauan pelaksanaan','perluasan cakupan/jangkauan sasaran sesuai data monitoring'],
      9:['kualitas pelaksanaan dan evaluasi','peningkatan kualitas pelaksanaan serta penguatan evaluasi/feedback'],
      10:['dokumentasi dan bukti pelaksanaan','kelengkapan bukti dan dokumentasi pelaksanaan'],
      11:['perencanaan dan dukungan','penguatan perencanaan, koordinasi, atau dukungan sesuai kebutuhan yang tercatat'],
      5:['aspek pelaksanaan yang masih memiliki kesenjangan','penguatan pada aspek yang belum memenuhi standar']
    }[pattern.id] || ['aspek pelaksanaan yang masih memiliki kesenjangan','penguatan pada aspek yang belum memenuhi standar'];
    return {
      anal:`Pelaksanaan ${title} telah berjalan, namun masih terdapat kebutuhan penguatan pada ${map[0]}.${labelText?` Data menunjukkan perhatian pada ${labelText}.`:''}${baseEvidence}`,
      gap:labelText?`Kesenjangan terpetakan pada: ${labelText}.`:'Masih terdapat aspek yang belum sepenuhnya memenuhi standar.',
      rekom:`Prioritaskan ${map[1]} dan lakukan pemantauan terhadap perbaikannya pada periode berikutnya.`,
      basis:'Data monitoring Satker, Juknis 2026, dan Surat Pelaksanaan PN T.A. 2026.'
    };
  }
  const focus=labelText||'aspek yang memiliki kesenjangan terbesar';
  if(pattern.id===12) return {
    anal:`Terdapat satu kesenjangan utama pada ${title} yang memerlukan perhatian lebih lanjut. Temuan yang terpetakan berkaitan dengan ${focus}.${baseEvidence}`,
    gap:`Kesenjangan utama: ${focus}.`,
    rekom:`Jadikan ${focus} sebagai prioritas tindak lanjut dan lakukan verifikasi perbaikannya pada monitoring berikutnya.`,
    basis:'Data monitoring Satker, Juknis 2026, dan Surat Pelaksanaan PN T.A. 2026.'
  };
  if(pattern.id===13) return {
    anal:`Hasil telaah menunjukkan beberapa aspek pada ${title} memerlukan perhatian secara bersamaan. Kesenjangan terutama terpetakan pada ${focus}.${baseEvidence}`,
    gap:`Beberapa aspek memerlukan intervensi: ${focus}.`,
    rekom:`Lakukan pendampingan terarah dengan memprioritaskan aspek yang memiliki kesenjangan terbesar, kemudian pantau perbaikannya secara berkala.`,
    basis:'Data monitoring Satker, Juknis 2026, dan Surat Pelaksanaan PN T.A. 2026.'
  };
  if(pattern.id===15) return {
    anal:`Data ${title} menunjukkan kesenjangan yang luas dan/atau belum cukup lengkap untuk mendukung penilaian yang kuat. Kondisi ini memerlukan perhatian dan pendampingan lebih lanjut.${baseEvidence}`,
    gap:`Kesenjangan utama terpetakan pada ${focus}, sementara data pendukung masih terbatas pada sebagian aspek.`,
    rekom:`Tetapkan ${title} sebagai prioritas pendampingan. Fokuskan intervensi pada aspek dengan kesenjangan terbesar dan lengkapi data serta bukti pelaksanaan secara bertahap.`,
    basis:'Analisis dibatasi pada data monitoring yang tersedia, Juknis 2026, dan Surat Pelaksanaan PN T.A. 2026; sistem tidak mengasumsikan penyebab yang tidak tercatat.'
  };
  return {
    anal:`Pelaksanaan ${title} menunjukkan kesenjangan prioritas terhadap standar yang memerlukan perhatian lebih lanjut, terutama pada ${focus}.${baseEvidence}`,
    gap:`Kesenjangan prioritas: ${focus}.`,
    rekom:`Prioritaskan tindak lanjut pada ${focus}, lengkapi bukti pendukung, dan lakukan pemantauan perbaikan secara berkala.`,
    basis:'Data monitoring Satker, Juknis 2026, dan Surat Pelaksanaan PN T.A. 2026.'
  };
}
function buildSectionAnalysesForRecord(r){
  const parts=[
    {code:'A',title:'Bagian Umum'},
    {code:'B',title:'Remaja Teman Sebaya (RTS)'},
    {code:'C',title:'Penyebarluasan Informasi & Edukasi'}
  ];
  return parts.map(part=>{
    const obj=(r?.[part.code]&&typeof r[part.code]==='object')?r[part.code]:{};
    const exists=!!r?.saved?.[part.code]||Object.keys(obj).length>0;
    const st=sectionStatusForRecord(r,part.code);
    const findings=_findingsForSection(part.code,obj);
    const negativeCount=findings.reduce((n,x)=>n+x.keys.length,0);
    const pattern=_patternForSection(part.code,st,obj,exists,negativeCount,_filledRatio(obj));
    const text=_dynamicNarrative(part.code,part.title,st,obj,pattern,findings,exists,r);
    return {
      analysis_id:`SECTION-${r.pengisian_id}-${part.code}`,
      pengisian_id:r.pengisian_id,
      nama_satker:r.nama_satker,
      section:part.code,
      fokus:part.title,
      pola_id:pattern.id,
      pola_narasi:pattern.name,
      status_bagian:st,
      analisis:text.anal,
      gap:text.gap,
      dasar_juknis:text.basis,
      rekomendasi:text.rekom,
      prioritas:st==='PERLU PERHATIAN'?'TINGGI':st==='PERLU PENGUATAN'?'SEDANG':'RENDAH'
    };
  });
}
function finalAnalysesForRecord(r){ return buildSectionAnalysesForRecord(r); }
function finalOverallRecommendation(r){
  const st=overallStatusForRecord(r);
  const items=finalAnalysesForRecord(r);
  const attention=items.filter(x=>x.status_bagian!=='MEMENUHI').map(x=>x.fokus).slice(0,3);
  if(st==='MEMENUHI')return 'Tidak terdapat kesenjangan yang memerlukan intervensi khusus. Satker perlu mempertahankan capaian dan meningkatkan kualitas pelaksanaan.';
  if(st==='PERLU PENGUATAN')return `Satker memerlukan penguatan pada ${attention.length?attention.join(', '):'aspek yang belum memenuhi standar'}. Pendampingan diarahkan pada bagian dan indikator dengan kesenjangan terbesar.`;
  return `Satker memerlukan perhatian dan pendampingan lebih lanjut. Prioritas intervensi diarahkan pada ${attention.length?attention.join(', '):'bagian yang memiliki kesenjangan terbesar'} terhadap standar 2026.`;
}

function buildLocalAnalyses(){
  return (data?.records||[]).flatMap(finalAnalysesForRecord);
}

function selectedAnalysisIds(){return Array.from(document.querySelectorAll('.analysisPick:checked')).map(x=>String(x.value));} // Tidak ada batas jumlah Satker.
function renderAnalysisSelector(){
  const box=$('analysisSatkerSelect');if(!box)return;
  const q=clean($('analysisSearch')?.value).toLowerCase();
  const seen=new Set(), rows=(data?.records||[]).filter(r=>!q||[r.nama_satker,r.kode_satker,r.nomor_pengisian].some(v=>String(v||'').toLowerCase().includes(q))).filter(r=>{const k=String(r.kode_satker||r.satker_id||r.nama_satker).toLowerCase();if(seen.has(k))return false;seen.add(k);return true;});
  const selected=new Set(selectedAnalysisIds());
  box.innerHTML=rows.map(r=>`<label class="analysis-select-row"><input type="checkbox" class="analysisPick" value="${esc(r.pengisian_id)}" ${selected.has(String(r.pengisian_id))?'checked':''}><span><span class="satname">${esc(r.nama_satker||'—')}</span><br><span class="satmeta">${esc(r.kode_satker||'')} · ${esc(displayStatus(r.status))}</span></span></label>`).join('')||'<div class="muted" style="padding:12px">Belum ada Satker yang dapat dipilih.</div>';
}

function comparisonForSelected(ids){
  const rows=ids.map(pid=>{
    const r=(data?.records||[]).find(x=>String(x.pengisian_id)===String(pid));
    if(!r)return null;
    const parts=[r.saved?.A,r.saved?.B,r.saved?.C].filter(Boolean).length;
    const items=(analyses||[]).filter(a=>String(a.pengisian_id)===String(pid));
    const high=items.filter(a=>['TINGGI','ATENSI'].includes(String(a.prioritas||a.priority||'').toUpperCase())).length;
    const med=items.filter(a=>['SEDANG','PENDAMPINGAN','MONITORING'].includes(String(a.prioritas||a.priority||'').toUpperCase())).length;
    const complete=String(r.status||'').toUpperCase()==='SELESAI';
    // Comparative index is explicitly a monitoring-completeness/telaah index, not a Juknis target.
    const score=(complete?50:0)+(parts*15)-(high*8)-(med*3);
    return {r,parts,high,med,complete,score,items};
  }).filter(Boolean).sort((x,y)=>y.score-x.score);
  return rows;
}
function renderComparison(ids){
  const box=$('analysisComparison');if(!box)return;
  const rows=comparisonForSelected(ids);
  if(rows.length<2){box.innerHTML='';return}
  box.innerHTML=`<div class="comparison-head"><h3>Perbandingan Antar-Satker</h3><p class="small muted">Urutan menunjukkan kondisi monitoring yang relatif lebih baik berdasarkan kelengkapan data dan hasil telaah yang tersedia. Ini bukan nilai kinerja baru dan tidak menggantikan penilaian Juknis.</p></div>
  <div class="comparison-table-wrap"><table class="comparison-table"><thead><tr><th>Peringkat</th><th>Satker</th><th>Status</th><th>Bagian tersedia</th><th>Perlu perhatian</th><th>Perlu pendampingan</th><th>Kesimpulan relatif</th></tr></thead><tbody>
  ${rows.map((x,i)=>{
    const label=i===0?'Relatif lebih baik':i===rows.length-1?'Relatif perlu diperhatikan':'Relatif menengah';
    return `<tr><td><b>${i+1}</b></td><td><b>${esc(x.r.nama_satker||'—')}</b><br><span class="small muted">${esc(x.r.kode_satker||'')}</span></td><td>${esc(displayStatus(x.r.status))}</td><td>${x.parts}/3</td><td>${x.high}</td><td>${x.med}</td><td><span class="badge">${label}</span></td></tr>`;
  }).join('')}</tbody></table></div>`;
}
function renderAnalysis(){
  renderAnalysisSelector();
  const selected=new Set(selectedAnalysisIds());
  if($('analysisSelectedCount')) $('analysisSelectedCount').textContent=`${selected.size} Satker dipilih`;
  renderComparison(Array.from(selected));
  const items=(analyses||[]).filter(a=>selected.has(String(a.pengisian_id)));
  const satkers=[...new Set(items.map(a=>String(a.pengisian_id)))];
  const high=items.filter(a=>['TINGGI','ATENSI'].includes(String(a.prioritas||a.priority||'').toUpperCase())).length;
  const med=items.filter(a=>['SEDANG','PENDAMPINGAN','MONITORING'].includes(String(a.prioritas||a.priority||'').toUpperCase())).length;
  if($('analysisSummaryCards'))$('analysisSummaryCards').innerHTML=`<div class="analysis-card"><b>${satkers.length}</b><span>Satker dianalisis</span></div><div class="analysis-card"><b>${items.length}</b><span>Hasil telaah</span></div><div class="analysis-card"><b>${high+med}</b><span>Perlu ditindaklanjuti</span></div>`;
  if(!$('analysisList'))return;
  const grouped={};items.forEach(x=>(grouped[x.pengisian_id]??=[]).push(x));
  $('analysisList').innerHTML=Object.values(grouped).map(arr=>`<article class="analysis-item"><h3 style="margin:0 0 10px">${esc(arr[0].nama_satker||'Satker')}</h3><div class="analysis-compare">${arr.map(x=>`<div class="analysis-item"><div class="analysis-item-head"><div><h4>${esc(x.fokus||'Telaah')}</h4></div><span class="badge">${esc(x.prioritas||x.priority||'NORMAL')}</span></div><p><b>Analisis:</b> ${esc(x.analisis||'—')}</p><p><b>Gap / kondisi:</b> ${esc(x.gap||'—')}</p><p><b>Dasar Juknis:</b> ${esc(x.dasar_juknis||'—')}</p><div class="recommendation"><b>Rekomendasi:</b> ${esc(x.rekomendasi||'—')}</div></div>`).join('')}</div></article>`).join('')||'<div class="panel muted">Pilih satu atau beberapa Satker, lalu klik Analisis &amp; Rekomendasi Satker Terpilih.</div>';
}

function bindAnalysisSelector(){
  $('analysisSearch')?.addEventListener('input',renderAnalysisSelector);
  $('selectAllAnalysis')?.addEventListener('click',()=>{
    document.querySelectorAll('.analysisPick').forEach(x=>x.checked=true);
    renderAnalysis();
  });
  $('clearAllAnalysis')?.addEventListener('click',()=>{document.querySelectorAll('.analysisPick').forEach(x=>x.checked=false);renderAnalysis()});
  $('analysisSatkerSelect')?.addEventListener('change',renderAnalysis);
}
function clearEval(){editEvalId='';['eJenis','ePic','eTemuan','eAkar','eRekom','eTarget','eBukti','eCatatan'].forEach(id=>$(id).value='');$('eStatus').value='Belum ditindaklanjuti';$('evalMsg').textContent='';$('evalMsg').className='small muted'}
function clearStd(){editStdId='';['sNama','sTarget'].forEach(id=>$(id).value='');$('sSatuan').value='kegiatan';$('sSumber').value='Juknis / penetapan internal';$('sAktif').value='YA';if($('stdMsg'))$('stdMsg').textContent=''}
async function saveStd(){
  const existing=standards.find(s=>String(s.standard_id)===String(editStdId));
  const o={key,standard_id:editStdId||'',kode_indikator:existing?.kode_indikator||('IND-'+Date.now()),nama_indikator:$('sNama').value,satuan:$('sSatuan').value,target_2026:$('sTarget').value,sumber_target:$('sSumber').value,aktif:$('sAktif').value};
  if(!clean(o.nama_indikator)||o.target_2026===''){alert('Nama indikator dan target monitoring wajib diisi.');return}
  try{$('saveStd').disabled=true;$('stdMsg').textContent=editStdId?'Memperbarui acuan…':'Menyimpan acuan…';await get('saveStandard',o);standards=(await get('standards',{key})).records||[];renderStandards();clearStd();$('stdMsg').textContent='Acuan berhasil disimpan.'}catch(e){$('stdMsg').textContent=e.message;$('stdMsg').className='small error'}finally{$('saveStd').disabled=false}
}

async function delStd(id){if(!confirm('Hapus standar ini?'))return;try{await get('deleteStandard',{key,standard_id:id});standards=(await get('standards',{key})).records||[];renderStandards()}catch(e){alert(e.message)}}
async function runAnalysis(){
  const ids=selectedAnalysisIds();
  if(!ids.length){$('analysisMsg').textContent='Pilih minimal satu Satker terlebih dahulu.';$('analysisMsg').className='small error';return}
  try{
    $('runAnalysis').disabled=true;$('analysisMsg').textContent='Menyusun analisis dan rekomendasi…';
    const local=buildLocalAnalyses();let remote=[];
    try{const a=await get('analysis',{key});remote=a.analyses||[]}catch(e){console.warn('fallback lokal',e)}
    const grouped={};local.forEach(x=>(grouped[String(x.pengisian_id)]??=[]).push(x));remote.forEach(x=>{const p=String(x.pengisian_id||'');if(p)(grouped[p]??=[]).push(x)});
    analyses=ids.flatMap(pid=>grouped[pid]||[]);
    renderAnalysis();if(current)showDetail(current.pengisian_id);
    $('analysisMsg').textContent=`Analisis selesai untuk ${ids.length} Satker.`;$('analysisMsg').className='small muted';
  }catch(e){$('analysisMsg').textContent='Analisis belum dapat ditampilkan.';$('analysisMsg').className='small error';console.error(e)}
  finally{$('runAnalysis').disabled=false}
}

async function delEval(id){if(!confirm('Hapus evaluasi ini?'))return;try{await get('deleteEvaluation',{key,eval_id:id});evals=(await get('adminEvaluations',{key})).records||[];showDetail(current.pengisian_id)}catch(e){alert(e.message)}}
function reportRows(obj,labels){
  return Object.keys(obj||{}).filter(k=>!['payload_json','progress','created_at','updated_at','pengisian_id','nomor_pengisian','satker_id','kode_satker','nama_satker'].includes(k))
    .map(k=>`<tr><td>${esc(labels[k]||'Informasi lainnya')}</td><td>${obj[k]===''?'—':esc(obj[k])}</td></tr>`).join('');
}
function reportAnalysisRows(items){
  return items.map(x=>`<div class="analysis-box"><h3>${esc(x.fokus||'Telaah')}</h3><p><b>Status:</b> ${esc(x.status_bagian||x.prioritas||'—')}</p><p><b>Analisa:</b> ${esc(x.analisis||'—')}</p><p><b>Kondisi:</b> ${esc(x.gap||'—')}</p><p><b>Rekomendasi:</b> ${esc(x.rekomendasi||'—')}</p><p class="small"><b>Dasar:</b> ${esc(x.dasar_juknis||'—')}</p></div>`).join('');
}
function makeReportHtml(records,items,title,comparison){
  const sections=records.map(r=>`
  <section class="satker">
    <h2>${esc(r.nama_satker||'Satker')}</h2>
    <div class="meta"><b>Kode:</b> ${esc(r.kode_satker||'—')} &nbsp; <b>Status:</b> ${esc(friendlyStatus(r.status))} &nbsp; <b>Nomor:</b> ${esc(r.nomor_pengisian||'—')}</div>
    <h3>Bagian Umum</h3><table><tr><th>Informasi</th><th>Data</th></tr>${reportRows(r.A,A_LABELS)}</table>
    <h3>Remaja Teman Sebaya (RTS)</h3><table><tr><th>Informasi</th><th>Data</th></tr>${reportRows(r.B,B_LABELS)}</table>
    <h3>Penyebarluasan Informasi &amp; Edukasi</h3><table><tr><th>Informasi</th><th>Data</th></tr>${reportRows(r.C,C_LABELS)}</table>
    <h3>Status Evaluasi</h3><p><b>${esc(overallStatusForRecord(r))}</b></p>
    <h3>Analisis &amp; Rekomendasi</h3>${reportAnalysisRows(finalAnalysesForRecord(r))}
    <div class="analysis-box"><h3>Atensi / Prioritas Pimpinan</h3><p>${esc(finalOverallRecommendation(r))}</p></div>
  </section>`).join('');
  const cmp=comparison&&comparison.length>1?`
  <h2>Perbandingan Antar-Satker</h2>
  <p class="small">Perbandingan ini menunjukkan kondisi monitoring yang relatif lebih baik berdasarkan kelengkapan data dan hasil telaah yang tersedia. Ini bukan nilai kinerja baru dan tidak menggantikan penilaian Juknis.</p>
  <table><tr><th>Peringkat</th><th>Satker</th><th>Status</th><th>Bagian tersedia</th><th>Perlu perhatian</th><th>Perlu pendampingan</th><th>Kesimpulan relatif</th></tr>
  ${comparison.map((x,i)=>`<tr><td>${i+1}</td><td>${esc(x.r.nama_satker||'—')}</td><td>${esc(displayStatus(x.r.status))}</td><td>${x.parts}/3</td><td>${x.high}</td><td>${x.med}</td><td>${i===0?'Relatif lebih baik':i===comparison.length-1?'Relatif perlu diperhatikan':'Relatif menengah'}</td></tr>`).join('')}</table>`:'';
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>
  body{font-family:Arial,sans-serif;margin:34px;color:#173b69;line-height:1.45}h1{font-size:24px;margin-bottom:6px}h2{font-size:18px;margin-top:26px;border-bottom:2px solid #d5e0ea;padding-bottom:7px}h3{font-size:14px;margin:17px 0 7px}table{border-collapse:collapse;width:100%;margin:7px 0 14px}td,th{border:1px solid #b9c6d3;padding:7px;text-align:left;vertical-align:top}th{background:#eef4fa}.meta{font-size:12px;color:#526b88;margin-bottom:12px}.small{font-size:11px;color:#667085}.analysis-box{border:1px solid #ccd6e0;border-radius:6px;padding:10px;margin:8px 0;break-inside:avoid}.satker{break-after:page}@media print{button{display:none!important}body{margin:15mm}}</style></head><body>
  <h1>Sistem Monitoring Pelaksanaan Informasi &amp; Edukasi Tahun Anggaran 2026</h1>
  <p class="small">${esc(title)}</p>
  ${cmp}${sections}
  <p class="small">Dokumen disusun berdasarkan data monitoring Satker yang tersedia dan ketentuan Juknis RTS serta Juknis Penyebarluasan Informasi dan Edukasi.</p>
  </body></html>`;
}
function _crc32(bytes){
  let c=0xffffffff;
  for(let i=0;i<bytes.length;i++){
    c^=bytes[i];
    for(let k=0;k<8;k++) c=(c>>>1)^((c&1)?0xedb88320:0);
  }
  return (c^0xffffffff)>>>0;
}
function _u16(n){return new Uint8Array([n&255,(n>>>8)&255])}
function _u32(n){return new Uint8Array([n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255])}
function _cat(...parts){
  const n=parts.reduce((a,b)=>a+b.length,0),o=new Uint8Array(n);let p=0;
  for(const b of parts){o.set(b,p);p+=b.length} return o;
}
function _zipStore(files){
  const enc=new TextEncoder(),local=[],central=[];let offset=0;
  for(const f of files){
    const name=enc.encode(f.name),data=f.data,crc=_crc32(data);
    const h=_cat(new Uint8Array([0x50,0x4b,3,4]),_u16(20),_u16(0),_u16(0),_u16(0),_u16(0),_u32(crc),_u32(data.length),_u32(data.length),_u16(name.length),_u16(0),name);
    local.push(h,data);
    const ch=_cat(new Uint8Array([0x50,0x4b,1,2]),_u16(20),_u16(20),_u16(0),_u16(0),_u16(0),_u16(0),_u32(crc),_u32(data.length),_u32(data.length),_u16(name.length),_u16(0),_u16(0),_u16(0),_u16(0),_u32(0),_u32(offset),name);
    central.push(ch);offset+=h.length+data.length;
  }
  const cd=central.reduce((a,b)=>a+b.length,0),end=_cat(new Uint8Array([0x50,0x4b,5,6]),_u16(0),_u16(0),_u16(files.length),_u16(files.length),_u32(cd),_u32(offset),_u16(0));
  return _cat(...local,...central,end);
}
function _xml(s){return String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;')}
function _docxTextRuns(text){
  const parts=String(text||'').split(/\n/);
  return parts.map((x,i)=>(i?' <w:br/>':'')+`<w:r><w:t xml:space="preserve">${_xml(x)}</w:t></w:r>`).join('');
}
/* DOCX_PATCH_V1.0.3 — generator-only patch */
function _htmlToDocx(htmlText){
  const doc=new DOMParser().parseFromString(htmlText,'text/html');
  const out=[];
  const addP=(text,style)=>{if(!String(text||'').trim())return;out.push(`<w:p><w:pPr>${style?`<w:pStyle w:val="${style}"/>`:''}</w:pPr>${_docxTextRuns(text.trim())}</w:p>`) };
  const addTable=(table)=>{
    const rows=[...table.rows];if(!rows.length)return;
    let x='<w:tbl><w:tblPr><w:tblBorders><w:top w:val="single" w:sz="4"/><w:left w:val="single" w:sz="4"/><w:bottom w:val="single" w:sz="4"/><w:right w:val="single" w:sz="4"/><w:insideH w:val="single" w:sz="4"/><w:insideV w:val="single" w:sz="4"/></w:tblBorders></w:tblPr>';
    for(const tr of rows){x+='<w:tr>';for(const cell of [...tr.cells]){x+=`<w:tc><w:tcPr><w:tcW w:w="0" w:type="auto"/></w:tcPr><w:p>${_docxTextRuns(cell.innerText.trim())}</w:p></w:tc>`}x+='</w:tr>'}
    out.push(x+'</w:tbl>');
  };
  for(const el of [...doc.body.children]){
    if(el.tagName==='TABLE') addTable(el);
    else if(el.tagName==='H1') addP(el.innerText,'Title');
    else if(el.tagName==='H2') addP(el.innerText,'Heading1');
    else if(el.tagName==='H3') addP(el.innerText,'Heading2');
    else if(el.tagName==='SECTION'){
      for(const child of [...el.children]){
        if(child.tagName==='TABLE') addTable(child);
        else if(child.tagName==='H1') addP(child.innerText,'Title');
        else if(child.tagName==='H2') addP(child.innerText,'Heading1');
        else if(child.tagName==='H3') addP(child.innerText,'Heading2');
        else if(child.tagName==='P') addP(child.innerText);
        else if(child.classList?.contains('analysis-box')){
          for(const q of [...child.querySelectorAll('h3,p')]) addP(q.innerText,q.tagName==='H3'?'Heading2':null);
        }
      }
    }
    else if(el.tagName==='P') addP(el.innerText);
  }
  const body=out.join('');
  const documentXml=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr></w:body></w:document>`;
  const styles=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="22"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:pPr><w:spacing w:after="160"/></w:pPr><w:rPr><w:b/><w:sz w:val="32"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:rPr><w:b/><w:sz w:val="28"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:rPr><w:b/><w:sz w:val="24"/></w:rPr></w:style></w:styles>`;
  const contentTypes=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>`;
  const rels=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`;
  const docRels=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;
  const enc=new TextEncoder(),files=[
    {name:'[Content_Types].xml',data:enc.encode(contentTypes)},
    {name:'_rels/.rels',data:enc.encode(rels)},
    {name:'word/document.xml',data:enc.encode(documentXml)},
    {name:'word/styles.xml',data:enc.encode(styles)},
    {name:'word/_rels/document.xml.rels',data:enc.encode(docRels)}
  ];
  return _zipStore(files);
}
function downloadReport(htmlText,filename){
  // ISOLATED DOCX GENERATOR — tidak menyentuh API/data/GIS/login/evaluasi.
  // Paksa nama file menjadi .docx, termasuk bila pemanggil lama masih mengirim .doc.
  const base=String(filename||'Laporan_IE_2026')
    .replace(/\.(docx?|html?|rtf)$/i,'')
    .replace(/[\\/:*?\"<>|]+/g,'_')
    .trim() || 'Laporan_IE_2026';
  const safeName=base+'.docx';
  const bytes=_htmlToDocx(htmlText);
  const blob=new Blob([bytes],{type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
  const u=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=u;
  a.download=safeName;
  a.setAttribute('download',safeName);
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(u),3000);
}
function printReport(htmlText){
  const w=window.open('','_blank','noopener,noreferrer');
  if(!w){alert('Jendela cetak diblokir browser. Izinkan pop-up untuk halaman ini.');return}
  w.document.open();w.document.write(htmlText);w.document.close();
  setTimeout(()=>w.print(),500);
}
function wordReportForIds(ids){
  const records=(data?.records||[]).filter(r=>ids.includes(String(r.pengisian_id)));
  const items=(analyses||[]).filter(a=>ids.includes(String(a.pengisian_id)));
  if(!records.length){alert('Pilih minimal satu Satker yang memiliki data monitoring.');return null}
  const comparison=comparisonForSelected(ids);
  const title=records.length===1?`Laporan Analisis dan Rekomendasi — ${records[0].nama_satker}`:`Laporan Analisis dan Rekomendasi — ${records.length} Satker`;
  return makeReportHtml(records,items,title,comparison);
}
function wordReport(){
  if(!current)return;
  const h=wordReportForIds([String(current.pengisian_id)]);
  if(h)downloadReport(h,`Laporan_Analisis_IE_2026_${String(current.nama_satker||'Satker').replace(/[^a-z0-9]+/gi,'_')}.docx`);
}
function printCurrentReport(){
  if(!current)return;
  const h=wordReportForIds([String(current.pengisian_id)]);
  if(h)printReport(h);
}
function wordReportSelected(){
  const ids=selectedAnalysisIds();
  const h=wordReportForIds(ids);
  if(h)downloadReport(h,`Laporan_Analisis_IE_2026_${ids.length}_Satker.docx`);
}
function printSelectedReport(){
  const ids=selectedAnalysisIds();
  const h=wordReportForIds(ids);
  if(h)printReport(h);
}

document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
  b.classList.add('active');
  ['monitoring','analisis'].forEach(t=>{
    const panel=$('tab-'+t);
    if(panel) panel.classList.toggle('hidden',t!==b.dataset.tab);
  });
  if(b.dataset.tab==='analisis'){
    if(!analyses.length) analyses=buildLocalAnalyses();
    renderAnalysisSelector();renderAnalysis();
  }
});
$('logout').onclick=()=>{
  if(!confirm('Keluar dari ruang evaluasi?'))return;
  key='';
  try{
    localStorage.removeItem('mieAdminKey');
    localStorage.removeItem('mie2026_summary_v1');
  }catch(_e){}
  $('app').classList.add('hidden');
  $('accessPanel').style.display='';
  $('key').value='';
  $('accessMsg').textContent='Anda telah keluar dari ruang evaluasi.';
  $('accessMsg').className='small success';
  current=null; editEvalId=''; editStdId='';
  window.scrollTo({top:0,behavior:'smooth'});
};
$('openBtn').onclick=async()=>{
  key=clean($('key').value);
  if(!key){$('accessMsg').textContent='Kunci akses harus diisi.';return}
  try{
    $('openBtn').disabled=true;
    $('accessMsg').textContent='Membuka ruang evaluasi…';
    $('accessMsg').className='small muted';
    $('accessPanel').style.display='none';
    $('app').classList.remove('hidden');
    if($('dashboardMsg'))$('dashboardMsg').textContent='Menghubungkan ke data monitoring…';
    await bindAnalysisSelector();
loadAll();
    localStorage.setItem('mieAdminKey',key);
  }catch(e){
    $('accessPanel').style.display='';
    $('app').classList.add('hidden');
    $('accessMsg').textContent='Sistem evaluasi belum dapat dihubungi. Silakan coba kembali.';
    $('accessMsg').className='small error';
    console.error(e);
  }finally{$('openBtn').disabled=false}
};
$('key').addEventListener('keydown',e=>{if(e.key==='Enter')$('openBtn').click()});$('reload').onclick=()=>loadAll().catch(e=>{if($('dashboardMsg'))$('dashboardMsg').textContent='Pembaruan data belum berhasil. Silakan coba lagi.';console.error(e)});$('search').oninput=renderList;$('statusFilter').onchange=renderList;$('closeDetail').onclick=()=>{$('detailPanel').classList.remove('show');current=null;};$('runAnalysis').onclick=runAnalysis;$('detailWord').onclick=wordReport;$('multiWord').onclick=wordReportSelected;$('multiPrint').onclick=printSelectedReport;

async function loadGIS(){
  const cacheKey='mie2026_gis_eval_v3';
  let cached=null;
  try{
    const c=JSON.parse(localStorage.getItem(cacheKey)||'null');
    if(c&&Array.isArray(c.points)&&c.points.length){
      cached=c;
      gisPoints=c.points;
      renderMap();
      if($('gisMsg'))$('gisMsg').textContent='Menampilkan 216 titik Satker. Memperbarui status…';
    }
  }catch(_e){}

  try{
    if($('gisMsg')&&!cached)$('gisMsg').textContent='Mengambil koordinat 216 Satker…';
    const g=await get('gis',{key});
    const points=g.points||[];
    if(points.length){
      gisPoints=points;
      localStorage.setItem(cacheKey,JSON.stringify({ts:Date.now(),points:points}));
      renderMap();
      if($('gisMsg'))$('gisMsg').textContent='216 titik Satker berhasil dimuat.';
    }else if(!cached){
      throw new Error('Data GIS belum tersedia.');
    }
  }catch(e){
    if(cached){
      // Never blank a map that already has the verified 216-point baseline.
      gisPoints=cached.points;
      renderMap();
      if($('gisMsg'))$('gisMsg').textContent='Menampilkan data GIS terakhir. Pembaruan status belum berhasil.';
    }else{
      if($('gisMsg'))$('gisMsg').textContent='GIS belum dapat dimuat. Dashboard tetap berjalan.';
      if($('map'))$('map').innerHTML='<div class="gis-placeholder">GIS belum tersedia.<br><span>Data monitoring tetap dapat digunakan.</span></div>';
    }
    console.warn('[Evaluasi Dit IE] GIS refresh gagal',e);
  }
}