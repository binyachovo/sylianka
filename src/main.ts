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
import { initCatalogDialog } from "./catalogDialog";
import {
  adoptCustomColors,
  colorTitle,
  colorView,
  customColors,
  fullLabel,
  hexOf,
  loadCustomColors,
  onCustomsChange
} from "./colors";
import { dbDelete, dbGet, dbGetAll, dbPut, requestPersistence, setBlockedHandler } from "./db";
import { parseProjectFile, saveProjectToFile } from "./files";
import { BEAD_R, beadsPerStep, buildGeometry, mirrorKey, type Geometry } from "./geometry";
import { History, type Action } from "./history";
import { convertHexFills } from "./legacy";
import { applyPrintLayout } from "./print";
import {
  MAX_CELLS,
  MAX_PALETTE,
  MAX_SIDE,
  blankProject,
  cloneFills,
  emptyFills,
  emptyWoven,
  ensureWoven,
  fitSize,
  forgetV1,
  isLegacyProject,
  migrateV1,
  newId,
  nextName,
  sideKey,
  type Project,
  type Side
} from "./projects";
import { initProjectsDialog } from "./projectsDialog";
import { legacyBrushHex, loadSettings, rememberRecent, saveSettings } from "./settings";
import { makeThumb } from "./thumb";
import { initBeadTooltip } from "./tooltip";
import { $, $$, clamp, esc, num, r2 } from "./util";
import { Weave } from "./weave";

registerSW({ immediate: true });

const GUT_L = 27;
const GUT_T = 20;
const PAD = 9;

const settings = loadSettings();
const ui = { erase: false, clean: false };
const history = new History(200);
let project: Project = blankProject("Трафарет 1");
let geom: Geometry | null = null;
/** Стає true, коли відкрито перший трафарет. */
let ready = false;

const svg = $<SVGSVGElement>("#strip");
const copy = $<SVGSVGElement>("#strip2");
const pal = $("#palette");
const eraseBtn = $<HTMLButtonElement>("#erase");
const mirrorBtn = $<HTMLButtonElement>("#mirror");
const undoBtns = $$<HTMLButtonElement>("[data-undo]");
const redoBtns = $$<HTMLButtonElement>("[data-redo]");
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
const countsList = $("#st-colors");
const modeDraw = $<HTMLButtonElement>("#mode-draw");
const modeWeave = $<HTMLButtonElement>("#mode-weave");
const barDraw = $("#bar-draw");
const barWeave = $("#bar-weave");
const wvCount = $("#wv-count");
const wvPct = $("#wv-pct");
const wvBar = $("#wv-bar");
const wvLast = $("#wv-last");
const wvFind = $<HTMLButtonElement>("#wv-find");
const wvReset = $<HTMLButtonElement>("#wv-reset");
const wvDim = $<HTMLInputElement>("#wv-dim");

let beadEls = new Map<string, SVGElement>();
const viewBoxes = { normal: "0 0 1 1", clean: "0 0 1 1" };
let cleanDims: [number, number] = [1, 1];

const fills = (): Record<string, string> => project.fills[sideKey(project.side)];
/** Позначки плетіння поточної сітки (3 чи 4 бісерини на сторону). */
const weave = new Weave();
const wovenList = (): string[] => project.woven[sideKey(project.side)];

/** Приглушувати нанизані бісерини (режим плетіння з галочкою, не під час друку). */
let fadeDone = false;
const EMPTY_FILL = "#EEF0EB";
const fadeCache = new Map<string, string>();

/** Колір, змішаний з білим: так нанизані бісерини відступають на задній план, а нитки під ними не просвічують. */
function fade(hex: string): string {
  let out = fadeCache.get(hex);
  if (!out) {
    const mix = (i: number): string =>
      Math.round(parseInt(hex.slice(i, i + 2), 16) * 0.3 + 255 * 0.7)
        .toString(16)
        .padStart(2, "0");
    out = `#${mix(1)}${mix(3)}${mix(5)}`;
    fadeCache.set(hex, out);
  }
  return out;
}

