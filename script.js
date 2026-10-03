// ============================================================
// HELAA KRK - Sistem Mentor-Mentee Rukaiyah
// Front-end prototype for GitHub Pages.
// Version 7.0 - editable schedule + static SDG + voice greetings + button hardening.
// Fill Supabase values only after the Supabase project is ready.
// Use ONLY a public / publishable key in browser code.
// ============================================================
const SUPABASE_URL = "";
const SUPABASE_PUBLISHABLE_KEY = "";
let supabaseClient = null;
function initialiseSupabaseWhenConfigured(){
  if(!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) return;
  const existing=document.querySelector('script[data-supabase-client]');
  if(existing) return;
  const tag=document.createElement('script');
  tag.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  tag.async=true;tag.dataset.supabaseClient='1';
  tag.onload=()=>{
    try{
      if(window.supabase){supabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);refreshIdentity();if(adminMode)renderAdminDashboard()}
    }catch(err){console.warn('Supabase belum dapat dimulakan:',err)}
  };
  document.head.appendChild(tag);
}

const SUBJECT_OPTIONS = [
  "Bahasa Melayu","English","Matematik","Sains","Sejarah","Geografi","Pendidikan Islam",
  "Reka Bentuk dan Teknologi","Asas Sains Komputer","Biologi","Fizik","Kimia","Matematik Tambahan",
  "Prinsip Perakaunan","Perniagaan","Perdagangan","Reka Cipta","Sains Rumah Tangga","Pendidikan Seni Visual",
  "Asas Kelestarian","Tasawwur Islam","Tilawah Al-Quran","Tajwid","Jawi dan Khat","Imlak","Sirah","Ibadah",
  "Aqidah (Tauhid)","Adab (Akhlak Islamiah)","Bahasa Arab","Lain-lain"
];

const LEVEL_OPTIONS = [
  "SK Tahun 1","SK Tahun 2","SK Tahun 3","SK Tahun 4","SK Tahun 5","SK Tahun 6",
  "SMK Tingkatan 1","SMK Tingkatan 2","SMK Tingkatan 3","SMK Tingkatan 4","SMK Tingkatan 5",
  "SRA Tahun 1","SRA Tahun 2","SRA Tahun 3","SRA Tahun 4","SRA Tahun 5 (UPKK)","SRA Tahun 6 (PSRA)"
];

const GROUP_ORDER = [
  "Tahun 1","Tahun 2","Tahun 3","Tahun 4","Tahun 5","Tahun 6",
  "Tingkatan 1","Tingkatan 2","Tingkatan 3","Tingkatan 4","Tingkatan 5"
];

const STUDENT_SEED = [
  {id:"y1-sayima",group:"Tahun 1",name:"Sayima"},
  {id:"y2-sofea",group:"Tahun 2",name:"Sofea"},
  {id:"y3-aisy-furqan",group:"Tahun 3",name:"Aisy Furqan"},{id:"y3-aidan",group:"Tahun 3",name:"Aidan"},
  {id:"y4-abdullah",group:"Tahun 4",name:"Abdullah"},{id:"y4-alesha",group:"Tahun 4",name:"Alesha"},
  {id:"y5-adam",group:"Tahun 5",name:"Adam"},{id:"y5-haziq",group:"Tahun 5",name:"Haziq"},{id:"y5-hakim",group:"Tahun 5",name:"Hakim"},{id:"y5-hakimi",group:"Tahun 5",name:"Hakimi"},
  {id:"y6-ariana",group:"Tahun 6",name:"Ariana"},{id:"y6-fathemah",group:"Tahun 6",name:"Fathemah"},
  {id:"f1-amirul",group:"Tingkatan 1",name:"Amirul"},{id:"f1-raffiuddin",group:"Tingkatan 1",name:"Raffiuddin"},{id:"f1-nisak",group:"Tingkatan 1",name:"Nisak"},
  {id:"f2-ainul",group:"Tingkatan 2",name:"Ainul"},{id:"f2-nadhirah",group:"Tingkatan 2",name:"Nadhirah"},{id:"f2-najwa",group:"Tingkatan 2",name:"Najwa"},{id:"f2-ameera",group:"Tingkatan 2",name:"Ameera"},{id:"f2-azwa",group:"Tingkatan 2",name:"Azwa"},
  {id:"f3-fairul",group:"Tingkatan 3",name:"Fairul"},{id:"f3-irfan",group:"Tingkatan 3",name:"Irfan"},{id:"f3-qaisara",group:"Tingkatan 3",name:"Qaisara"},{id:"f3-kathrina",group:"Tingkatan 3",name:"Kathrina"},{id:"f3-farzana",group:"Tingkatan 3",name:"Farzana"},{id:"f3-alia",group:"Tingkatan 3",name:"Alia"},
  {id:"f4-farhana",group:"Tingkatan 4",name:"Farhana"},{id:"f4-natrah",group:"Tingkatan 4",name:"Natrah"},
  {id:"f5-hidayah",group:"Tingkatan 5",name:"Hidayah"},{id:"f5-humairah",group:"Tingkatan 5",name:"Humairah"}
];

const DEFAULT_SCHEDULE = [
  {id:"20261003-y4-sains",date:"2026-10-03",day:"Sabtu",time:"2.00 PM - 4.30 PM",subject:"Sains",group:"Tahun 4",mode:"individual"},
  {id:"20261003-y4-bm",date:"2026-10-03",day:"Sabtu",time:"8.00 PM - 10.15 PM*",subject:"Bahasa Melayu",group:"Tahun 4",mode:"individual"},
  {id:"20261003-pksk",date:"2026-10-03",day:"Sabtu",time:"8.00 PM - 10.15 PM*",subject:"Persediaan PKSK",group:"Tahun 6",mode:"pksk",topic:"Bahasa Melayu"},
  {id:"20261004-y4-eng",date:"2026-10-04",day:"Ahad",time:"10.00 AM - 12.30 PM",subject:"English",group:"Tahun 4",mode:"individual"},
  {id:"20261004-y4-math",date:"2026-10-04",day:"Ahad",time:"2.00 PM - 4.30 PM",subject:"Matematik",group:"Tahun 4",mode:"individual"},
  {id:"20261005-y5-sifir",date:"2026-10-05",day:"Isnin",time:"10.00 AM - 12.00 PM",subject:"Latih Tubi Sifir",group:"Tahun 5",mode:"individual"},
  {id:"20261005-y4-bm",date:"2026-10-05",day:"Isnin",time:"8.00 PM - 10.15 PM*",subject:"Bahasa Melayu",group:"Tahun 4",mode:"individual"},
  {id:"20261005-f1-bm",date:"2026-10-05",day:"Isnin",time:"8.00 PM - 10.15 PM*",subject:"Bahasa Melayu",group:"Tingkatan 1",mode:"individual"},
  {id:"20261005-f2-bm",date:"2026-10-05",day:"Isnin",time:"8.00 PM - 10.15 PM*",subject:"Bahasa Melayu",group:"Tingkatan 2",mode:"individual"},
  {id:"20261005-f3-bm",date:"2026-10-05",day:"Isnin",time:"8.00 PM - 10.15 PM*",subject:"Bahasa Melayu",group:"Tingkatan 3",mode:"individual"},
  {id:"20261005-pksk",date:"2026-10-05",day:"Isnin",time:"8.00 PM - 10.15 PM*",subject:"Persediaan PKSK",group:"Tahun 6",mode:"pksk",topic:"Sains"},
  {id:"20261006-y5-sifir",date:"2026-10-06",day:"Selasa",time:"10.00 AM - 12.00 PM",subject:"Latih Tubi Sifir",group:"Tahun 5",mode:"individual"},
  {id:"20261006-y2-sifir",date:"2026-10-06",day:"Selasa",time:"2.00 PM - 4.30 PM",subject:"Latih Tubi Sifir",group:"Tahun 2",mode:"individual"},
  {id:"20261006-y3-sifir",date:"2026-10-06",day:"Selasa",time:"2.00 PM - 4.30 PM",subject:"Latih Tubi Sifir",group:"Tahun 3",mode:"individual"},
  {id:"20261006-y4-sains",date:"2026-10-06",day:"Selasa",time:"8.00 PM - 10.15 PM*",subject:"Sains",group:"Tahun 4",mode:"individual"},
  {id:"20261006-f1-sains",date:"2026-10-06",day:"Selasa",time:"8.00 PM - 10.15 PM*",subject:"Sains",group:"Tingkatan 1",mode:"individual"},
  {id:"20261006-f2-sains",date:"2026-10-06",day:"Selasa",time:"8.00 PM - 10.15 PM*",subject:"Sains",group:"Tingkatan 2",mode:"individual"},
  {id:"20261006-f3-sains",date:"2026-10-06",day:"Selasa",time:"8.00 PM - 10.15 PM*",subject:"Sains",group:"Tingkatan 3",mode:"individual"},
  {id:"20261006-pksk",date:"2026-10-06",day:"Selasa",time:"8.00 PM - 10.15 PM*",subject:"Persediaan PKSK",group:"Tahun 6",mode:"pksk",topic:"Matematik"},
  {id:"20261007-y5-bahagi",date:"2026-10-07",day:"Rabu",time:"10.00 AM - 12.00 PM",subject:"Latih Tubi Bahagi",group:"Tahun 5",mode:"individual"},
  {id:"20261007-y2-bahagi",date:"2026-10-07",day:"Rabu",time:"2.00 PM - 4.30 PM",subject:"Latih Tubi Bahagi",group:"Tahun 2",mode:"individual"},
  {id:"20261007-y3-bahagi",date:"2026-10-07",day:"Rabu",time:"2.00 PM - 4.30 PM",subject:"Latih Tubi Bahagi",group:"Tahun 3",mode:"individual"},
  {id:"20261007-f1-eng",date:"2026-10-07",day:"Rabu",time:"8.00 PM - 10.15 PM*",subject:"English",group:"Tingkatan 1",mode:"individual"},
  {id:"20261007-f2-eng",date:"2026-10-07",day:"Rabu",time:"8.00 PM - 10.15 PM*",subject:"English",group:"Tingkatan 2",mode:"individual"},
  {id:"20261007-f3-eng",date:"2026-10-07",day:"Rabu",time:"8.00 PM - 10.15 PM*",subject:"English",group:"Tingkatan 3",mode:"individual"},
  {id:"20261007-pksk",date:"2026-10-07",day:"Rabu",time:"8.00 PM - 10.15 PM*",subject:"Persediaan PKSK",group:"Tahun 6",mode:"pksk",topic:"RBT"},
  {id:"20261008-f1-math",date:"2026-10-08",day:"Khamis",time:"8.00 PM - 10.15 PM*",subject:"Matematik",group:"Tingkatan 1",mode:"individual"},
  {id:"20261008-f2-math",date:"2026-10-08",day:"Khamis",time:"8.00 PM - 10.15 PM*",subject:"Matematik",group:"Tingkatan 2",mode:"individual"},
  {id:"20261008-f3-math",date:"2026-10-08",day:"Khamis",time:"8.00 PM - 10.15 PM*",subject:"Matematik",group:"Tingkatan 3",mode:"individual"},
  {id:"20261008-pksk",date:"2026-10-08",day:"Khamis",time:"8.00 PM - 10.15 PM*",subject:"Persediaan PKSK",group:"Tahun 6",mode:"pksk",topic:"Sejarah & Pengetahuan Am"},
  {id:"20261009-f1-pi",date:"2026-10-09",day:"Jumaat",time:"8.00 PM - 10.15 PM*",subject:"Pendidikan Islam",group:"Tingkatan 1",mode:"individual"},
  {id:"20261009-f2-pi",date:"2026-10-09",day:"Jumaat",time:"8.00 PM - 10.15 PM*",subject:"Pendidikan Islam",group:"Tingkatan 2",mode:"individual"},
  {id:"20261009-f3-pi",date:"2026-10-09",day:"Jumaat",time:"8.00 PM - 10.15 PM*",subject:"Pendidikan Islam",group:"Tingkatan 3",mode:"individual"},
  {id:"20261009-pksk",date:"2026-10-09",day:"Jumaat",time:"8.00 PM - 10.15 PM*",subject:"Persediaan PKSK",group:"Tahun 6",mode:"pksk",topic:"PSV, Muzik & PJK"},
  {id:"20261010-f1-geo",date:"2026-10-10",day:"Sabtu",time:"8.00 PM - 10.15 PM*",subject:"Geografi",group:"Tingkatan 1",mode:"individual"},
  {id:"20261010-f2-geo",date:"2026-10-10",day:"Sabtu",time:"8.00 PM - 10.15 PM*",subject:"Geografi",group:"Tingkatan 2",mode:"individual"},
  {id:"20261010-f3-geo",date:"2026-10-10",day:"Sabtu",time:"8.00 PM - 10.15 PM*",subject:"Geografi",group:"Tingkatan 3",mode:"individual"},
  {id:"20261010-pksk",date:"2026-10-10",day:"Sabtu",time:"8.00 PM - 10.15 PM*",subject:"Persediaan PKSK",group:"Tahun 6",mode:"pksk",topic:"IQ, Psikometrik & Karangan"},
  {id:"20261011-f1-bmkbat",date:"2026-10-11",day:"Ahad",time:"8.00 PM - 10.15 PM*",subject:"Ulasan BM & KBAT Sejarah",group:"Tingkatan 1",mode:"individual"},
  {id:"20261011-f2-bmkbat",date:"2026-10-11",day:"Ahad",time:"8.00 PM - 10.15 PM*",subject:"Ulasan BM & KBAT Sejarah",group:"Tingkatan 2",mode:"individual"},
  {id:"20261011-f3-bmkbat",date:"2026-10-11",day:"Ahad",time:"8.00 PM - 10.15 PM*",subject:"Ulasan BM & KBAT Sejarah",group:"Tingkatan 3",mode:"individual"},
  {id:"20261011-pksk",date:"2026-10-11",day:"Ahad",time:"8.00 PM - 10.15 PM*",subject:"Persediaan PKSK",group:"Tahun 6",mode:"pksk",topic:"Karangan"}
];

