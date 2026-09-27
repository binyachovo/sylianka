import "@fontsource/alegreya/cyrillic-800.css";
import "@fontsource/alegreya/latin-800.css";
import "@fontsource/arsenal/cyrillic-400.css";
import "@fontsource/arsenal/latin-400.css";
import "@fontsource/arsenal/cyrillic-700.css";
import "@fontsource/arsenal/latin-700.css";
import "@fontsource/ibm-plex-mono/cyrillic-500.css";
import "@fontsource/ibm-plex-mono/latin-500.css";
import "./styles.css";

import { registerSW } from "virtual:pwa-register";
import { dbDelete, dbGet, dbGetAll, dbPut, requestPersistence } from "./db";
import { parseProjectFile, saveProjectToFile } from "./files";
import { BEAD_R, beadsPerStep, buildGeometry, mirrorKey, type Geometry } from "./geometry";
import { History, type Action } from "./history";
import { PALETTE, paletteName, paletteRank } from "./palette";
import { applyPrintLayout } from "./print";
import {
  MAX_CELLS,
  MAX_SIDE,
  blankProject,
  cloneFills,
  emptyFills,
  fitSize,
  migrateV1,
  newId,
  nextName,
  sideKey,
  type Project,
  type Side
} from "./projects";
import { initProjectsDialog } from "./projectsDialog";
import { loadSettings, saveSettings } from "./settings";
import { makeThumb } from "./thumb";
import { $, $$, clamp, num, r2 } from "./util";

registerSW({ immediate: true });

const GUT_L = 27;
const GUT_T = 20;
const PAD = 9;

const settings = loadSettings();
const ui = { erase: false, clean: false };
const history = new History(200);
let project: Project = blankProject("Трафарет 1");
let geom: Geometry | null = null;

const svg = $<SVGSVGElement>("#strip");
const copy = $<SVGSVGElement>("#strip2");
const pal = $("#palette");
const eraseBtn = $<HTMLButtonElement>("#erase");
const mirrorBtn = $<HTMLButtonElement>("#mirror");
const undoBtn = $<HTMLButtonElement>("#undo");
const redoBtn = $<HTMLButtonElement>("#redo");
const clearBtn = $<HTMLButtonElement>("#clear");
const inRows = $<HTMLInputElement>("#in-rows");
const inCols = $<HTMLInputElement>("#in-cols");
const cleanBox = $<HTMLInputElement>("#clean");
const twoBox = $<HTMLInputElement>("#two");
const twoFloat = $<HTMLInputElement>("#two-float");
const exitBtn = $<HTMLButtonElement>("#exit-clean");
const warn = $("#warn");
const pageSize = $<HTMLStyleElement>("#page-size");
const installBtn = $<HTMLButtonElement>("#install");
const nameInput = $<HTMLInputElement>("#project-name");
const saveState = $("#save-state");

let beadEls = new Map<string, SVGElement>();
const viewBoxes = { normal: "0 0 1 1", clean: "0 0 1 1" };
let cleanDims: [number, number] = [1, 1];

const fills = (): Record<string, string> => project.fills[sideKey(project.side)];

/* ---------- Автозбереження ---------- */

let saveTimer = 0;
let dirty = false;

function markDirty(): void {
  dirty = true;
  saveState.textContent = "Зберігаю…";
  saveState.classList.remove("error");
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => void flushSave(), 600);
}

async function flushSave(): Promise<void> {
  window.clearTimeout(saveTimer);
  if (!dirty) return;
  dirty = false;
  project.updatedAt = Date.now();
  if (geom) project.thumb = makeThumb(geom, fills());
  try {
    await dbPut(project);
    if (!dirty) saveState.textContent = "Збережено";
  } catch {
    dirty = true;
    saveState.textContent = "Не вдалося зберегти";
    saveState.classList.add("error");
  }
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") void flushSave();
});
window.addEventListener("pagehide", () => void flushSave());

/* ---------- Малювання сітки ---------- */

