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
  customIdsIn,
  loadCustomColors,
  onCustomsChange,
  restoreCustomColors
} from "./colors";
import { dbDelete, dbGet, dbGetAll, dbPut, requestPersistence, setBlockedHandler } from "./db";
import { parseProjectFile, saveBackupToFile, saveProjectToFile, type ParsedBackup } from "./files";
import { BEAD_R, beadsPerStep, buildGeometry, mirrorKey, type Edge, type Gaps, type Geometry } from "./geometry";
import { HitIndex } from "./hit";
import { History, type Action } from "./history";
import { convertHexFills } from "./legacy";
import { applyPrintLayout, describePlan, fitScaleWithText, fmtMm, planStrips, stripStart, type Frame } from "./print";
import {
  MAX_CELLS,
  MAX_PALETTE,
  MAX_SIDE,
  blankProject,
  cloneFills,
  cloneGaps,
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
import { initTooltip } from "./tooltip";
import { $, $$, clamp, esc, num, r2 } from "./util";
import { Weave } from "./weave";

/* ---------- Оновлення програми ---------- */

const updateBar = $("#update-bar");
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    updateBar.hidden = false;
  }
});
$("#update-now").addEventListener("click", async () => {
  await flushSave();
  void updateSW(true);
});
$("#update-later").addEventListener("click", () => {
  updateBar.hidden = true;
});

const GUT_L = 27;
const GUT_T = 20;
const PAD = 9;

const settings = loadSettings();
const ui = { erase: false, clean: false };
/** «Скасувати» в малюванні й у плетінні — окремі: кожне скасовує лише свої дії. */
const drawHistory = new History(200);
const weaveHistory = new History(200);
const history = (): History => (settings.weave ? weaveHistory : drawHistory);
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
const scroller = $("#scroller");
const zoomValue = $("#zoom-value");
const zoomOutBtn = $<HTMLButtonElement>("#zoom-out");
const zoomInBtn = $<HTMLButtonElement>("#zoom-in");

let beadEls = new Map<string, SVGElement>();
/** Пошук бісерини під курсором за координатами (див. hit.ts). */
let hitIndex: HitIndex | null = null;
/** Бісерина під мишею (підсвічена). */
let hoverKey: string | null = null;
/** Прозорий шар над сіткою, що ловить мишу. */
let hitRect: SVGElement | null = null;
/** Кільця підсвітки: під мишею й «де зупинилися». Окремі елементи, щоб не змінювати розмір самих бісерин. */
let ringHover: SVGElement | null = null;
let ringLast: SVGElement | null = null;
/** Лінія-підказка «тут буде проміжок», коли миша між номерами ромбів чи рядів. */
let gapGuide: SVGElement | null = null;
/** Межа під мишею над номерами: після якого ромба (col) чи ряду (row). */
let hoverGutter: GapAt | null = null;
const viewBoxes = { normal: "0 0 1 1", clean: "0 0 1 1" };
let cleanDims: [number, number] = [1, 1];
/** Ширина трафарету в одиницях SVG (звичайний вигляд, з номерами). */
let vbWidth = 1;
let vbHeight = 1;

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