const ADMIN_CODES = ["1983","19831983"];
const RATING_LABELS = [
  "Fokus dan kerjasama mentee",
  "Tahap kefahaman mentee",
  "Respons dan komunikasi mentee",
  "Motivasi / kesediaan mentee untuk belajar",
  "Layanan dan pengurusan Pusat Jagaan Rukaiyah kepada mentor"
];

const KEYS = {
  bookings:"helaa_rukaiyah_bookings_v4",
  reports:"helaa_rukaiyah_reports_v4",
  materials:"helaa_rukaiyah_materials_v4",
  notifications:"helaa_rukaiyah_notifications_v4",
  students:"helaa_rukaiyah_students_v4",
  profiles:"helaa_rukaiyah_mentor_profiles_v4",
  emailSettings:"helaa_rukaiyah_email_settings_v4",
  emailLog:"helaa_rukaiyah_email_log_v4",
  sessionEmail:"helaa_rukaiyah_user_email_v4",
  sessionMatric:"helaa_rukaiyah_user_matric_v4",
  sessionRole:"helaa_rukaiyah_role_v4",
  schedule:"helaa_rukaiyah_schedule_v7"
};

const DB_NAME = "helaa_rukaiyah_files_v4";
const STORE = "files";

function parseJSON(raw,fallback){try{return raw?JSON.parse(raw):fallback}catch{return fallback}}

// Safe storage wrapper: some previews/private browser contexts block localStorage.
// When blocked, the app continues working in memory instead of crashing.
const memoryStorage = new Map();
function storageGet(key){
  try{return window.localStorage.getItem(key)}catch(err){return memoryStorage.has(key)?memoryStorage.get(key):null}
}
function storageSet(key,value){
  const v=String(value);
  try{window.localStorage.setItem(key,v)}catch(err){memoryStorage.set(key,v)}
}
function storageRemove(key){
  try{window.localStorage.removeItem(key)}catch(err){memoryStorage.delete(key)}
}
function loadWithFallback(newKey,oldKey,fallback){const n=storageGet(newKey);if(n!==null)return parseJSON(n,fallback);return parseJSON(storageGet(oldKey),fallback)}

let bookings = loadWithFallback(KEYS.bookings,"helaa_rukaiyah_bookings_v2",[]);
let reports = loadWithFallback(KEYS.reports,"helaa_rukaiyah_reports_v2",[]);
let materials = loadWithFallback(KEYS.materials,"helaa_rukaiyah_materials_v2",[]);
let notifications = loadWithFallback(KEYS.notifications,"helaa_rukaiyah_notifications_v2",[]);
let students = parseJSON(storageGet(KEYS.students),STUDENT_SEED.map(x=>({...x,summary:"",photoKey:""})));
let mentorProfiles = parseJSON(storageGet(KEYS.profiles),[]);
let emailSettings = loadWithFallback(KEYS.emailSettings,"helaa_rukaiyah_email_settings_v3",{enabled:false,adminEmail:"",webhookUrl:""});
let emailLog = loadWithFallback(KEYS.emailLog,"helaa_rukaiyah_email_log_v3",[]);
let SCHEDULE = parseJSON(storageGet(KEYS.schedule), DEFAULT_SCHEDULE.map(x=>({...x})));
if(!Array.isArray(SCHEDULE)||!SCHEDULE.length) SCHEDULE=DEFAULT_SCHEDULE.map(x=>({...x}));

let currentEmail = storageGet(KEYS.sessionEmail) || "";
let currentMatric = storageGet(KEYS.sessionMatric) || "";
let currentRole = storageGet(KEYS.sessionRole) || "";
let adminMode = currentRole === "admin";
let selectedDate = SCHEDULE[0].date;
let activeReassignId = null;
let activeReportId = null;
let reportRatings = [0,0,0,0,0];
let reportWorkingAttachments = [];
let materialEditId = null;
let imageObjectUrls = [];

function $(id){return document.getElementById(id)}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]))}
function uid(){return crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random().toString(36).slice(2)}
function fmtDate(date){return new Date(date+"T00:00:00").toLocaleDateString("ms-MY",{day:"numeric",month:"short",year:"numeric"})}
function fmtDateTime(date){return new Date(date).toLocaleString("ms-MY",{dateStyle:"medium",timeStyle:"short"})}
function slotById(id){return SCHEDULE.find(s=>s.id===id)}
function studentById(id){return students.find(s=>s.id===id)}
function profileByEmail(email){return mentorProfiles.find(p=>p.email.toLowerCase()===String(email||"").toLowerCase())}
function isFinalStatus(b){return ["approved","reassigned"].includes(b.status)}
function approvedForSlot(id){return bookings.filter(b=>b.slotId===id&&isFinalStatus(b))}
function makeTicket(){return "HL-"+Date.now().toString(36).slice(-6).toUpperCase()}
function wordCount(text){return String(text||"").trim()?String(text).trim().split(/\s+/).length:0}
function isImageType(type,name=""){return String(type||"").startsWith("image/")||/\.(png|jpe?g|webp|gif)$/i.test(name)}
function statusLabel(s){return({pending:"Menunggu Semakan",approved:"Diluluskan",reassigned:"Diatur Semula",rejected:"Tidak Diluluskan",reverted:"Dibuka Semula",returned:"Dipulangkan"})[s]||s}
function badge(s){const c=s==="pending"?"pending":["approved","reassigned"].includes(s)?"ok":s==="returned"?"returned":s==="rejected"?"full":"info";return `<span class="badge ${c}">${esc(statusLabel(s))}</span>`}

// ---------- Voice greeting / appreciation ----------
const WELCOME_VOICE_TEXT = "Selamat datang ke laman web CSR Biro Hal Ehwal Luar, Alumni dan Antarabangsa Kolej Rahim Kajai. Selamat menjadi perwira untuk bangsa, agama dan negara. Anda amatlah diperlukan.";
const THANK_VOICE_TEXT = "Terima kasih banyak-banyak atas sumbangan anda kepada masyarakat.";
let welcomeVoiceStarted=false;
function speakText(text,kind="general"){
  try{
    if(!("speechSynthesis" in window)||!window.SpeechSynthesisUtterance)return false;
    const u=new SpeechSynthesisUtterance(text);u.lang="ms-MY";u.rate=.94;u.pitch=1;u.volume=1;
    const voices=window.speechSynthesis.getVoices();
    const ms=voices.find(v=>/^ms(-|_)/i.test(v.lang))||voices.find(v=>/malay/i.test(v.name))||voices.find(v=>/^en(-|_)/i.test(v.lang));
    if(ms)u.voice=ms;
    if(kind==="welcome")u.onstart=()=>{welcomeVoiceStarted=true};
    window.speechSynthesis.cancel();window.speechSynthesis.speak(u);return true;
  }catch(err){console.warn("Voice tidak dapat dimainkan:",err);return false}
}
function speakWelcome(){if(!welcomeVoiceStarted)speakText(WELCOME_VOICE_TEXT,"welcome")}
function speakThanks(){speakText(THANK_VOICE_TEXT,"thanks")}
function setupWelcomeVoice(){
  setTimeout(speakWelcome,500);
  const fallback=()=>{if(!welcomeVoiceStarted)speakWelcome()};
  document.addEventListener("pointerdown",fallback,{once:true,capture:true});
  document.addEventListener("keydown",fallback,{once:true,capture:true});
}

function saveAll(){
  storageSet(KEYS.bookings,JSON.stringify(bookings));
  storageSet(KEYS.reports,JSON.stringify(reports));
  storageSet(KEYS.materials,JSON.stringify(materials));
  storageSet(KEYS.notifications,JSON.stringify(notifications));
  storageSet(KEYS.students,JSON.stringify(students));
  storageSet(KEYS.profiles,JSON.stringify(mentorProfiles));
  storageSet(KEYS.emailSettings,JSON.stringify(emailSettings));
  storageSet(KEYS.emailLog,JSON.stringify(emailLog.slice(0,100)));
  storageSet(KEYS.schedule,JSON.stringify(SCHEDULE));
}