/** Заливка бісерини з урахуванням приглушення нанизаних ("" — типова заливка з CSS). */
function fillFor(k: string): string {
  const id = fills()[k];
  if (fadeDone && k !== weave.last && weave.has(k)) return fade(id ? hexOf(id) : EMPTY_FILL);
  return id ? hexOf(id) : "";
}

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
  if (geom) {
    project.thumb = makeThumb(geom, fills(), hexOf);
    project.progress = { done: weave.done, total: geom.beads.length };
  }
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

/* ---------- Повідомлення під панеллю ---------- */

let warnTimer = 0;
function showWarn(text: string, ms = 7000): void {
  warn.textContent = text;
  warn.hidden = false;
  window.clearTimeout(warnTimer);
  warnTimer = window.setTimeout(() => {
    warn.hidden = true;
  }, ms);
}

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

  const existing = new Set(geom.beads.map((b) => b.k));
  weave.bind(wovenList(), (k) => existing.has(k));
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
    const cls = weave.has(b.k) ? (b.k === weave.last ? "bd done last" : "bd done") : "bd";
    const fill = fillFor(b.k);
    parts.push(
      `<circle class="${cls}" data-k="${b.k}" cx="${r2(b.x)}" cy="${r2(b.y)}" r="${BEAD_R}"${fill ? ` style="fill:${fill}"` : ""}/>`
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
  updateWeaveInfo();
  printLayout();
}