/** Зберігає відкритий трафарет, якщо є зміни. false — зберегти не вдалося. */
async function flushSave(): Promise<boolean> {
  window.clearTimeout(saveTimer);
  if (!dirty) return true;
  dirty = false;
  project.updatedAt = Date.now();
  if (geom) {
    project.thumb = makeThumb(geom, fills(), hexOf);
    project.progress = { done: weave.done, total: geom.beads.length };
  }
  try {
    await dbPut(project);
    if (!dirty) saveState.textContent = "Збережено";
    return true;
  } catch {
    dirty = true;
    saveState.textContent = "Не вдалося зберегти";
    saveState.classList.add("error");
    return false;
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

/** Нитки: одна пряма на сторону ромба, а якщо сторона перетинає проміжок — ламана через її бісерини. */
function threadPath(edges: Edge[], H: number, keep: (e: Edge) => boolean = () => true): string {
  let d = "";
  for (const e of edges) {
    if (!keep(e)) continue;
    const p = e.pts;
    const n = p.length;
    d += `M${r2(p[0])} ${r2(p[1])}`;
    const straight =
      Math.abs(p[n - 2] - p[0] - (e.lx1 - e.lx0) * H) < 1e-6 && Math.abs(p[n - 1] - p[1] - (e.ly1 - e.ly0) * H) < 1e-6;
    if (straight) d += `L${r2(p[n - 2])} ${r2(p[n - 1])}`;
    else for (let i = 2; i < n; i += 2) d += `L${r2(p[i])} ${r2(p[i + 1])}`;
  }
  return d;
}

function render(): void {
  geom = buildGeometry(project.cols, project.rows, project.side, project.gaps);
  const { H, width: W, height: HT, px, py } = geom;
  const vb = [-GUT_L, -GUT_T, W + GUT_L + PAD, HT + GUT_T + PAD];
  const e = BEAD_R + 1;
  const vbc = [-e, -e, W + 2 * e, HT + 2 * e];
  viewBoxes.normal = vb.map(r2).join(" ");
  viewBoxes.clean = vbc.map(r2).join(" ");
  cleanDims = [vbc[2], vbc[3]];

  const existing = new Set(geom.beads.map((b) => b.k));
  weave.bind(wovenList(), (k) => existing.has(k));
  const parts: string[] = [];
  parts.push(`<path class="thread" d="${threadPath(geom.edges, H)}"/>`);
  // Вісь дзеркала — посередині висоти (якщо там проміжок — посередині проміжку).
  const axisY = r2((py(project.rows) + py(project.rows + 1e-3) - 1e-3 * H) / 2);
  parts.push(`<line class="axis" x1="-6" y1="${axisY}" x2="${r2(W + 6)}" y2="${axisY}"/>`);

  const colEvery = project.cols > 40 ? 5 : 1;
  const rowEvery = project.rows > 40 ? 5 : 1;
  for (let i = 0; i < project.cols; i++) {
    const label = i + 1;
    if (colEvery === 1 || label === 1 || label % colEvery === 0) {
      parts.push(`<text class="lc" x="${r2(px(2 * i + 1))}" y="-8" text-anchor="middle">${label}</text>`);
    }
  }
  for (let r = 0; r < project.rows; r++) {
    const label = r + 1;
    if (rowEvery === 1 || label === 1 || label % rowEvery === 0) {
      parts.push(
        `<text class="lr" x="-7.5" y="${r2(py(2 * r + 1))}" text-anchor="end" dominant-baseline="central">${label}</text>`
      );
    }
  }
  // Бісерини в окремій групі: зміни поза нею не змушують браузер перераховувати межі всіх кіл.
  parts.push(`<g class="beads">`);
  for (const b of geom.beads) {
    const fill = fillFor(b.k);
    parts.push(
      `<circle class="${weave.has(b.k) ? "bd done" : "bd"}" cx="${r2(b.x)}" cy="${r2(b.y)}" r="${BEAD_R}"${fill ? ` style="fill:${fill}"` : ""}/>`
    );
  }
  parts.push(`</g>`);
  parts.push(
    `<g class="marks"><circle class="ring ring-last" cx="0" cy="0" r="${BEAD_R + 1.1}"/>` +
      `<circle class="ring ring-hover" cx="0" cy="0" r="${BEAD_R + 0.9}"/>` +
      `<line class="gap-guide" x1="0" y1="0" x2="0" y2="0"/></g>`
  );
  // Прозорий шар зверху ловить мишу; бісерину під курсором шукаємо за координатами.
  parts.push(`<rect class="hit" x="${r2(vb[0])}" y="${r2(vb[1])}" width="${r2(vb[2])}" height="${r2(vb[3])}"/>`);

  svg.setAttribute("viewBox", ui.clean ? viewBoxes.clean : viewBoxes.normal);
  vbWidth = vb[2];
  vbHeight = vb[3];
  applyZoom();
  svg.innerHTML = parts.join("");
  svg.setAttribute("aria-label", `Сітка силянки: ${project.rows} у висоту, ${project.cols} у ширину`);

  // Кола йдуть у тому самому порядку, що й geom.beads.
  beadEls = new Map();
  const els = $$<SVGElement>(".bd", svg);
  for (let i = 0; i < els.length; i++) beadEls.set(geom.beads[i].k, els[i]);
  hitIndex = new HitIndex(geom.beads, W);
  hitRect = svg.querySelector<SVGElement>(".hit");
  ringHover = svg.querySelector<SVGElement>(".ring-hover");
  ringLast = svg.querySelector<SVGElement>(".ring-last");
  gapGuide = svg.querySelector<SVGElement>(".gap-guide");
  hoverKey = null;
  hoverGutter = null;
  placeRing(ringLast, weave.last);

  syncTools();
  updateMeta();
  updateStats();
  updateWeaveInfo();
  syncGapsUi();
  printLayout();
}

/** Перефарбовує бісерини без перебудови сітки (коли змінився відтінок свого кольору). */
function repaintBeads(): void {
  for (const [k, el] of beadEls) el.style.fill = fillFor(k);
  syncCopy();
}

/* ---------- Масштаб на екрані ---------- */

/** Відсотки масштабу: 100 % — бісеринка 16 px (2 px на одиницю SVG). */
const ZOOMS = [10, 15, 20, 25, 35, 50, 65, 80, 100, 125, 150, 200, 250, 300];
const pxPerUnit = (pct: number): number => pct / 50;

function applyZoom(): void {
  const z = settings.zoom;
  if (z === null) {
    // «Авто»: по ширині, але не дрібніше, ніж зручно клікати, і не завеликі.
    svg.style.width = "";
    svg.style.minWidth = `${Math.round(vbWidth * 1.2)}px`;
    svg.style.maxWidth = `${Math.round(vbWidth * 3)}px`;
  } else {
    svg.style.width = `${Math.round(vbWidth * pxPerUnit(z))}px`;
    svg.style.minWidth = "0";
    svg.style.maxWidth = "none";
  }
  updateZoomLabel();
}

/** Поточний масштаб у відсотках (для «Авто» — фактичний). */
function effectiveZoom(): number {
  const w = svg.getBoundingClientRect().width;
  return w > 0 ? (w / vbWidth) * 50 : 100;
}

function updateZoomLabel(): void {
  zoomValue.textContent = settings.zoom === null ? "авто" : `${Math.round(settings.zoom)} %`;
  const z = settings.zoom ?? effectiveZoom();
  zoomOutBtn.disabled = z <= ZOOMS[0] + 0.5;
  zoomInBtn.disabled = z >= ZOOMS[ZOOMS.length - 1] - 0.5;
}

/** Змінює масштаб, лишаючи на місці те, що було посередині видимої частини. */
function setZoom(z: number | null): void {
  const oldW = svg.getBoundingClientRect().width;
  const center = oldW > 0 ? (scroller.scrollLeft + scroller.clientWidth / 2) / oldW : 0.5;
  settings.zoom = z === null ? null : Math.min(400, Math.max(5, z));
  applyZoom();
  const newW = svg.getBoundingClientRect().width;
  scroller.scrollLeft = Math.max(0, center * newW - scroller.clientWidth / 2);
  saveSettings(settings);
}

function stepZoom(dir: 1 | -1): void {
  const cur = settings.zoom ?? effectiveZoom();
  const next = dir > 0 ? ZOOMS.find((z) => z > cur + 0.5) : [...ZOOMS].reverse().find((z) => z < cur - 0.5);
  if (next !== undefined) setZoom(next);
}

zoomInBtn.addEventListener("click", () => stepZoom(1));
zoomOutBtn.addEventListener("click", () => stepZoom(-1));
$("#zoom-auto").addEventListener("click", () => setZoom(null));
$("#zoom-fit").addEventListener("click", () => {
  const room = scroller.clientWidth;
  if (room > 0) setZoom((room / vbWidth) * 50);
});
new ResizeObserver(() => {
  if (settings.zoom === null) updateZoomLabel();
}).observe(scroller);

/* ---------- Друк ---------- */

const printBead = $<HTMLSelectElement>("#print-bead");
const printInfo = $("#print-info");
const printPages = $("#print-pages");

/** Поля навколо сітки: з номерами рядів і ромбів (друк з текстом) або без. */
function frameFor(labels: boolean): Frame {
  if (labels) return { left: GUT_L, right: PAD, top: GUT_T, bottom: PAD };
  const e = BEAD_R + 1;
  return { left: e, right: e, top: e, bottom: e };
}

let fitK = 0;
let fitOrient: "landscape" | "portrait" = "landscape";

function printLayout(): void {
  const fit = applyPrintLayout(cleanDims[0], cleanDims[1], settings.two ? 2 : 1, pageSize);
  fitK = fit.k;
  fitOrient = fit.orient;
  updatePrintInfo();
}

/** Підказка в панелі «Друк»: скільки аркушів і якого розміру вийдуть бісеринки. */
function updatePrintInfo(): void {
  const strips = settings.printBead !== null;
  twoBox.disabled = strips;
  twoFloat.disabled = strips;
  twoBox.closest("label")?.classList.toggle("disabled", strips);
  printBead.value = settings.printBead === null ? "" : String(settings.printBead);
  if (!geom) return;
  if (strips) {
    printInfo.textContent = describePlan(planStrips(geom, project.cols, frameFor(!ui.clean), settings.printBead ?? 4, !ui.clean));
    return;
  }
  const k = ui.clean ? fitK : fitScaleWithText(vbWidth, vbHeight, fitOrient);
  const bead = 2 * BEAD_R * k;
  printInfo.textContent =
    `На одному аркуші, бісеринки ≈ ${fmtMm(bead)}.` +
    (bead < 2 ? " Задрібно — виберіть розмір бісеринок, і трафарет поділиться на смуги." : "");
}

/**
 * Одна смуга трафарету для друку: ромби з c0 до c1 (не включно).
 * Якщо смуга починається одразу після проміжку, проміжок у неї не потрапляє:
 * вузлові бісерини на її лівому краї стають поруч зі своїм ромбом.
 */
function stripSvg(c0: number, c1: number, labels: boolean, scale: number): string {
  if (!geom) return "";
  const { H, height: HT, px, py } = geom;
  const x0 = stripStart(geom, c0);
  const x1 = geom.colX[c1];
  const lo = 2 * c0 - 1e-9;
  const hi = 2 * c1 + 1e-9;
  const shift = x0 - geom.colX[c0];
  const onLeft = (lx: number): boolean => shift > 0 && Math.abs(lx - 2 * c0) < 1e-6;
  const fr = frameFor(labels);
  const vb = [x0 - fr.left, -fr.top, x1 - x0 + fr.left + fr.right, HT + fr.top + fr.bottom];
  const parts: string[] = [];
  const edges: Edge[] = [];
  for (const e of geom.edges) {
    if (Math.min(e.lx0, e.lx1) < lo || Math.max(e.lx0, e.lx1) > hi) continue;
    if (!onLeft(e.lx0) && !onLeft(e.lx1)) {
      edges.push(e);
      continue;
    }
    const pts = [...e.pts];
    if (onLeft(e.lx0)) pts[0] += shift;
    if (onLeft(e.lx1)) pts[pts.length - 2] += shift;
    edges.push({ ...e, pts });
  }
  parts.push(`<path class="thread" d="${threadPath(edges, H)}"/>`);
  if (labels) {
    const colEvery = c1 - c0 > 40 ? 5 : 1;
    for (let i = c0; i < c1; i++) {
      const label = i + 1;
      if (colEvery === 1 || i === c0 || label % colEvery === 0) {
        parts.push(`<text class="lc" x="${r2(px(2 * i + 1))}" y="-8" text-anchor="middle">${label}</text>`);
      }
    }
    const rowEvery = project.rows > 40 ? 5 : 1;
    for (let r = 0; r < project.rows; r++) {
      const label = r + 1;
      if (rowEvery === 1 || label === 1 || label % rowEvery === 0) {
        parts.push(
          `<text class="lr" x="${r2(x0 - 7.5)}" y="${r2(py(2 * r + 1))}" text-anchor="end" dominant-baseline="central">${label}</text>`
        );
      }
    }
  }
  const f = fills();
  for (const b of geom.beads) {
    if (b.lx < lo || b.lx > hi) continue;
    const id = f[b.k];
    const x = onLeft(b.lx) ? b.x + shift : b.x;
    parts.push(`<circle class="bd" cx="${r2(x)}" cy="${r2(b.y)}" r="${BEAD_R}"${id ? ` style="fill:${hexOf(id)}"` : ""}/>`);
  }
  return (
    `<svg class="stencil print-strip" xmlns="http://www.w3.org/2000/svg" viewBox="${vb.map(r2).join(" ")}"` +
    ` style="width:${r2(vb[2] * scale)}mm;height:${r2(vb[3] * scale)}mm">${parts.join("")}</svg>`
  );
}

/** Перед друком смугами будуємо аркуші; після друку прибираємо. */
function buildPrintPages(): void {
  if (!geom || settings.printBead === null) {
    clearPrintPages();
    return;
  }
  const labels = !ui.clean;
  const plan = planStrips(geom, project.cols, frameFor(labels), settings.printBead, labels);
  pageSize.textContent = `@page { size: A4 ${plan.orient}; margin: 0; }`;
  const meta = `${project.rows}-рядна силянка · ${project.side} бісерини в комірці`;
  const pages: string[] = [];
  for (let p = 0; p < plan.pages; p++) {
    const strips: string[] = [];
    const last = Math.min(plan.strips, (p + 1) * plan.stripsPerPage);
    for (let st = p * plan.stripsPerPage; st < last; st++) {
      const [c0, c1] = plan.ranges[st];
      strips.push(stripSvg(c0, c1, labels, plan.scale));
    }
    const head = labels
      ? `<p class="print-head"><b>${esc(project.name)}</b> · ${esc(meta)} · аркуш ${p + 1} з ${plan.pages}</p>`
      : "";
    pages.push(`<section class="print-page">${head}${strips.join("")}</section>`);
  }
  printPages.innerHTML = pages.join("");
  document.body.classList.add("print-strips");
}

function clearPrintPages(): void {
  printPages.textContent = "";
  document.body.classList.remove("print-strips");
}

printBead.addEventListener("change", () => {
  const v = Number(printBead.value);
  settings.printBead = printBead.value && Number.isFinite(v) ? v : null;
  if (settings.printBead !== null && settings.two) setTwo(false);
  saveSettings(settings);
  updatePrintInfo();
});

for (const b of $$<HTMLButtonElement>("[data-print]")) {
  b.addEventListener("click", () => window.print());
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
  const run = (): void => {
    statsQueued = false;
    updateStats();
  };
  // На дуже великих сітках підрахунок під час руху миші оновлюємо рідше, щоб малювання не гальмувало.
  if (beadEls.size > 20000 && (painting || weaving)) window.setTimeout(run, 300);
  else requestAnimationFrame(run);
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
  drawHistory.push({ kind: "paint", side: sideKey(project.side), changes });
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
  const parts = project.palette.map((id, i) => {
    const v = colorView(id);
    const label = v.code || v.name;
    const title = colorTitle(v) + (i < 9 ? `\nКлавіша ${i + 1}` : "");
    return (
      `<button type="button" class="pill" data-id="${esc(id)}" aria-pressed="false" title="${esc(title)}">` +
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
  drawHistory.push({ kind: "paint", side: sideKey(project.side), changes });
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

/** Точка екрана → координати SVG трафарету. */
function svgPoint(e: { clientX: number; clientY: number }): { x: number; y: number } | null {
  const m = svg.getScreenCTM();
  if (!m) return null;
  const inv = m.inverse();
  return { x: inv.a * e.clientX + inv.c * e.clientY + inv.e, y: inv.b * e.clientX + inv.d * e.clientY + inv.f };
}

/** Бісерина під курсором (за координатами) або null. */
function beadAt(e: { clientX: number; clientY: number }): string | null {
  if (!geom || !hitIndex) return null;
  const pt = svgPoint(e);
  if (!pt) return null;
  const i = hitIndex.nearest(pt.x, pt.y);
  return i >= 0 ? geom.beads[i].k : null;
}

/* ---------- Проміжки: клік між номерами ромбів чи рядів ---------- */

/** Межа, де може бути проміжок: після ромба index (col) чи після ряду index (row), з 1. */
type GapAt = { kind: "col" | "row"; index: number };

/** Екранне положення межі після ромба j (посередині проміжку, якщо він є). */
function colBoundary(j: number): number {
  if (!geom) return 0;
  return geom.colGaps.has(j) ? geom.colX[j] + geom.gap / 2 : geom.colX[j];
}
function rowBoundary(r: number): number {
  if (!geom) return 0;
  return geom.rowGaps.has(r) ? geom.rowY[r] + geom.gap / 2 : geom.rowY[r];
}

/** Межа між номерами під мишею: над трафаретом — між ромбами, зліва — між рядами. */
function gutterAt(e: { clientX: number; clientY: number }): GapAt | null {
  if (!geom || ui.clean || settings.weave) return null;
  const pt = svgPoint(e);
  if (!pt) return null;
  // Лише між номерами: над самим номером підказка не заважає його прочитати.
  const reach = geom.H * 0.65;
  if (pt.y < -1 && pt.y >= -GUT_T && pt.x > -2 && pt.x < geom.width + 2) {
    let best = -1;
    let bestD = reach;
    for (let j = 1; j < project.cols; j++) {
      const d = Math.abs(colBoundary(j) - pt.x);
      if (d < bestD) {
        bestD = d;
        best = j;
      }
    }
    return best > 0 ? { kind: "col", index: best } : null;
  }
  if (pt.x < -1 && pt.x >= -GUT_L && pt.y > -2 && pt.y < geom.height + 2) {
    let best = -1;
    let bestD = reach;
    for (let r = 1; r < project.rows; r++) {
      const d = Math.abs(rowBoundary(r) - pt.y);
      if (d < bestD) {
        bestD = d;
        best = r;
      }
    }
    return best > 0 ? { kind: "row", index: best } : null;
  }
  return null;
}

const hasGap = (g: GapAt): boolean =>
  g.kind === "col" ? project.gaps.cols.includes(g.index) : project.gaps.rows.includes(g.index);

function gutterText(g: GapAt): string {
  const what = g.kind === "col" ? `ромбами ${g.index} і ${g.index + 1}` : `рядами ${g.index} і ${g.index + 1}`;
  return hasGap(g) ? `Клік — прибрати проміжок між ${what}` : `Клік — проміжок між ${what}`;
}

function setGutterHover(g: GapAt | null): void {
  if (g?.kind === hoverGutter?.kind && g?.index === hoverGutter?.index) return;
  hoverGutter = g;
  if (gapGuide && geom) {
    if (g) {
      if (g.kind === "col") {
        const x = r2(colBoundary(g.index));
        gapGuide.setAttribute("x1", x);
        gapGuide.setAttribute("x2", x);
        gapGuide.setAttribute("y1", r2(-GUT_T + 3));
        gapGuide.setAttribute("y2", r2(geom.height + 3));
      } else {
        const y = r2(rowBoundary(g.index));
        gapGuide.setAttribute("y1", y);
        gapGuide.setAttribute("y2", y);
        gapGuide.setAttribute("x1", r2(-GUT_L + 3));
        gapGuide.setAttribute("x2", r2(geom.width + 3));
      }
    }
    gapGuide.classList.toggle("on", g !== null);
    gapGuide.classList.toggle("del", g !== null && hasGap(g));
  }
  hitRect?.classList.toggle("over", hoverKey !== null || g !== null);
}

/** Змінює проміжки однією дією (можна скасувати). */
function setGaps(next: Gaps): void {
  const norm = (v: number[]): number[] => [...new Set(v)].sort((a, b) => a - b);
  const after: Gaps = { cols: norm(next.cols), rows: norm(next.rows) };
  const before = cloneGaps(project.gaps);
  if (before.cols.join() === after.cols.join() && before.rows.join() === after.rows.join()) return;
  drawHistory.push({ kind: "gaps", before, after: cloneGaps(after) });
  project.gaps = after;
  render();
  syncHistory();
  markDirty();
}

function toggleGap(g: GapAt): void {
  const list = g.kind === "col" ? project.gaps.cols : project.gaps.rows;
  const next = list.includes(g.index) ? list.filter((v) => v !== g.index) : [...list, g.index];
  setGaps(g.kind === "col" ? { cols: next, rows: project.gaps.rows } : { cols: project.gaps.cols, rows: next });
}

/* ---------- Проміжки: панель «Проміжки» над трафаретом ---------- */

const gapsBtn = $<HTMLButtonElement>("#gaps-btn");
const gapsPop = $("#gaps-pop");
const gapsCount = $("#gaps-n");
const gapsState = $("#gaps-state");
const gapAxes = {
  col: {
    input: $<HTMLInputElement>("#gap-cols-n"),
    lead: $("#gap-cols-lead"),
    unit: $("#gap-cols-unit"),
    set: $<HTMLButtonElement>("#gap-cols-set"),
    clear: $<HTMLButtonElement>("#gap-cols-clear"),
    fallback: 5
  },
  row: {
    input: $<HTMLInputElement>("#gap-rows-n"),
    lead: $("#gap-rows-lead"),
    unit: $("#gap-rows-unit"),
    set: $<HTMLButtonElement>("#gap-rows-set"),
    clear: $<HTMLButtonElement>("#gap-rows-clear"),
    fallback: 4
  }
};

/** «Після кожних 5 ромбів», але «після кожного 21 ромба». */
function syncEveryWords(kind: "col" | "row"): void {
  const a = gapAxes[kind];
  const n = Math.round(Number(a.input.value));
  const one = n % 10 === 1 && n % 100 !== 11;
  a.lead.textContent = one ? "Після кожного" : "Після кожних";
  a.unit.textContent = kind === "col" ? (one ? "ромба" : "ромбів") : one ? "ряду" : "рядів";
}

/** «після 5, 10, 15» — перші кілька проміжків. */
function gapList(v: number[]): string {
  const head = v.slice(0, 8).join(", ");
  return v.length > 8 ? `${head} … (усього ${v.length})` : head;
}

/** Лічильник на кнопці, стан кнопок і підсумок у панелі. */
function syncGapsUi(): void {
  if (!geom) return;
  const cols = [...geom.colGaps].sort((a, b) => a - b);
  const rows = [...geom.rowGaps].sort((a, b) => a - b);
  gapsCount.textContent = cols.length + rows.length ? ` · ${cols.length + rows.length}` : "";
  for (const kind of ["col", "row"] as const) {
    const a = gapAxes[kind];
    const total = kind === "col" ? project.cols : project.rows;
    a.input.max = String(Math.max(1, total - 1));
    a.input.disabled = total < 2;
    a.set.disabled = total < 2;
    a.clear.disabled = (kind === "col" ? cols : rows).length === 0;
    syncEveryWords(kind);
  }
  const parts: string[] = [];
  if (cols.length) parts.push(`між ромбами — після ${gapList(cols)}`);
  if (rows.length) parts.push(`між рядами — після ${gapList(rows)}`);
  gapsState.textContent = parts.length ? `Зараз проміжки ${parts.join("; ")}.` : "Проміжків ще немає.";
}

/** Рівномірні проміжки: після кожних n ромбів (рядів). Попередні проміжки цього напрямку замінюються. */
function spreadGaps(kind: "col" | "row"): void {
  const a = gapAxes[kind];
  const total = kind === "col" ? project.cols : project.rows;
  if (total < 2) return;
  let n = Math.round(Number(a.input.value));
  if (!Number.isFinite(n) || n < 1) n = a.fallback;
  n = clamp(n, 1, total - 1);
  a.input.value = String(n);
  const list: number[] = [];
  for (let v = n; v < total; v += n) list.push(v);
  setGaps(kind === "col" ? { cols: list, rows: project.gaps.rows } : { cols: project.gaps.cols, rows: list });
  syncGapsUi();
}

function clearGaps(kind: "col" | "row"): void {
  setGaps(kind === "col" ? { cols: [], rows: project.gaps.rows } : { cols: project.gaps.cols, rows: [] });
  syncGapsUi();
}

function showGapsPop(open: boolean): void {
  if (gapsPop.hidden === !open) return;
  gapsPop.hidden = !open;
  gapsBtn.setAttribute("aria-expanded", String(open));
  if (open) syncGapsUi();
}

gapsBtn.addEventListener("click", () => showGapsPop(gapsPop.hidden));
for (const kind of ["col", "row"] as const) {
  const a = gapAxes[kind];
  a.set.addEventListener("click", () => spreadGaps(kind));
  a.clear.addEventListener("click", () => clearGaps(kind));
  a.input.addEventListener("input", () => syncEveryWords(kind));
  a.input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      spreadGaps(kind);
    }
  });
}
// Клік поза панеллю чи Escape закривають її.
document.addEventListener(
  "pointerdown",
  (e) => {
    if (gapsPop.hidden) return;
    const t = e.target as Node | null;
    if (t && (gapsPop.contains(t) || gapsBtn.contains(t))) return;
    showGapsPop(false);
  },
  true
);
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape" || gapsPop.hidden) return;
  showGapsPop(false);
  gapsBtn.focus();
});

/** Ставить кільце підсвітки на бісерину (або ховає, якщо k — null). */
function placeRing(ring: SVGElement | null, k: string | null): void {
  if (!ring) return;
  const el = k ? beadEls.get(k) : undefined;
  if (!el) {
    ring.classList.remove("on");
    return;
  }
  ring.setAttribute("cx", el.getAttribute("cx") ?? "0");
  ring.setAttribute("cy", el.getAttribute("cy") ?? "0");
  ring.classList.add("on");
}

function setHover(k: string | null): void {
  if (k === hoverKey) return;
  hoverKey = k;
  placeRing(ringHover, k);
  // Клас на прозорому шарі, а не на всій сітці: інакше браузер перераховує стилі всіх бісерин.
  hitRect?.classList.toggle("over", k !== null || hoverGutter !== null);
}

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
  el.style.fill = fillFor(k);
}

