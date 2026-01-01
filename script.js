/* =========================
   דרך הזיווג – Script v6
   (עם: אנגלית/עברית, מצב כהה, טשטוש, מצב שבת, PIN, פח מחזור עם ימים, גיבוי, שידוכים+סטטוס+תחושה+הערת בטן+היסטוריה, AI דמו)
========================= */

const STORAGE_KEY = "dz_candidates_v6";
const SETTINGS_KEY = "dz_settings_v2";

let state = {
  filter: "all",
  search: "",
  selectedId: null,
  candidates: []
};

let modalMode = "add";   // "add" | "edit"
let editingId = null;

let settings = {
  lang: "he",
  darkMode: false,
  blurPhotos: false,
  shabbatMode: false,

  pinEnabled: false,
  pin: "",
  requirePinForDelete: true,

  trashDays: 30
};

let sessionUnlocked = false;

const MOODS = [
  { key:"good", he:"😊 הולך טוב", en:"😊 Going well" },
  { key:"neutral", he:"😐 נייטרלי", en:"😐 Neutral" },
  { key:"care", he:"⚠️ צריך רגישות", en:"⚠️ Needs care" },
  { key:"stopped", he:"💔 נעצר בעדינות", en:"💔 Paused gently" }
];

const STATUS_LABELS_HE = ["חדש","הוצע","ממתין","מתקדם","ירד","נסגר בע״ה"];
const STATUS_LABELS_EN = ["New","Suggested","Waiting","Progressing","Dropped","Closed (BH)"];

const I18N = {
  he: {
    brand: "דרך הזיווג",
    filters: { all:"כולם", important:"⭐ חשובים", archived:"ארכיון", trash:"🗑️ פח מחזור" },
    tabs: { home:"בית", important:"חשובים", archived:"ארכיון", trash:"פח", settings:"הגדרות" },
    sec: { doing:"מה עושה כרגע", personality:"אופי ותכונות", family:"משפחה", looking:"מה מחפש/ת", head:"כיסוי ראש – מה חשוב לי", matches:"שידוכים", ai:"יועץ AI לשדכן" },
    aiHint: "Enter שולח · Shift+Enter שורה חדשה",
    footerHint: "הערות למחשבה בלבד. השדכן מכיר את התמונה המלאה.",
    placeholders: { search:"חיפוש לפי שם…", ai:"כתבי כאן… לדוגמה: ניסוח עדין / מה לשאול / הערכת התאמה" },
    buttons: {
      back:"⬅ חזרה", edit:"✏️ עריכה", trash:"🗑️ לפח מחזור", restore:"♻️ שחזור", del:"❌ מחיקה לצמיתות",
      archiveTo:"📦 העברה לארכיון", unarchive:"♻️ שחזור מהארכיון",
      addMatch:"+ יצירת שידוך", aiSend:"שליחה",
      addTitle:"הוספת מועמד", editTitle:"עריכת מועמד",
      cancel:"ביטול", save:"שמירה", saveChanges:"שמירת שינויים",
      starOn:"⭐ חשוב", starOff:"☆ סימון חשוב",
      history:"היסטוריה", gut:"הערת בטן"
    },
    settings: {
      title:"הגדרות",
      lang:"שפה",
      dark:"מצב כהה",
      blur:"טשטוש תמונות ברשימה",
      shabbat:"מצב שבת / שקט (צפייה בלבד)",
      pinEnabled:"נעילת PIN בפתיחה",
      pin:"הגדרת/שינוי PIN (4 ספרות)",
      pinDelete:"לדרוש PIN למחיקה לצמיתות",
      trashDays:"פח מחזור – ימים",
      backup:"גיבוי",
      importHint:"ייבוא ידרוס את הנתונים הקיימים.",
      close:"סגירה",
      save:"שמירה",
      export:"הורדת גיבוי",
      import:"ייבוא גיבוי"
    },
    banners: { shabbat:"מצב שקט פעיל 🕯️ (צפייה בלבד) — פעולות עריכה/מחיקה מושבתות." },
    alerts: {
      required:"חובה למלא: שם מלא, גיל, אזור, רמה דתית",
      pin4:"PIN חייב להיות 4 ספרות.",
      confirmTrash:(name)=>`להעביר את ${name} לפח מחזור? אפשר לשחזר.`,
      confirmDelete:(name)=>`למחוק את ${name} לצמיתות? אי אפשר לשחזר.`,
      confirmArchive:(name)=>`להעביר את ${name} לארכיון?`,
      confirmUnarchive:(name)=>`לשחזר את ${name} מהארכיון?`,
      confirmRestore:(name)=>`לשחזר את ${name} מהפח?`,
      noCandidates:"אין עוד מועמדים",
      matchExists:"השידוך הזה כבר קיים.",
      chooseBackup:"בחרי קובץ גיבוי.",
      importOverride:"ייבוא ידרוס את הנתונים הקיימים. להמשיך?",
      importOk:"הגיבוי יובא בהצלחה.",
      importBad:"לא הצלחתי לייבא. כנראה קובץ לא תקין."
    },
    lock: { title:"נעילה", sub:"הכניסי PIN כדי להמשיך", wrong:"PIN לא נכון", ask:"PIN נדרש:" }
  },
  en: {
    brand: "Derech HaZivug",
    filters: { all:"All", important:"⭐ Important", archived:"Archive", trash:"🗑️ Trash" },
    tabs: { home:"Home", important:"Important", archived:"Archive", trash:"Trash", settings:"Settings" },
    sec: { doing:"Currently", personality:"Personality", family:"Family", looking:"Looking for", head:"Head covering – important to me", matches:"Matches", ai:"AI helper" },
    aiHint: "Enter sends · Shift+Enter newline",
    footerHint: "Notes are for thinking only. The matchmaker knows the full picture.",
    placeholders: { search:"Search by name…", ai:"Type here… e.g., message wording / what to ask / compatibility" },
    buttons: {
      back:"⬅ Back", edit:"✏️ Edit", trash:"🗑️ Move to Trash", restore:"♻️ Restore", del:"❌ Delete permanently",
      archiveTo:"📦 Move to archive", unarchive:"♻️ Restore from archive",
      addMatch:"+ Create match", aiSend:"Send",
      addTitle:"Add candidate", editTitle:"Edit candidate",
      cancel:"Cancel", save:"Save", saveChanges:"Save changes",
      starOn:"⭐ Important", starOff:"☆ Mark important",
      history:"History", gut:"Gut note"
    },
    settings: {
      title:"Settings",
      lang:"Language",
      dark:"Dark mode",
      blur:"Blur photos in list",
      shabbat:"Quiet mode (view only)",
      pinEnabled:"PIN lock on open",
      pin:"Set/Change PIN (4 digits)",
      pinDelete:"Require PIN for permanent delete",
      trashDays:"Trash – days",
      backup:"Backup",
      importHint:"Import will overwrite current data.",
      close:"Close",
      save:"Save",
      export:"Download backup",
      import:"Import backup"
    },
    banners: { shabbat:"Quiet mode 🕯️ (view only) — editing/deleting is disabled." },
    alerts: {
      required:"Required: full name, age, area, religious level",
      pin4:"PIN must be exactly 4 digits.",
      confirmTrash:(name)=>`Move ${name} to Trash? You can restore.`,
      confirmDelete:(name)=>`Delete ${name} permanently? Cannot be undone.`,
      confirmArchive:(name)=>`Move ${name} to archive?`,
      confirmUnarchive:(name)=>`Restore ${name} from archive?`,
      confirmRestore:(name)=>`Restore ${name} from trash?`,
      noCandidates:"No other candidates",
      matchExists:"This match already exists.",
      chooseBackup:"Choose a backup file.",
      importOverride:"Import will overwrite current data. Continue?",
      importOk:"Backup imported successfully.",
      importBad:"Import failed. File may be invalid."
    },
    lock: { title:"Locked", sub:"Enter PIN to continue", wrong:"Wrong PIN", ask:"PIN required:" }
  }
};

function $(id) { return document.getElementById(id); }
function t() { return I18N[settings.lang] || I18N.he; }
function uid() { return Math.random().toString(16).slice(2) + Date.now().toString(16); }
function today() { return new Date().toLocaleDateString(settings.lang === "en" ? "en-US" : "he-IL"); }
function currentStatusLabels() { return settings.lang === "en" ? STATUS_LABELS_EN : STATUS_LABELS_HE; }
function isReadOnly() { return !!settings.shabbatMode; }