/** Перефарбовує бісерини без перебудови сітки (коли змінився відтінок свого кольору). */
function repaintBeads(): void {
  const f = fills();
  for (const [k, el] of beadEls) el.style.fill = fillFor(k);
  syncCopy();
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

/* ---------- Підрахунок бісеру ---------- */

/** Нанизано з кількох — для режиму плетіння. */
function progressCell(done: number, count: number): string {
  const pct = count ? (done / count) * 100 : 0;
  return (
    `<span class="cnt-act cnt-prog" title="Нанизано ${num(done)} з ${num(count)}">` +
    `<span class="progress"><i style="width:${r2(pct)}%"></i></span>` +
    `<span class="cnt-prog-n">${num(done)} з ${num(count)}</span></span>`
  );
}

function countRow(id: string | null, count: number, done: number): string {
  if (!id) {
    if (settings.weave) {
      return (
        `<li class="cnt cnt-empty"><span class="chip chip-empty"></span><span class="cnt-code"></span>` +
        `<span class="cnt-name">Не зафарбовано</span><span class="n">${num(count)}</span>${progressCell(done, count)}</li>`
      );
    }
    const canFill = count > 0 && !!settings.color;
    const cur = settings.color ? colorView(settings.color) : null;
    return (
      `<li class="cnt cnt-empty"><span class="chip chip-empty"></span><span class="cnt-code"></span>` +
      `<span class="cnt-name">Не зафарбовано</span><span class="n">${num(count)}</span>` +
      `<span class="cnt-act"><button type="button" class="tbtn small" data-fill-empty${canFill ? "" : " disabled"}` +
      ` title="${cur ? esc(`Зафарбувати всі порожні бісерини кольором ${fullLabel(cur)}`) : "Спершу виберіть колір"}">` +
      `Залити поточним кольором</button></span></li>`
    );
  }
  const v = colorView(id);
  const others = project.palette.filter((x) => x !== id);
  const options = others
    .map((x) => `<option value="${esc(x)}">${esc(fullLabel(colorView(x)))}</option>`)
    .join("");
  return (
    `<li class="cnt" title="${esc(colorTitle(v))}"><span class="chip" style="--c:${v.hex}"></span>` +
    `<span class="cnt-code">${esc(v.code)}</span><span class="cnt-name">${esc(v.name)}</span>` +
    `<span class="n">${num(count)}</span>` +
    (settings.weave
      ? progressCell(done, count)
      : `<span class="cnt-act"><select class="cnt-replace" data-replace="${esc(id)}" aria-label="Замінити ${esc(fullLabel(v))} на інший колір"${others.length ? "" : " disabled"}>` +
        `<option value="">Замінити на…</option>${options}</select></span>`) +
    `</li>`
  );
}

function updateStats(): void {
  const f = fills();
  const counts = new Map<string, number>();
  const done = new Map<string, number>();
  let empty = 0;
  let emptyDone = 0;
  for (const k of beadEls.keys()) {
    const id = f[k];
    const strung = weave.has(k);
    if (id) {
      counts.set(id, (counts.get(id) ?? 0) + 1);
      if (strung) done.set(id, (done.get(id) ?? 0) + 1);
    } else {
      empty++;
      if (strung) emptyDone++;
    }
  }
  $("#st-total").textContent = num(beadEls.size);
  $("#st-step").textContent = num(beadsPerStep(project.rows, project.side));

  const order = new Map(project.palette.map((id, i) => [id, i]));
  const used = Array.from(counts.keys()).sort(
    (a, b) => (order.get(a) ?? 1e6) - (order.get(b) ?? 1e6) || a.localeCompare(b)
  );
  countsList.innerHTML =
    used.map((id) => countRow(id, counts.get(id) ?? 0, done.get(id) ?? 0)).join("") + countRow(null, empty, emptyDone);
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

/** Замінює колір на всіх бісеринах поточної сітки (можна скасувати). */
function replaceColor(from: string, to: string): void {
  const f = fills();
  const changes = new Map<string, [string | undefined, string | undefined]>();
  for (const k of beadEls.keys()) if (f[k] === from) changes.set(k, [from, to]);
  if (changes.size === 0) return;
  applyChanges(changes);
  showWarn(`Замінено ${num(changes.size)} бісерин: ${fullLabel(colorView(from))} → ${fullLabel(colorView(to))}.`, 5000);
}

/** Зафарбовує всі порожні бісерини поточним кольором (можна скасувати). */
function fillEmpty(): void {
  const color = settings.color;
  if (!color) return;
  const f = fills();
  const changes = new Map<string, [string | undefined, string | undefined]>();
  for (const k of beadEls.keys()) if (!f[k]) changes.set(k, [undefined, color]);
  if (changes.size === 0) return;
  applyChanges(changes);
}

function applyChanges(changes: Map<string, [string | undefined, string | undefined]>): void {
  const f = fills();
  for (const [k, [, after]] of changes) {
    if (after) f[k] = after;
    else delete f[k];
    const el = beadEls.get(k);
    if (el) el.style.fill = fillFor(k);
  }
  history.push({ kind: "paint", side: sideKey(project.side), changes });
  syncHistory();
  updateStats();
  markDirty();
}

countsList.addEventListener("change", (e) => {
  const sel = (e.target as Element).closest<HTMLSelectElement>("select[data-replace]");
  if (!sel?.dataset.replace || !sel.value) return;
  replaceColor(sel.dataset.replace, sel.value);
});
countsList.addEventListener("click", (e) => {
  if ((e.target as Element).closest("[data-fill-empty]")) fillEmpty();
});

/* ---------- Кольори трафарету й інструменти ---------- */

function renderPalette(): void {
  const parts = project.palette.map((id) => {
    const v = colorView(id);
    const label = v.code || v.name;
    return (
      `<button type="button" class="pill" data-id="${esc(id)}" aria-pressed="false" title="${esc(colorTitle(v))}">` +
      `<span class="chip" style="--c:${v.hex}"></span>` +
      `<span class="pill-code${v.code ? "" : " pill-name"}">${esc(label)}</span></button>`
    );
  });
  const empty = project.palette.length === 0;
  if (empty) parts.push(`<span class="pal-empty">У трафареті ще немає кольорів.</span>`);
  parts.push(
    `<button type="button" class="tbtn${empty ? " primary" : ""} pal-add" id="open-catalog">` +
      `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v10"/><path d="M3 8h10"/></svg>` +
      `${empty ? "Додати кольори" : "Кольори"}</button>`
  );
  pal.innerHTML = parts.join("");
  syncTools();
}

function syncTools(): void {
  for (const b of $$<HTMLButtonElement>("button.pill", pal)) {
    b.setAttribute("aria-pressed", String(!ui.erase && b.dataset.id === settings.color));
  }
  eraseBtn.setAttribute("aria-pressed", String(ui.erase));
  mirrorBtn.setAttribute("aria-pressed", String(settings.mirror));
  svg.classList.toggle("erasing", ui.erase && !settings.weave);
  svg.classList.toggle("mirror-on", settings.mirror && !settings.weave);
  const cur = $("#cur-name");
  if (ui.erase) cur.textContent = "гумка";
  else if (settings.color) cur.textContent = fullLabel(colorView(settings.color));
  else cur.textContent = "не вибрано";
}

function selectColor(id: string): void {
  settings.color = id;
  ui.erase = false;
  syncTools();
  saveSettings(settings);
  scheduleStats();
}

/** Колір пензля має бути серед кольорів трафарету. */
function fitBrush(): void {
  if (!settings.color || !project.palette.includes(settings.color)) {
    settings.color = project.palette[0] ?? null;
    saveSettings(settings);
  }
}

function addToPalette(id: string): void {
  if (needColorShown) {
    warn.hidden = true;
    needColorShown = false;
  }
  if (!project.palette.includes(id)) {
    if (project.palette.length >= MAX_PALETTE) {
      showWarn(`У трафареті може бути щонайбільше ${MAX_PALETTE} кольорів.`);
      return;
    }
    project.palette.push(id);
    rememberRecent(settings, id);
    markDirty();
  }
  renderPalette();
  selectColor(id);
}

function removeFromPalette(id: string): void {
  if (!project.palette.includes(id)) return;
  project.palette = project.palette.filter((x) => x !== id);
  if (settings.color === id) {
    settings.color = project.palette[0] ?? null;
    saveSettings(settings);
  }
  markDirty();
  renderPalette();
  scheduleStats();
}

pal.addEventListener("click", (e) => {
  const t = e.target as Element;
  if (t.closest("#open-catalog")) {
    catalog.open();
    return;
  }
  const b = t.closest<HTMLButtonElement>("button.pill");
  if (b?.dataset.id) selectColor(b.dataset.id);
});

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

/** Що зробить клік по бісерині: колір, стирання (null) чи нічого (undefined — колір не вибрано). */
function modeFor(k: string): string | null | undefined {
  if (ui.erase) return null;
  if (!settings.color) return undefined;
  return fills()[k] === settings.color ? null : settings.color;
}

let needColorShown = false;
function needColor(): void {
  showWarn("Спершу додайте кольори: кнопка «Додати кольори» над трафаретом відкриває каталог Preciosa.", 6000);
  needColorShown = true;
  const add = document.getElementById("open-catalog");
  add?.classList.remove("pulse");
  void add?.getBoundingClientRect();
  add?.classList.add("pulse");
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
  if (el) el.style.fill = fillFor(k);
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

/* ---------- Плетіння: позначки нанизаних бісерин ---------- */

/** Поточний рух миші в режимі плетіння: позначаємо чи знімаємо позначки. */
let weaving: { mode: "mark" | "unmark"; keys: string[]; items: [number, string][] } | null = null;

/** Оновлює позначку й заливку однієї бісерини. */
function refreshBead(k: string): void {
  const el = beadEls.get(k);
  if (!el) return;
  el.classList.toggle("done", weave.has(k));
  el.classList.toggle("last", k === weave.last);
  el.style.fill = fillFor(k);
}

/** Переносить підсвітку «де зупинилися» на нову останню бісерину. */
function moveLast(prev: string | null): void {
  if (prev && prev !== weave.last) refreshBead(prev);
  if (weave.last) refreshBead(weave.last);
}

/** Оновлює позначки всіх бісерин (після скасування, скидання чи зміни вигляду). */
function refreshWeaveMarks(): void {
  for (const k of beadEls.keys()) refreshBead(k);
  syncCopy();
}

function startWeave(k: string): void {
  weaving = { mode: weave.has(k) ? "unmark" : "mark", keys: [], items: [] };
  weaveAt(k);
}

function weaveAt(k: string): void {
  if (!weaving) return;
  const prev = weave.last;
  if (weaving.mode === "mark") {
    if (!weave.mark(k)) return;
    weaving.keys.push(k);
  } else {
    const i = weave.unmark(k);
    if (i < 0) return;
    weaving.items.push([i, k]);
  }
  refreshBead(k);
  moveLast(prev);
  scheduleWeaveInfo();
}

function endWeave(): void {
  if (!weaving) return;
  const w = weaving;
  weaving = null;
  const side = sideKey(project.side);
  if (w.mode === "mark" && w.keys.length > 0) history.push({ kind: "mark", side, keys: w.keys });
  else if (w.mode === "unmark" && w.items.length > 0) history.push({ kind: "unmark", side, items: w.items });
  else return;
  syncHistory();
  markDirty();
  scheduleStats();
  scheduleWeaveInfo();
}

let weaveInfoQueued = false;
function scheduleWeaveInfo(): void {
  if (weaveInfoQueued) return;
  weaveInfoQueued = true;
  requestAnimationFrame(() => {
    weaveInfoQueued = false;
    updateWeaveInfo();
  });
}

const pctFmt = new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 1 });

/** Лічильник «нанизано N з M», смужка прогресу й остання бісерина. */
function updateWeaveInfo(): void {
  const total = beadEls.size;
  const done = weave.done;
  const pct = total ? (done / total) * 100 : 0;
  wvCount.innerHTML = `${num(done)} <span class="prog-of">з</span> ${num(total)}`;
  wvPct.textContent = `${pctFmt.format(pct >= 10 ? Math.floor(pct) : Math.floor(pct * 10) / 10)} %`;
  wvBar.style.width = `${r2(pct)}%`;
  const last = weave.last;
  if (last) {
    const id = fills()[last];
    wvLast.innerHTML =
      `Остання: № <b>${num(weave.number(last) ?? done)}</b> · ` +
      esc(id ? fullLabel(colorView(id)) : "не зафарбована");
  } else {
    wvLast.textContent = "Ще нічого не позначено.";
  }
  wvFind.disabled = !last;
  wvReset.disabled = wovenList().length === 0;
}

let printing = false;

/** Класи сітки: режим плетіння (приглушення, підсвітка) не діє в режимі «лише трафарет» і під час друку. */
function syncStencilClasses(): void {
  const weavingView = settings.weave && !ui.clean && !printing;
  svg.classList.toggle("weaving", weavingView);
  svg.classList.toggle("dim", settings.dim);
  const fadeNow = weavingView && settings.dim;
  if (fadeNow !== fadeDone) {
    fadeDone = fadeNow;
    for (const [k, el] of beadEls) el.style.fill = fillFor(k);
  }
  syncTools();
}

// Друкуємо трафарет без позначок плетіння.
window.addEventListener("beforeprint", () => {
  printing = true;
  syncStencilClasses();
  syncCopy();
});
window.addEventListener("afterprint", () => {
  printing = false;
  syncStencilClasses();
  syncCopy();
});

function setMode(weaveMode: boolean): void {
  if (painting) stopPainting();
  if (weaving) endWeave();
  settings.weave = weaveMode;
  modeDraw.setAttribute("aria-selected", String(!weaveMode));
  modeWeave.setAttribute("aria-selected", String(weaveMode));
  modeDraw.tabIndex = weaveMode ? -1 : 0;
  modeWeave.tabIndex = weaveMode ? 0 : -1;
  barDraw.hidden = weaveMode;
  barWeave.hidden = !weaveMode;
  document.body.classList.toggle("weaving", weaveMode);
  syncStencilClasses();
  updateStats();
  updateWeaveInfo();
  saveSettings(settings);
}

modeDraw.addEventListener("click", () => setMode(false));
modeWeave.addEventListener("click", () => setMode(true));
for (const tab of [modeDraw, modeWeave]) {
  tab.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const next = tab === modeDraw ? modeWeave : modeDraw;
    next.focus();
    setMode(next === modeWeave);
  });
}