function render(): void {
  geom = buildGeometry(project.cols, project.rows, project.side);
  const { H, width: W, height: HT } = geom;
  const vb = [-GUT_L, -GUT_T, W + GUT_L + PAD, HT + GUT_T + PAD];
  const e = BEAD_R + 1;
  const vbc = [-e, -e, W + 2 * e, HT + 2 * e];
  viewBoxes.normal = vb.map(r2).join(" ");
  viewBoxes.clean = vbc.map(r2).join(" ");
  cleanDims = [vbc[2], vbc[3]];

  const f = fills();
  const parts: string[] = [];
  let d = "";
  for (const s of geom.segs) d += `M${r2(s[0] * H)} ${r2(s[1] * H)}L${r2(s[2] * H)} ${r2(s[3] * H)}`;
  parts.push(`<path class="thread" d="${d}"/>`);
  const axisY = r2(project.rows * H);
  parts.push(`<line class="axis" x1="-6" y1="${axisY}" x2="${r2(W + 6)}" y2="${axisY}"/>`);

  const colEvery = project.cols > 40 ? 5 : 1;
  const rowEvery = project.rows > 40 ? 5 : 1;
  for (let i = 0; i < project.cols; i++) {
    const label = i + 1;
    if (colEvery === 1 || label === 1 || label % colEvery === 0) {
      parts.push(`<text class="lc" x="${r2((2 * i + 1) * H)}" y="-8" text-anchor="middle">${label}</text>`);
    }
  }
  for (let r = 0; r < project.rows; r++) {
    const label = r + 1;
    if (rowEvery === 1 || label === 1 || label % rowEvery === 0) {
      parts.push(
        `<text class="lr" x="-7.5" y="${r2((2 * r + 1) * H)}" text-anchor="end" dominant-baseline="central">${label}</text>`
      );
    }
  }
  for (const b of geom.beads) {
    const c = f[b.k];
    parts.push(
      `<circle class="bd" data-k="${b.k}" cx="${r2(b.x)}" cy="${r2(b.y)}" r="${BEAD_R}"${c ? ` style="fill:${c}"` : ""}/>`
    );
  }

  svg.setAttribute("viewBox", ui.clean ? viewBoxes.clean : viewBoxes.normal);
  svg.style.minWidth = `${Math.round(vb[2] * 1.2)}px`;
  svg.style.maxWidth = `${Math.round(vb[2] * 3)}px`;
  svg.innerHTML = parts.join("");
  svg.setAttribute("aria-label", `Сітка силянки: ${project.rows} у висоту, ${project.cols} у ширину`);

  beadEls = new Map();
  for (const el of $$<SVGElement>(".bd", svg)) beadEls.set(el.getAttribute("data-k") ?? "", el);

  syncTools();
  updateMeta();
  updateStats();
  printLayout();
}

function printLayout(): void {
  applyPrintLayout(cleanDims[0], cleanDims[1], settings.two ? 2 : 1, pageSize);
}

function syncCopy(): void {
  if (!ui.clean || !settings.two) return;
  copy.setAttribute("viewBox", viewBoxes.clean);
  copy.innerHTML = svg.innerHTML;
}

function updateMeta(): void {
  $("#meta").textContent = `${project.rows}-рядна силянка · ${project.side} бісерини в комірці`;
  inRows.value = String(project.rows);
  inCols.value = String(project.cols);
  for (const b of $$<HTMLButtonElement>("button[data-s]")) {
    b.setAttribute("aria-pressed", String(Number(b.dataset.s) === project.side));
  }
}

/* ---------- Підрахунок ---------- */

function addCountRow(ul: HTMLElement, color: string | null, name: string, count: number): void {
  const li = document.createElement("li");
  const chip = document.createElement("span");
  chip.className = color ? "chip" : "chip chip-empty";
  if (color) chip.style.setProperty("--c", color);
  const nm = document.createElement("span");
  nm.textContent = name;
  const n = document.createElement("span");
  n.className = "n";
  n.textContent = num(count);
  li.append(chip, nm, n);
  ul.append(li);
}