function escapeHtml(s) {
  
  return String(s ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

/* ---------- Settings storage ---------- */
function saveSettings() { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }
function loadSettings() {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) return;
  try { settings = { ...settings, ...JSON.parse(raw) }; } catch {}
  if (!settings.lang) settings.lang = "he";
  if (!settings.trashDays || settings.trashDays < 1) settings.trashDays = 30;
}

/* ---------- Apply settings UI ---------- */
function applySettings() {
  document.documentElement.lang = settings.lang;
  document.body.style.direction = settings.lang === "en" ? "ltr" : "rtl";
  document.body.classList.toggle("dark", !!settings.darkMode);
  document.body.classList.toggle("blur-photos", !!settings.blurPhotos);

  const banner = $("shabbat-banner");
  if (banner) {
    if (settings.shabbatMode) {
      banner.textContent = t().banners.shabbat;
      banner.style.display = "block";
    } else {
      banner.style.display = "none";
    }
  }
}

/* ---------- I18n ---------- */
function applyI18n() {
  const L = t();

  if ($("t-brand")) $("t-brand").textContent = L.brand;

  if ($("t-filter-all")) $("t-filter-all").textContent = L.filters.all;
  if ($("t-filter-important")) $("t-filter-important").textContent = L.filters.important;
  if ($("t-filter-archived")) $("t-filter-archived").textContent = L.filters.archived;
  if ($("t-filter-trash")) $("t-filter-trash").textContent = L.filters.trash;

  if ($("t-tab-home")) $("t-tab-home").textContent = L.tabs.home;
  if ($("t-tab-important")) $("t-tab-important").textContent = L.tabs.important;
  if ($("t-tab-archived")) $("t-tab-archived").textContent = L.tabs.archived;
  if ($("t-tab-trash")) $("t-tab-trash").textContent = L.tabs.trash;
  if ($("t-tab-settings")) $("t-tab-settings").textContent = L.tabs.settings;

  if ($("t-sec-doing")) $("t-sec-doing").textContent = L.sec.doing;
  if ($("t-sec-personality")) $("t-sec-personality").textContent = L.sec.personality;
  if ($("t-sec-family")) $("t-sec-family").textContent = L.sec.family;
  if ($("t-sec-looking")) $("t-sec-looking").textContent = L.sec.looking;
  if ($("t-sec-head")) $("t-sec-head").textContent = L.sec.head;
  if ($("t-sec-matches")) $("t-sec-matches").textContent = L.sec.matches;
  if ($("t-sec-ai")) $("t-sec-ai").textContent = L.sec.ai;

  const search = $("search"); if (search) search.placeholder = L.placeholders.search;
  const aiq = $("ai-q"); if (aiq) aiq.placeholder = L.placeholders.ai;

  if ($("t-ai-hint")) $("t-ai-hint").textContent = L.aiHint;
  if ($("t-footer-hint")) $("t-footer-hint").textContent = L.footerHint;

  // modal labels
  if ($("t-f-name")) $("t-f-name").textContent = settings.lang === "en" ? "Full name" : "שם מלא";
  if ($("t-f-age")) $("t-f-age").textContent = settings.lang === "en" ? "Age" : "גיל";
  if ($("t-f-area")) $("t-f-area").textContent = settings.lang === "en" ? "Area" : "אזור";
  if ($("t-f-level")) $("t-f-level").textContent = settings.lang === "en" ? "Religious level" : "רמה דתית";
  if ($("t-f-photo")) $("t-f-photo").textContent = settings.lang === "en" ? "Photo (optional)" : "תמונה (אופציונלי)";
  if ($("t-f-doing")) $("t-f-doing").textContent = L.sec.doing;
  if ($("t-f-personality")) $("t-f-personality").textContent = L.sec.personality;
  if ($("t-f-family")) $("t-f-family").textContent = L.sec.family;
  if ($("t-f-looking")) $("t-f-looking").textContent = L.sec.looking;
  if ($("t-f-head")) $("t-f-head").textContent = L.sec.head;

  // settings labels
  if ($("t-settings-title")) $("t-settings-title").textContent = L.settings.title;
  if ($("t-s-lang")) $("t-s-lang").textContent = L.settings.lang;
  if ($("t-s-dark")) $("t-s-dark").textContent = L.settings.dark;
  if ($("t-s-blur")) $("t-s-blur").textContent = L.settings.blur;
  if ($("t-s-shabbat")) $("t-s-shabbat").textContent = L.settings.shabbat;
  if ($("t-s-pin-enabled")) $("t-s-pin-enabled").textContent = L.settings.pinEnabled;
  if ($("t-s-pin")) $("t-s-pin").textContent = L.settings.pin;
  if ($("t-s-pin-delete")) $("t-s-pin-delete").textContent = L.settings.pinDelete;
  if ($("t-s-trash-days")) $("t-s-trash-days").textContent = L.settings.trashDays;
  if ($("t-backup")) $("t-backup").textContent = L.settings.backup;
  if ($("t-import-hint")) $("t-import-hint").textContent = L.settings.importHint;

  if ($("btn-settings-close")) $("btn-settings-close").textContent = L.settings.close;
  if ($("btn-settings-save")) $("btn-settings-save").textContent = L.settings.save;
  if ($("btn-export")) $("btn-export").textContent = L.settings.export;
  if ($("btn-import")) $("btn-import").textContent = L.settings.import;

  if ($("t-lock-title")) $("t-lock-title").textContent = L.lock.title;
  if ($("t-lock-sub")) $("t-lock-sub").textContent = L.lock.sub;

  // buttons on card (labels are set inside renderCard too, but keep sane defaults)
  if ($("btn-back")) $("btn-back").textContent = L.buttons.back;
  if ($("btn-edit")) $("btn-edit").textContent = L.buttons.edit;
  if ($("btn-delete")) $("btn-delete").textContent = L.buttons.del;
}

/* ---------- Candidate storage ---------- */
function saveCandidates() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.candidates)); }
function loadCandidates() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    state.candidates = JSON.parse(raw);
    normalizeCandidates();
    return;
  }

  // demo data (אפשר למחוק אם לא רוצים)
  state.candidates = [
    {
      id: uid(),
      name: "אליה כהן",
      age: 23,
      area: "אזור ירושלים",
      level: "חרדי",
      doing: "לומד בישיבה ומשלב עם עבודה",
      personality: "בחור שמח, בוגר, מסודר, חברותי ואהוב על כולם",
      family: "משפחה חרדית חמה ואוהבת, 4 אחים, אני הבכור",
      lookingFor: "בחורה יראת שמים, בעלת מידות טובות וממשפחה טובה",
      headCovering: "פתוח לשיח, חשוב שתהיה צניעות וקו ברור",
      important: true,
      archived: false,
      trashed: false,
      deletedAt: null,
      photo: null,
      matches: []
    },
    {
      id: uid(),
      name: "שרה לוי",
      age: 21,
      area: "מרכז",
      level: "חרדית",
      doing: "לומדת ומדריכה",
      personality: "נעימה, רגועה, ערכית ומסודרת",
      family: "משפחה חמה ומכבדת",
      lookingFor: "בחור ירא שמים, עם לב טוב ובשלות",
      headCovering: "מטפחת או שילוב, פתוחה לשיח",
      important: false,
      archived: false,
      trashed: false,
      deletedAt: null,
      photo: null,
      matches: []
    }
  ];
  saveCandidates();
}

function normalizeCandidates() {
  state.candidates.forEach(c => {
    if (!("matches" in c)) c.matches = [];
    if (!("archived" in c)) c.archived = false;
    if (!("important" in c)) c.important = false;
    if (!("photo" in c)) c.photo = null;

    if (!("trashed" in c)) c.trashed = false;
    if (!("deletedAt" in c)) c.deletedAt = null;

    (c.matches || []).forEach(m => {
      if (!("history" in m)) m.history = [{ status: m.status || currentStatusLabels()[0], date: today(), type:"status" }];
      if (!("mood" in m)) m.mood = "neutral";
      if (!("gutNote" in m)) m.gutNote = "";
    });
  });
}

/* ---------- PIN helper ---------- */
function requirePinIfNeeded(reasonText="") {
  if (!settings.pinEnabled) return true;
  if (!settings.pin) return true;
  const entered = prompt(reasonText ? `${t().lock.ask} ${reasonText}` : t().lock.ask);
  if (entered === null) return false;
  return entered === settings.pin;
}

/* ---------- Avatar helpers ---------- */
function hashInt(str){
  let h = 0;
  for (let i=0;i<str.length;i++) h = (h*31 + str.charCodeAt(i)) >>> 0;
  return h;
}
function avatarBg(id){
  const h = hashInt(String(id)) % 360;
  return `hsl(${h} 80% 45%)`;
}