wvDim.addEventListener("change", () => {
  settings.dim = wvDim.checked;
  syncStencilClasses();
  saveSettings(settings);
});

wvFind.addEventListener("click", () => {
  const el = weave.last ? beadEls.get(weave.last) : undefined;
  if (!el) return;
  el.scrollIntoView({ block: "center", inline: "center", behavior: "smooth" });
  el.classList.remove("flash");
  void el.getBoundingClientRect();
  el.classList.add("flash");
  window.setTimeout(() => el.classList.remove("flash"), 2600);
});

let resetTimer = 0;
function disarmReset(): void {
  window.clearTimeout(resetTimer);
  wvReset.classList.remove("armed");
  wvReset.textContent = "Скинути позначки";
}
wvReset.addEventListener("click", () => {
  if (!wvReset.classList.contains("armed")) {
    wvReset.classList.add("armed");
    wvReset.textContent = "Натисніть ще раз, щоб скинути";
    resetTimer = window.setTimeout(disarmReset, 3500);
    return;
  }
  disarmReset();
  const list = wovenList();
  if (list.length === 0) return;
  // Знімаємо з кінця, щоб «Скасувати» повернуло все в тому самому порядку.
  const items: [number, string][] = [];
  for (let i = list.length - 1; i >= 0; i--) items.push([i, list[i]]);
  list.length = 0;
  history.push({ kind: "unmark", side: sideKey(project.side), items });
  afterWeaveChange();
  syncHistory();
  markDirty();
  showWarn("Позначки плетіння скинуто. «Скасувати» поверне їх.", 5000);
});