function updateStats(): void {
  const f = fills();
  const counts = new Map<string, number>();
  let empty = 0;
  for (const k of beadEls.keys()) {
    const c = f[k];
    if (c) counts.set(c, (counts.get(c) ?? 0) + 1);
    else empty++;
  }
  $("#st-total").textContent = num(beadEls.size);
  $("#st-step").textContent = num(beadsPerStep(project.rows, project.side));

  const used = Array.from(counts.keys()).sort((a, b) => paletteRank(a) - paletteRank(b) || a.localeCompare(b));
  const ul = $("#st-colors");
  ul.textContent = "";
  for (const c of used) addCountRow(ul, c, paletteName(c) ?? `Свій ${c.toLowerCase()}`, counts.get(c) ?? 0);
  addCountRow(ul, null, "Не зафарбовано", empty);
  syncCopy();
}

let statsQueued = false;
function scheduleStats(): void {
  if (statsQueued) return;
  statsQueued = true;
  requestAnimationFrame(() => {
    statsQueued = false;
    updateStats();
  });
}

/* ---------- Палітра й інструменти ---------- */

for (const p of PALETTE) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "sw";
  b.dataset.c = p.hex;
  b.title = p.name;
  b.setAttribute("aria-label", p.name);
  b.setAttribute("aria-pressed", "false");
  b.innerHTML = `<span class="chip" style="--c:${p.hex}"></span>`;
  pal.append(b);
}
const custom = document.createElement("label");
custom.className = "sw sw-custom";
custom.title = "Свій колір";
custom.innerHTML =
  '<span class="chip" id="custom-chip"></span><input type="color" id="custom-color" value="#8e5ac8" aria-label="Свій колір">';
pal.append(custom);
const customInput = $<HTMLInputElement>("#custom-color");
const customChip = $("#custom-chip");
customChip.style.setProperty("--c", customInput.value);

function syncTools(): void {
  const named = paletteName(settings.color);
  for (const b of $$<HTMLButtonElement>("button.sw", pal)) {
    b.setAttribute("aria-pressed", String(!ui.erase && b.dataset.c === settings.color));
  }
  custom.classList.toggle("on", !ui.erase && !named);
  if (!named) {
    customInput.value = settings.color.toLowerCase();
    customChip.style.setProperty("--c", settings.color);
  }
  eraseBtn.setAttribute("aria-pressed", String(ui.erase));
  mirrorBtn.setAttribute("aria-pressed", String(settings.mirror));
  svg.classList.toggle("erasing", ui.erase);
  svg.classList.toggle("mirror-on", settings.mirror);
  $("#cur-name").textContent = ui.erase ? "гумка" : (named ?? "свій").toLowerCase();
}

function selectColor(c: string): void {
  settings.color = c.toUpperCase();
  ui.erase = false;
  syncTools();
  saveSettings(settings);
}

pal.addEventListener("click", (e) => {
  const b = (e.target as Element).closest<HTMLButtonElement>("button.sw");
  if (b?.dataset.c) selectColor(b.dataset.c);
});
customInput.addEventListener("input", () => selectColor(customInput.value));
customInput.addEventListener("click", () => selectColor(customInput.value));

eraseBtn.addEventListener("click", () => {
  ui.erase = !ui.erase;
  syncTools();
});
mirrorBtn.addEventListener("click", () => {
  settings.mirror = !settings.mirror;
  syncTools();
  saveSettings(settings);
});

/* ---------- Фарбування ---------- */

let stroke: Map<string, [string | undefined, string | undefined]> | null = null;

function beginStroke(): void {
  stroke = new Map();
}

function endStroke(): void {
  if (!stroke) return;
  const changes = new Map([...stroke].filter(([, [before, after]]) => before !== after));
  stroke = null;
  if (changes.size === 0) return;
  history.push({ kind: "paint", side: sideKey(project.side), changes });
  syncHistory();
  markDirty();
}