// ---------- File storage for prototype ----------
function fileToDataUrl(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=()=>rej(r.error);r.readAsDataURL(file)})}
function dataUrlToBlob(dataUrl){const [meta,data]=dataUrl.split(","),mime=(meta.match(/data:(.*?);/)||[])[1]||"application/octet-stream",bin=atob(data),arr=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)arr[i]=bin.charCodeAt(i);return new Blob([arr],{type:mime})}
function openDB(){return new Promise((res,rej)=>{if(!window.indexedDB){rej(new Error("IndexedDB tidak tersedia"));return}const r=indexedDB.open(DB_NAME,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(STORE))r.result.createObjectStore(STORE)};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
async function idbPut(key,file){
  try{const db=await openDB();return await new Promise((res,rej)=>{const tx=db.transaction(STORE,"readwrite");tx.objectStore(STORE).put(file,key);tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error)})}
  catch(err){const data=await fileToDataUrl(file);storageSet(`helaa_file_${key}`,data)}
}
async function idbGet(key){
  try{const db=await openDB();const got=await new Promise((res,rej)=>{const r=db.transaction(STORE,"readonly").objectStore(STORE).get(key);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});if(got)return got}catch{}
  const fallback=storageGet(`helaa_file_${key}`);return fallback?dataUrlToBlob(fallback):null
}
async function openStoredFile(key,name){
  try{const blob=await idbGet(key);if(!blob){alert("Fail tidak ditemui pada peranti ini.");return}const url=URL.createObjectURL(blob);imageObjectUrls.push(url);window.open(url,"_blank","noopener,noreferrer")}
  catch(err){alert(err.message||"Fail tidak dapat dibuka.")}
}
async function hydrateStoredImages(root=document){
  const imgs=[...root.querySelectorAll("img[data-file-key]")];
  await Promise.all(imgs.map(async img=>{
    const key=img.dataset.fileKey;if(!key||img.dataset.loaded==="1")return;
    const blob=await idbGet(key);if(!blob)return;
    const url=URL.createObjectURL(blob);imageObjectUrls.push(url);img.src=url;img.dataset.loaded="1";
  }));
}
async function previewSelectedImage(input,img){
  const f=input.files?.[0];if(!f)return;img.src=URL.createObjectURL(f)
}

// ---------- Email / notifications ----------
async function dispatchEmail(target,message,event="notification"){
  let to="";
  if(target==="*admin*")to=emailSettings.adminEmail||"";
  else if(target==="*")return;
  else to=target;
  if(!to||!emailSettings.enabled||!emailSettings.webhookUrl)return;
  const payload={to,subject:"HELAA KRK | Sistem Mentor-Mentee Rukaiyah",message,event,createdAt:new Date().toISOString()};
  try{
    const res=await fetch(emailSettings.webhookUrl,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(payload)});
    emailLog.unshift({id:uid(),to,event,status:res.ok?"ok":"fail",detail:`HTTP ${res.status}`,createdAt:new Date().toISOString()});
  }catch(err){emailLog.unshift({id:uid(),to,event,status:"fail",detail:String(err?.message||err),createdAt:new Date().toISOString()})}
  saveAll();renderEmailSettings();
}
function notify(target,message,type="info",event="notification"){
  notifications.unshift({id:uid(),target,message,type,read:false,createdAt:new Date().toISOString()});
  saveAll();renderNotifications();updateNotifCounts();dispatchEmail(target,message,event)
}
function notificationMatchesCurrent(n){
  if(adminMode)return n.target==="*admin*"||n.target==="*"||n.target.toLowerCase?.()===currentEmail.toLowerCase();
  return n.target==="*"||n.target.toLowerCase?.()===currentEmail.toLowerCase();
}
function currentNotifications(){return notifications.filter(notificationMatchesCurrent)}
function toggleNotificationPopover(event){event?.stopPropagation();$("notificationPopover").classList.toggle("open");renderBellPopover()}
document.addEventListener("click",e=>{if(!e.target.closest(".notification-shell"))$("notificationPopover")?.classList.remove("open")});
function renderBellPopover(){
  const list=currentNotifications().slice(0,6);
  $("notificationPopoverList").innerHTML=list.length?list.map(n=>`<div class="popover-item ${n.read?"":"unread"}"><b>${esc(n.message)}</b><span>${fmtDateTime(n.createdAt)}</span></div>`).join(""):'<div class="popover-empty">Tiada notifikasi baharu.</div>'
}
function renderNotifications(){
  const list=currentNotifications();
  $("notificationList").innerHTML=list.length?list.map(n=>`<div class="notification ${n.read?"":"unread"}"><b>${esc(n.message)}</b><div class="meta">${fmtDateTime(n.createdAt)}</div></div>`).join(""):'<div class="empty">Tiada notifikasi.</div>';
  if(adminMode){const a=notifications.filter(n=>n.target==="*admin*");$("adminNotificationList").innerHTML=a.length?a.map(n=>`<div class="notification ${n.read?"":"unread"}"><b>${esc(n.message)}</b><div class="meta">${fmtDateTime(n.createdAt)}</div></div>`).join(""):'<div class="empty">Tiada notifikasi Pentadbir.</div>'}
  renderBellPopover();updateNotifCounts();
}
function markAllNotificationsRead(){notifications.forEach(n=>{if(notificationMatchesCurrent(n))n.read=true});saveAll();renderNotifications()}
function markAllAdminNotificationsRead(){notifications.forEach(n=>{if(n.target==="*admin*")n.read=true});saveAll();renderNotifications()}
function updateNotifCounts(){
  if(!currentEmail)return;
  const c=currentNotifications().filter(n=>!n.read).length;
  $("navNotifCount").innerHTML=c?`<span class="badge info">${c}</span>`:"";
  $("bellNotifCount").textContent=c;$("bellNotifCount").classList.toggle("hidden",!c)
}

// ---------- Login and navigation ----------
function setLoginMode(mode){
  $("mentorLoginTab").classList.toggle("active",mode==="mentor");$("adminLoginTab").classList.toggle("active",mode==="admin");
  $("mentorLoginPane").classList.toggle("active",mode==="mentor");$("adminLoginPane").classList.toggle("active",mode==="admin");
  setTimeout(()=>$(mode==="admin"?"adminEmail":"loginEmail")?.focus(),50)
}
function userDisplay(){const p=profileByEmail(currentEmail);return p?.fullName?`${p.fullName} • ${currentMatric}`:`${currentEmail} • ${currentMatric}`}
function setSession(email,matric,role){
  currentEmail=email.toLowerCase();currentMatric=matric.trim().toUpperCase();currentRole=role;adminMode=role==="admin";
  storageSet(KEYS.sessionEmail,currentEmail);storageSet(KEYS.sessionMatric,currentMatric);storageSet(KEYS.sessionRole,currentRole);
  $("loginOverlay").classList.add("hidden");
  $("adminNavBtn").classList.toggle("hidden",!adminMode);document.querySelectorAll(".admin-only").forEach(el=>el.classList.toggle("hidden",!adminMode));
  refreshIdentity();switchTab(adminMode?"admin":"booking");renderAll();
}
function refreshIdentity(){
  const d=adminMode?`Pentadbir • ${userDisplay()}`:userDisplay();
  $("currentUserLabel").textContent=d;$("sidebarUserLabel").textContent=d;$("heroUserPill").textContent=d;
  if(adminMode)$("adminIdentity").textContent=`${currentEmail} • ${currentMatric}`;
  $("backendStatus").textContent=supabaseClient?"Supabase tersedia":"Mod tempatan";$("backendStatus").classList.toggle("online",!!supabaseClient)
}
function mentorLogin(){const e=$("loginEmail").value.trim().toLowerCase(),m=$("loginMatric").value.trim();if(!/^\S+@\S+\.\S+$/.test(e)){alert("Masukkan alamat e-mel yang sah.");return}if(!m){alert("Masukkan nombor matrik pelajar.");return}setSession(e,m,"mentor")}
function adminLogin(){const e=$("adminEmail").value.trim().toLowerCase(),m=$("adminMatric").value.trim(),c=$("adminPasscode").value.trim();if(!/^\S+@\S+\.\S+$/.test(e)){alert("Masukkan e-mel Pentadbir yang sah.");return}if(!m){alert("Masukkan nombor matrik pelajar.");return}if(!ADMIN_CODES.includes(c)){alert("Passcode Pentadbir tidak tepat.");return}setSession(e,m,"admin")}
function logout(){
  currentEmail="";currentMatric="";currentRole="";adminMode=false;
  storageRemove(KEYS.sessionEmail);storageRemove(KEYS.sessionMatric);storageRemove(KEYS.sessionRole);
  toggleSidebar(false);$("loginOverlay").classList.remove("hidden");$("adminNavBtn").classList.add("hidden");document.querySelectorAll(".admin-only").forEach(el=>el.classList.add("hidden"));
  $("currentUserLabel").textContent="-";$("sidebarUserLabel").textContent="-";$("heroUserPill").textContent="Belum log masuk";setLoginMode("mentor")
}
function toggleSidebar(open){$("sidebar").classList.toggle("open",!!open);$("sidebarBackdrop").classList.toggle("open",!!open)}
function closeModal(id){$(id).classList.remove("open")}
function switchTab(id){
  document.querySelectorAll(".sidebar-nav button[data-tab]").forEach(b=>b.classList.toggle("active",b.dataset.tab===id));
  document.querySelectorAll(".section").forEach(s=>s.classList.toggle("active",s.id===id));toggleSidebar(false);$("notificationPopover")?.classList.remove("open");
  if(id==="booking"){renderDays();renderSlots()}
  if(id==="mybooking")renderMyBookings();
  if(id==="reports")renderMentorReports();
  if(id==="approvedReports")renderApprovedReports();
  if(id==="mentees")renderMentees();
  if(id==="mentorProfile")renderMentorProfile();
  if(id==="mentorDirectory")renderMentorDirectory();
  if(id==="materials")renderMaterials();
  if(id==="notifications")renderNotifications();
  if(id==="admin"&&adminMode)renderAdminAll();
  window.scrollTo({top:0,behavior:"smooth"})
}

document.querySelectorAll(".sidebar-nav button[data-tab]").forEach(b=>b.addEventListener("click",()=>switchTab(b.dataset.tab)));
document.querySelectorAll(".admin-tabs button[data-admin]").forEach(b=>b.addEventListener("click",()=>switchAdminPane(b.dataset.admin)));
function switchAdminPane(id){document.querySelectorAll(".admin-tabs button").forEach(b=>b.classList.toggle("active",b.dataset.admin===id));document.querySelectorAll(".admin-pane").forEach(p=>p.classList.toggle("active",p.id===id));if(id==="adminDashboard")renderAdminDashboard();if(id==="adminMentees")renderAdminMentees();if(id==="adminMaterials")renderMaterials();if(id==="adminSchedule")renderAdminSchedule();if(id==="adminReports")renderAdminReports();if(id==="bookings")renderAdminBookings()}

