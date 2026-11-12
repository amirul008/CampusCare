/* CampusCare — prototipe akademik berbasis HTML, CSS, JavaScript, dan localStorage */
(() => {
  "use strict";
  const STORAGE_KEY = "campuscare_v1";
  const USERS = [
    {id:"u1",name:"Alya Putri",email:"pelapor@campuscare.id",password:"campus123",role:"pelapor",unit:"Mahasiswa"},
    {id:"u2",name:"Budi Santoso",email:"petugas@campuscare.id",password:"campus123",role:"petugas",unit:"Unit Fasilitas"},
    {id:"u3",name:"Admin CampusCare",email:"admin@campuscare.id",password:"campus123",role:"admin",unit:"Administrator"}
  ];
  const DEFAULT_CATEGORIES = [
    {id:"c1",name:"Elektrikal",icon:"💡",description:"Lampu, stopkontak, dan instalasi listrik."},
    {id:"c2",name:"Perabot",icon:"🪑",description:"Meja, kursi, lemari, dan perlengkapan ruang."},
    {id:"c3",name:"Perangkat Kelas",icon:"📽️",description:"Proyektor, layar, speaker, dan perangkat presentasi."},
    {id:"c4",name:"Plumbing",icon:"🚰",description:"Keran, saluran air, toilet, dan kebocoran."},
    {id:"c5",name:"Kebersihan",icon:"🧹",description:"Sampah, kebersihan ruangan, dan area umum."},
    {id:"c6",name:"Fasilitas Umum",icon:"🏢",description:"Pintu, jendela, lantai, dan fasilitas lainnya."}
  ];
  const STATUS = {
    diajukan:{label:"Diajukan",class:"badge-new"},
    diverifikasi:{label:"Diverifikasi",class:"badge-verified"},
    diproses:{label:"Dalam Penanganan",class:"badge-progress"},
    selesai:{label:"Selesai",class:"badge-done"},
    ditolak:{label:"Ditolak",class:"badge-rejected"}
  };
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  let state = loadState();
  let currentUser = null;
  let currentPage = "dashboard";
  let reportFilter = {q:"",status:"",category:""};
  let editingReportId = null;

  function seedReports(){
    const now = Date.now();
    const ago = h => new Date(now-h*3600000).toISOString();
    return [
      {id:"CC-2026-001",title:"Lampu ruang kelas tidak menyala",categoryId:"c1",location:"Gedung A · Ruang 204",description:"Dua lampu di bagian belakang ruang kelas tidak menyala sehingga pencahayaan kurang saat perkuliahan sore.",priority:"sedang",reporterId:"u1",reporterName:"Alya Putri",status:"diproses",createdAt:ago(27),updatedAt:ago(3),notes:"Petugas sudah melakukan pemeriksaan awal. Penggantian lampu dijadwalkan.",history:[{status:"diajukan",note:"Laporan dibuat oleh pelapor.",at:ago(27)},{status:"diverifikasi",note:"Laporan telah diverifikasi.",at:ago(20)},{status:"diproses",note:"Pemeriksaan dan penanganan sedang dilakukan.",at:ago(3)}]},
      {id:"CC-2026-002",title:"Proyektor tidak dapat terhubung",categoryId:"c3",location:"Gedung B · Ruang 101",description:"Proyektor menyala tetapi tidak menampilkan gambar dari laptop melalui kabel HDMI.",priority:"tinggi",reporterId:"u1",reporterName:"Alya Putri",status:"diajukan",createdAt:ago(6),updatedAt:ago(6),notes:"",history:[{status:"diajukan",note:"Laporan dibuat oleh pelapor.",at:ago(6)}]},
      {id:"CC-2026-003",title:"Keran wastafel mengalami kebocoran",categoryId:"c4",location:"Gedung C · Toilet lantai 1",description:"Keran wastafel terus menetes meskipun sudah ditutup rapat.",priority:"rendah",reporterId:"u1",reporterName:"Alya Putri",status:"selesai",createdAt:ago(95),updatedAt:ago(22),notes:"Seal keran telah diganti dan kebocoran sudah berhenti.",history:[{status:"diajukan",note:"Laporan dibuat oleh pelapor.",at:ago(95)},{status:"diverifikasi",note:"Laporan telah diverifikasi.",at:ago(90)},{status:"diproses",note:"Petugas melakukan perbaikan.",at:ago(48)},{status:"selesai",note:"Perbaikan selesai.",at:ago(22)}]},
      {id:"CC-2026-004",title:"Kursi kuliah patah",categoryId:"c2",location:"Gedung A · Ruang 203",description:"Salah satu kursi di baris depan mengalami kerusakan pada sambungan kaki.",priority:"tinggi",reporterId:"u1",reporterName:"Alya Putri",status:"diverifikasi",createdAt:ago(49),updatedAt:ago(14),notes:"Kursi telah diamankan dan menunggu perbaikan.",history:[{status:"diajukan",note:"Laporan dibuat oleh pelapor.",at:ago(49)},{status:"diverifikasi",note:"Petugas memverifikasi kondisi fasilitas.",at:ago(14)}]}
    ];
  }
  function loadState(){
    try{
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if(saved && Array.isArray(saved.reports)) return {...saved,categories:saved.categories||DEFAULT_CATEGORIES,users:saved.users||USERS,activities:saved.activities||[]};
    }catch(e){}
    return {reports:seedReports(),categories:DEFAULT_CATEGORIES,users:USERS.map(({password,...u})=>u),activities:[
      {id:1,text:"Budi Santoso memperbarui status laporan CC-2026-001.",at:new Date().toISOString()},
      {id:2,text:"Alya Putri membuat laporan CC-2026-004.",at:new Date(Date.now()-3600000).toISOString()}
    ],nextNumber:5};
  }
  function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}
  function escapeHtml(v=""){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  function fmtDate(v,withTime=true){if(!v)return "—";return new Intl.DateTimeFormat("id-ID",{day:"2-digit",month:"short",year:"numeric",...(withTime?{hour:"2-digit",minute:"2-digit"}:{})}).format(new Date(v));}
  function roleName(r){return ({pelapor:"Pelapor",petugas:"Petugas Fasilitas",admin:"Administrator"})[r]||r;}
  function category(id){return state.categories.find(c=>c.id===id)||{name:"Lainnya",icon:"📌"};}
  function statusBadge(s){const x=STATUS[s]||STATUS.diajukan;return `<span class="badge ${x.class}">${x.label}</span>`;}
  function priorityLabel(p){return ({tinggi:"Tinggi",sedang:"Sedang",rendah:"Rendah"})[p]||p;}
  function log(text){state.activities.unshift({id:Date.now()+Math.random(),text,at:new Date().toISOString()});state.activities=state.activities.slice(0,100);save();}
  function toast(msg,type=""){const el=document.createElement("div");el.className="toast "+type;el.textContent=msg;$("#toastRoot").append(el);setTimeout(()=>el.remove(),3000);}
  function allowedReports(){return currentUser.role==="pelapor"?state.reports.filter(r=>r.reporterId===currentUser.id):state.reports;}
  function init(){
    $("#loginForm").addEventListener("submit",login);
    $$(".demo-account").forEach(b=>b.addEventListener("click",()=>{$("#loginEmail").value=b.dataset.email;$("#loginPassword").value="campus123";}));
    $("#logoutBtn").addEventListener("click",logout);
    $("#menuToggle").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
    $$(".nav-link").forEach(b=>b.addEventListener("click",()=>navigate(b.dataset.page)));
    if(sessionStorage.getItem("campuscare_user")){const id=sessionStorage.getItem("campuscare_user");const user=USERS.find(u=>u.id===id);if(user)enter(user);}
  }
  function login(e){e.preventDefault();const email=$("#loginEmail").value.trim().toLowerCase(),pass=$("#loginPassword").value;const user=USERS.find(u=>u.email===email&&u.password===pass);if(!user){$("#loginError").textContent="Email atau kata sandi tidak sesuai.";return;}$("#loginError").textContent="";enter(user);}
  function enter(user){
    currentUser={...user};sessionStorage.setItem("campuscare_user",user.id);
    $("#loginView").classList.add("hidden");$("#appView").classList.remove("hidden");
    $("#sidebarName").textContent=user.name;$("#sidebarRole").textContent=roleName(user.role);$("#sidebarAvatar").textContent=user.name[0].toUpperCase();$("#topName").textContent=user.name;$("#topAvatar").textContent=user.name[0].toUpperCase();
    $("#todayLabel").textContent=new Intl.DateTimeFormat("id-ID",{weekday:"short",day:"numeric",month:"short",year:"numeric"}).format(new Date());
    $$("[data-role='admin']").forEach(el=>el.classList.toggle("hidden",user.role!=="admin"));
    $("#navNewReport").classList.toggle("hidden",user.role!=="pelapor");
    navigate("dashboard");
  }
  function logout(){sessionStorage.removeItem("campuscare_user");currentUser=null;$("#appView").classList.add("hidden");$("#loginView").classList.remove("hidden");$("#sidebar").classList.remove("open");}
  function navigate(page){
    if(["categories","users","activity"].includes(page)&&currentUser.role!=="admin"){toast("Anda tidak memiliki akses ke halaman tersebut.","error");return;}
    if(page==="new-report"&&currentUser.role!=="pelapor"){toast("Menu ini hanya tersedia untuk pelapor.","error");return;}
    currentPage=page;$("#sidebar").classList.remove("open");
    $$(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
    const labels={dashboard:"Dashboard",reports:"Semua Laporan","new-report":"Buat Laporan",categories:"Kategori",users:"Pengguna",activity:"Aktivitas Sistem"};
    $("#breadcrumbCurrent").textContent=labels[page]||"Dashboard";
    render();
  }
  function pageHead(title,desc,action=""){return `<div class="page-heading"><div><h1>${title}</h1><p>${desc}</p></div><div class="heading-actions">${action}</div></div>`;}
  function render(){
    $("#navReportCount").textContent=allowedReports().length;
    const pages={dashboard:renderDashboard,reports:renderReports,"new-report":renderNewReport,categories:renderCategories,users:renderUsers,activity:renderActivity};
    $("#pageContent").innerHTML=(pages[currentPage]||renderDashboard)();
    bindPageEvents();
  }
  function renderDashboard(){
    const reports=allowedReports(),count=s=>reports.filter(r=>r.status===s).length;
    const total=reports.length,done=count("selesai"),open=total-done-count("ditolak");
    const recent=[...reports].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5);
    const welcome=currentUser.role==="pelapor"?"Pantau laporan fasilitas yang telah Anda kirimkan.":currentUser.role==="petugas"?"Kelola laporan dan tindak lanjuti kebutuhan fasilitas kampus.":"Pantau kondisi laporan dan aktivitas layanan fasilitas kampus.";
    return `${`<div class="welcome-strip"><div><h2>Halo, ${escapeHtml(currentUser.name.split(" ")[0])} 👋</h2><p>${welcome}</p></div><div class="welcome-date">${fmtDate(new Date(),false)}</div></div>`}
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-top"><span class="stat-label">Total Laporan</span><span class="stat-icon">▤</span></div><div class="stat-value">${total}</div><div class="stat-note">Laporan yang dapat Anda akses</div></div>
        <div class="stat-card orange"><div class="stat-top"><span class="stat-label">Menunggu / Diverifikasi</span><span class="stat-icon">◷</span></div><div class="stat-value">${count("diajukan")+count("diverifikasi")}</div><div class="stat-note">Membutuhkan tindak lanjut</div></div>
        <div class="stat-card"><div class="stat-top"><span class="stat-label">Dalam Penanganan</span><span class="stat-icon">⚙</span></div><div class="stat-value">${count("diproses")}</div><div class="stat-note">Sedang dikerjakan petugas</div></div>
        <div class="stat-card green"><div class="stat-top"><span class="stat-label">Selesai</span><span class="stat-icon">✓</span></div><div class="stat-value">${done}</div><div class="stat-note">${total?Math.round(done/total*100):0}% dari total laporan</div></div>
      </div>
      <div class="dashboard-grid">
        <section class="panel"><div class="panel-head"><div><h3>Ringkasan Status</h3><p>Distribusi status seluruh laporan yang dapat diakses</p></div></div>
          <div class="status-summary">${Object.keys(STATUS).map(s=>`<div class="status-line"><span>${STATUS[s].label}</span><div class="bar"><span style="width:${total?count(s)/total*100:0}%"></span></div><b>${count(s)}</b></div>`).join("")}</div>
        </section>
        <section class="panel"><div class="panel-head"><div><h3>Laporan Terbaru</h3><p>Aktivitas pelaporan terakhir</p></div><button class="text-link" data-action="go-reports">Lihat semua →</button></div>
          <div class="recent-list">${recent.length?recent.map(r=>`<div class="recent-item"><div class="report-symbol">${category(r.categoryId).icon}</div><div><strong>${escapeHtml(r.title)}</strong><small>${escapeHtml(r.id)} · ${fmtDate(r.createdAt,false)}</small></div>${statusBadge(r.status)}</div>`).join(""):`<div class="empty-state"><div class="empty-icon">▤</div><strong>Belum ada laporan</strong><p>Laporan yang dibuat akan tampil di sini.</p></div>`}</div>
        </section>
      </div>`;
  }
  function renderReports(){
    const reports=[...allowedReports()].filter(r=>(!reportFilter.status||r.status===reportFilter.status)&&(!reportFilter.category||r.categoryId===reportFilter.category)&&(!reportFilter.q||[r.id,r.title,r.location,r.reporterName].join(" ").toLowerCase().includes(reportFilter.q.toLowerCase()))).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
    return `${pageHead("Semua Laporan",currentUser.role==="pelapor"?"Daftar laporan yang telah Anda kirimkan.":"Kelola dan pantau seluruh laporan kerusakan fasilitas.",currentUser.role==="admin"?'<button class="btn btn-outline btn-sm" data-action="export">↓ Ekspor CSV</button>':"")}
      <div class="toolbar"><div class="search-wrap"><span>⌕</span><input id="reportSearch" placeholder="Cari judul, ID, lokasi, pelapor..." value="${escapeHtml(reportFilter.q)}"></div><select id="statusFilter"><option value="">Semua status</option>${Object.keys(STATUS).map(s=>`<option value="${s}" ${reportFilter.status===s?"selected":""}>${STATUS[s].label}</option>`).join("")}</select><select id="categoryFilter"><option value="">Semua kategori</option>${state.categories.map(c=>`<option value="${c.id}" ${reportFilter.category===c.id?"selected":""}>${escapeHtml(c.name)}</option>`).join("")}</select><button class="btn btn-outline btn-sm" data-action="reset-filter">Reset</button></div>
      <section class="panel table-panel"><div class="table-scroll"><table class="data-table"><thead><tr><th>ID / Tanggal</th><th>Judul Laporan</th><th>Kategori & Lokasi</th>${currentUser.role!=="pelapor"?"<th>Pelapor</th>":""}<th>Prioritas</th><th>Status</th><th>Aksi</th></tr></thead><tbody>
      ${reports.length?reports.map(r=>`<tr><td><span class="table-title">${escapeHtml(r.id)}</span><span class="table-sub">${fmtDate(r.createdAt,false)}</span></td><td><span class="table-title">${escapeHtml(r.title)}</span><span class="table-sub">${escapeHtml(r.description.slice(0,58))}${r.description.length>58?"…":""}</span></td><td><span class="table-title">${category(r.categoryId).icon} ${escapeHtml(category(r.categoryId).name)}</span><span class="table-sub">${escapeHtml(r.location)}</span></td>${currentUser.role!=="pelapor"?`<td>${escapeHtml(r.reporterName)}</td>`:""}<td>${priorityLabel(r.priority)}</td><td>${statusBadge(r.status)}</td><td><div class="table-actions"><button class="icon-action" title="Detail" data-action="detail" data-id="${r.id}">↗</button>${currentUser.role==="pelapor"&&r.status==="diajukan"?`<button class="icon-action" title="Hapus" data-action="delete" data-id="${r.id}">×</button>`:""}</div></td></tr>`).join(""):`<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">⌕</div><strong>Laporan tidak ditemukan</strong><p>Coba ubah kata kunci atau filter pencarian.</p></div></td></tr>`}
      </tbody></table></div></section>`;
  }
  function renderNewReport(){
    const editing=editingReportId?state.reports.find(r=>r.id===editingReportId):null;
    return `${pageHead(editing?"Ubah Laporan":"Buat Laporan Baru",editing?"Perbarui informasi laporan yang masih dapat diedit.":"Sampaikan kerusakan fasilitas agar dapat segera ditindaklanjuti.")}
      <div class="form-layout"><section class="panel form-panel"><h3>Informasi Kerusakan</h3><p>Lengkapi informasi berikut dengan jelas dan benar.</p>
        <form id="reportForm"><div class="form-grid">
          <div class="form-field full"><label for="reportTitle">Judul laporan <span class="required">*</span></label><input id="reportTitle" maxlength="90" required placeholder="Contoh: Lampu ruang kelas tidak menyala" value="${escapeHtml(editing?.title||"")}"></div>
          <div class="form-field"><label for="reportCategory">Kategori <span class="required">*</span></label><select id="reportCategory" required><option value="">Pilih kategori</option>${state.categories.map(c=>`<option value="${c.id}" ${editing?.categoryId===c.id?"selected":""}>${c.icon} ${escapeHtml(c.name)}</option>`).join("")}</select></div>
          <div class="form-field"><label for="reportPriority">Tingkat prioritas <span class="required">*</span></label><select id="reportPriority" required><option value="rendah" ${editing?.priority==="rendah"?"selected":""}>Rendah</option><option value="sedang" ${!editing||editing.priority==="sedang"?"selected":""}>Sedang</option><option value="tinggi" ${editing?.priority==="tinggi"?"selected":""}>Tinggi</option></select></div>
          <div class="form-field full"><label for="reportLocation">Lokasi fasilitas <span class="required">*</span></label><input id="reportLocation" required maxlength="120" placeholder="Contoh: Gedung A, Ruang 204" value="${escapeHtml(editing?.location||"")}"></div>
          <div class="form-field full"><label for="reportDescription">Deskripsi kerusakan <span class="required">*</span></label><textarea id="reportDescription" required minlength="15" maxlength="1000" placeholder="Jelaskan kondisi kerusakan, kapan diketahui, dan dampaknya...">${escapeHtml(editing?.description||"")}</textarea><div class="field-hint">Minimal 15 karakter. Jangan mencantumkan informasi pribadi yang tidak diperlukan.</div></div>
        </div><div class="form-actions"><button type="button" class="btn btn-outline" data-action="cancel-form">Batal</button><button class="btn btn-primary" type="submit">${editing?"Simpan Perubahan":"Kirim Laporan"} →</button></div></form>
      </section><aside class="info-panel"><h4>ⓘ Panduan Pelaporan</h4><ul><li>Gunakan judul yang singkat dan menggambarkan masalah.</li><li>Tulis lokasi secara spesifik agar petugas mudah menemukan fasilitas.</li><li>Jelaskan kerusakan dengan detail dan bahasa yang jelas.</li><li>Pilih prioritas berdasarkan dampak kerusakan.</li><li>Setelah dikirim, pantau status laporan secara berkala.</li></ul></aside></div>`;
  }
  function renderCategories(){
    return `${pageHead("Kategori Laporan","Kelola klasifikasi kerusakan fasilitas kampus.",'<button class="btn btn-primary btn-sm" data-action="add-category">＋ Tambah Kategori</button>')}
      <div class="category-grid">${state.categories.map(c=>`<article class="category-card"><div class="category-card-top"><div class="category-emoji">${c.icon}</div><button class="icon-action" data-action="edit-category" data-id="${c.id}" title="Ubah">✎</button></div><h3>${escapeHtml(c.name)}</h3><p>${escapeHtml(c.description||"Tidak ada deskripsi.")}</p><small>${state.reports.filter(r=>r.categoryId===c.id).length} laporan terkait</small></article>`).join("")}</div>`;
  }
  function renderUsers(){
    return `${pageHead("Pengguna Sistem","Daftar akun demo dan pembagian peran pengguna.")}
      <div class="user-grid">${USERS.map(u=>`<article class="user-card"><div class="avatar">${u.name[0]}</div><div><strong>${escapeHtml(u.name)}</strong><small>${escapeHtml(u.email)}</small><small>${roleName(u.role)} · ${escapeHtml(u.unit)}</small></div></article>`).join("")}</div>
      <section class="panel" style="margin-top:18px"><div class="panel-head"><div><h3>Prinsip Hak Akses</h3><p>Fitur yang tersedia untuk setiap jenis pengguna.</p></div></div>
      <div class="table-scroll"><table class="data-table"><thead><tr><th>Fitur</th><th>Pelapor</th><th>Petugas</th><th>Administrator</th></tr></thead><tbody>
      <tr><td>Lihat laporan</td><td>Hanya laporan sendiri</td><td>Semua laporan</td><td>Semua laporan</td></tr><tr><td>Buat laporan</td><td>✓</td><td>—</td><td>—</td></tr><tr><td>Ubah status laporan</td><td>—</td><td>✓</td><td>✓</td></tr><tr><td>Kelola kategori</td><td>—</td><td>—</td><td>✓</td></tr><tr><td>Lihat aktivitas sistem</td><td>—</td><td>—</td><td>✓</td></tr></tbody></table></div></section>`;
  }
  function renderActivity(){
    return `${pageHead("Aktivitas Sistem","Catatan perubahan dan aktivitas yang terjadi di CampusCare.",'<button class="btn btn-outline btn-sm" data-action="clear-activity">Bersihkan Log</button>')}
      <section class="panel"><div class="activity-list">${state.activities.length?state.activities.map(a=>`<div class="activity-row"><span class="activity-dot"></span><div><strong>${escapeHtml(a.text)}</strong><p>${fmtDate(a.at)}</p></div></div>`).join(""):`<div class="empty-state"><strong>Belum ada aktivitas</strong><p>Aktivitas sistem akan tercatat di halaman ini.</p></div>`}</div></section>`;
  }
  function bindPageEvents(){
    $$("[data-action]").forEach(b=>b.addEventListener("click",()=>handleAction(b.dataset.action,b.dataset.id)));
    const search=$("#reportSearch");if(search)search.addEventListener("input",()=>{reportFilter.q=search.value;renderReportsTableOnly();});
    const sf=$("#statusFilter");if(sf)sf.addEventListener("change",()=>{reportFilter.status=sf.value;render();});
    const cf=$("#categoryFilter");if(cf)cf.addEventListener("change",()=>{reportFilter.category=cf.value;render();});
    const rf=$("#reportForm");if(rf)rf.addEventListener("submit",submitReport);
  }
  function renderReportsTableOnly(){const y=window.scrollY;render();const input=$("#reportSearch");if(input){input.focus();input.setSelectionRange(input.value.length,input.value.length);}window.scrollTo(0,y);}
  function handleAction(action,id){
    if(action==="go-reports")navigate("reports");
    if(action==="reset-filter"){reportFilter={q:"",status:"",category:""};render();}
    if(action==="detail")showDetail(id);
    if(action==="delete")deleteReport(id);
    if(action==="cancel-form"){editingReportId=null;navigate("reports");}
    if(action==="export")exportCSV();
    if(action==="add-category")categoryModal();
    if(action==="edit-category")categoryModal(id);
    if(action==="clear-activity"){if(confirm("Hapus seluruh catatan aktivitas?")){state.activities=[];save();render();toast("Log aktivitas dibersihkan.");}}
  }
  function submitReport(e){
    e.preventDefault();
    const title=$("#reportTitle").value.trim(),categoryId=$("#reportCategory").value,priority=$("#reportPriority").value,location=$("#reportLocation").value.trim(),description=$("#reportDescription").value.trim();
    if(description.length<15){toast("Deskripsi minimal 15 karakter.","error");return;}
    if(editingReportId){
      const r=state.reports.find(x=>x.id===editingReportId);if(!r)return;
      Object.assign(r,{title,categoryId,priority,location,description,updatedAt:new Date().toISOString()});log(`${currentUser.name} memperbarui laporan ${r.id}.`);editingReportId=null;save();toast("Laporan berhasil diperbarui.");navigate("reports");return;
    }
    const year=new Date().getFullYear(),num=state.nextNumber||1,id=`CC-${year}-${String(num).padStart(3,"0")}`;
    state.nextNumber=num+1;
    const now=new Date().toISOString();
    state.reports.unshift({id,title,categoryId,priority,location,description,reporterId:currentUser.id,reporterName:currentUser.name,status:"diajukan",createdAt:now,updatedAt:now,notes:"",history:[{status:"diajukan",note:"Laporan dibuat oleh pelapor.",at:now}]});
    log(`${currentUser.name} membuat laporan ${id}.`);save();toast("Laporan berhasil dikirim.");navigate("reports");
  }
  function deleteReport(id){
    const r=state.reports.find(x=>x.id===id);if(!r||r.reporterId!==currentUser.id||r.status!=="diajukan")return;
    if(confirm(`Hapus laporan ${id}?`)){state.reports=state.reports.filter(x=>x.id!==id);log(`${currentUser.name} menghapus laporan ${id}.`);save();toast("Laporan dihapus.");render();}
  }
  function showDetail(id){
    const r=state.reports.find(x=>x.id===id);if(!r)return;
    const canManage=["petugas","admin"].includes(currentUser.role);
    const modal=`<div class="modal-backdrop" id="modalBackdrop"><div class="modal"><div class="modal-head"><h3>Detail Laporan · ${escapeHtml(r.id)}</h3><button class="modal-close" data-modal-close>×</button></div><div class="modal-body">
      <div class="detail-grid"><div><div class="detail-block"><h4>Judul Laporan</h4><p style="font-weight:700;color:#26394d">${escapeHtml(r.title)}</p></div><div class="detail-block"><h4>Deskripsi</h4><p>${escapeHtml(r.description)}</p></div><div class="detail-meta"><div class="meta-item"><small>Kategori</small><strong>${category(r.categoryId).icon} ${escapeHtml(category(r.categoryId).name)}</strong></div><div class="meta-item"><small>Prioritas</small><strong>${priorityLabel(r.priority)}</strong></div><div class="meta-item"><small>Lokasi</small><strong>${escapeHtml(r.location)}</strong></div><div class="meta-item"><small>Pelapor</small><strong>${escapeHtml(r.reporterName)}</strong></div><div class="meta-item"><small>Dibuat</small><strong>${fmtDate(r.createdAt)}</strong></div><div class="meta-item"><small>Status</small><strong>${statusBadge(r.status)}</strong></div></div>
      <div class="detail-block" style="margin-top:20px"><h4>Catatan Petugas</h4><p>${escapeHtml(r.notes||"Belum ada catatan tindak lanjut.")}</p></div></div><div><div class="detail-block"><h4>Riwayat Penanganan</h4><div class="timeline">${(r.history||[]).map(h=>`<div class="timeline-item"><strong>${STATUS[h.status]?.label||h.status}</strong><p>${escapeHtml(h.note)}</p><small>${fmtDate(h.at)}</small></div>`).join("")}</div></div>
      ${canManage?`<div class="detail-actions"><h4>Perbarui Penanganan</h4><label class="field-hint">Status laporan</label><select id="detailStatus">${Object.keys(STATUS).filter(s=>s!=="diajukan").map(s=>`<option value="${s}" ${r.status===s?"selected":""}>${STATUS[s].label}</option>`).join("")}</select><label class="field-hint">Catatan tindak lanjut</label><textarea id="detailNotes" class="form-field" style="width:100%;min-height:80px;border:1px solid #dce4ec;border-radius:8px;padding:10px;font:inherit" placeholder="Tuliskan tindakan atau informasi terbaru...">${escapeHtml(r.notes||"")}</textarea><button class="btn btn-primary btn-sm" id="saveStatusBtn">Simpan Perubahan</button></div>`:""}
      ${currentUser.role==="pelapor"&&r.status==="diajukan"?`<button class="btn btn-outline btn-sm" style="margin-top:15px" id="editReportBtn">Ubah Laporan</button>`:""}</div></div></div><div class="modal-foot"><button class="btn btn-outline btn-sm" data-modal-close>Tutup</button></div></div></div>`;
    $("#modalRoot").innerHTML=modal;
    $$("[data-modal-close]").forEach(b=>b.addEventListener("click",closeModal));
    $("#modalBackdrop").addEventListener("click",e=>{if(e.target.id==="modalBackdrop")closeModal();});
    const saveBtn=$("#saveStatusBtn");if(saveBtn)saveBtn.addEventListener("click",()=>updateStatus(id));
    const editBtn=$("#editReportBtn");if(editBtn)editBtn.addEventListener("click",()=>{closeModal();editingReportId=id;navigate("new-report");});
  }
  function updateStatus(id){
    const r=state.reports.find(x=>x.id===id);if(!r)return;
    const status=$("#detailStatus").value,notes=$("#detailNotes").value.trim();
    if(!notes){toast("Tambahkan catatan tindak lanjut.","error");return;}
    const now=new Date().toISOString();r.status=status;r.notes=notes;r.updatedAt=now;r.history.push({status,note:notes,at:now});
    log(`${currentUser.name} memperbarui status laporan ${id} menjadi ${STATUS[status].label}.`);save();closeModal();toast("Status laporan berhasil diperbarui.");render();
  }
  function closeModal(){$("#modalRoot").innerHTML="";}
  function categoryModal(id){
    const c=id?state.categories.find(x=>x.id===id):null;
    $("#modalRoot").innerHTML=`<div class="modal-backdrop" id="modalBackdrop"><div class="modal" style="width:min(440px,100%)"><div class="modal-head"><h3>${c?"Ubah Kategori":"Tambah Kategori"}</h3><button class="modal-close" data-modal-close>×</button></div><form id="categoryForm"><div class="modal-body"><div class="form-field" style="margin-bottom:15px"><label>Nama kategori <span class="required">*</span></label><input id="catName" required maxlength="40" value="${escapeHtml(c?.name||"")}" placeholder="Nama kategori"></div><div class="form-field" style="margin-bottom:15px"><label>Ikon / emoji</label><input id="catIcon" maxlength="4" value="${escapeHtml(c?.icon||"📌")}" placeholder="📌"></div><div class="form-field"><label>Deskripsi</label><textarea id="catDesc" maxlength="160" placeholder="Penjelasan kategori">${escapeHtml(c?.description||"")}</textarea></div></div><div class="modal-foot"><button type="button" class="btn btn-outline btn-sm" data-modal-close>Batal</button><button class="btn btn-primary btn-sm">Simpan</button></div></form></div></div>`;
    $$("[data-modal-close]").forEach(b=>b.addEventListener("click",closeModal));
    $("#modalBackdrop").addEventListener("click",e=>{if(e.target.id==="modalBackdrop")closeModal();});
    $("#categoryForm").addEventListener("submit",e=>{e.preventDefault();const name=$("#catName").value.trim();if(!name)return;
      if(c){Object.assign(c,{name,icon:$("#catIcon").value.trim()||"📌",description:$("#catDesc").value.trim()});log(`${currentUser.name} mengubah kategori ${name}.`);}
      else{const newId="c"+Date.now();state.categories.push({id:newId,name,icon:$("#catIcon").value.trim()||"📌",description:$("#catDesc").value.trim()});log(`${currentUser.name} menambahkan kategori ${name}.`);}
      save();closeModal();render();toast("Kategori berhasil disimpan.");});
  }
  function exportCSV(){
    const rows=[["ID","Judul","Kategori","Lokasi","Prioritas","Status","Pelapor","Tanggal","Deskripsi"],...state.reports.map(r=>[r.id,r.title,category(r.categoryId).name,r.location,priorityLabel(r.priority),STATUS[r.status].label,r.reporterName,fmtDate(r.createdAt),r.description])];
    const csv=rows.map(row=>row.map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(",")).join("\r\n");
    const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="campuscare-laporan.csv";a.click();URL.revokeObjectURL(url);toast("Data laporan berhasil diekspor.");
  }
  init();
})();