function modeFor(k: string): string | null {
  if (ui.erase) return null;
  return fills()[k] === settings.color ? null : settings.color;
}

function setBead(k: string, c: string | null): void {
  const f = fills();
  const before = f[k];
  const after = c ?? undefined;
  if (before === after) return;
  if (after) f[k] = after;
  else delete f[k];
  if (stroke) {
    const rec = stroke.get(k);
    if (rec) rec[1] = after;
    else stroke.set(k, [before, after]);
  }
  const el = beadEls.get(k);
  if (el) el.style.fill = after ?? "";
}

function paint(k: string, c: string | null): void {
  setBead(k, c);
  if (settings.mirror) {
    const mk = mirrorKey(k, project.rows);
    if (mk !== k && beadEls.has(mk)) setBead(mk, c);
  }
  scheduleStats();
}

const beadKey = (target: EventTarget | null): string | null =>
  (target as Element | null)?.closest?.(".bd")?.getAttribute("data-k") ?? null;

let painting: { mode: string | null } | null = null;
let lastPointer = "";

svg.addEventListener("pointerdown", (e) => {
  lastPointer = e.pointerType;
  if (e.pointerType !== "mouse" || e.button !== 0) return;
  const k = beadKey(e.target);
  if (!k) return;
  e.preventDefault();
  painting = { mode: modeFor(k) };
  beginStroke();
  paint(k, painting.mode);
});
svg.addEventListener("pointerover", (e) => {
  if (!painting) return;
  const k = beadKey(e.target);
  if (k) paint(k, painting.mode);
});
const stopPainting = (): void => {
  if (!painting) return;
  painting = null;
  endStroke();
};
window.addEventListener("pointerup", stopPainting);
window.addEventListener("pointercancel", stopPainting);
svg.addEventListener("click", (e) => {
  if (lastPointer === "mouse") return;
  const k = beadKey(e.target);
  if (!k) return;
  beginStroke();
  paint(k, modeFor(k));
  endStroke();
});

/* ---------- Скасувати / повторити ---------- */

function syncHistory(): void {
  undoBtn.disabled = !history.canUndo;
  redoBtn.disabled = !history.canRedo;
}

function applyAction(a: Action, useBefore: boolean): void {
  switch (a.kind) {
    case "paint": {
      const f = project.fills[a.side];
      const visible = a.side === sideKey(project.side);
      for (const [k, [before, after]] of a.changes) {
        const v = useBefore ? before : after;
        if (v) f[k] = v;
        else delete f[k];
        if (visible) {
          const el = beadEls.get(k);
          if (el) el.style.fill = v ?? "";
        }
      }
      scheduleStats();
      break;
    }
    case "size": {
      const [rows, cols] = useBefore ? a.before : a.after;
      project.rows = rows;
      project.cols = cols;
      render();
      break;
    }
    case "side":
      project.side = useBefore ? a.before : a.after;
      render();
      break;
    case "clear":
      project.fills = cloneFills(useBefore ? a.before : a.after);
      render();
      break;
  }
  syncHistory();
  markDirty();
}

function undo(): void {
  if (painting) stopPainting();
  const a = history.undo();
  if (a) applyAction(a, true);
}

function redo(): void {
  if (painting) stopPainting();
  const a = history.redo();
  if (a) applyAction(a, false);
}

undoBtn.addEventListener("click", undo);
redoBtn.addEventListener("click", redo);

document.addEventListener("keydown", (e) => {
  if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
  const t = e.target as HTMLElement | null;
  if (t?.closest("input[type=text], input[type=number], textarea, [contenteditable=true]")) return;
  if ($<HTMLDialogElement>("#projects-dlg").open) return;
  // e.code не залежить від розкладки, тож Ctrl+Z працює й з українською.
  if (e.code === "KeyZ" && !e.shiftKey) {
    e.preventDefault();
    undo();
  } else if (e.code === "KeyY" || (e.code === "KeyZ" && e.shiftKey)) {
    e.preventDefault();
    redo();
  }
});