// ---------- Student helpers ----------
function studentsInGroup(group){return students.filter(s=>s.group===group)}
function bookingStudentId(b){return b.assignedStudentId||b.requestedStudentId||""}
function bookingStudentName(b){const s=studentById(bookingStudentId(b));return s?.name||b.assignedStudent||b.requestedStudentName||b.requestedStudent||"-"}
function availableStudents(slot,excludeBookingId=""){
  if(slot.mode==="pksk")return approvedForSlot(slot.id).filter(b=>b.id!==excludeBookingId).length?[]:[{id:"pksk-pair",name:"Ariana + Fathemah",group:"Tahun 6"}];
  const finals=approvedForSlot(slot.id).filter(b=>b.id!==excludeBookingId);
  const takenIds=new Set(finals.map(bookingStudentId).filter(Boolean));
  const takenNames=new Set(finals.map(bookingStudentName));
  return studentsInGroup(slot.group).filter(s=>!takenIds.has(s.id)&&!takenNames.has(s.name))
}

// ---------- Schedule / booking ----------
function renderDays(){
  const dates=[...new Set(SCHEDULE.map(s=>s.date))];
  $("dayButtons").innerHTML=dates.map(d=>{const s=SCHEDULE.find(x=>x.date===d);return `<button class="day-btn ${d===selectedDate?"active":""}" onclick="selectDate('${d}')"><strong>${esc(s.day)}</strong><span>${fmtDate(d)}</span></button>`}).join("")
}
function selectDate(d){selectedDate=d;renderDays();renderSlots()}
function renderSlots(){
  const slots=SCHEDULE.filter(s=>s.date===selectedDate),first=slots[0];if(!first)return;
  $("selectedDayTitle").textContent=`${first.day}, ${fmtDate(selectedDate)}`;$("selectedDayHint").textContent=`${slots.length} pilihan kelas`;
  $("slotGrid").innerHTML=slots.map(s=>{
    const avail=availableStudents(s),full=!avail.length,capacity=s.mode==="pksk"?1:studentsInGroup(s.group).length,approved=Math.min(capacity,approvedForSlot(s.id).length),pending=bookings.filter(b=>b.slotId===s.id&&b.status==="pending").length;
    return `<article class="slot ${full?"full":"available"} ${s.mode==="pksk"?"pksk":""}"><div class="slot-head"><div><div class="time">${esc(s.time)}</div><div class="subject">${esc(s.subject)}</div><div class="group">${esc(s.group)}${s.mode==="pksk"?" • 2 mentee, 1 mentor tambahan":""}</div></div><span class="badge ${full?"full":"ok"}">${full?"PENUH":"TERSEDIA"}</span></div>${s.topic?`<div class="topic"><b>Topik:</b> ${esc(s.topic)}</div>`:""}<div class="slot-footer"><small>${s.mode==="pksk"?(full?"1/1 mentor tambahan diluluskan":"1 mentor tambahan diperlukan"):`${approved}/${capacity} mentee telah diisi`}${pending?` • ${pending} menunggu`:""}</small><button class="primary" ${full?"disabled":""} onclick="openBooking('${s.id}')">${full?"Slot Penuh":"Tempah"}</button></div></article>`
  }).join("")
}
function openBooking(id){
  if(!currentEmail||adminMode){alert("Sila log masuk sebagai Mentor.");return}
  const s=slotById(id),avail=availableStudents(s);if(!avail.length){alert("Slot ini telah penuh.");return}
  $("slotId").value=s.id;
  $("mentorEmail").value=currentEmail;
  $("mentorMatric").value=currentMatric;
  $("mentorName").value=profileByEmail(currentEmail)?.fullName||"";
  $("mentorName").focus();
  $("bookingSummary").innerHTML=`<b>${s.day}, ${fmtDate(s.date)}</b><br>${esc(s.time)}<br><b>${esc(s.subject)}</b> • ${esc(s.group)}${s.topic?`<br>Topik: ${esc(s.topic)}`:""}`;
  if(s.mode==="pksk"){$("studentSelect").innerHTML=`<option value="pksk-pair">Ariana + Fathemah (kelas bersama)</option>`;$("studentSelect").disabled=true;$("studentHelp").textContent="PKSK dikendalikan oleh Felo Yamin. Tempahan ini untuk 1 mentor tambahan sahaja."}
  else{$("studentSelect").disabled=false;$("studentSelect").innerHTML=`<option value="">-- Pilih mentee --</option>${avail.map(st=>`<option value="${st.id}">${esc(st.name)}</option>`).join("")}`;$("studentHelp").textContent=`${avail.length} mentee masih tersedia untuk slot ini.`}
  $("bookingNote").value="";document.querySelector('input[name="reassignConsent"][value="yes"]').checked=true;$("bookingModal").classList.add("open")
}
function submitBooking(){
  const sid=$("slotId").value,s=slotById(sid),name=$("mentorName").value.trim(),studentId=$("studentSelect").value,consent=document.querySelector('input[name="reassignConsent"]:checked')?.value||"no";
  if(!name){alert("Sila tulis NAMA PENUH mentor sebelum menghantar tempahan.");$("mentorName").focus();return}
  if(name.length<3){alert("Nama penuh mentor terlalu pendek. Sila semak semula.");$("mentorName").focus();return}
  if(!currentMatric){alert("Nombor matrik tidak ditemui. Sila log keluar dan log masuk semula.");return}
  if(!studentId){alert("Pilih mentee.");return}
  const avail=availableStudents(s);if(!avail.some(x=>x.id===studentId)){alert("Mentee / slot ini tidak lagi tersedia. Sila pilih semula.");closeModal("bookingModal");renderSlots();return}
  const st=studentId==="pksk-pair"?{id:"pksk-pair",name:"Ariana + Fathemah"}:studentById(studentId);
  const dup=bookings.some(b=>b.slotId===sid&&b.email?.toLowerCase()===currentEmail&&!["rejected","reverted"].includes(b.status));if(dup){alert("Anda telah mempunyai permohonan untuk slot ini.");return}
  const rec={id:uid(),ticket:makeTicket(),slotId:sid,email:currentEmail,mentorMatric:currentMatric,mentorName:name,requestedStudentId:st.id,requestedStudentName:st.name,requestedStudent:st.name,assignedStudentId:"",assignedStudent:"",consent,mentorNote:$("bookingNote").value.trim(),status:"pending",createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
  bookings.unshift(rec);saveAll();closeModal("bookingModal");notify("*admin*",`Tempahan baharu ${rec.ticket}: ${name} (${currentMatric}) memohon ${st.name} untuk ${s.subject} ${s.group}.`,"info","booking_submitted");renderAll();speakThanks();alert("Tempahan dihantar kepada Pentadbir untuk kelulusan.")
}
function renderMyBookings(){
  const list=bookings.filter(b=>b.email?.toLowerCase()===currentEmail.toLowerCase()).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  $("myBookingList").innerHTML=list.length?list.map(b=>{const s=slotById(b.slotId),r=reports.find(x=>x.bookingId===b.id);return `<div class="card"><div class="card-top"><div><h4>${esc(s?.subject||"Slot")}</h4><div class="meta">${s?`${s.day}, ${fmtDate(s.date)} • ${esc(s.time)} • ${esc(s.group)}`:""}</div></div>${badge(b.status)}</div><div class="kv"><b>No. Tempahan</b><span class="ticket">${esc(b.ticket)}</span><b>Nombor Matrik</b><span>${esc(b.mentorMatric||currentMatric)}</span><b>Mentee Diminta</b><span>${esc(b.requestedStudentName||b.requestedStudent||"-")}</span><b>Mentee Ditugaskan</b><span>${esc(bookingStudentName(b))}</span><b>Persetujuan Tukar</b><span>${b.consent==="yes"?"Ya":"Tidak"}</span></div>${isFinalStatus(b)?`<div class="actions"><button class="secondary" onclick="switchTab('reports')">${r?"Lihat / Edit Laporan":"Sediakan Laporan"}</button></div>`:""}</div>`}).join(""):'<div class="empty">Belum ada tempahan dibuat.</div>'
}

// ---------- Admin booking ----------
function renderAdminBookings(){
  if(!adminMode)return;
  const filter=$("statusFilter").value,q=$("adminSearch").value.trim().toLowerCase();
  const list=bookings.filter(b=>(filter==="all"||b.status===filter)&&(!q||[b.mentorName,b.email,b.mentorMatric,b.requestedStudentName,b.requestedStudent,bookingStudentName(b),b.ticket].some(x=>String(x||"").toLowerCase().includes(q))));
  $("adminBookingList").innerHTML=list.length?list.map(b=>{const s=slotById(b.slotId);return `<div class="card"><div class="card-top"><div><h4>${esc(b.mentorName)} • <span class="ticket">${esc(b.ticket)}</span></h4><div class="meta">${esc(b.email)} • Matrik: <b>${esc(b.mentorMatric||"-")}</b><br>${s?`${s.day}, ${fmtDate(s.date)} • ${esc(s.time)} • ${esc(s.subject)} • ${esc(s.group)}`:""}</div></div>${badge(b.status)}</div><div class="kv"><b>Mentee diminta</b><span>${esc(b.requestedStudentName||b.requestedStudent||"-")}</span><b>Mentee ditugaskan</b><span>${esc(bookingStudentName(b))}</span><b>Benar pengaturan lain</b><span>${b.consent==="yes"?"Ya":"Tidak"}</span><b>Catatan mentor</b><span>${esc(b.mentorNote||"-")}</span></div><div class="actions">${b.status==="pending"?`<button class="primary" onclick="approveBooking('${b.id}')">Luluskan</button><button class="secondary" onclick="openReassign('${b.id}')" ${b.consent!=="yes"?"disabled":""}>Atur Mentee Lain</button><button class="danger" onclick="rejectBooking('${b.id}')">Tidak Lulus</button>`:""}${isFinalStatus(b)?`<button class="secondary" onclick="openReassign('${b.id}')" ${b.consent!=="yes"?"disabled":""}>Tukar Mentee</button><button class="danger" onclick="revertBooking('${b.id}')">Buka Semula</button>`:""}${["rejected","reverted"].includes(b.status)?`<button class="secondary" onclick="restorePending('${b.id}')">Kembalikan ke Menunggu</button>`:""}</div></div>`}).join(""):'<div class="empty">Tiada tempahan dalam kategori ini.</div>';
  updateStats()
}
function approveBooking(id){
  const b=bookings.find(x=>x.id===id),s=slotById(b.slotId);if(!b||!s)return;
  const avail=availableStudents(s,id);if(!avail.some(x=>x.id===(b.requestedStudentId||"pksk-pair"))){alert("Mentee pilihan tidak lagi tersedia. Gunakan fungsi Atur Mentee Lain.");return}
  b.assignedStudentId=b.requestedStudentId;b.assignedStudent=b.requestedStudentName||b.requestedStudent;b.status="approved";b.updatedAt=new Date().toISOString();saveAll();notify(b.email,`Tempahan ${b.ticket} telah DILULUSKAN. Mentee: ${bookingStudentName(b)}.`,"success","booking_approved");renderAll()
}
function openReassign(id){
  const b=bookings.find(x=>x.id===id),s=slotById(b.slotId);if(!b||!s)return;if(b.consent!=="yes"){alert("Mentor tidak bersetuju untuk diaturkan mentee lain.");return}
  const avail=availableStudents(s,id);if(!avail.length){alert("Tiada mentee lain tersedia untuk slot ini.");return}
  activeReassignId=id;$("reassignSummary").innerHTML=`<b>${esc(b.mentorName)}</b> • ${esc(b.mentorMatric||"-")}<br>${s.day}, ${fmtDate(s.date)} • ${esc(s.subject)} • ${esc(s.group)}<br>Pilihan asal: <b>${esc(b.requestedStudentName||b.requestedStudent||"-")}</b>`;
  $("reassignStudent").innerHTML=avail.map(st=>`<option value="${st.id}">${esc(st.name)}</option>`).join("");$("reassignNote").value="";$("reassignModal").classList.add("open")
}
function confirmReassign(){
  const b=bookings.find(x=>x.id===activeReassignId),s=slotById(b?.slotId),sid=$("reassignStudent").value,st=sid==="pksk-pair"?{id:sid,name:"Ariana + Fathemah"}:studentById(sid);if(!b||!s||!st)return;
  if(!availableStudents(s,b.id).some(x=>x.id===sid)){alert("Mentee ini tidak lagi tersedia.");return}
  b.assignedStudentId=st.id;b.assignedStudent=st.name;b.status="reassigned";b.adminNote=$("reassignNote").value.trim();b.updatedAt=new Date().toISOString();saveAll();closeModal("reassignModal");notify(b.email,`Tempahan ${b.ticket} telah diluluskan dengan pengaturan mentee: ${st.name}.${b.adminNote?` Catatan: ${b.adminNote}`:""}`,"success","booking_reassigned");renderAll()
}
function rejectBooking(id){const b=bookings.find(x=>x.id===id);const n=prompt("Sebab tempahan tidak diluluskan:","");if(!b||n===null)return;b.status="rejected";b.adminNote=n;b.assignedStudentId="";b.assignedStudent="";b.updatedAt=new Date().toISOString();saveAll();notify(b.email,`Tempahan ${b.ticket} tidak diluluskan.${n?` Catatan: ${n}`:""}`,"warn","booking_rejected");renderAll()}
function revertBooking(id){const b=bookings.find(x=>x.id===id);if(!b||!confirm("Buka semula tempahan ini? Mentee akan tersedia kepada mentor lain."))return;b.status="reverted";b.assignedStudentId="";b.assignedStudent="";b.updatedAt=new Date().toISOString();saveAll();notify(b.email,`Kelulusan tempahan ${b.ticket} telah dibuka semula oleh Pentadbir.`,"warn","booking_reverted");renderAll()}
function restorePending(id){const b=bookings.find(x=>x.id===id);if(!b)return;b.status="pending";b.updatedAt=new Date().toISOString();saveAll();notify(b.email,`Tempahan ${b.ticket} dikembalikan ke status Menunggu Semakan.`,"info","booking_pending");renderAll()}

// ---------- Mentor profile ----------
function buildProfileCheckboxes(){
  $("subjectCheckboxes").innerHTML=SUBJECT_OPTIONS.map(s=>`<label><input type="checkbox" name="mentorSubject" value="${esc(s)}" onchange="toggleOtherSubject()" /> ${esc(s)}</label>`).join("");
  $("levelCheckboxes").innerHTML=LEVEL_OPTIONS.map(s=>`<label><input type="checkbox" name="mentorLevel" value="${esc(s)}" /> ${esc(s)}</label>`).join("")
}
function toggleOtherSubject(){const checked=[...document.querySelectorAll('input[name="mentorSubject"]:checked')].some(x=>x.value==="Lain-lain");$("otherSubjectWrap").classList.toggle("hidden",!checked)}
function updateAboutWordCount(){const n=wordCount($("mentorProfileAbout").value);$("aboutWordCount").textContent=n;$("aboutWordCount").parentElement.classList.toggle("over",n>50)}
function renderMentorProfile(){
  const p=profileByEmail(currentEmail);$("mentorProfileName").value=p?.fullName||"";$("mentorProfileMatric").value=p?.matric||currentMatric;$("mentorProfileFaculty").value=p?.faculty||"";$("mentorProfileCourse").value=p?.course||"";$("mentorProfilePhone").value=p?.phone||"";$("mentorProfileStrength").value=p?.strength||"";$("mentorProfileAbout").value=p?.about||"";$("otherSubjectText").value=p?.otherSubject||"";
  document.querySelectorAll('input[name="mentorSubject"]').forEach(cb=>cb.checked=(p?.subjects||[]).includes(cb.value));document.querySelectorAll('input[name="mentorLevel"]').forEach(cb=>cb.checked=(p?.levels||[]).includes(cb.value));toggleOtherSubject();updateAboutWordCount();
  const img=$("mentorProfilePhotoPreview");img.removeAttribute("src");img.dataset.loaded="0";if(p?.photoKey)img.dataset.fileKey=p.photoKey;else delete img.dataset.fileKey;hydrateStoredImages($("mentorProfile"))
}
async function saveMentorProfile(){
  if(!currentEmail){alert("Sila log masuk.");return}
  const fullName=$("mentorProfileName").value.trim(),matric=$("mentorProfileMatric").value.trim().toUpperCase(),faculty=$("mentorProfileFaculty").value.trim(),course=$("mentorProfileCourse").value.trim(),about=$("mentorProfileAbout").value.trim();
  const subjects=[...document.querySelectorAll('input[name="mentorSubject"]:checked')].map(x=>x.value),levels=[...document.querySelectorAll('input[name="mentorLevel"]:checked')].map(x=>x.value);
  if(!fullName||!matric||!faculty||!course||!about){alert("Lengkapkan semua ruangan wajib.");return}if(wordCount(about)>50){alert("Penerangan diri mestilah maksimum 50 patah perkataan.");return}if(!subjects.length||!levels.length){alert("Pilih sekurang-kurangnya satu subjek dan satu tahap yang yakin untuk diajar.");return}
  let p=profileByEmail(currentEmail);if(!p){p={id:uid(),email:currentEmail,photoKey:""};mentorProfiles.push(p)}
  const photo=$("mentorProfilePhoto").files?.[0];if(photo){const key=`mentor-photo-${uid()}`;await idbPut(key,photo);p.photoKey=key}
  Object.assign(p,{fullName,matric,faculty,course,phone:$("mentorProfilePhone").value.trim(),strength:$("mentorProfileStrength").value.trim(),about,subjects,otherSubject:$("otherSubjectText").value.trim(),levels,updatedAt:new Date().toISOString()});
  currentMatric=matric;storageSet(KEYS.sessionMatric,currentMatric);bookings.filter(b=>b.email?.toLowerCase()===currentEmail).forEach(b=>{b.mentorName=fullName;b.mentorMatric=matric});saveAll();refreshIdentity();renderMentorProfile();renderMentorDirectory();notify("*admin*",`Profil mentor dikemas kini: ${fullName} (${matric}).`,"info","mentor_profile_updated");speakThanks();alert("Profil Mentor berjaya disimpan.")
}
function renderMentorDirectory(){
  const finals=bookings.filter(isFinalStatus),emails=[...new Set(finals.map(b=>b.email?.toLowerCase()).filter(Boolean))];
  const cards=emails.map(email=>{const p=profileByEmail(email),bs=finals.filter(b=>b.email?.toLowerCase()===email),fallback=bs[0];return {email,p,bs,name:p?.fullName||fallback?.mentorName||email,matric:p?.matric||fallback?.mentorMatric||"-"}});
  $("mentorDirectoryList").innerHTML=cards.length?cards.map(x=>`<article class="mentor-card"><div class="mentor-card-top"><img class="profile-photo" ${x.p?.photoKey?`data-file-key="${esc(x.p.photoKey)}"`:""} alt="Gambar mentor"><div><h4>${esc(x.name)}</h4><div class="matric">${esc(x.matric)}</div><div class="meta">${esc(x.p?.faculty||"Fakulti belum dilengkapkan")}<br>${esc(x.p?.course||"")}</div></div></div>${x.p?.about?`<p>${esc(x.p.about)}</p>`:""}<div class="tag-list">${(x.p?.subjects||[]).slice(0,6).map(t=>`<span class="tag">${esc(t)}</span>`).join("")}</div><div class="service-count">${x.bs.length} sesi / tugasan mentor direkodkan</div></article>`).join(""):'<div class="empty">Belum ada mentor dengan tempahan yang diluluskan.</div>';
  hydrateStoredImages($("mentorDirectory"))
}

// ---------- Mentee profiles ----------
function menteeCard(st,admin=false){return `<article class="mentee-card"><img class="profile-photo" ${st.photoKey?`data-file-key="${esc(st.photoKey)}"`:""} alt="${esc(st.name)}"><h4>${esc(st.name)}</h4><div class="meta">${esc(st.group)}</div><p>${esc(st.summary||"Maklumat ringkas belum ditambah oleh Pentadbir.")}</p>${admin?`<div class="actions"><button class="secondary" onclick="openMenteeEdit('${st.id}')">Edit Profil</button></div>`:""}</article>`}
function renderMentees(){
  $("menteeDirectory").innerHTML=GROUP_ORDER.map(g=>{const list=studentsInGroup(g);return `<section class="directory-group"><h3>${esc(g)} <span class="directory-group-count">${list.length}</span></h3><div class="mentee-grid">${list.map(s=>menteeCard(s,false)).join("")}</div></section>`}).join("");hydrateStoredImages($("menteeDirectory"))
}
function renderAdminMentees(){
  if(!adminMode)return;$("adminMenteeList").innerHTML=GROUP_ORDER.map(g=>{const list=studentsInGroup(g);return `<section class="directory-group"><h3>${esc(g)} <span class="directory-group-count">${list.length}</span></h3><div class="mentee-grid">${list.map(s=>menteeCard(s,true)).join("")}</div></section>`}).join("");hydrateStoredImages($("adminMenteeList"))
}
function openMenteeEdit(id){if(!adminMode)return;const s=studentById(id);if(!s)return;$("menteeEditId").value=id;$("menteeEditName").value=s.name;$("menteeEditSummary").value=s.summary||"";$("menteeEditPhoto").value="";const img=$("menteeEditPhotoPreview");img.removeAttribute("src");img.dataset.loaded="0";if(s.photoKey)img.dataset.fileKey=s.photoKey;else delete img.dataset.fileKey;$("menteeEditModal").classList.add("open");hydrateStoredImages($("menteeEditModal"))}
async function saveMenteeProfile(){if(!adminMode)return;const s=studentById($("menteeEditId").value);if(!s)return;const name=$("menteeEditName").value.trim();if(!name){alert("Nama mentee diperlukan.");return}const f=$("menteeEditPhoto").files?.[0];if(f){const key=`mentee-photo-${uid()}`;await idbPut(key,f);s.photoKey=key}s.name=name;s.summary=$("menteeEditSummary").value.trim();s.updatedAt=new Date().toISOString();saveAll();closeModal("menteeEditModal");renderMentees();renderAdminMentees();notify("*",`Profil mentee ${name} telah dikemas kini.`,"info","mentee_profile_updated");speakThanks()}

// ---------- Reports ----------
function renderRatingQuestions(){
  $("ratingQuestions").innerHTML=RATING_LABELS.map((q,i)=>`<div class="rating-label">${i+1}. ${esc(q)}</div><div class="stars">${[1,2,3,4,5].map(v=>`<button type="button" class="star ${reportRatings[i]>=v?"on":""}" onclick="setRating(${i},${v})">★</button>`).join("")}</div>`).join("")
}
function setRating(i,v){reportRatings[i]=v;renderRatingQuestions()}
function renderMentorReports(){
  const eligible=bookings.filter(b=>b.email?.toLowerCase()===currentEmail.toLowerCase()&&isFinalStatus(b)).sort((a,b)=>slotById(a.slotId)?.date.localeCompare(slotById(b.slotId)?.date||"")||0);
  $("mentorReportList").innerHTML=eligible.length?eligible.map(b=>{const s=slotById(b.slotId),r=reports.find(x=>x.bookingId===b.id);return `<div class="card"><div class="card-top"><div><h4>${esc(s?.subject||"Sesi")}</h4><div class="meta">${s?`${s.day}, ${fmtDate(s.date)} • ${esc(s.time)} • ${esc(s.group)}`:""}<br>Mentee: <b>${esc(bookingStudentName(b))}</b></div></div>${r?badge(r.status):'<span class="badge info">Belum Dihantar</span>'}</div>${r?.adminNote?`<div class="notice warn"><b>Catatan Pentadbir:</b> ${esc(r.adminNote)}</div>`:""}<div class="actions"><button class="primary" onclick="openReport('${b.id}')">${r?"Lihat / Edit Laporan":"Sediakan Laporan"}</button>${r?.status==="approved"?`<span class="meta">Jika diedit, laporan perlu disemak semula.</span>`:""}</div></div>`}).join(""):'<div class="empty">Belum ada sesi yang diluluskan untuk laporan.</div>'
}
function openReport(bookingId){
  const b=bookings.find(x=>x.id===bookingId),s=slotById(b?.slotId);if(!b||!s)return;
  const r=reports.find(x=>x.bookingId===bookingId);activeReportId=r?.id||null;reportWorkingAttachments=[...(r?.attachments||[])];reportRatings=r?.ratings?.length===5?[...r.ratings]:[0,0,0,0,0];
  $("reportBookingId").value=bookingId;$("reportModalTitle").textContent=r?"Edit Laporan Mentor":"Laporan Mentor";$("reportSessionSummary").innerHTML=`<b>${s.day}, ${fmtDate(s.date)}</b> • ${esc(s.time)}<br><b>${esc(s.subject)}</b> • ${esc(s.group)} • Mentee: <b>${esc(bookingStudentName(b))}</b><br>Mentor: ${esc(b.mentorName)} (${esc(b.mentorMatric||currentMatric)})`;
  $("reportTaught").value=r?.taught||"";$("reportProgress").value=r?.progress||"";$("reportReaction").value=r?.reaction||"";$("reportAttention").value=r?.attention||"";$("reportNext").value=r?.next||"";$("reportFiles").value="";
  $("reportAdminFeedback").classList.toggle("hidden",!r?.adminNote);$("reportAdminFeedback").innerHTML=r?.adminNote?`<b>Catatan Pentadbir:</b> ${esc(r.adminNote)}`:"";renderRatingQuestions();renderExistingReportAttachments();$("reportModal").classList.add("open")
}
function renderExistingReportAttachments(){
  const el=$("existingReportAttachments");if(!reportWorkingAttachments.length){el.innerHTML="";return}
  el.innerHTML=`<label>Lampiran sedia ada</label><div class="attachment-grid">${reportWorkingAttachments.map(a=>`<div class="attachment-tile">${isImageType(a.type,a.name)?`<img data-file-key="${esc(a.key)}" alt="Lampiran">`:`<div class="attachment-file">${esc(a.name)}</div>`}<div class="attachment-name">${esc(a.name)}</div><button class="attachment-remove" type="button" onclick="removeReportWorkingAttachment('${a.key}')">×</button></div>`).join("")}</div>`;hydrateStoredImages(el)
}
function removeReportWorkingAttachment(key){reportWorkingAttachments=reportWorkingAttachments.filter(a=>a.key!==key);renderExistingReportAttachments()}
async function saveReport(){
  const bookingId=$("reportBookingId").value,b=bookings.find(x=>x.id===bookingId);if(!b)return;
  const fields={taught:$("reportTaught").value.trim(),progress:$("reportProgress").value.trim(),reaction:$("reportReaction").value.trim(),attention:$("reportAttention").value.trim(),next:$("reportNext").value.trim()};if(!fields.taught||!fields.progress||!fields.reaction||!fields.attention){alert("Lengkapkan soalan 1 hingga 4.");return}if(reportRatings.some(v=>v<1)){alert("Lengkapkan semua lima penilaian bintang.");return}
  const newFiles=[...$("reportFiles").files];for(const f of newFiles){const key=`report-${uid()}`;await idbPut(key,f);reportWorkingAttachments.push({key,name:f.name,type:f.type||"application/octet-stream"})}
  if(!reportWorkingAttachments.some(a=>isImageType(a.type,a.name))){alert("Sekurang-kurangnya satu gambar aktiviti diperlukan.");return}
  let r=reports.find(x=>x.bookingId===bookingId),wasApproved=r?.status==="approved";if(!r){r={id:uid(),bookingId,createdAt:new Date().toISOString()};reports.unshift(r)}
  Object.assign(r,fields,{ratings:[...reportRatings],attachments:[...reportWorkingAttachments],status:"pending",adminNote:"",updatedAt:new Date().toISOString()});saveAll();closeModal("reportModal");notify("*admin*",`${wasApproved?"Laporan yang telah diluluskan diedit dan dihantar semula":"Laporan dihantar"} oleh ${b.mentorName} (${b.mentorMatric||"-"}) untuk ${b.ticket}.`,"info","report_submitted");renderAll();speakThanks();alert(wasApproved?"Laporan telah diedit. Status kembali kepada Menunggu Semakan.":"Laporan dihantar untuk semakan Pentadbir.")
}
function reportAttachmentMarkup(r,editable=false){
  const atts=r.attachments||[];return atts.length?`<div class="attachment-grid">${atts.map(a=>`<div class="attachment-tile">${isImageType(a.type,a.name)?`<img data-file-key="${esc(a.key)}" alt="Lampiran laporan">`:`<div class="attachment-file">${esc(a.name)}</div>`}<div class="attachment-name">${esc(a.name)}</div><div class="actions"><button class="ghost" onclick="openStoredFile('${a.key}','${esc(a.name)}')">Buka</button></div></div>`).join("")}</div>`:'<div class="meta">Tiada lampiran.</div>'
}
function renderAdminReports(){
  if(!adminMode)return;const filter=$("reportStatusFilter").value,list=reports.filter(r=>filter==="all"||r.status===filter);
  $("adminReportList").innerHTML=list.length?list.map(r=>{const b=bookings.find(x=>x.id===r.bookingId),s=slotById(b?.slotId);if(!b)return"";return `<div class="card"><div class="card-top"><div><h4>${esc(b.mentorName)} • ${esc(bookingStudentName(b))}</h4><div class="meta">${esc(b.mentorMatric||"-")} • ${esc(b.email)}<br>${s?`${s.day}, ${fmtDate(s.date)} • ${esc(s.subject)} • ${esc(s.group)}`:""}</div></div>${badge(r.status)}</div><div class="kv"><b>Apa diajar</b><span>${esc(r.taught)}</span><b>Progress</b><span>${esc(r.progress)}</span><b>Reaksi mentee</b><span>${esc(r.reaction)}</span><b>Perlu perhatian</b><span>${esc(r.attention)}</span><b>Cadangan</b><span>${esc(r.next||"-")}</span><b>Penilaian</b><span>${(r.ratings||[]).map((x,i)=>`${i+1}: ${x}/5`).join(" • ")}</span></div><div class="attachment-summary"><b>Lampiran (${(r.attachments||[]).length})</b>${reportAttachmentMarkup(r)}</div><div class="actions">${r.status!=="approved"?`<button class="primary" onclick="approveReport('${r.id}')">Luluskan</button>`:""}<button class="secondary" onclick="returnReport('${r.id}')">Pulangkan untuk Pembetulan</button><button class="danger" onclick="rejectReport('${r.id}')">Tidak Lulus</button></div>${r.adminNote?`<div class="notice info"><b>Catatan Pentadbir:</b> ${esc(r.adminNote)}</div>`:""}</div>`}).join(""):'<div class="empty">Tiada laporan dalam kategori ini.</div>';hydrateStoredImages($("adminReportList"));updateStats()
}
function approveReport(id){const r=reports.find(x=>x.id===id),b=bookings.find(x=>x.id===r?.bookingId);if(!r||!b)return;r.status="approved";r.adminNote="";r.updatedAt=new Date().toISOString();saveAll();notify(b.email,`Laporan bagi ${b.ticket} telah DILULUSKAN dan kini dipaparkan dalam Galeri Laporan Aktiviti.`,"success","report_approved");renderAll()}
function returnReport(id){const r=reports.find(x=>x.id===id),b=bookings.find(x=>x.id===r?.bookingId),n=prompt("Nyatakan pembetulan yang diperlukan:","");if(!r||!b||!n)return;r.status="returned";r.adminNote=n;r.updatedAt=new Date().toISOString();saveAll();notify(b.email,`Laporan bagi ${b.ticket} dipulangkan untuk pembetulan. Catatan: ${n}`,"warn","report_returned");renderAll()}
function rejectReport(id){const r=reports.find(x=>x.id===id),b=bookings.find(x=>x.id===r?.bookingId),n=prompt("Sebab laporan tidak diluluskan:","");if(!r||!b||!n)return;r.status="rejected";r.adminNote=n;r.updatedAt=new Date().toISOString();saveAll();notify(b.email,`Laporan bagi ${b.ticket} tidak diluluskan. Catatan: ${n}`,"warn","report_rejected");renderAll()}
function renderApprovedReports(){
  const list=reports.filter(r=>r.status==="approved").sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt));
  $("approvedReportGallery").innerHTML=list.length?list.map(r=>{const b=bookings.find(x=>x.id===r.bookingId),s=slotById(b?.slotId),images=(r.attachments||[]).filter(a=>isImageType(a.type,a.name)),avg=(r.ratings||[]).length?((r.ratings.reduce((a,c)=>a+c,0))/r.ratings.length).toFixed(1):"-";if(!b)return"";return `<article class="report-story"><div class="report-cover">${images[0]?`<img data-file-key="${esc(images[0].key)}" alt="Aktiviti ${esc(bookingStudentName(b))}">`:`<span>Tiada gambar utama</span>`}</div><div class="report-body"><span class="approved-chip">LAPORAN DILULUSKAN</span><h3>${esc(bookingStudentName(b))}</h3><div class="meta">${s?`${s.day}, ${fmtDate(s.date)} • ${esc(s.subject)} • ${esc(s.group)}`:""}<br>Mentor: ${esc(b.mentorName)} • ${esc(b.mentorMatric||"-")}</div><div class="report-snippet"><b>Apa diajar:</b> ${esc(r.taught)}<br><b>Progress:</b> ${esc(r.progress)}</div><div class="rating-summary">★★★★★ <span>${avg}/5</span></div>${images.length>1?`<div class="report-thumbs">${images.slice(1,6).map(a=>`<img data-file-key="${esc(a.key)}" alt="Gambar aktiviti">`).join("")}</div>`:""}</div></article>`}).join(""):'<div class="empty">Belum ada laporan yang diluluskan.</div>';hydrateStoredImages($("approvedReportGallery"))
}