/* ---------- File -> DataURL ---------- */
function fileToDataUrl(file){
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

/* ---------- Trash purge ---------- */
function purgeExpiredTrash() {
  const days = Number(settings.trashDays || 30);
  const ms = days * 24 * 60 * 60 * 1000;
  const now = Date.now();

  const toDeleteIds = state.candidates
    .filter(c => c.trashed && c.deletedAt && (now - c.deletedAt) > ms)
    .map(c => c.id);

  if (!toDeleteIds.length) return;

  state.candidates.forEach(x => {
    x.matches = (x.matches || []).filter(m => !toDeleteIds.includes(m.partnerId));
  });

  state.candidates = state.candidates.filter(c => !toDeleteIds.includes(c.id));
  saveCandidates();
}

/* ---------- LIST ---------- */
function filteredCandidates() {
  let items = [...state.candidates];

  if (state.filter === "trash") {
    items = items.filter(x => x.trashed);
  } else {
    items = items.filter(x => !x.trashed);
    if (state.filter !== "archived") items = items.filter(x => !x.archived);
    if (state.filter === "important") items = items.filter(x => x.important);
    if (state.filter === "archived") items = items.filter(x => x.archived);
  }

  const q = state.search.trim().toLowerCase();
  if (q) items = items.filter(x => (x.name || "").toLowerCase().includes(q));

  return items;
}

function daysLeftForTrash(c) {
  if (!c.trashed || !c.deletedAt) return null;
  const days = Number(settings.trashDays || 30);
  const end = c.deletedAt + days*24*60*60*1000;
  const left = Math.ceil((end - Date.now())/(24*60*60*1000));
  return Math.max(0, left);
}

function renderList() {
  const list = $("list");
  const items = filteredCandidates();

  list.innerHTML = "";
  $("empty").style.display = items.length ? "none" : "block";

  for (const c of items) {
    const row = document.createElement("div");
    row.className = "item";
    row.onclick = () => openCard(c.id);

    const avatar = document.createElement("div");
    avatar.className = "avatar";

    if (c.photo) {
      const img = document.createElement("img");
      img.src = c.photo;
      img.alt = c.name || "";
      avatar.appendChild(img);
    } else {
      avatar.textContent = (c.name || "?").trim().charAt(0) || "?";
      avatar.style.background = avatarBg(c.id);
    }

    const content = document.createElement("div");
    content.className = "item-content";

    let metaExtra = "";
    if (c.trashed) {
      const left = daysLeftForTrash(c);
      metaExtra = settings.lang === "en"
        ? ` · 🗑️ ${left} days left`
        : ` · 🗑️ נשארו ${left} ימים`;
    }

    content.innerHTML = `
      <div class="name">${escapeHtml(c.name)}
        ${c.archived ? '<span class="badge">ארכיון</span>' : ""}
        ${c.trashed ? '<span class="badge dangerBadge">פח</span>' : ""}
      </div>
      <div class="meta">${escapeHtml(c.age)} · ${escapeHtml(c.area)} · ${escapeHtml(c.level)}${metaExtra}</div>
    `;

    const right = document.createElement("div");
    right.className = "star";
    right.textContent = c.important ? "⭐" : "";

    row.appendChild(avatar);
    row.appendChild(content);
    row.appendChild(right);
    list.appendChild(row);
  }
}

function setFilter(filter) {
  state.filter = filter;
  document.querySelectorAll(".chip").forEach(b => {
    b.classList.toggle("active", b.dataset.filter === filter);
  });
  renderList();
}

/* ---------- CARD ---------- */
function getSelected() { return state.candidates.find(x => x.id === state.selectedId); }

function openCard(id) {
  state.selectedId = id;
  renderCard();
  $("view-list").style.display = "none";
  $("view-card").style.display = "block";
}

function closeCard() {
  state.selectedId = null;
  $("view-card").style.display = "none";
  $("view-list").style.display = "block";
}

function toggleImportant() {
  if (isReadOnly()) return;
  const c = getSelected();
  if (!c || c.trashed) return;
  c.important = !c.important;
  saveCandidates();
  renderCard();
  renderList();
}

function toggleArchiveSelected() {
  if (isReadOnly()) return;
  const c = getSelected();
  if (!c || c.trashed) return;

  if (!c.archived) {
    const ok = confirm(t().alerts.confirmArchive(c.name));
    if (!ok) return;
    c.archived = true;
    saveCandidates();
    closeCard();
    renderList();
  } else {
    const ok = confirm(t().alerts.confirmUnarchive(c.name));
    if (!ok) return;
    c.archived = false;
    saveCandidates();
    renderCard();
    renderList();
  }
}

function moveSelectedToTrash() {
  if (isReadOnly()) return;
  const c = getSelected();
  if (!c || c.trashed) return;

  const ok = confirm(t().alerts.confirmTrash(c.name));
  if (!ok) return;

  state.candidates.forEach(x => {
    x.matches = (x.matches || []).filter(m => m.partnerId !== c.id);
  });
  c.matches = [];

  c.trashed = true;
  c.deletedAt = Date.now();
  c.archived = false;
  c.important = false;

  saveCandidates();
  closeCard();
  renderList();
}

function restoreSelectedFromTrash() {
  if (isReadOnly()) return;
  const c = getSelected();
  if (!c || !c.trashed) return;

  const ok = confirm(t().alerts.confirmRestore(c.name));
  if (!ok) return;

  c.trashed = false;
  c.deletedAt = null;
  saveCandidates();
  renderCard();
  renderList();
}

function deleteSelectedPermanent() {
  const c = getSelected();
  if (!c) return;

  if (settings.pinEnabled && settings.requirePinForDelete && settings.pin) {
    const okPin = requirePinIfNeeded(settings.lang === "en" ? "Permanent delete" : "מחיקה לצמיתות");
    if (!okPin) return;
  }

  const ok = confirm(t().alerts.confirmDelete(c.name));
  if (!ok) return;

  state.candidates.forEach(x => {
    x.matches = (x.matches || []).filter(m => m.partnerId !== c.id);
  });
  state.candidates = state.candidates.filter(x => x.id !== c.id);

  saveCandidates();
  closeCard();
  renderList();
}

function renderCard() {
  const c = getSelected();
  if (!c) return;

  $("card-name").textContent = c.name || "";
  $("card-age").textContent = c.age || "";
  $("card-area").textContent = c.area || "";
  $("card-level").textContent = c.level || "";

  $("card-doing").textContent = c.doing || "";
  $("card-personality").textContent = c.personality || "";
  $("card-family").textContent = c.family || "";
  $("card-looking").textContent = c.lookingFor || "";
  $("card-head").textContent = c.headCovering || "";

  $("card-archived-badge").style.display = c.archived ? "inline-block" : "none";
  $("card-trash-badge").style.display = c.trashed ? "inline-block" : "none";

  // soft note
  const notes = settings.lang === "en"
    ? ["Each case is a whole world 🤍","Leave room for a good surprise.","Details matter — and so does the heart.","A good match is built step by step."]
    : ["כל מקרה הוא עולם ומלואו 🤍","כדאי להשאיר מקום להפתעה טובה.","פרטים חשובים – אבל גם תחושת לב.","שידוך טוב נבנה בצעדים קטנים."];
  const sn = $("soft-note");
  if (sn) sn.textContent = notes[Math.floor(Math.random()*notes.length)];

  renderPartnerSelect();
  renderMatches();

  $("ai-a").textContent = "";
  $("ai-q").value = "";

  // dynamic button labels + enable/disable
  const ro = isReadOnly();
  const disabledBecauseTrash = c.trashed;

  const btnStar = $("btn-star");
  const btnArchive = $("btn-archive");
  const btnTrash = $("btn-trash");
  const btnDelete = $("btn-delete");
  const btnEdit = $("btn-edit");
  const btnAddMatch = $("btn-add-match");
  const btnExportPdf = document.getElementById("btn-export-pdf");
  if (btnExportPdf) {
    btnExportPdf.onclick = () => {
      alert("ייצוא ל-PDF מחובר 🎉");
       // reset AI box when switching candidate
$("ai-question").value = "";
$("ai-answer").innerText = "";
    };
  }

  if (btnStar) btnStar.textContent = c.important ? t().buttons.starOn : t().buttons.starOff;
  if (btnArchive) btnArchive.textContent = c.archived ? t().buttons.unarchive : t().buttons.archiveTo;

  // אם בפח – btn-trash נהיה "שחזור"
  if (btnTrash) btnTrash.textContent = c.trashed ? t().buttons.restore : t().buttons.trash;

  // enable/disable rules
  const disableAllEdits = ro || disabledBecauseTrash;
  if (btnEdit) btnEdit.disabled = disableAllEdits;
  if (btnArchive) btnArchive.disabled = disableAllEdits;
  if (btnStar) btnStar.disabled = disableAllEdits;
  if (btnAddMatch) btnAddMatch.disabled = disableAllEdits;

  // btn-trash: אם בפח – עדיין מותר לשחזר (אלא אם מצב שבת)
  if (btnTrash) btnTrash.disabled = ro;

  // btn-delete: מחיקה לצמיתות תמיד אפשר (אלא אם מצב שבת)
  if (btnDelete) btnDelete.disabled = ro;

  // back label
  if ($("btn-back")) $("btn-back").textContent = t().buttons.back;
  if ($("btn-edit")) $("btn-edit").textContent = t().buttons.edit;
  if ($("btn-delete")) $("btn-delete").textContent = t().buttons.del;
}

/* ---------- MODAL: Candidate ---------- */
function openModalAdd() {
  if (isReadOnly()) return;
  modalMode = "add";
  editingId = null;

  $("modal-title").textContent = t().buttons.addTitle;
  $("btn-save").textContent = t().buttons.save;

  ["f-name","f-age","f-area","f-level","f-doing","f-personality","f-family","f-looking","f-head"]
    .forEach(id => { if ($(id)) $(id).value = ""; });
  if ($("f-photo")) $("f-photo").value = "";

  $("modal").style.display = "flex";
}

function openEditModal() {
  if (isReadOnly()) return;
  const c = getSelected();
  if (!c || c.trashed) return;

  modalMode = "edit";
  editingId = c.id;

  $("modal-title").textContent = t().buttons.editTitle;
  $("btn-save").textContent = t().buttons.saveChanges;

  $("f-name").value = c.name || "";
  $("f-age").value = c.age || "";
  $("f-area").value = c.area || "";
  $("f-level").value = c.level || "";
  $("f-doing").value = c.doing || "";
  $("f-personality").value = c.personality || "";
  $("f-family").value = c.family || "";
  $("f-looking").value = c.lookingFor || "";
  $("f-head").value = c.headCovering || "";
  if ($("f-photo")) $("f-photo").value = "";

  $("modal").style.display = "flex";
}

function closeModal() {
  $("modal").style.display = "none";
  modalMode = "add";
  editingId = null;
}

async function addCandidate() {
  if (isReadOnly()) return;

  const name = $("f-name").value.trim();
  const age = Number($("f-age").value);
  const area = $("f-area").value.trim();
  const level = $("f-level").value.trim();

  if (!name || !age || !area || !level) {
    alert(t().alerts.required);
    return;
  }

  const c = {
    id: uid(),
    name, age, area, level,
    photo: null,

    doing: $("f-doing").value.trim(),
    personality: $("f-personality").value.trim(),
    family: $("f-family").value.trim(),
    lookingFor: $("f-looking").value.trim(),
    headCovering: $("f-head").value.trim(),

    important: false,
    archived: false,
    trashed: false,
    deletedAt: null,

    matches: []
  };

  const file = $("f-photo")?.files?.[0];
  if (file) c.photo = await fileToDataUrl(file);

  state.candidates.unshift(c);
  saveCandidates();
  closeModal();
  renderList();
}

async function saveEditCandidate() {
  if (isReadOnly()) return;

  const c = state.candidates.find(x => x.id === editingId);
  if (!c || c.trashed) return;

  const name = $("f-name").value.trim();
  const age = Number($("f-age").value);
  const area = $("f-area").value.trim();
  const level = $("f-level").value.trim();

  if (!name || !age || !area || !level) {
    alert(t().alerts.required);
    return;
  }

  c.name = name;
  c.age = age;
  c.area = area;
  c.level = level;

  c.doing = $("f-doing").value.trim();
  c.personality = $("f-personality").value.trim();
  c.family = $("f-family").value.trim();
  c.lookingFor = $("f-looking").value.trim();
  c.headCovering = $("f-head").value.trim();

  const file = $("f-photo")?.files?.[0];
  if (file) c.photo = await fileToDataUrl(file);

  saveCandidates();
  closeModal();
  renderCard();
  renderList();
}

/* ---------- MATCHES + NOTES + HISTORY ---------- */
function renderPartnerSelect() {
  const c = getSelected();
  const sel = $("match-partner");
  if (!sel) return;
  sel.innerHTML = "";

  const others = state.candidates.filter(x => x.id !== c.id && !x.trashed);
  if (others.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = t().alerts.noCandidates;
    sel.appendChild(opt);
    return;
  }

  for (const o of others) {
    const opt = document.createElement("option");
    opt.value = o.id;
    opt.textContent = `${o.name} · ${o.age} · ${o.area} · ${o.level}${o.archived ? (settings.lang==="en"?" (Archive)":" (ארכיון)") : ""}`;
    sel.appendChild(opt);
  }
}

function addMatch() {
  if (isReadOnly()) return;

  const c = getSelected();
  const partnerId = $("match-partner")?.value;
  if (!c || !partnerId || c.trashed) return;

  if (c.matches.some(m => m.partnerId === partnerId)) {
    alert(t().alerts.matchExists);
    return;
  }

  const labels = currentStatusLabels();
  const m = {
    id: uid(),
    partnerId,
    status: labels[0],
    mood: "neutral",
    gutNote: "",
    history: [{ type:"created", status: labels[0], date: today() }]
  };

  c.matches.unshift(m);
  saveCandidates();
  renderMatches();
}

function setMatchStatus(matchId, newStatus) {
  if (isReadOnly()) return;

  const c = getSelected();
  const m = c?.matches?.find(x => x.id === matchId);
  if (!m) return;

  if (m.status !== newStatus) {
    m.status = newStatus;
    m.history.unshift({ type:"status", status: newStatus, date: today() });
    saveCandidates();
    renderMatches();
  }
}

function setMatchMood(matchId, moodKey) {
  if (isReadOnly()) return;

  const c = getSelected();
  const m = c?.matches?.find(x => x.id === matchId);
  if (!m) return;

  if (m.mood !== moodKey) {
    m.mood = moodKey;
    m.history.unshift({ type:"mood", status: moodKey, date: today() });
    saveCandidates();
    renderMatches();
  }
}

function toggleHistory(elId) {
  const el = $(elId);
  if (!el) return;
  el.classList.toggle("open");
}

function toggleGut(elId) {
  const el = $(elId);
  if (!el) return;
  el.classList.toggle("open");
}

function saveGut(matchId, text) {
  if (isReadOnly()) return;

  const c = getSelected();
  const m = c?.matches?.find(x => x.id === matchId);
  if (!m) return;

  const v = (text || "").trim();
  if (m.gutNote !== v) {
    m.gutNote = v;
    m.history.unshift({ type:"gut", status: "note", date: today() });
    saveCandidates();
  }
}

function generateNotes(a, b) {
  const notes = [];

  if (a.area && b.area && a.area === b.area) {
    notes.push(settings.lang==="en" ? "Same area — can make logistics easier." : "יש חיבור טבעי בנושא אזור מגורים.");
  } else if (a.area && b.area) {
    notes.push(settings.lang==="en" ? "Different areas — align expectations gently." : "יש פער בנושא אזור מגורים – שווה לתאם ציפיות בעדינות.");
  }

  if (a.level && b.level && a.level === b.level) {
    notes.push(settings.lang==="en" ? "Similar religious level." : "נראה שיש קו דומה ברמה הדתית.");
  }

  const gap = Math.abs((a.age || 0) - (b.age || 0));
  if (gap <= 4 && gap > 0) notes.push(settings.lang==="en" ? "Age gap seems reasonable." : "פער גיל סביר – יכול להתאים טוב.");
  if (gap >= 8) notes.push(settings.lang==="en" ? "Larger age gap — check comfort on both sides." : "פער גיל גדול יחסית – שווה לבדוק נוחות משני הצדדים.");

  const headA = (a.headCovering || "").toLowerCase().trim();
  const headB = (b.headCovering || "").toLowerCase().trim();
  if (headA && headB && headA !== headB) {
    notes.push(settings.lang==="en" ? "Head covering style differs — discuss with care." : "נושא כיסוי ראש/סגנון נראה שונה – שווה לשוחח על זה ברגישות.");
  }

  return notes.slice(0, 2);
}

function renderMatches() {
  const c = getSelected();
  const box = $("matches");
  if (!box) return;
  box.innerHTML = "";

  if (!c?.matches || c.matches.length === 0) {
    const empty = document.createElement("div");
    empty.className = "sec-body";
    empty.textContent = settings.lang==="en"
      ? "No matches yet. Create a new match above."
      : "אין שידוכים עדיין. אפשר ליצור שידוך חדש למעלה.";
    box.appendChild(empty);
    return;
  }

  const labels = currentStatusLabels();

  for (const m of c.matches) {
    const partner = state.candidates.find(x => x.id === m.partnerId);
    if (!partner || partner.trashed) continue;

    const row = document.createElement("div");
    row.className = "match-row";

    const top = document.createElement("div");
    top.className = "match-top";

    const name = document.createElement("div");
    name.className = "match-name";
    name.textContent = `${partner.name} · ${partner.age} · ${partner.area} · ${partner.level}${partner.archived ? (settings.lang==="en"?" · (Archive)":" · (ארכיון)") : ""}`;

    const controls = document.createElement("div");
    controls.className = "match-controls";

    const selStatus = document.createElement("select");
    for (const s of labels) {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s;
      if (m.status === s) opt.selected = true;
      selStatus.appendChild(opt);
    }
    selStatus.onchange = () => setMatchStatus(m.id, selStatus.value);
    selStatus.disabled = isReadOnly();

    const selMood = document.createElement("select");
    for (const md of MOODS) {
      const opt = document.createElement("option");
      opt.value = md.key;
      opt.textContent = settings.lang === "en" ? md.en : md.he;
      if (m.mood === md.key) opt.selected = true;
      selMood.appendChild(opt);
    }
    selMood.onchange = () => setMatchMood(m.id, selMood.value);
    selMood.disabled = isReadOnly();

    const btnGut = document.createElement("button");
    btnGut.className = "btn";
    btnGut.textContent = t().buttons.gut;
    const gutId = `gut_${m.id}`;
    btnGut.onclick = () => toggleGut(gutId);

    const btnHist = document.createElement("button");
    btnHist.className = "btn";
    btnHist.textContent = t().buttons.history;
    const histId = `hist_${m.id}`;
    btnHist.onclick = () => toggleHistory(histId);

    controls.appendChild(selStatus);
    controls.appendChild(selMood);
    controls.appendChild(btnGut);
    controls.appendChild(btnHist);

    top.appendChild(name);
    top.appendChild(controls);

    const notesWrap = document.createElement("div");
    notesWrap.className = "match-notes";
    const notes = generateNotes(c, partner);

    if (settings.lang==="en" && (m.status || "").toLowerCase().includes("wait")) {
      notes.unshift("Gentle reminder: if it’s been a while, a soft check-in can help.");
    }
    if (settings.lang==="he" && (m.status || "").includes("ממתין")) {
      notes.unshift("תזכורת עדינה: אם עבר זמן, שווה בדיקה שקטה.");
    }

    for (const n of notes.slice(0,3)) {
      const p = document.createElement("div");
      p.className = "note";
      p.textContent = "🫧 " + n;
      notesWrap.appendChild(p);
    }

    const gut = document.createElement("div");
    gut.className = "gut";
    gut.id = gutId;

    const gutArea = document.createElement("textarea");
    gutArea.placeholder = settings.lang==="en" ? "Private note…" : "הערה פרטית לשדכן…";
    gutArea.value = m.gutNote || "";
    gutArea.disabled = isReadOnly();
    gutArea.onblur = () => saveGut(m.id, gutArea.value);
    gut.appendChild(gutArea);

    const hist = document.createElement("div");
    hist.className = "history";
    hist.id = histId;

    for (const h of (m.history || [])) {
      const line = document.createElement("div");
      line.className = "history-item";

      let msg = "";
      if (h.type === "created") msg = settings.lang==="en" ? "Created" : "נוצר";
      else if (h.type === "status") msg = settings.lang==="en" ? `Status → ${h.status}` : `סטטוס → ${h.status}`;
      else if (h.type === "mood") {
        const md = MOODS.find(x=>x.key===h.status);
        msg = settings.lang==="en" ? `Mood → ${md?.en || h.status}` : `תחושה → ${md?.he || h.status}`;
      } else if (h.type === "gut") msg = settings.lang==="en" ? "Gut note updated" : "עודכנה הערת בטן";
      else msg = h.status || "";

      line.textContent = `${msg} · ${h.date}`;
      hist.appendChild(line);
    }

    row.appendChild(top);
    if (notesWrap.childNodes.length) row.appendChild(notesWrap);
    row.appendChild(gut);
    row.appendChild(hist);

    box.appendChild(row);
  }
}

/* ---------- AI (דמו) ---------- */
function firstActiveMatchPartner(c) {
  if (!c.matches || c.matches.length === 0) return null;
  const m = c.matches[0];
  return state.candidates.find(x => x.id === m.partnerId && !x.trashed) || null;
}

function aiReply(q) {
  const c = getSelected();
  if (!c) return settings.lang==="en" ? "I'm here 🙂" : "אני כאן 🙂";
  const text = (q || "").trim();
  if (!text) return settings.lang==="en" ? "Write a short question and I'll answer." : "תכתבי שאלה קצרה ואני אענה נקודתי.";

  const t0 = text.toLowerCase();
  const partner = firstActiveMatchPartner(c);

  const wantsMsg = t0.includes("word") || t0.includes("message") || t0.includes("ניסוח") || t0.includes("מה לכתוב");
  const wantsHead = t0.includes("head") || t0.includes("wig") || t0.includes("scarf") || t0.includes("כיסוי") || t0.includes("פאה") || t0.includes("מטפחת");
  const wantsEval = t0.includes("match") || t0.includes("fit") || t0.includes("compat") || t0.includes("התאמה") || t0.includes("מתאים");

  if (wantsMsg) {
    return settings.lang==="en"
      ? "Sure. Tell me: who are you messaging (parents/boy/girl/matchmaker) + topic, and I’ll draft a gentle message."
      : "בטח. תני לי: למי כותבים (הורים/בחור/בחורה/שדכן) + מה הנושא, ואני אתן ניסוח עדין וקצר.";
  }

  if (wantsHead) {
    return settings.lang==="en"
      ? "Gentle question: “To align expectations, what’s your direction on head covering? Clear preference or open to discuss?”"
      : "שאלה עדינה: “כדי שנהיה מתואמים, מה הכיוון אצלכם בנושא כיסוי ראש? יש העדפה ברורה או פתוח לשיח?”";
  }

  if (wantsEval && partner) {
    const notes = generateNotes(c, partner);
    return settings.lang==="en"
      ? "Points to clarify:\n" + (notes.length ? notes.map(n=>"• "+n).join("\n") : "• Nothing stands out from the data.") + "\nWant 3 questions for the first call?"
      : "נקודות לבירור:\n" + (notes.length ? notes.map(n=>"• "+n).join("\n") : "• אין נקודות בולטות מהנתונים.") + "\nרוצה שאכין 3 שאלות לשיחה הראשונה?";
  }

  return settings.lang==="en"
    ? "Tell me what you want: message wording / what to ask / compatibility."
    : "הבנתי 🙂 תכתבי אם את רוצה: ניסוח / מה לשאול / הערכת התאמה.";
}

function askAI() {
  const input = $("ai-q");
  const text = (input?.value || "").trim();
  if (!text) return;
  $("ai-a").textContent = aiReply(text);
  input.value = "";
  input.focus();
}

/* ---------- SETTINGS UI ---------- */
function openSettings() {
  $("s-lang").value = settings.lang;
  $("s-dark").checked = !!settings.darkMode;
  $("s-blur").checked = !!settings.blurPhotos;
  $("s-shabbat").checked = !!settings.shabbatMode;

  $("s-pin-enabled").checked = !!settings.pinEnabled;
  $("s-pin").value = "";
  $("s-pin-delete").checked = !!settings.requirePinForDelete;

  $("s-trash-days").value = settings.trashDays || 30;

  $("settings-modal").style.display = "flex";
}

function closeSettings() { $("settings-modal").style.display = "none"; }

function saveSettingsFromUI() {
  settings.lang = $("s-lang").value || "he";
  settings.darkMode = $("s-dark").checked;
  settings.blurPhotos = $("s-blur").checked;
  settings.shabbatMode = $("s-shabbat").checked;

  settings.pinEnabled = $("s-pin-enabled").checked;
  settings.requirePinForDelete = $("s-pin-delete").checked;

  const days = Number($("s-trash-days").value);
  settings.trashDays = (days && days >= 1 && days <= 365) ? days : 30;

  const newPin = ($("s-pin").value || "").trim();
  if (newPin) {
    if (!/^\d{4}$/.test(newPin)) {
      alert(t().alerts.pin4);
      return;
    }
    settings.pin = newPin;
  }

  saveSettings();
  applySettings();
  applyI18n();
  renderList();
  if (state.selectedId) renderCard();
  closeSettings();
}

/* ---------- BACKUP ---------- */
function exportBackup() {
  const payload = {
    exportedAt: new Date().toISOString(),
    candidates: state.candidates,
    settings: settings
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `derech-hazivug-backup-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function importBackup() {
  const file = $("import-file")?.files?.[0];
  if (!file) { alert(t().alerts.chooseBackup); return; }

  const ok = confirm(t().alerts.importOverride);
  if (!ok) return;

  try {
    const text = await file.text();
    const data = JSON.parse(text);

    if (!data || !Array.isArray(data.candidates)) {
      alert(t().alerts.importBad);
      return;
    }

    state.candidates = data.candidates;
    normalizeCandidates();

    if (data.settings) settings = { ...settings, ...data.settings };
    if (!settings.lang) settings.lang = "he";

    saveCandidates();
    saveSettings();

    applySettings();
    applyI18n();

    closeSettings();
    closeCard();
    renderList();

    alert(t().alerts.importOk);
  } catch {
    alert(t().alerts.importBad);
  }
}

/* ---------- LOCK ---------- */
function showLockIfNeeded() {
  if (!settings.pinEnabled) { sessionUnlocked = true; return; }
  if (!settings.pin) { sessionUnlocked = true; return; }
  if (sessionUnlocked) return;

  $("lock").style.display = "flex";
  $("lock-pin").value = "";
  $("lock-err").textContent = "";
  setTimeout(()=> $("lock-pin").focus(), 50);
}

function unlock() {
  const val = ($("lock-pin").value || "").trim();
  if (val === settings.pin) {
    sessionUnlocked = true;
    $("lock").style.display = "none";
  } else {
    $("lock-err").textContent = t().lock.wrong;
  }
}

function exportSelectedToPDF(){
  const c = getSelected();
  if (!c) return;

  const html = `
  <html lang="${settings.lang}" dir="${settings.lang === "en" ? "ltr" : "rtl"}">
  <head>
    <meta charset="utf-8" />
    <title>${c.name || "Resume"}</title>
    <style>
      body{ font-family: Arial, sans-serif; padding:24px; color:#111; }
      h1{ margin:0 0 8px 0; font-size:22px; }
      .meta{ color:#555; margin-bottom:18px; }
      .sec{ margin:14px 0; }
      .t{ font-weight:700; margin-bottom:6px; }
      .b{ white-space:pre-wrap; line-height:1.5; }
      hr{ border:none; border-top:1px solid #ddd; margin:14px 0; }
    </style>
  </head>
  <body>
    <h1>${escapeHtml(c.name || "")}</h1>
    <div class="meta">${escapeHtml(c.age || "")} · ${escapeHtml(c.area || "")} · ${escapeHtml(c.level || "")}</div>

    <div class="sec"><div class="t">${escapeHtml(t().sec.doing)}</div><div class="b">${escapeHtml(c.doing || "")}</div></div>
    <hr/>
    <div class="sec"><div class="t">${escapeHtml(t().sec.personality)}</div><div class="b">${escapeHtml(c.personality || "")}</div></div>
    <hr/>
    <div class="sec"><div class="t">${escapeHtml(t().sec.family)}</div><div class="b">${escapeHtml(c.family || "")}</div></div>
    <hr/>
    <div class="sec"><div class="t">${escapeHtml(t().sec.looking)}</div><div class="b">${escapeHtml(c.lookingFor || "")}</div></div>
    <hr/>
    <div class="sec"><div class="t">${escapeHtml(t().sec.head)}</div><div class="b">${escapeHtml(c.headCovering || "")}</div></div>
  </body>
  </html>`;

  const w = window.open("", "_blank");
  if (!w) { alert("הדפדפן חסם חלון קופץ. תאפשרי Pop-ups ואז נסי שוב."); return; }
  w.document.open();
  w.document.write(html);
  w.document.close();

  w.focus();
  w.print(); // משם בוחרים “Save as PDF”
}

/* ---------- BIND ---------- */
function bind() {
  // Card buttons
  const back = $("btn-back"); if (back) back.onclick = closeCard;
  const backTop = $("btn-back-top");
  const pdf = $("btn-pdf"); 
  const share = $("btn-share");
  if (share) share.onclick = openSharePage;
  if (pdf) pdf.onclick = exportCandidatePDF;
  // יצוא ל-PDF / עמוד שיתוף
  const btnExport = document.getElementById("btn-export");
  btnExport.addEventListener("click", () => {
    const candidate = currentCandidate;
    if (!candidate) return;
     // Share modal
  const shareModal = $("share-modal");
  const shareClose = $("btn-share-close");
  const shareWa = $("btn-share-whatsapp");
  const shareEmail = $("btn-share-email");
  const shareCopy = $("btn-share-copy");

  function openShareModal(){
    if (shareModal) shareModal.style.display = "flex";
  }
  function closeShareModal(){
    if (shareModal) shareModal.style.display = "none";
     // AI Chat bind
  const aiSend = document.getElementById("ai-send");
  const aiInput = document.getElementById("ai-input");
  if (aiSend && aiInput) {
    aiSend.onclick = () => aiAsk();
    aiInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") aiAsk();
    });
  }
  }
     function showAIBoxIfNeeded() {
  const box = document.getElementById("ai-box");
  if (!box) return;

  // פה את שולטת אם זה רק לשדכן:
  // אם יש לך "מצב שדכן" / סיסמה / לוגין – פה עושים IF.
  // כרגע פשוט מציגים תמיד בתוך הכרטיס:
  box.style.display = "block";
}

function addMsg(text, who) {
  const wrap = document.getElementById("ai-messages");
  if (!wrap) return;

  const div = document.createElement("div");
  div.className = "ai-msg " + (who === "user" ? "ai-user" : "ai-assistant");
  div.textContent = text;
  wrap.appendChild(div);
  wrap.scrollTop = wrap.scrollHeight;
}

async function aiAsk() {
  const input = document.getElementById("ai-input");
  if (!input) return;

  const q = (input.value || "").trim();
  if (!q) return;

  input.value = "";
  addMsg(q, "user");
  addMsg("רגע…", "assistant");

  // מוחקים את ה"רגע…" האחרון כשמגיעה תשובה
  const wrap = document.getElementById("ai-messages");
  const last = wrap?.lastElementChild;

  // חשוב: לקחת את המועמד הנבחר אצלך
  // אם יש לך פונקציה getSelected() כמו שראיתי – נשתמש בה:
  let candidate = null;
  try { candidate = getSelected?.(); } catch(e) {}

  // שולחים רק שדות “מותרים”
  const safeCandidate = candidate ? {
    name: candidate.name,
    age: candidate.age,
    area: candidate.area,
    level: candidate.level,
    doing: candidate.doing,
    personality: candidate.personality,
    family: candidate.family,
    looking: candidate.looking,
    head: candidate.head
  } : null;

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: q,
        candidate: safeCandidate
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Request failed");

    if (last && last.textContent === "רגע…") last.remove();
    addMsg(data.answer || "לא התקבלה תשובה.", "assistant");
  } catch (err) {
    if (last && last.textContent === "רגע…") last.remove();
    addMsg("יש תקלה בחיבור ל-AI. תנסי שוב בעוד רגע.", "assistant");
    console.log(err);
  }
}

  // כפתור "שיתוף פרופיל" (אם קיים אצלך בכרטיס)
  const btnShare = $("btn-share");
  if (btnShare) btnShare.onclick = openShareModal;

  if (shareClose) shareClose.onclick = closeShareModal;

  if (shareModal) {
    shareModal.addEventListener("click", (e) => {
      if (e.target && e.target.id === "share-modal") closeShareModal();
    });
  }

  function buildShareUrl(){
    // זמני: משתף את העמוד הראשי (אחרי שפרסמת בגיטהאב זה יהיה לינק אמיתי)
    return window.location.href;
  }

  if (shareWa) {
    shareWa.onclick = () => {
      const url = buildShareUrl();
      const text = encodeURIComponent("היי, זה הפרופיל ששלחתי לך:\n" + url);
      window.open("https://wa.me/?text=" + text, "_blank");
    };
  }

  if (shareEmail) {
    shareEmail.onclick = () => {
      const url = buildShareUrl();
      const subject = encodeURIComponent("שיתוף פרופיל");
      const body = encodeURIComponent("מצרפת קישור:\n" + url);
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };
  }

  if (shareCopy) {
    shareCopy.onclick = async () => {
      const url = buildShareUrl();
      try{
        await navigator.clipboard.writeText(url);
        alert("הקישור הועתק ✅");
      }catch{
        prompt("העתיקי את הקישור:", url);
      }
    };
     // Share modal
  function openShareModal() {
    const c = getSelected();
    if (!c) return;

    const url = window.location.href; // כרגע זה הקישור של האפליקציה
    const title = `פרופיל: ${c.name || ""}`.trim();
    const text = `${title}\n${c.age || ""} · ${c.area || ""} · ${c.level || ""}\n${url}`;

    const wa = document.getElementById("share-wa");
    const mail = document.getElementById("share-mail");
    const hint = document.getElementById("share-hint");

    if (wa) wa.href = `https://wa.me/?text=${encodeURIComponent(text)}`;
    if (mail) mail.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text)}`;

    if (hint) hint.style.display = "none";

    const sm = document.getElementById("share-modal");
    if (sm) sm.style.display = "flex";
  }

  function closeShareModal() {
    const sm = document.getElementById("share-modal");
    if (sm) sm.style.display = "none";
  }

  const shareBtn = document.getElementById("btn-share");
  if (shareBtn) shareBtn.onclick = openShareModal;

  const shareClose = document.getElementById("share-close");
  if (shareClose) shareClose.onclick = closeShareModal;

  const shareCopy = document.getElementById("share-copy");
  if (shareCopy) {
    shareCopy.onclick = async () => {
      const c = getSelected();
      if (!c) return;
      const url = window.location.href;
      const title = `פרופיל: ${c.name || ""}`.trim();
      const text = `${title}\n${c.age || ""} · ${c.area || ""} · ${c.level || ""}\n${url}`;
      try {
        await navigator.clipboard.writeText(text);
        const hint = document.getElementById("share-hint");
        if (hint) {
          hint.textContent = "הועתק ✅";
          hint.style.display = "block";
        }
      } catch (e) {
        alert("לא הצלחתי להעתיק. נסי להעתיק ידנית.");
      }
    };
  }

  // close on backdrop click
  const shareModal = document.getElementById("share-modal");
  if (shareModal) {
    shareModal.addEventListener("click", (e) => {
      if (e.target.id === "share-modal") closeShareModal();
    });
  }
  }

    // יוצרים דף שיתוף חדש
    const shareHTML = `
      <html dir="rtl" lang="he">
        <head>
          <meta charset="UTF-8" />
          <title>${candidate.name} – דרך הזיווג</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background: linear-gradient(135deg, #f9f9ff, #f0f4ff);
              padding: 30px;
              color: #111;
              line-height: 1.6;
            }
            .box {
              max-width: 600px;
              margin: auto;
              background: white;
              border-radius: 20px;
              box-shadow: 0 10px 40px rgba(0,0,0,0.1);
              padding: 25px;
            }
            h1 {
              margin-top: 0;
              color: #2563eb;
              text-align: center;
            }
            img {
              width: 120px;
              height: 120px;
              object-fit: cover;
              border-radius: 100px;
              display: block;
              margin: 10px auto;
              border: 3px solid #2563eb33;
            }
            .section { margin-top: 14px; }
            .label { font-weight: bold; color: #444; }
          </style>
        </head>
        <body>
          <div class="box">
            ${candidate.photo ? `<img src="${candidate.photo}" alt="תמונה"/>` : ""}
            <h1>${candidate.name}</h1>
            <div class="section"><span class="label">גיל:</span> ${candidate.age || ''}</div>
            <div class="section"><span class="label">אזור:</span> ${candidate.area || ''}</div>
            <div class="section"><span class="label">רמה דתית:</span> ${candidate.level || ''}</div>
            <div class="section"><span class="label">מה עושה כרגע:</span> ${candidate.doing || ''}</div>
            <div class="section"><span class="label">אופי ותכונות:</span> ${candidate.personality || ''}</div>
            <div class="section"><span class="label">משפחה:</span> ${candidate.family || ''}</div>
            <div class="section"><span class="label">מה מחפש/ת:</span> ${candidate.looking || ''}</div>
            <div class="section"><span class="label">כיסוי ראש:</span> ${candidate.head || ''}</div>
            <hr style="margin:20px 0;">
            <p style="text-align:center;color:#777">נוצר באפליקציית “דרך הזיווג”</p>
          </div>
        </body>
      </html>
    `;

    // פתיחת חלון שיתוף חדש
    const newTab = window.open("", "_blank");
    newTab.document.write(`
    <!DOCTYPE html>
    <html lang="he">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${candidate.name} - פרופיל שידוך</title>
    <style>
    body{
      font-family: Arial, sans-serif;
      background: linear-gradient(180deg,#f9fafb,#eef2ff);
      margin:0;
      padding:0;
      text-align:center;
      direction:rtl;
      color:#1e293b;
    }
    .box{
      max-width:600px;
      margin:20px auto;
      background:white;
      box-shadow:0 8px 30px rgba(0,0,0,0.1);
      border-radius:18px;
      overflow:hidden;
    }
    h1{margin:0;padding:20px 0;font-size:24px;color:#1e40af;}
    img{width:100%;height:280px;object-fit:cover;}
    .section{padding:10px 20px;text-align:right;border-bottom:1px solid #e2e8f0;}
    .label{font-weight:bold;color:#475569;}
    footer{
      padding:16px;
      font-size:14px;
      color:#64748b;
    }
    button{
      background:linear-gradient(135deg,#2563eb,#7c3aed);
      color:#fff;
      border:none;
      padding:12px 18px;
      border-radius:999px;
      cursor:pointer;
      font-size:16px;
      margin-top:12px;
    }
    </style>
    </head>
    <body>
    <div class="box">
    ${candidate.photo ? `<img src="${candidate.photo}" alt="תמונה"/>` : ""}
    <h1>${candidate.name}</h1>
    <div class="section"><span class="label">גיל:</span> ${candidate.age}</div>
    <div class="section"><span class="label">אזור:</span> ${candidate.area}</div>
    <div class="section"><span class="label">רמה דתית:</span> ${candidate.level}</div>
    <div class="section"><span class="label">מה עושה כרגע:</span> ${candidate.doing}</div>
    <div class="section"><span class="label">אופי ותכונות:</span> ${candidate.personality}</div>
    <div class="section"><span class="label">משפחה:</span> ${candidate.family}</div>
    <div class="section"><span class="label">מה מחפש/ת:</span> ${candidate.looking}</div>
    <div class="section"><span class="label">כיסוי ראש:</span> ${candidate.head}</div>
    <footer>
    <button onclick="shareProfile()">שתף בפרופיל 📤</button>
    </footer>
    </div>
    <script>
    function shareProfile(){
      const text = "פרופיל שידוך של ${candidate.name}\\n\\nגיל: ${candidate.age}\\nאזור: ${candidate.area}";
      if (navigator.share){
        navigator.share({title:"פרופיל שידוך",text, url: window.location.href});
      } else {
        window.open('https://wa.me/?text=' + encodeURIComponent(text));
      }
    }
    </script>
    </body>
    </html>
    `);
    newTab.document.close();
  });
  if (backTop) backTop.onclick = closeCard;
  const star = $("btn-star"); if (star) star.onclick = toggleImportant;
  const archive = $("btn-archive"); if (archive) archive.onclick = () => {
    const c = getSelected();
    if (c?.trashed) return;
    toggleArchiveSelected();
   
  };

  const trashBtn = $("btn-trash"); if (trashBtn) trashBtn.onclick = () => {
    const c = getSelected();
    if (!c) return;
    if (c.trashed) restoreSelectedFromTrash();
    else moveSelectedToTrash();
  };

  const del = $("btn-delete"); if (del) del.onclick = deleteSelectedPermanent;
  const edit = $("btn-edit"); if (edit) edit.onclick = openEditModal;

  // Topbar
  const add = $("btn-add"); if (add) add.onclick = openModalAdd;
  const gear = $("btn-settings"); if (gear) gear.onclick = openSettings;

  // Modal candidate
  const cancel = $("btn-cancel"); if (cancel) cancel.onclick = closeModal;
  const saveBtn = $("btn-save");
  if (saveBtn) {
    saveBtn.onclick = async () => {
      if (modalMode === "edit") await saveEditCandidate();
      else await addCandidate();
    };
  }
  // ✅ Enter moves to next field in "Add/Edit candidate" modal
  const modalFieldIds = [
    "f-name",
    "f-age",
    "f-area",
    "f-level",
    "f-photo",
    "f-doing",
    "f-personality",
    "f-family",
    "f-looking",
    "f-head",
  ];

  modalFieldIds.forEach((id, idx) => {
    const el = $(id);
    if (!el) return;

    el.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;

      // In textareas: Shift+Enter = newline, Enter = next field
      if (el.tagName === "TEXTAREA" && e.shiftKey) return;

      e.preventDefault();

      // Move to next field, or save if last
      const nextId = modalFieldIds[idx + 1];
      const nextEl = nextId ? $(nextId) : null;

      if (nextEl) {
        nextEl.focus();
      } else {
        const s = $("btn-save");
        if (s && !s.disabled) s.click();
      }
    });
  });

  // Matches + AI
  const addMatchBtn = $("btn-add-match"); if (addMatchBtn) addMatchBtn.onclick = addMatch;
  const aiBtn = $("btn-ai"); if (aiBtn) aiBtn.onclick = askAI;

  const aiQ = $("ai-q");
  if (aiQ) {
    aiQ.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        askAI();
      }
    });
  }

  // Search
  const search = $("search");
  if (search) {
    search.addEventListener("input", (e) => {
      state.search = e.target.value;
      renderList();
    });
  }

  // Chips
  document.querySelectorAll(".chip").forEach(b => {
    b.addEventListener("click", () => setFilter(b.dataset.filter));
  });

  // Close modals on backdrop click
  const modal = $("modal");
  if (modal) modal.addEventListener("click", (e) => { if (e.target.id === "modal") closeModal(); });
  const sModal = $("settings-modal");
  if (sModal) sModal.addEventListener("click", (e) => { if (e.target.id === "settings-modal") closeSettings(); });

  // Settings buttons
  const sClose = $("btn-settings-close"); if (sClose) sClose.onclick = closeSettings;
  const sSave = $("btn-settings-save"); if (sSave) sSave.onclick = saveSettingsFromUI;
  const ex = $("btn-export"); if (ex) ex.onclick = exportBackup;
  const im = $("btn-import"); if (im) im.onclick = importBackup;

  // Lock
  const unl = $("btn-unlock"); if (unl) unl.onclick = unlock;

  // Bottom bar tabs
  function setTabActive(which){
    ["tab-all","tab-important","tab-archived","tab-trash","tab-settings"].forEach(id=>{
      const el = document.getElementById(id);
      if (el) el.classList.toggle("active", id === which);
    });
  }
  const tabAll = $("tab-all");
  const tabImp = $("tab-important");
  const tabArc = $("tab-archived");
  const tabTrash = $("tab-trash");
  const tabSet = $("tab-settings");

  if (tabAll) tabAll.onclick = () => { setFilter("all"); setTabActive("tab-all"); closeCard(); };
  if (tabImp) tabImp.onclick = () => { setFilter("important"); setTabActive("tab-important"); closeCard(); };
  if (tabArc) tabArc.onclick = () => { setFilter("archived"); setTabActive("tab-archived"); closeCard(); };
  if (tabTrash) tabTrash.onclick = () => { setFilter("trash"); setTabActive("tab-trash"); closeCard(); };
  if (tabSet) tabSet.onclick = () => { setTabActive("tab-settings"); openSettings(); };

  // ESC close
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if ($("modal")?.style.display === "flex") closeModal();
      if ($("settings-modal")?.style.display === "flex") closeSettings();
    }
  });
}

/* ---------- INIT ---------- */
loadSettings();
applySettings();
loadCandidates();
normalizeCandidates();
purgeExpiredTrash();
applyI18n();
bind();
renderList();
showLockIfNeeded();
function downloadPDF() {
  const c = getSelected();
  if (!c) return;

  const content = `
שם: ${c.name}
גיל: ${c.age}
אזור: ${c.area}
רמה דתית: ${c.level}

מה עושה כרגע:
${c.doing || "-"}

אופי ותכונות:
${c.personality || "-"}

משפחה:
${c.family || "-"}

מה מחפש/ת:
${c.lookingFor || "-"}

כיסוי ראש:
${c.headCovering || "-"}
  `;

  const blob = new Blob([content], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${c.name}-resume.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}
async function exportCandidatePDF(){
  const c = getSelected();
  if (!c) return;

  // 1) בונים דף PDF "נקי" משלנו (לא כל ה-UI)
  const wrap = document.createElement("div");
  wrap.className = "pdf-sheet";

  wrap.innerHTML = `
    <div class="pdf-title">${escapeHtml(c.name || "")}</div>
    <div class="pdf-sub">${escapeHtml(c.age)} · ${escapeHtml(c.area)} · ${escapeHtml(c.level)}</div>

    <div class="pdf-block">
      <h3>${escapeHtml(t().sec.doing)}</h3>
      <div class="pdf-text">${escapeHtml(c.doing || "")}</div>
    </div>

    <div class="pdf-block">
      <h3>${escapeHtml(t().sec.personality)}</h3>
      <div class="pdf-text">${escapeHtml(c.personality || "")}</div>
    </div>

    <div class="pdf-block">
      <h3>${escapeHtml(t().sec.family)}</h3>
      <div class="pdf-text">${escapeHtml(c.family || "")}</div>
    </div>

    <div class="pdf-block">
      <h3>${escapeHtml(t().sec.looking)}</h3>
      <div class="pdf-text">${escapeHtml(c.lookingFor || "")}</div>
    </div>

    <div class="pdf-block">
      <h3>${escapeHtml(t().sec.head)}</h3>
      <div class="pdf-text">${escapeHtml(c.headCovering || "")}</div>
    </div>
  `;

  // 2) יוצרים PDF כקובץ (Blob)
  const opt = {
    margin:       10,
    filename:     `derech-hazivug-${(c.name||"candidate").replace(/\s+/g,"-")}.pdf`,
    image:        { type: "jpeg", quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: "mm", format: "a4", orientation: "portrait" }
  };

  const worker = html2pdf().set(opt).from(wrap);
  const blob = await worker.outputPdf("blob");

  // 3) ניסיון שיתוף (אם נתמך) – אחרת הורדה
  const file = new File([blob], opt.filename, { type: "application/pdf" });

  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: c.name || "PDF",
        text: "קובץ PDF לשיתוף"
      });
      return;
    } catch (e) {
      // אם המשתמש ביטל/או נכשל – נמשיך להורדה
    }
  }

  // fallback: download
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = opt.filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
function openSharePage() {
  const c = getSelected();
  if (!c) return;

  const html = `
<!DOCTYPE html>
<html lang="he">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${c.name}</title>
<style>
body{
  font-family: Arial, sans-serif;
  direction: rtl;
  background: linear-gradient(135deg,#f8fafc,#eef2ff);
  margin:0;
  padding:20px;
}
.card{
  max-width:520px;
  margin:0 auto;
  background:#fff;
  border-radius:20px;
  box-shadow:0 20px 40px rgba(0,0,0,.15);
  overflow:hidden;
}
.cover{
  height:120px;
  background: linear-gradient(135deg,#6366f1,#a78bfa);
}
.content{
  padding:20px;
}
h1{
  margin:0 0 8px;
}
.meta{
  color:#555;
  margin-bottom:16px;
}
.sec{
  margin-bottom:14px;
}
.sec b{
  display:block;
  margin-bottom:4px;
}
</style>
</head>
<body>

<div class="card">
  <div class="cover"></div>
  <div class="content">
    <h1>${c.name}</h1>
    <div class="meta">${c.age || ""} · ${c.area || ""}</div>

    <div class="sec"><b>מה עושה כרגע</b>${c.doing || ""}</div>
    <div class="sec"><b>אופי ותכונות</b>${c.personality || ""}</div>
    <div class="sec"><b>משפחה</b>${c.family || ""}</div>
    <div class="sec"><b>מה מחפש/ת</b>${c.looking || ""}</div>
  </div>
</div>

</body>
</html>
`;

  const w = window.open("", "_blank");
  if (!w) {
    alert("נא לאפשר חלונות קופצים (Pop-ups)");
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}
async function askAI() {
  const question = $("ai-question").value.trim();
  if (!question) return;

  const c = getSelected();
  if (!c) return;

  $("ai-answer").innerText = "חושב...";

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        candidate: c
      })
    });

    const data = await res.json();
    $("ai-answer").innerText = data.answer || "לא התקבלה תשובה";
  } catch (e) {
    $("ai-answer").innerText = "שגיאה בחיבור ל-AI";
  }
}