/* ---------- Розмір і сторона ромба ---------- */

let warnTimer = 0;
function setSize(name: "rows" | "cols", raw: string | number): void {
  let v = Math.round(Number(raw));
  if (!Number.isFinite(v)) v = project[name];
  const other = name === "rows" ? project.cols : project.rows;
  const cap = Math.min(MAX_SIDE, Math.floor(MAX_CELLS / other));
  const next = clamp(v, 1, cap);
  if (next < v) {
    warn.hidden = false;
    window.clearTimeout(warnTimer);
    warnTimer = window.setTimeout(() => {
      warn.hidden = true;
    }, 7000);
  }
  if (next === project[name]) {
    updateMeta();
    return;
  }
  const before: [number, number] = [project.rows, project.cols];
  project[name] = next;
  history.push({ kind: "size", before, after: [project.rows, project.cols] });
  render();
  syncHistory();
  markDirty();
}

for (const b of $$<HTMLButtonElement>("[data-step]")) {
  b.addEventListener("click", () => {
    const p = b.dataset.step === "rows" ? "rows" : "cols";
    setSize(p, project[p] + Number(b.dataset.d));
  });
}
inRows.addEventListener("change", () => setSize("rows", inRows.value));
inCols.addEventListener("change", () => setSize("cols", inCols.value));
for (const b of $$<HTMLButtonElement>("button[data-s]")) {
  b.addEventListener("click", () => {
    const next: Side = Number(b.dataset.s) === 4 ? 4 : 3;
    if (next === project.side) return;
    history.push({ kind: "side", before: project.side, after: next });
    project.side = next;
    render();
    syncHistory();
    markDirty();
  });
}

/* ---------- Друк ---------- */

function setClean(on: boolean): void {
  ui.clean = on;
  cleanBox.checked = on;
  document.body.classList.toggle("clean", on);
  svg.setAttribute("viewBox", on ? viewBoxes.clean : viewBoxes.normal);
  syncCopy();
  if (on) window.scrollTo(0, 0);
}

function setTwo(on: boolean): void {
  settings.two = on;
  twoBox.checked = on;
  twoFloat.checked = on;
  document.body.classList.toggle("two", on);
  printLayout();
  syncCopy();
  saveSettings(settings);
}

cleanBox.addEventListener("change", () => setClean(cleanBox.checked));
twoBox.addEventListener("change", () => setTwo(twoBox.checked));
twoFloat.addEventListener("change", () => setTwo(twoFloat.checked));
exitBtn.addEventListener("click", () => {
  setClean(false);
  cleanBox.focus();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && ui.clean) setClean(false);
});

/* ---------- Стерти все (з підтвердженням на сторінці) ---------- */

let armTimer = 0;
function disarm(): void {
  window.clearTimeout(armTimer);
  clearBtn.classList.remove("armed");
  clearBtn.textContent = "Стерти все";
}
clearBtn.addEventListener("click", () => {
  if (!clearBtn.classList.contains("armed")) {
    clearBtn.classList.add("armed");
    clearBtn.textContent = "Натисніть ще раз, щоб стерти";
    armTimer = window.setTimeout(disarm, 3500);
    return;
  }
  disarm();
  const before = cloneFills(project.fills);
  if (Object.keys(before["3"]).length === 0 && Object.keys(before["4"]).length === 0) return;
  history.push({ kind: "clear", before, after: emptyFills() });
  project.fills = emptyFills();
  render();
  syncHistory();
  markDirty();
});

/* ---------- Трафарети ---------- */

function showProjectName(): void {
  nameInput.value = project.name;
  document.title = `${project.name} — Трафарет силянки`;
}

nameInput.addEventListener("change", () => {
  const v = nameInput.value.trim().slice(0, 80);
  if (v && v !== project.name) {
    project.name = v;
    markDirty();
  }
  showProjectName();
});
nameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") nameInput.blur();
  if (e.key === "Escape") {
    nameInput.value = project.name;
    nameInput.blur();
  }
});