// ---------- Teaching materials ----------
function fillMaterialSlots(){if(!$("materialSlot"))return;$("materialSlot").innerHTML=SCHEDULE.map(s=>`<option value="${s.id}">${s.day} ${fmtDate(s.date)} | ${s.time} | ${s.subject} | ${s.group}${s.topic?" | "+s.topic:""}</option>`).join("")}
function materialFilesNormalized(m,kind){if(!m)return[];if(kind==="material")return Array.isArray(m.materialFiles)?m.materialFiles:(m.materialKey?[{key:m.materialKey,name:m.materialName||"Bahan",type:""}]:[]);if(kind==="scheme")return Array.isArray(m.schemeFiles)?m.schemeFiles:(m.schemeKey?[{key:m.schemeKey,name:m.schemeName||"Skema",type:""}]:[]);if(kind==="note")return Array.isArray(m.noteFiles)?m.noteFiles:[];return[]}
async function saveMaterialSet(){
  if(!adminMode){alert("Akses Pentadbir diperlukan.");return}
  const sid=$("materialSlot").value,old=materialEditId?materials.find(m=>m.id===materialEditId):materials.find(m=>m.slotId===sid),mfs=[...$("materialFiles").files],sfs=[...$("schemeFiles").files],nfs=[...$("noteFiles").files];
  let materialArr=materialFilesNormalized(old,"material"),schemeArr=materialFilesNormalized(old,"scheme"),noteArr=materialFilesNormalized(old,"note");
  if(!mfs.length&&!materialArr.length&&!sfs.length&&!schemeArr.length&&!nfs.length&&!noteArr.length&&!$("materialNote").value.trim()){alert("Masukkan nota atau pilih sekurang-kurangnya satu fail.");return}
  for(const f of mfs){const key=`material-${uid()}`;await idbPut(key,f);materialArr.push({key,name:f.name,type:f.type||"application/octet-stream"})}
  for(const f of sfs){const key=`scheme-${uid()}`;await idbPut(key,f);schemeArr.push({key,name:f.name,type:f.type||"application/octet-stream"})}
  for(const f of nfs){const key=`note-${uid()}`;await idbPut(key,f);noteArr.push({key,name:f.name,type:f.type||"application/octet-stream"})}
  const rec={id:old?.id||uid(),slotId:sid,title:$("materialTitle").value.trim(),materialFiles:materialArr,schemeFiles:schemeArr,noteFiles:noteArr,note:$("materialNote").value.trim(),updatedAt:new Date().toISOString()};
  if(old)materials[materials.indexOf(old)]=rec;else materials.push(rec);saveAll();const sl=slotById(sid);notify("*",`Bahan mengajar dikemas kini untuk ${sl.day}, ${fmtDate(sl.date)} • ${sl.subject} (${sl.group}).`,"info","material_updated");cancelMaterialEdit();renderAll();speakThanks();alert("Bahan, nota dan skema berjaya disimpan / dikemas kini.")
}
function fileRows(arr,materialId="",kind="",admin=false){return arr.length?`<div class="file-list">${arr.map(f=>`<div class="file-row"><span class="file-name">${esc(f.name)}</span><div class="actions"><button class="ghost" onclick="openStoredFile('${f.key}','${esc(f.name)}')">Buka</button>${admin?`<button class="material-remove" onclick="removeMaterialFile('${materialId}','${kind}','${f.key}')">Buang</button>`:""}</div></div>`).join("")}</div>`:'<div class="meta">Belum ada fail.</div>'}
function materialCard(m,admin=false){const sl=slotById(m.slotId),ma=materialFilesNormalized(m,"material"),sa=materialFilesNormalized(m,"scheme"),na=materialFilesNormalized(m,"note");return `<div class="card"><div class="card-top"><div><h4>${esc(m.title||sl?.subject||"Bahan")}</h4><div class="meta">${sl?`${sl.day}, ${fmtDate(sl.date)} • ${esc(sl.time)} • ${esc(sl.subject)} • ${esc(sl.group)}${sl.topic?` • Topik: ${esc(sl.topic)}`:""}`:""}</div></div></div><div class="material-grid" style="margin-top:11px"><div class="material-box"><h5>Bahan Mengajar (${ma.length})</h5>${fileRows(ma,m.id,"material",admin)}</div><div class="material-box"><h5>Skema Jawapan (${sa.length})</h5>${fileRows(sa,m.id,"scheme",admin)}</div><div class="material-box"><h5>Nota / Lampiran (${na.length})</h5>${fileRows(na,m.id,"note",admin)}</div></div>${m.note?`<div class="notice info" style="margin-top:9px"><b>Nota:</b> ${esc(m.note)}</div>`:""}${admin?`<div class="actions"><button class="secondary" onclick="editMaterial('${m.id}')">Edit / Tambah Fail</button><button class="danger" onclick="deleteMaterial('${m.id}')">Padam Rekod</button></div>`:""}</div>`}
function renderMaterials(){const list=[...materials].sort((a,b)=>(slotById(a.slotId)?.date||"").localeCompare(slotById(b.slotId)?.date||""));$("materialsList").innerHTML=list.length?list.map(m=>materialCard(m,false)).join(""):'<div class="empty">Belum ada bahan mengajar dimuat naik.</div>';if(adminMode)$("adminMaterialList").innerHTML=list.length?list.map(m=>materialCard(m,true)).join(""):'<div class="empty">Belum ada bahan mengajar dimuat naik.</div>';updateStats()}
function editMaterial(id){if(!adminMode)return;const m=materials.find(x=>x.id===id);if(!m)return;materialEditId=id;$("materialSlot").value=m.slotId;$("materialTitle").value=m.title||"";$("materialNote").value=m.note||"";$("materialEditBanner").classList.remove("hidden");$("materialEditBanner").innerHTML=`Anda sedang mengedit rekod <b>${esc(m.title||slotById(m.slotId)?.subject||"bahan")}</b>. Fail sedia ada dikekalkan dan anda boleh menambah fail baharu atau membuang fail secara individu.`;$("cancelMaterialEditBtn").classList.remove("hidden");switchAdminPane("adminMaterials");window.scrollTo({top:$("admin").offsetTop,behavior:"smooth"})}
function cancelMaterialEdit(){materialEditId=null;$("materialTitle").value="";$("materialNote").value="";$("materialFiles").value="";$("schemeFiles").value="";$("noteFiles").value="";$("materialEditBanner").classList.add("hidden");$("cancelMaterialEditBtn").classList.add("hidden")}
function removeMaterialFile(id,kind,key){const m=materials.find(x=>x.id===id);if(!m||!confirm("Buang fail ini daripada rekod bahan?"))return;const prop=kind==="material"?"materialFiles":kind==="scheme"?"schemeFiles":"noteFiles";m[prop]=materialFilesNormalized(m,kind).filter(f=>f.key!==key);m.updatedAt=new Date().toISOString();saveAll();renderMaterials()}
function deleteMaterial(id){if(!confirm("Padam rekod bahan ini?"))return;materials=materials.filter(m=>m.id!==id);saveAll();if(materialEditId===id)cancelMaterialEdit();renderAll()}