/** Після зміни масиву позначок поза звичайним рухом миші. */
function afterWeaveChange(): void {
  weave.rebuild();
  refreshWeaveMarks();
  scheduleStats();
  updateWeaveInfo();
}

/* ---------- Події миші на сітці ---------- */

svg.addEventListener("pointerdown", (e) => {
  lastPointer = e.pointerType;
  if (e.pointerType !== "mouse" || e.button !== 0) return;
  const k = beadKey(e.target);
  if (!k) return;
  e.preventDefault();
  if (settings.weave) {
    startWeave(k);
    return;
  }
  const mode = modeFor(k);
  if (mode === undefined) {
    needColor();
    return;
  }
  painting = { mode };
  beginStroke();
  paint(k, mode);
});
svg.addEventListener("pointerover", (e) => {
  if (!painting && !weaving) return;
  const k = beadKey(e.target);
  if (!k) return;
  if (weaving) weaveAt(k);
  else if (painting) paint(k, painting.mode);
});
const stopPainting = (): void => {
  if (weaving) endWeave();
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
  if (settings.weave) {
    startWeave(k);
    endWeave();
    return;
  }
  const mode = modeFor(k);
  if (mode === undefined) {
    needColor();
    return;
  }
  beginStroke();
  paint(k, mode);
  endStroke();
});

