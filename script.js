/* =========================
   דרך הזיווג – Script v7
   גרסה יציבה + AI אמיתי
========================= */

const STORAGE_KEY = "dz_candidates_v7";

let state = {
  selectedId: null,
  candidates: []
};

/* ---------- helpers ---------- */
const $ = (id) => document.getElementById(id);
const uid = () => Math.random().toString(16).slice(2) + Date.now().toString(16);

/* ---------- load / save ---------- */
function loadCandidates() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    state.candidates = raw ? JSON.parse(raw) : [];
  } catch {
    state.candidates = [];
  }
}

function saveCandidates() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.candidates));
}

/* ---------- list ---------- */
function renderList() {
  const list = $("list");
  if (!list) return;

  list.innerHTML = "";
  state.candidates.forEach(c => {
    const row = document.createElement("div");
    row.className = "item";
    row.textContent = c.name;
    row.onclick = () => openCard(c.id);
    list.appendChild(row);
  });
}

/* ---------- card ---------- */
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

function getSelected() {
  return state.candidates.find(c => c.id === state.selectedId);
}

function renderCard() {
  const c = getSelected();
  if (!c) return;

  $("card-name").textContent = c.name;
  $("card-age").textContent = c.age;
  $("card-area").textContent = c.area;
  $("card-level").textContent = c.level;

  // reset AI
  $("ai-q").value = "";
  $("ai-a").textContent = "";
}

/* ---------- add candidate ---------- */
function addCandidate() {
  const name = $("f-name").value.trim();
  const age = $("f-age").value.trim();
  const area = $("f-area").value.trim();
  const level = $("f-level").value.trim();

  if (!name || !age || !area || !level) {
    alert("חובה למלא שם, גיל, אזור ורמה דתית");
    return;
  }

  state.candidates.unshift({
    id: uid(),
    name,
    age,
    area,
    level
  });

  saveCandidates();
  renderList();
  closeModal();
}

/* ---------- modal ---------- */
function openModal() {
  $("modal").style.display = "flex";
}
function closeModal() {
  $("modal").style.display = "none";
}

/* ---------- AI ---------- */
async function askAI() {
  const qEl = $("ai-q");
  const aEl = $("ai-a");
  const c = getSelected();

  if (!qEl || !aEl || !c) return;

  const question = qEl.value.trim();
  if (!question) {
    aEl.textContent = "נא לכתוב שאלה";
    return;
  }

  aEl.textContent = "ה-AI חושב… 🤍";

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        candidate: {
          name: c.name,
          age: c.age,
          area: c.area,
          level: c.level
        }
      })
    });

    const data = await res.json();
    aEl.textContent = data.answer || "לא התקבלה תשובה";
  } catch (e) {
    aEl.textContent = "שגיאה בחיבור ל-AI";
    console.error(e);
  }
}

/* ---------- bind ---------- */
function bind() {
  $("btn-add")?.addEventListener("click", openModal);
  $("btn-save")?.addEventListener("click", addCandidate);
  $("btn-cancel")?.addEventListener("click", closeModal);
  $("btn-back")?.addEventListener("click", closeCard);
  $("btn-ai")?.addEventListener("click", askAI);

  $("ai-q")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askAI();
    }
  });
}

/* ---------- init ---------- */
loadCandidates();
renderList();
bind();