// ---------- Editable schedule (Pentadbir) ----------
let scheduleEditId = null;
function scheduleDayName(date){
  if(!date)return "";
  const d=new Date(date+"T00:00:00");
  const raw=d.toLocaleDateString("ms-MY",{weekday:"long"});
  return raw.charAt(0).toUpperCase()+raw.slice(1);
}
function fillScheduleGroupOptions(){
  const el=$("scheduleGroup");if(!el)return;
  el.innerHTML=GROUP_ORDER.map(g=>`<option value="${esc(g)}">${esc(g)}</option>`).join("");
}
function scheduleSort(a,b){return String(a.date||"").localeCompare(String(b.date||""))||String(a.time||"").localeCompare(String(b.time||""))||String(a.group||"").localeCompare(String(b.group||""))}
function renderAdminSchedule(){
  if(!adminMode||!$("adminScheduleList"))return;
  const list=[...SCHEDULE].sort(scheduleSort);
  $("adminScheduleList").innerHTML=list.length?list.map(s=>`<div class="card schedule-admin-card"><div class="card-top"><div><h4>${esc(s.subject)}</h4><div class="meta"><b>${esc(s.day)}, ${fmtDate(s.date)}</b> • ${esc(s.time)}<br>${esc(s.group)} • ${s.mode==="pksk"?"PKSK":"One-to-One"}${s.topic?` • Topik: ${esc(s.topic)}`:""}</div></div><span class="badge info">${esc(s.mode==="pksk"?"PKSK":"INDIVIDU")}</span></div><div class="actions"><button class="secondary" type="button" onclick="editScheduleItem('${s.id}')">Edit</button><button class="danger" type="button" onclick="deleteScheduleItem('${s.id}')">Padam</button></div></div>`).join(""):'<div class="empty">Belum ada jadual.</div>';
}
function editScheduleItem(id){
  if(!adminMode)return;const s=slotById(id);if(!s)return;scheduleEditId=id;
  $("scheduleEditId").value=id;$("scheduleDate").value=s.date||"";$("scheduleTime").value=s.time||"";$("scheduleSubject").value=s.subject||"";$("scheduleGroup").value=s.group||GROUP_ORDER[0];$("scheduleMode").value=s.mode||"individual";$("scheduleTopic").value=s.topic||"";
  $("scheduleEditBanner").classList.remove("hidden");$("scheduleEditBanner").innerHTML=`Anda sedang mengedit <b>${esc(s.subject)}</b> pada ${esc(s.day)}, ${fmtDate(s.date)}.`;$("cancelScheduleEditBtn").classList.remove("hidden");switchAdminPane("adminSchedule");
  window.scrollTo({top:$("admin").offsetTop,behavior:"smooth"});
}
function cancelScheduleEdit(){
  scheduleEditId=null;if($("scheduleEditId"))$("scheduleEditId").value="";["scheduleDate","scheduleTime","scheduleSubject","scheduleTopic"].forEach(id=>{if($(id))$(id).value=""});if($("scheduleMode"))$("scheduleMode").value="individual";if($("scheduleGroup"))$("scheduleGroup").value=GROUP_ORDER[0];$("scheduleEditBanner")?.classList.add("hidden");$("cancelScheduleEditBtn")?.classList.add("hidden");
}
function uniqueScheduleId(date,subject,group){
  const slug=(subject+"-"+group).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,42)||"slot";
  let base=String(date||"").replaceAll("-","")+"-"+slug,id=base,n=2;while(SCHEDULE.some(s=>s.id===id)){id=base+"-"+n++}return id;
}
function saveScheduleItem(){
  if(!adminMode)return;const date=$("scheduleDate").value,time=$("scheduleTime").value.trim(),subject=$("scheduleSubject").value.trim(),group=$("scheduleGroup").value,mode=$("scheduleMode").value,topic=$("scheduleTopic").value.trim();
  if(!date||!time||!subject||!group){alert("Lengkapkan Tarikh, Masa, Subjek/Aktiviti dan Tahun/Tingkatan.");return}
  const rec={date,day:scheduleDayName(date),time,subject,group,mode:mode==="pksk"?"pksk":"individual",topic};
  if(scheduleEditId){const idx=SCHEDULE.findIndex(s=>s.id===scheduleEditId);if(idx<0)return;SCHEDULE[idx]={...SCHEDULE[idx],...rec};}
  else{rec.id=uniqueScheduleId(date,subject,group);SCHEDULE.push(rec)}
  SCHEDULE.sort(scheduleSort);selectedDate=date;saveAll();cancelScheduleEdit();fillMaterialSlots();renderAll();renderAdminSchedule();notify("*",`Jadual kelas dikemas kini: ${rec.day}, ${fmtDate(rec.date)} • ${rec.subject} (${rec.group}).`,"info","schedule_updated");speakThanks();alert("Jadual berjaya disimpan dan dikemas kini pada paparan mentor.")
}
function deleteScheduleItem(id){
  if(!adminMode)return;const s=slotById(id);if(!s)return;
  const relatedBookings=bookings.filter(b=>b.slotId===id),relatedMaterials=materials.filter(m=>m.slotId===id);const extra=(relatedBookings.length||relatedMaterials.length)?`\n\nSlot ini mempunyai ${relatedBookings.length} tempahan dan ${relatedMaterials.length} rekod bahan. Jika diteruskan, rekod berkaitan turut dipadam.`:"";
  if(!confirm(`Padam slot ${s.subject} • ${s.group} pada ${fmtDate(s.date)}?${extra}`))return;
  const bookingIds=new Set(relatedBookings.map(b=>b.id));SCHEDULE=SCHEDULE.filter(x=>x.id!==id);bookings=bookings.filter(b=>b.slotId!==id);reports=reports.filter(r=>!bookingIds.has(r.bookingId));materials=materials.filter(m=>m.slotId!==id);
  if(!SCHEDULE.some(x=>x.date===selectedDate))selectedDate=SCHEDULE[0]?.date||"";saveAll();fillMaterialSlots();renderAll();renderAdminSchedule();speakThanks();alert("Slot jadual telah dipadam.")
}