initBeadTooltip(svg, $("#tip"), (k) => {
  const id = fills()[k];
  const color = id ? fullLabel(colorView(id)) : "не зафарбована";
  const n = weave.number(k);
  if (n) return `№ ${num(n)} · ${color}`;
  if (settings.weave) return `Не нанизана · ${color}`;
  return id ? color : "Не зафарбована";
});

/* ---------- Скасувати / повторити ---------- */

function syncHistory(): void {
  for (const b of undoBtns) b.disabled = !history.canUndo;
  for (const b of redoBtns) b.disabled = !history.canRedo;
}

/** Масив позначок змінюється на місці, щоб не загубити прив'язку до Weave. */
function replaceList(list: string[], next: string[]): void {
  list.length = 0;
  for (const k of next) list.push(k);
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
          if (el) el.style.fill = fillFor(k);
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
    case "mark": {
      const list = project.woven[a.side];
      if (useBefore) {
        // Позначки цієї дії — в кінці набору.
        const start = list.length - a.keys.length;
        if (start >= 0 && a.keys.every((k, j) => list[start + j] === k)) list.length = start;
        else {
          const drop = new Set(a.keys);
          replaceList(list, list.filter((k) => !drop.has(k)));
        }
      } else {
        const have = new Set(list);
        for (const k of a.keys) if (!have.has(k)) list.push(k);
      }
      if (a.side === sideKey(project.side)) afterWeaveChange();
      break;
    }
    case "unmark": {
      const list = project.woven[a.side];
      if (useBefore) {
        const have = new Set(list);
        for (let j = a.items.length - 1; j >= 0; j--) {
          const [i, k] = a.items[j];
          if (have.has(k)) continue;
          list.splice(Math.min(i, list.length), 0, k);
          have.add(k);
        }
      } else {
        for (const [i, k] of a.items) {
          const at = list[i] === k ? i : list.indexOf(k);
          if (at >= 0) list.splice(at, 1);
        }
      }
      if (a.side === sideKey(project.side)) afterWeaveChange();
      break;
    }
  }
  syncHistory();
  markDirty();
}

