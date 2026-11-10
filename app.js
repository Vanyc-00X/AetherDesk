const TOTAL = 25 * 60;
let remaining = TOTAL;
let running = false;
let timerId = null;
let sessions = 0;

const notes = [
  { id: 1, title: "Главный фокус", body: "Довести демо RemoteForge до кликабельного состояния", x: 40, y: 50, color: "#d7ffe8" },
  { id: 2, title: "Идея", body: "AetherDesk = focus OS без шума уведомлений", x: 260, y: 120, color: "#dff1ff" },
  { id: 3, title: "Не сейчас", body: "Отложить рефакторинг до пятницы", x: 120, y: 260, color: "#ffe8c8" },
];

const tasks = [
  { id: 1, text: "Собрать 5 продуктовых UI", done: true },
  { id: 2, text: "Проверить адаптив на мобиле", done: false },
  { id: 3, text: "Написать README с запуском", done: false },
  { id: 4, text: "Сделать 2–3 motion-эффекта", done: false },
];

const ritual = [
  { title: "Разогрев", text: "5 минут без экрана, вода, одно намерение" },
  { title: "Deep block", text: "25×2 фокус-кольца, без чатов" },
  { title: "Review", text: "3 пункта done / 1 next" },
];

const sounds = {
  rain: "Rain on glass",
  cafe: "Quiet café murmur",
  forest: "Pine wind & birds",
  fire: "Soft hearth crackle",
};

function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => (el.hidden = true), 2200);
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function renderClock() {
  const now = new Date();
  document.getElementById("clock").textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  document.getElementById("date").textContent = now.toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function renderTimer() {
  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  document.getElementById("timer").textContent = `${pad(m)}:${pad(s)}`;
  const offset = 603 - 603 * (remaining / TOTAL);
  document.getElementById("timerArc").style.strokeDashoffset = String(offset);
}

function renderDots() {
  document.getElementById("sessionDots").innerHTML = Array.from({ length: 8 }, (_, i) =>
    `<i class="${i < sessions ? "on" : ""}"></i>`
  ).join("");
}

function tick() {
  if (!running) return;
  remaining -= 1;
  if (remaining <= 0) {
    remaining = 0;
    running = false;
    sessions = Math.min(8, sessions + 1);
    renderDots();
    toast("Фокус завершён. Можно короткий recover.");
    clearInterval(timerId);
  }
  renderTimer();
}

function startFocus() {
  if (running) return;
  if (remaining === 0) remaining = TOTAL;
  running = true;
  clearInterval(timerId);
  timerId = setInterval(tick, 1000);
  document.getElementById("eq").classList.add("playing");
  toast("Deep work начат");
}

function renderNotes() {
  const canvas = document.getElementById("noteCanvas");
  canvas.innerHTML = notes
    .map(
      (n) => `<article class="note" data-id="${n.id}" style="left:${n.x}px;top:${n.y}px;background:${n.color}">
        <button class="x" data-del="${n.id}">×</button>
        <h3>${n.title}</h3>
        <p>${n.body}</p>
      </article>`
    )
    .join("");

  canvas.querySelectorAll(".note").forEach((el) => {
    el.addEventListener("pointerdown", (e) => {
      if (e.target.dataset.del) return;
      const id = Number(el.dataset.id);
      const note = notes.find((n) => n.id === id);
      const startX = e.clientX;
      const startY = e.clientY;
      const origX = note.x;
      const origY = note.y;
      const move = (ev) => {
        note.x = Math.max(8, origX + (ev.clientX - startX));
        note.y = Math.max(8, origY + (ev.clientY - startY));
        el.style.left = `${note.x}px`;
        el.style.top = `${note.y}px`;
      };
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    });
  });

  canvas.querySelectorAll("[data-del]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = Number(btn.dataset.del);
      const idx = notes.findIndex((n) => n.id === id);
      if (idx >= 0) notes.splice(idx, 1);
      renderNotes();
    });
  });
}

function renderTasks() {
  document.getElementById("taskList").innerHTML = tasks
    .map(
      (t) => `<li class="${t.done ? "done" : ""}">
        <input type="checkbox" data-id="${t.id}" ${t.done ? "checked" : ""} />
        <span>${t.text}</span>
      </li>`
    )
    .join("");
  document.querySelectorAll("#taskList input").forEach((input) => {
    input.addEventListener("change", () => {
      const t = tasks.find((x) => x.id === Number(input.dataset.id));
      t.done = input.checked;
      renderTasks();
    });
  });
}

function renderRitual() {
  document.getElementById("ritual").innerHTML = ritual
    .map((r) => `<li><strong>${r.title}</strong> — ${r.text}</li>`)
    .join("");
}

function renderEq() {
  document.getElementById("eq").innerHTML = Array.from({ length: 16 }, (_, i) =>
    `<span style="animation-delay:${i * 0.07}s;height:${20 + Math.random() * 70}%"></span>`
  ).join("");
}

function setScene(name) {
  document.body.className = name === "deep" ? "" : `scene-${name}`;
  document.querySelectorAll(".dock button").forEach((b) => b.classList.toggle("active", b.dataset.scene === name));
  const labels = { deep: "Deep Work", create: "Create", recover: "Recover", plan: "Plan" };
  document.getElementById("sceneBtn").textContent = `Сцена: ${labels[name]}`;
  document.getElementById("phase").textContent = labels[name];
  toast(`Сцена «${labels[name]}»`);
}

document.getElementById("startFocus").addEventListener("click", startFocus);
document.getElementById("pauseBtn").addEventListener("click", () => {
  running = false;
  clearInterval(timerId);
  document.getElementById("eq").classList.remove("playing");
  toast("Пауза");
});
document.getElementById("resetBtn").addEventListener("click", () => {
  running = false;
  clearInterval(timerId);
  remaining = TOTAL;
  renderTimer();
  document.getElementById("phase").textContent = "Deep work";
});
document.getElementById("breakBtn").addEventListener("click", () => {
  remaining = 5 * 60;
  document.getElementById("phase").textContent = "Recover";
  renderTimer();
  startFocus();
});

document.getElementById("addNote").addEventListener("click", () => {
  notes.push({
    id: Date.now(),
    title: "Новая заметка",
    body: "Перетащи куда нужно",
    x: 80 + Math.random() * 200,
    y: 80 + Math.random() * 180,
    color: ["#d7ffe8", "#dff1ff", "#ffe8c8", "#f0e0ff"][Math.floor(Math.random() * 4)],
  });
  renderNotes();
});

document.getElementById("addTask").addEventListener("click", () => {
  const text = prompt("Новая задача");
  if (!text) return;
  tasks.unshift({ id: Date.now(), text, done: false });
  renderTasks();
});

document.querySelectorAll(".sound").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".sound").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("soundTitle").textContent = sounds[btn.dataset.sound];
    document.getElementById("eq").classList.add("playing");
    toast(`Soundscape: ${sounds[btn.dataset.sound]}`);
  });
});

document.getElementById("sceneBtn").addEventListener("click", () => setScene("create"));
document.querySelectorAll(".dock button").forEach((btn) => {
  btn.addEventListener("click", () => setScene(btn.dataset.scene));
});

renderClock();
setInterval(renderClock, 1000);
renderTimer();
renderDots();
renderNotes();
renderTasks();
renderRitual();
renderEq();
setScene("deep");
