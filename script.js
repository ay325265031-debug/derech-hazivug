/* =========================
   AI – יועץ לשדכן (נקי)
========================= */

function getSelectedCandidate() {
  if (typeof getSelected === "function") {
    return getSelected();
  }
  return window.currentCandidateForAI || null;
}

async function askAI() {
  const qEl = document.getElementById("ai-q");
  const aEl = document.getElementById("ai-a");

  if (!qEl || !aEl) return;

  const question = qEl.value.trim();
  if (!question) {
    aEl.textContent = "נא לכתוב שאלה 🙏";
    return;
  }

  const candidate = getSelectedCandidate();
  if (!candidate) {
    aEl.textContent = "לא נבחר מועמד";
    return;
  }

  aEl.textContent = "ה-AI חושב… 🤍";

  // שולחים רק מידע רלוונטי ועדין
  const safeCandidate = {
    name: candidate.name,
    age: candidate.age,
    area: candidate.area,
    level: candidate.level,
    doing: candidate.doing,
    personality: candidate.personality,
    family: candidate.family,
    lookingFor: candidate.lookingFor,
    headCovering: candidate.headCovering
  };

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        candidate: safeCandidate
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || "AI error");
    }

    aEl.textContent = data.answer || "לא התקבלה תשובה";
    qEl.value = "";
  } catch (err) {
    console.error(err);
    aEl.textContent = "יש תקלה בחיבור ל-AI. נסי שוב בעוד רגע.";
  }
}

/* ---------- Bind ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btn-ai");
  const input = document.getElementById("ai-q");

  if (btn) btn.addEventListener("click", askAI);

  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        askAI();
      }
    });
  }
});