/** Переносить підсвітку «де зупинилися» на нову останню бісерину. */
function moveLast(prev: string | null): void {
  if (prev && prev !== weave.last) refreshBead(prev);
  if (weave.last) refreshBead(weave.last);
  placeRing(ringLast, weave.last);
}

/** Оновлює позначки всіх бісерин (після скасування, скидання чи зміни вигляду). */
function refreshWeaveMarks(): void {
  for (const k of beadEls.keys()) refreshBead(k);
  placeRing(ringLast, weave.last);
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
  if (w.mode === "mark" && w.keys.length > 0) weaveHistory.push({ kind: "mark", side, keys: w.keys });
  else if (w.mode === "unmark" && w.items.length > 0) weaveHistory.push({ kind: "unmark", side, items: w.items });
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

// Друкуємо трафарет без позначок плетіння; смуги будуємо лише на час друку.
window.addEventListener("beforeprint", () => {
  printing = true;
  syncStencilClasses();
  syncCopy();
  buildPrintPages();
});
window.addEventListener("afterprint", () => {
  printing = false;
  syncStencilClasses();
  syncCopy();
  clearPrintPages();
  printLayout();
});

function setMode(weaveMode: boolean): void {
  if (painting) stopPainting();
  if (weaving) endWeave();
  settings.weave = weaveMode;
  if (weaveMode) {
    showGapsPop(false);
    setGutterHover(null);
  }
  modeDraw.setAttribute("aria-selected", String(!weaveMode));
  modeWeave.setAttribute("aria-selected", String(weaveMode));
  modeDraw.tabIndex = weaveMode ? -1 : 0;
  modeWeave.tabIndex = weaveMode ? 0 : -1;
  barDraw.hidden = weaveMode;
  barWeave.hidden = !weaveMode;
  document.body.classList.toggle("weaving", weaveMode);
  syncStencilClasses();
  syncHistory();
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

let flashTimer = 0;
wvFind.addEventListener("click", () => {
  const el = weave.last ? beadEls.get(weave.last) : undefined;
  const ring = ringLast;
  if (!el || !ring) return;
  el.scrollIntoView({ block: "center", inline: "center", behavior: "smooth" });
  ring.classList.remove("flash");
  void ring.getBoundingClientRect();
  ring.classList.add("flash");
  window.clearTimeout(flashTimer);
  flashTimer = window.setTimeout(() => ring.classList.remove("flash"), 2600);
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
  weaveHistory.push({ kind: "unmark", side: sideKey(project.side), items });
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

/** Остання бісерина, через яку пройшла миша під час малювання чи позначення. */
let strokeKey: string | null = null;

svg.addEventListener("pointerdown", (e) => {
  lastPointer = e.pointerType;
  if (e.pointerType !== "mouse" || e.button !== 0 || ui.clean) return;
  const k = beadAt(e);
  if (!k) {
    const g = gutterAt(e);
    if (g) {
      e.preventDefault();
      toggleGap(g);
      setGutterHover(gutterAt(e));
    }
    return;
  }
  e.preventDefault();
  try {
    svg.setPointerCapture(e.pointerId);
  } catch {
    // не критично
  }
  strokeKey = k;
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
svg.addEventListener("pointermove", (e) => {
  if (e.pointerType !== "mouse") return;
  if (!painting && !weaving) {
    const k = ui.clean ? null : beadAt(e);
    setHover(k);
    setGutterHover(k ? null : gutterAt(e));
    return;
  }
  // Проміжні положення миші, щоб швидкий рух не пропускав бісерини.
  const moves = typeof e.getCoalescedEvents === "function" ? e.getCoalescedEvents() : [];
  for (const ev of moves.length > 0 ? moves : [e]) {
    const k = beadAt(ev);
    if (!k || k === strokeKey) continue;
    strokeKey = k;
    if (weaving) weaveAt(k);
    else if (painting) paint(k, painting.mode);
  }
  setHover(strokeKey);
});
svg.addEventListener("pointerleave", () => {
  setHover(null);
  setGutterHover(null);
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
  if (lastPointer === "mouse" || ui.clean) return;
  const k = beadAt(e);
  if (!k) {
    const g = gutterAt(e);
    if (g) toggleGap(g);
    return;
  }
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

initTooltip(svg, $("#tip"), (e) => {
  const k = beadAt(e);
  if (!k) {
    const g = gutterAt(e);
    return g ? gutterText(g) : null;
  }
  const id = fills()[k];
  const color = id ? fullLabel(colorView(id)) : "не зафарбована";
  const n = weave.number(k);
  if (n) return `№ ${num(n)} · ${color}`;
  if (settings.weave) return `Не нанизана · ${color}`;
  return id ? color : "Не зафарбована";
});

/* ---------- Скасувати / повторити ---------- */

function syncHistory(): void {
  for (const b of undoBtns) b.disabled = !history().canUndo;
  for (const b of redoBtns) b.disabled = !history().canRedo;
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
    case "gaps":
      project.gaps = cloneGaps(useBefore ? a.before : a.after);
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
  const a = history().undo();
  if (a) applyAction(a, true);
}

function redo(): void {
  stopPainting();
  const a = history().redo();
  if (a) applyAction(a, false);
}

for (const b of undoBtns) b.addEventListener("click", undo);
for (const b of redoBtns) b.addEventListener("click", redo);

/** Клавіші малювання: 1–9 — кольори трафарету, E — гумка (незалежно від розкладки). */
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey || e.repeat || settings.weave || ui.clean) return;
  const t = e.target as HTMLElement | null;
  if (t?.closest("input, textarea, select, [contenteditable=true]")) return;
  if (document.querySelector("dialog[open]")) return;
  const digit = /^Digit([1-9])$/.exec(e.code) ?? /^Numpad([1-9])$/.exec(e.code);
  if (digit) {
    const id = project.palette[Number(digit[1]) - 1];
    if (id) {
      e.preventDefault();
      selectColor(id);
    }
  } else if (e.code === "KeyE") {
    e.preventDefault();
    ui.erase = !ui.erase;
    syncTools();
  }
});

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
  // Порожнє чи незрозуміле поле — лишаємо як було.
  if (typeof raw === "string" && !/^\s*-?\d+([.,]\d+)?\s*$/.test(raw)) {
    updateMeta();
    return;
  }
  let v = Math.round(Number(String(raw).replace(",", ".")));
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
  drawHistory.push({ kind: "size", before, after: [project.rows, project.cols] });
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
    drawHistory.push({ kind: "side", before: project.side, after: next });
    project.side = next;
    render();
    syncHistory();
    markDirty();
  });
}

/* ---------- Друк ---------- */

function setClean(on: boolean): void {
  ui.clean = on;
  setHover(null);
  setGutterHover(null);
  if (on) showGapsPop(false);
  cleanBox.checked = on;
  document.body.classList.toggle("clean", on);
  svg.setAttribute("viewBox", on ? viewBoxes.clean : viewBoxes.normal);
  syncStencilClasses();
  syncCopy();
  updatePrintInfo();
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
  // Стираємо лише видиму сітку; візерунок для іншої кількості бісерин на стороні лишається.
  const key = sideKey(project.side);
  if (Object.keys(project.fills[key]).length === 0) return;
  const before = cloneFills(project.fills);
  const after = cloneFills(project.fills);
  after[key] = {};
  drawHistory.push({ kind: "clear", before, after });
  project.fills = cloneFills(after);
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
  if (!(await flushSave())) {
    // Не перемикаємо, щоб не загубити незбережені зміни.
    showWarn("Не вдалося зберегти відкритий трафарет, тож інший не відкрито. Збережіть його у файл і спробуйте ще раз.", 10000);
    return;
  }
  stopPainting();
  const upgraded = await upgradeProject(p);
  ensureWoven(p);
  project = p;
  fitSize(project);
  drawHistory.clear();
  weaveHistory.clear();
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
      gaps: cloneGaps(src.gaps),
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
    if (parsed.kind === "backup") return restoreBackup(parsed);
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
    return null;
  },
  async backup() {
    const list = await allProjects();
    for (const p of list) {
      await upgradeProject(p);
      ensureWoven(p);
    }
    return saveBackupToFile(list);
  }
});