// ---------- Admin dashboard ----------
function capacityForSlot(s){return s.mode==="pksk"?1:studentsInGroup(s.group).length}
function renderAdminDashboard(){
  if(!adminMode)return;
  const byDate=[...new Set(SCHEDULE.map(s=>s.date))].map(date=>{const slots=SCHEDULE.filter(s=>s.date===date),cap=slots.reduce((n,s)=>n+capacityForSlot(s),0),filled=slots.reduce((n,s)=>n+Math.min(capacityForSlot(s),approvedForSlot(s.id).length),0);return {date,day:slots[0].day,cap,filled,pct:cap?Math.round(filled/cap*100):0}});
  $("occupancyOverview").innerHTML=byDate.map(x=>`<div class="occupancy-row"><div class="occupancy-meta"><span>${x.day}, ${fmtDate(x.date)}</span><b>${x.filled}/${x.cap} (${x.pct}%)</b></div><div class="progress-bar"><div class="progress-fill" style="width:${x.pct}%"></div></div></div>`).join("");
  const activity=[...notifications].filter(n=>n.target==="*admin*").slice(0,7);$("adminRecentActivity").innerHTML=activity.length?activity.map(n=>`<div class="activity-mini"><b>${esc(n.message)}</b><div class="meta">${fmtDateTime(n.createdAt)}</div></div>`).join(""):'<div class="meta">Belum ada aktiviti Pentadbir.</div>';
  $("adminBackendBadge").textContent=supabaseClient?"Supabase client tersedia":"Backend tempatan";$("backendDescription").innerHTML=supabaseClient?"Supabase client telah dikonfigurasi pada front-end. Sambungan data penuh masih memerlukan jadual, polisi RLS dan Storage bucket yang sepadan.":"Versi ini berjalan dalam mod prototaip tempatan menggunakan localStorage dan IndexedDB. GitHub Pages boleh memaparkan website, tetapi data merentas telefon / pengguna belum dikongsi sehingga database Supabase disambungkan.";
  updateStats()
}
function updateStats(){
  const finals=bookings.filter(isFinalStatus),mentorEmails=new Set(finals.map(b=>b.email?.toLowerCase()).filter(Boolean));
  $("statPending").textContent=bookings.filter(b=>b.status==="pending").length;$("statApproved").textContent=finals.length;$("statReports").textContent=reports.filter(r=>r.status==="pending").length;$("statApprovedReports").textContent=reports.filter(r=>r.status==="approved").length;$("statMentors").textContent=mentorEmails.size;$("statMaterials").textContent=materials.length
}
function renderAdminAll(){if(!adminMode)return;renderAdminDashboard();renderAdminBookings();renderAdminReports();renderMaterials();renderAdminSchedule();renderAdminMentees();renderNotifications();renderEmailSettings();updateStats()}
function copyWhatsAppSummary(){
  const finals=bookings.filter(isFinalStatus).sort((a,b)=>(slotById(a.slotId)?.date||"").localeCompare(slotById(b.slotId)?.date||""));if(!finals.length){alert("Belum ada tempahan diluluskan.");return}
  const g={};finals.forEach(b=>{const s=slotById(b.slotId);(g[s.date] ||= []).push({b,s})});let t="*RINGKASAN MENTOR-MENTEE RUKAIYAH*\n";Object.entries(g).forEach(([d,arr])=>{t+=`\n*${arr[0].s.day}, ${fmtDate(d)}*\n`;arr.forEach(({b,s})=>t+=`• ${s.time} | ${s.subject} (${s.group}) | ${bookingStudentName(b)} → ${b.mentorName} (${b.mentorMatric||"-"})\n`)});navigator.clipboard?.writeText(t).then(()=>alert("Ringkasan disalin.")).catch(()=>prompt("Salin teks:",t))
}