async function openProject(p: Project): Promise<void> {
  await flushSave();
  if (painting) stopPainting();
  project = p;
  fitSize(project);
  history.clear();
  settings.lastProjectId = p.id;
  saveSettings(settings);
  showProjectName();
  render();
  syncHistory();
  saveState.textContent = "Збережено";
  saveState.classList.remove("error");
  // Новий чи відкритий з файлу трафарет ще не має мініатюри для списку.
  if (!project.thumb) markDirty();
}

async function allProjects(): Promise<Project[]> {
  await flushSave();
  return dbGetAll();
}

async function createProject(): Promise<void> {
  const names = (await allProjects()).map((p) => p.name);
  const p = blankProject(nextName(names));
  await dbPut(p);
  await openProject(p);
}

const dialog = initProjectsDialog({
  currentId: () => project.id,
  list: allProjects,
  async open(id) {
    const p = await dbGet(id);
    if (p) await openProject(p);
  },
  create: createProject,
  async duplicate(id) {
    const src = id === project.id ? project : await dbGet(id);
    if (!src) return;
    const now = Date.now();
    const copyP: Project = {
      ...src,
      id: newId(),
      name: `${src.name} (копія)`.slice(0, 80),
      fills: cloneFills(src.fills),
      createdAt: now,
      updatedAt: now
    };
    await dbPut(copyP);
  },
  async remove(id) {
    await dbDelete(id);
    if (id !== project.id) return;
    dirty = false;
    const rest = (await dbGetAll()).sort((a, b) => b.updatedAt - a.updatedAt);
    if (rest.length > 0) await openProject(rest[0]);
    else await createProject();
  },
  async exportFile(id) {
    const p = id === project.id ? project : await dbGet(id);
    if (p) await saveProjectToFile(p);
  },
  async importFile(file) {
    const data = parseProjectFile(await file.text(), file.name);
    const p: Project = { ...blankProject(data.name), ...data };
    await dbPut(p);
    await openProject(p);
  }
});

$("#open-projects").addEventListener("click", () => void dialog.open());
$("#export-project").addEventListener("click", async () => {
  await flushSave();
  await saveProjectToFile(project);
});

/* ---------- Встановлення як програми ---------- */

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
let installPrompt: BeforeInstallPromptEvent | null = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  installPrompt = e as BeforeInstallPromptEvent;
  installBtn.hidden = false;
});
installBtn.addEventListener("click", async () => {
  if (!installPrompt) return;
  await installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt = null;
  installBtn.hidden = true;
});
window.addEventListener("appinstalled", () => {
  installBtn.hidden = true;
});

/* ---------- Старт ---------- */

async function start(): Promise<void> {
  twoBox.checked = settings.two;
  twoFloat.checked = settings.two;
  document.body.classList.toggle("two", settings.two);

  let list: Project[] = [];
  try {
    list = await dbGetAll();
  } catch {
    saveState.textContent = "Сховище недоступне: зміни не збережуться";
    saveState.classList.add("error");
  }

  if (list.length === 0) {
    const migrated = migrateV1();
    const first = migrated?.project ?? blankProject("Трафарет 1");
    if (migrated) {
      if (migrated.color) settings.color = migrated.color;
      if (migrated.mirror !== undefined) settings.mirror = migrated.mirror;
      if (migrated.two !== undefined) {
        settings.two = migrated.two;
        twoBox.checked = twoFloat.checked = settings.two;
        document.body.classList.toggle("two", settings.two);
      }
    }
    try {
      await dbPut(first);
    } catch {
      // покажемо трафарет навіть без сховища
    }
    list = [first];
  }

  const target =
    list.find((p) => p.id === settings.lastProjectId) ?? [...list].sort((a, b) => b.updatedAt - a.updatedAt)[0];
  await openProject(target);
  void requestPersistence();
}

void start();