function undo(): void {
  stopPainting();
  const a = history.undo();
  if (a) applyAction(a, true);
}

function redo(): void {
  stopPainting();
  const a = history.redo();
  if (a) applyAction(a, false);
}

for (const b of undoBtns) b.addEventListener("click", undo);
for (const b of redoBtns) b.addEventListener("click", redo);

document.addEventListener("keydown", (e) => {
  if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
  const t = e.target as HTMLElement | null;
  if (t?.closest("input[type=text], input[type=number], input[type=search], textarea, select, [contenteditable=true]")) return;
  if (document.querySelector("dialog[open]")) return;
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

function setSize(name: "rows" | "cols", raw: string | number): void {
  let v = Math.round(Number(raw));
  if (!Number.isFinite(v)) v = project[name];
  const other = name === "rows" ? project.cols : project.rows;
  const cap = Math.min(MAX_SIDE, Math.floor(MAX_CELLS / other));
  const next = clamp(v, 1, cap);
  if (next < v) {
    showWarn("Найбільше — 400 ромбів з кожного боку й до 12 000 ромбів разом, щоб програма не зависала.");
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
  syncStencilClasses();
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
  if (e.key === "Escape" && ui.clean && !document.querySelector("dialog[open]")) setClean(false);
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

/** Трафарет зі старої версії: HEX-кольори переходять у «Мої кольори». */
async function upgradeProject(p: Project): Promise<boolean> {
  if (!isLegacyProject(p)) return false;
  const conv = await convertHexFills(p.fills);
  p.fills = conv.fills;
  p.palette = conv.palette;
  return true;
}

/** Кольори, що вже є на бісеринах, додаємо до палітри трафарету. */
function includeUsedColors(p: Project): void {
  const seen = new Set(p.palette);
  for (const side of ["3", "4"] as const) {
    for (const id of Object.values(p.fills[side])) {
      if (!seen.has(id) && seen.size < MAX_PALETTE) {
        seen.add(id);
        p.palette.push(id);
      }
    }
  }
}

async function openProject(p: Project): Promise<void> {
  await flushSave();
  stopPainting();
  const upgraded = await upgradeProject(p);
  ensureWoven(p);
  project = p;
  fitSize(project);
  history.clear();
  settings.lastProjectId = p.id;
  fitBrush();
  saveSettings(settings);
  showProjectName();
  renderPalette();
  render();
  syncHistory();
  saveState.textContent = "Збережено";
  saveState.classList.remove("error");
  // Новий чи відкритий з файлу трафарет ще не має мініатюри для списку.
  if (!project.thumb || upgraded) markDirty();
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
    if (!src) return false;
    await upgradeProject(src);
    ensureWoven(src);
    const now = Date.now();
    // Копію плетуть заново, тож позначки плетіння в неї не переносимо.
    const copyP: Project = {
      ...src,
      id: newId(),
      name: `${src.name} (копія)`.slice(0, 80),
      fills: cloneFills(src.fills),
      palette: [...src.palette],
      woven: emptyWoven(),
      progress: undefined,
      createdAt: now,
      updatedAt: now
    };
    await dbPut(copyP);
    return src.woven["3"].length + src.woven["4"].length > 0;
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
    if (!p) return;
    await upgradeProject(p);
    ensureWoven(p);
    await saveProjectToFile(p);
  },
  async importFile(file) {
    const parsed = parseProjectFile(await file.text(), file.name);
    const p: Project = { ...blankProject(parsed.data.name), ...parsed.data };
    if (parsed.legacyHex) {
      const conv = await convertHexFills(p.fills);
      p.fills = conv.fills;
      p.palette = conv.palette;
    } else {
      await adoptCustomColors(parsed.colors);
    }
    includeUsedColors(p);
    await dbPut(p);
    await openProject(p);
  }
});

$("#open-projects").addEventListener("click", () => void dialog.open());
$("#export-project").addEventListener("click", async () => {
  await flushSave();
  await saveProjectToFile(project);
});

/* ---------- Каталог кольорів ---------- */

const catalog = initCatalogDialog({
  palette: () => project.palette,
  recent: () => settings.recent,
  add: addToPalette,
  remove: removeFromPalette,
  currentHex: () => (settings.color ? hexOf(settings.color) : null)
});

onCustomsChange(() => {
  if (!ready) return;
  renderPalette();
  repaintBeads();
  scheduleStats();
  markDirty();
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

setBlockedHandler(() => {
  saveState.textContent = "Закрийте інші вкладки з програмою, щоб оновити сховище";
  saveState.classList.add("error");
});

async function start(): Promise<void> {
  twoBox.checked = settings.two;
  twoFloat.checked = settings.two;
  document.body.classList.toggle("two", settings.two);
  wvDim.checked = settings.dim;
  setMode(settings.weave);

  let list: Project[] = [];
  let storageOk = true;
  try {
    await loadCustomColors();
    list = await dbGetAll();
  } catch {
    storageOk = false;
    saveState.textContent = "Сховище недоступне: зміни не збережуться";
    saveState.classList.add("error");
  }

  // Трафарети зі старої версії (кольори HEX) переносимо одразу всі.
  for (const p of list) {
    if (await upgradeProject(p)) {
      try {
        await dbPut(p);
      } catch {
        // спробуємо зберегти пізніше
      }
    }
  }

  let oldBrush = legacyBrushHex;
  if (list.length === 0) {
    const migrated = migrateV1();
    let first = blankProject("Трафарет 1");
    if (migrated) {
      first = { ...first, ...migrated.data };
      const conv = await convertHexFills(first.fills);
      first.fills = conv.fills;
      first.palette = conv.palette;
      oldBrush = oldBrush ?? migrated.color ?? null;
      if (migrated.mirror !== undefined) settings.mirror = migrated.mirror;
      if (migrated.two !== undefined) {
        settings.two = migrated.two;
        twoBox.checked = twoFloat.checked = settings.two;
        document.body.classList.toggle("two", settings.two);
      }
    }
    try {
      await dbPut(first);
      if (migrated) forgetV1();
    } catch {
      // покажемо трафарет навіть без сховища
    }
    list = [first];
  }

  // Колір пензля зі старої версії → відповідний свій колір.
  if (!settings.color && oldBrush) {
    const match = customColors().find((c) => c.hex === oldBrush);
    if (match) settings.color = match.id;
  }

  const target =
    list.find((p) => p.id === settings.lastProjectId) ?? [...list].sort((a, b) => b.updatedAt - a.updatedAt)[0];
  await openProject(target);
  ready = true;
  if (storageOk) void requestPersistence();
}

void start();