// ---------- Email settings ----------
function saveEmailSettings(){if(!adminMode)return;const admin=$("emailAdminAddress").value.trim().toLowerCase(),url=$("emailWebhookUrl").value.trim();if(admin&&!/^\S+@\S+\.\S+$/.test(admin)){alert("E-mel Pentadbir tidak sah.");return}if(url&&!/^https?:\/\//i.test(url)){alert("Webhook URL perlu bermula dengan http:// atau https://");return}emailSettings={enabled:$("emailEnabled").checked,adminEmail:admin,webhookUrl:url};saveAll();renderEmailSettings();speakThanks();alert("Tetapan e-mel disimpan.")}
async function sendTestEmail(){if(!adminMode)return;saveEmailSettings();if(!emailSettings.enabled||!emailSettings.webhookUrl||!emailSettings.adminEmail){alert("Aktifkan e-mel dan lengkapkan e-mel Pentadbir serta Webhook URL dahulu.");return}const before=emailLog.length;await dispatchEmail(emailSettings.adminEmail,"Ini ialah e-mel ujian daripada Sistem Mentor-Mentee Rukaiyah HELAA KRK.","test_email");const latest=emailLog[0];alert(latest&&emailLog.length>before&&latest.status==="ok"?"Permintaan e-mel ujian berjaya dihantar ke webhook.":"Permintaan e-mel ujian tidak berjaya. Semak log penghantaran.")}
function renderEmailSettings(){if(!adminMode)return;$("emailAdminAddress").value=emailSettings.adminEmail||currentEmail||"";$("emailWebhookUrl").value=emailSettings.webhookUrl||"";$("emailEnabled").checked=!!emailSettings.enabled;$("emailLogList").innerHTML=emailLog.length?emailLog.slice(0,20).map(l=>`<div class="email-log-item ${l.status}"><b>${l.status==="ok"?"BERJAYA":l.status==="fail"?"GAGAL":"DILANGKAU"}</b> • ${esc(l.to||"-")}<div class="meta">${esc(l.event||"notification")} • ${fmtDateTime(l.createdAt)} ${l.detail?"• "+esc(l.detail):""}</div></div>`).join(""):'<div class="empty">Belum ada log penghantaran e-mel.</div>'}

// ---------- Render all ----------
function renderAll(){
  renderDays();renderSlots();renderMyBookings();renderMentorReports();renderApprovedReports();renderMentees();renderMentorDirectory();fillMaterialSlots();renderMaterials();renderNotifications();if(adminMode)renderAdminAll();refreshIdentity()
}

// ---------- Initial setup ----------
function bindLoginControls(){
  // Login tabs and submit buttons are intentionally wired in index.html itself.
  // Keep only keyboard conveniences here.
  $("loginEmail")?.addEventListener("keydown",e=>{if(e.key==="Enter") $("loginMatric")?.focus()});
  $("adminEmail")?.addEventListener("keydown",e=>{if(e.key==="Enter") $("adminMatric")?.focus()});
}

function init(){
  try{
    bindLoginControls();
    buildProfileCheckboxes();fillMaterialSlots();fillScheduleGroupOptions();setupWelcomeVoice();
    $("mentorProfilePhoto")?.addEventListener("change",()=>previewSelectedImage($("mentorProfilePhoto"),$("mentorProfilePhotoPreview")));
    $("menteeEditPhoto")?.addEventListener("change",()=>previewSelectedImage($("menteeEditPhoto"),$("menteeEditPhotoPreview")));
    initialiseSupabaseWhenConfigured();
    if(currentEmail&&currentMatric&&currentRole){$("loginOverlay").classList.add("hidden");$("adminNavBtn").classList.toggle("hidden",!adminMode);document.querySelectorAll(".admin-only").forEach(el=>el.classList.toggle("hidden",!adminMode));refreshIdentity();switchTab(adminMode?"admin":"booking");renderAll()}
    else{$("loginOverlay").classList.remove("hidden");setLoginMode("mentor");renderDays();renderSlots()}
  }catch(err){
    console.error("HELAA system startup error",err);
    alert("Sistem tidak dapat dimulakan sepenuhnya. Sila refresh halaman. Jika masih berlaku, pastikan index.html, style.css dan script.js berada dalam folder GitHub yang sama.");
  }
}

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
else init();