/** Трафарет, у якому ще нічого не робили: без кольорів, палітри й позначок. */
function isPristine(p: Project): boolean {
  return (
    p.palette.length === 0 &&
    Object.keys(p.fills["3"]).length === 0 &&
    Object.keys(p.fills["4"]).length === 0 &&
    p.woven["3"].length === 0 &&
    p.woven["4"].length === 0 &&
    p.gaps.cols.length === 0 &&
    p.gaps.rows.length === 0
  );
}

/** Мініатюра й прогрес для трафарету, що не відкривався в цьому браузері. */
function decorate(p: Project): void {
  const g = buildGeometry(p.cols, p.rows, p.side, p.gaps);
  const key = sideKey(p.side);
  p.thumb = makeThumb(g, p.fills[key], hexOf);
  const exist = new Set(g.beads.map((b) => b.k));
  p.progress = { done: p.woven[key].filter((k) => exist.has(k)).length, total: g.beads.length };
}

/**
 * Відновлення з резервної копії: трафарети, яких тут немає, додаються; наявні оновлюються,
 * лише якщо в копії вони новіші. Нічого не видаляється.
 */
async function restoreBackup(b: ParsedBackup): Promise<string> {
  await flushSave();
  const addedColors = await restoreCustomColors(b.colors);
  // Відкритий трафарет під час відновлення не змінювався — не даємо автозбереженню перезаписати копію.
  window.clearTimeout(saveTimer);
  dirty = false;
  const local = new Map((await dbGetAll()).map((p) => [p.id, p]));
  let added = 0;
  let updated = 0;
  let same = 0;
  let reopen = false;
  for (const bp of b.projects) {
    const cur = local.get(bp.id);
    if (cur && cur.updatedAt >= bp.updatedAt) {
      same++;
      continue;
    }
    const p: Project = { ...bp };
    decorate(p);
    await dbPut(p);
    if (cur) updated++;
    else added++;
    if (p.id === project.id) reopen = true;
  }
  if (reopen) {
    const p = await dbGet(project.id);
    if (p) {
      dirty = false;
      await openProject(p);
    }
  } else if (added > 0 && isPristine(project)) {
    // Порожній трафарет, створений у новому браузері, після відновлення не потрібен.
    const blankId = project.id;
    dirty = false;
    await dbDelete(blankId);
    const rest = (await dbGetAll()).sort((a, b) => b.updatedAt - a.updatedAt);
    if (rest[0]) await openProject(rest[0]);
  }
  if (added + updated === 0 && addedColors === 0) {
    return "Усе з резервної копії вже є тут — нічого не змінилося.";
  }
  const parts = [`нових трафаретів — ${added}`, `оновлених — ${updated}`];
  if (same) parts.push(`без змін — ${same}`);
  if (addedColors) parts.push(`своїх кольорів додано — ${addedColors}`);
  return `Відновлено з резервної копії: ${parts.join(", ")}.`;
}

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

onCustomsChange((id) => {
  if (!ready) return;
  renderPalette();
  repaintBeads();
  scheduleStats();
  // Зберігаємо трафарет (мініатюру) лише тоді, коли змінився колір, що в ньому є.
  if (project.palette.includes(id) || customIdsIn(project.fills, project.palette).includes(id)) markDirty();
});

/* ---------- Друга вкладка з програмою ---------- */

// Якщо програму відкрито в кількох вкладках, збереження з однієї може перезаписати іншу.
if ("BroadcastChannel" in window) {
  const channel = new BroadcastChannel("sylianka");
  const warnOther = (): void =>
    showWarn("Програму відкрито ще в іншій вкладці чи вікні. Працюйте в одній, щоб зміни не перезаписали одна одну.", 12000);
  channel.addEventListener("message", (e) => {
    if (e.data === "hello") {
      channel.postMessage("here");
      warnOther();
    } else if (e.data === "here") warnOther();
  });
  channel.postMessage("hello");
}

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
