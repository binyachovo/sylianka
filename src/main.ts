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
import { fmtGrams, gramsFor } from "./buy";
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
import { parseProjectFile, saveBackupToFile, saveImageToFile, saveProjectToFile, type ParsedBackup } from "./files";
import {
  BEAD_R,
  GAP_UNIT,
  beadsPerStep,
  buildGeometry,
  knotLine,
  labelScale,
  symmetryClosure,
  type Bead,
  type Edge,
  type Gaps,
  type Geometry,
  type Symmetry
} from "./geometry";
import { HitIndex } from "./hit";
import { renderStencilPng, type ImageText, type LegendRow } from "./image";
import { History, type Action } from "./history";
import { convertHexFills } from "./legacy";
import {
  applyPrintLayout,
  describePlan,
  fitScaleWithText,
  fmtMm,
  planStrips,
  stripEnd,
  stripStart,
  tableHeightMm,
  type Frame
} from "./print";
import {
  MAX_PALETTE,
  MAX_SIDE,
  blankProject,
  cloneFills,
  cloneGaps,
  emptyWoven,
  ensureFields,
  fitSize,
  forgetV1,
  isLegacyProject,
  maxCells,
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
import { $, $$, clamp, esc, keyOf, num, plural, r2 } from "./util";
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

/** Смуги для номерів зліва й згори (на великих комірках — ширші, див. labelScale). */
const gutL = (): number => 27 * labelScale(project.side);
const gutT = (): number => 20 * labelScale(project.side);
const PAD = 9;

const settings = loadSettings();
const ui = { erase: false, fill: false, clean: false };
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
const fillBtn = $<HTMLButtonElement>("#fill");
const mirrorBtn = $<HTMLButtonElement>("#mirror");
const mirrorLrBtn = $<HTMLButtonElement>("#mirror-lr");
const repeatBtn = $<HTMLButtonElement>("#repeat");
const repeatInput = $<HTMLInputElement>("#repeat-n");
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
const wvPath = $<HTMLInputElement>("#wv-path");
const scroller = $("#scroller");
const zoomValue = $("#zoom-value");
const zoomOutBtn = $<HTMLButtonElement>("#zoom-out");
const zoomInBtn = $<HTMLButtonElement>("#zoom-in");

let beadEls = new Map<string, SVGElement>();
/** Бісерини за ключем — для шляху набору. */
let beadPos = new Map<string, Bead>();
/** Сусіди кожної бісерини вздовж ниток — для заливки (будуються, коли вперше знадобляться). */
let neighbors: Map<string, string[]> | null = null;
/** Пошук бісерини під курсором за координатами (див. hit.ts). */
let hitIndex: HitIndex | null = null;
/** Бісерина під мишею (підсвічена). */
let hoverKey: string | null = null;
/** Прозорий шар над сіткою, що ловить мишу. */
let hitRect: SVGElement | null = null;
/** Група під бісеринами: нитки, осі, межі повторів, номери. */
let underGroup: SVGElement | null = null;
/** Кільця підсвітки: під мишею й «де зупинилися». Окремі елементи, щоб не змінювати розмір самих бісерин. */
let ringHover: SVGElement | null = null;
let ringLast: SVGElement | null = null;
/** Лінія-підказка «тут буде проміжок», коли миша між номерами ромбів чи рядів. */
let gapGuide: SVGElement | null = null;
/** Група шляху набору (запам'ятовуємо: пошук у сітці з десятків тисяч бісерин повільний). */
let pathGroup: SVGElement | null = null;
/** Межа під мишею над номерами: після якого ромба (col) чи ряду (row). */
let hoverGutter: GapAt | null = null;
const viewBoxes = { normal: "0 0 1 1", clean: "0 0 1 1" };
let cleanDims: [number, number] = [1, 1];
/** Ширина трафарету в одиницях SVG (звичайний вигляд, з номерами). */
let vbWidth = 1;
let vbHeight = 1;

const fills = (): Record<string, string> => (project.fills[sideKey(project.side)] ??= {});
/** Позначки плетіння поточної сітки (3 чи 4 бісерини на сторону). */
const weave = new Weave();
const wovenList = (): string[] => (project.woven[sideKey(project.side)] ??= []);

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

/** Рамка сітки (viewBox) з номерами й без них за поточною геометрією. Повертає рамку з номерами. */
function frameGeometry(): number[] {
  if (!geom) return [0, 0, 1, 1];
  const { width: W, height: HT } = geom;
  const vb = [-gutL(), -gutT(), W + gutL() + PAD, HT + gutT() + PAD];
  const e = BEAD_R + 1;
  const vbc = [-e, -e, W + 2 * e, HT + 2 * e];
  viewBoxes.normal = vb.map(r2).join(" ");
  viewBoxes.clean = vbc.map(r2).join(" ");
  cleanDims = [vbc[2], vbc[3]];
  vbWidth = vb[2];
  vbHeight = vb[3];
  svg.setAttribute("viewBox", ui.clean ? viewBoxes.clean : viewBoxes.normal);
  return vb;
}

/** Усе, що лежить під бісеринами й залежить від проміжків: нитки, осі дзеркал, межі повторів, номери. */
function underParts(): string {
  if (!geom) return "";
  const { H, width: W, height: HT, px, py } = geom;
  const parts: string[] = [];
  parts.push(`<path class="thread" d="${threadPath(geom.edges, H)}"/>`);
  // Осі дзеркал — посередині висоти й довжини (якщо там проміжок — посередині проміжку).
  const axisY = r2((py(project.rows) + py(project.rows + 1e-3) - 1e-3 * H) / 2);
  const axisX = r2((px(project.cols) + px(project.cols + 1e-3) - 1e-3 * H) / 2);
  parts.push(`<line class="axis axis-tb" x1="-6" y1="${axisY}" x2="${r2(W + 6)}" y2="${axisY}"/>`);
  parts.push(`<line class="axis axis-lr" x1="${axisX}" y1="-6" x2="${axisX}" y2="${r2(HT + 6)}"/>`);
  parts.push(`<g class="periods">${periodLines()}</g>`);
  parts.push(numberLabels(0, project.cols, 0));
  return parts.join("");
}

function render(): void {
  geom = buildGeometry(project.cols, project.rows, project.side, project.gaps);
  const vb = frameGeometry();

  const existing = new Set(geom.beads.map((b) => b.k));
  weave.bind(wovenList(), (k) => existing.has(k));
  const parts: string[] = [];
  parts.push(`<g class="under">${underParts()}</g>`);
  // Бісерини в окремій групі: зміни поза нею не змушують браузер перераховувати межі всіх кіл.
  parts.push(`<g class="beads">`);
  for (const b of geom.beads) {
    const fill = fillFor(b.k);
    parts.push(
      `<circle class="${weave.has(b.k) ? "bd done" : "bd"}" cx="${r2(b.x)}" cy="${r2(b.y)}" r="${BEAD_R}"${fill ? ` style="fill:${fill}"` : ""}/>`
    );
  }
  parts.push(`</g>`);
  parts.push(`<g class="path"></g>`);
  parts.push(
    `<g class="marks"><circle class="ring ring-last" cx="0" cy="0" r="${BEAD_R + 1.1}"/>` +
      `<circle class="ring ring-hover" cx="0" cy="0" r="${BEAD_R + 0.9}"/>` +
      `<line class="gap-guide" x1="0" y1="0" x2="0" y2="0"/></g>`
  );
  // Прозорий шар зверху ловить мишу; бісерину під курсором шукаємо за координатами.
  parts.push(`<rect class="hit" x="${r2(vb[0])}" y="${r2(vb[1])}" width="${r2(vb[2])}" height="${r2(vb[3])}"/>`);

  applyZoom();
  svg.innerHTML = parts.join("");
  svg.setAttribute("aria-label", `Сітка силянки: ${project.rows} у висоту, ${project.cols} у ширину`);

  // Кола йдуть у тому самому порядку, що й geom.beads.
  beadEls = new Map();
  const els = $$<SVGElement>(".bd", svg);
  for (let i = 0; i < els.length; i++) beadEls.set(geom.beads[i].k, els[i]);
  beadPos = new Map(geom.beads.map((b) => [b.k, b]));
  neighbors = null;
  hitIndex = new HitIndex(geom.beads, geom.width);
  underGroup = svg.firstElementChild as SVGElement | null;
  hitRect = svg.lastElementChild as SVGElement | null;
  const marks = hitRect?.previousElementSibling ?? null;
  ringLast = marks?.querySelector<SVGElement>(".ring-last") ?? null;
  ringHover = marks?.querySelector<SVGElement>(".ring-hover") ?? null;
  gapGuide = marks?.querySelector<SVGElement>(".gap-guide") ?? null;
  pathGroup = (marks?.previousElementSibling as SVGElement | null) ?? null;
  hoverKey = null;
  hoverGutter = null;
  placeRing(ringLast, weave.last);

  syncTools();
  updateMeta();
  updateStats();
  updateWeaveInfo();
  syncGapsUi();
  syncRepeatUi();
  drawPath();
  printLayout();
}

/**
 * Змінилися лише проміжки: бісерини ті самі, тож переставляємо наявні кола й перемальовуємо
 * те, що під ними, — без повної перебудови сітки (на великих трафаретах це в рази швидше).
 */
function relayout(): void {
  const old = geom;
  geom = buildGeometry(project.cols, project.rows, project.side, project.gaps);
  if (!old || !underGroup || !hitRect || old.beads.length !== geom.beads.length) {
    render();
    return;
  }
  const vb = frameGeometry();
  applyZoom();
  underGroup.innerHTML = underParts();
  for (const b of geom.beads) {
    const el = beadEls.get(b.k);
    if (!el) continue;
    el.setAttribute("cx", r2(b.x));
    el.setAttribute("cy", r2(b.y));
  }
  hitRect.setAttribute("x", r2(vb[0]));
  hitRect.setAttribute("y", r2(vb[1]));
  hitRect.setAttribute("width", r2(vb[2]));
  hitRect.setAttribute("height", r2(vb[3]));
  beadPos = new Map(geom.beads.map((b) => [b.k, b]));
  hitIndex = new HitIndex(geom.beads, geom.width);
  setHover(null);
  setGutterHover(null);
  placeRing(ringLast, weave.last);
  drawPath();
  syncCopy();
  syncGapsUi();
  printLayout();
}

/**
 * Номери ромбів c0…c1 − 1 згори й рядів зліва (x0 — лівий край смуги). Розмір — за labelScale.
 */
function numberLabels(c0: number, c1: number, x0: number): string {
  if (!geom) return "";
  const { px, py } = geom;
  const k = labelScale(project.side);
  const parts = [`<g class="labels" font-size="${r2(9.5 * k)}">`];
  const colEvery = c1 - c0 > 40 ? 5 : 1;
  for (let i = c0; i < c1; i++) {
    const label = i + 1;
    if (colEvery === 1 || i === c0 || label % colEvery === 0) {
      parts.push(`<text class="lc" x="${r2(px(2 * i + 1))}" y="${r2(-8 * k)}" text-anchor="middle">${label}</text>`);
    }
  }
  const rowEvery = project.rows > 40 ? 5 : 1;
  for (let r = 0; r < project.rows; r++) {
    const label = r + 1;
    if (rowEvery === 1 || label === 1 || label % rowEvery === 0) {
      parts.push(
        `<text class="lr" x="${r2(x0 - 7.5 * k)}" y="${r2(py(2 * r + 1))}" text-anchor="end" dominant-baseline="central">${label}</text>`
      );
    }
  }
  parts.push(`</g>`);
  return parts.join("");
}

/** Межі повторів візерунка: після кожних N ромбів (посередині проміжку, якщо він там є). */
function periodLines(): string {
  if (!geom) return "";
  const { px, H, height: HT } = geom;
  let out = "";
  for (let j = project.repeat; j < project.cols; j += project.repeat) {
    const x = r2((px(2 * j) + px(2 * j + 1e-3) - 1e-3 * H) / 2);
    out += `<line x1="${x}" y1="-6" x2="${x}" y2="${r2(HT + 6)}"/>`;
  }
  return out;
}

function drawPeriods(): void {
  const g = svg.querySelector(".periods");
  if (g) g.innerHTML = periodLines();
  syncCopy();
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
  if (labels) return { left: gutL(), right: PAD, top: gutT(), bottom: PAD };
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
    printInfo.textContent = describePlan(
      planStrips(geom, project.cols, frameFor(!ui.clean), settings.printBead ?? 4, !ui.clean, tableMm())
    );
    return;
  }
  const k = ui.clean ? fitK : fitScaleWithText(vbWidth, vbHeight, fitOrient);
  const bead = 2 * BEAD_R * k;
  // Друк з текстом: назва (~17 мм разом із відступами), трафарет і таблиця бісеру на одному аркуші A4.
  const room = (fitOrient === "landscape" ? 210 : 297) - 2 * 10 - 3;
  const tableApart = !ui.clean && 17 + vbHeight * k + tableMm() > room;
  printInfo.textContent =
    (tableApart ? "Трафарет на одному аркуші, таблиця бісеру — на другому" : "На одному аркуші") +
    `, бісеринки ≈ ${fmtMm(bead)}.` +
    (bead < 2 ? " Задрібно — виберіть розмір бісеринок, і трафарет поділиться на смуги." : "");
}

/** Скільки місця на папері займе таблиця бісеру (0 — друк без тексту). */
function tableMm(): number {
  return ui.clean ? 0 : tableHeightMm(countsList.children.length);
}

/**
 * Одна смуга трафарету для друку: ромби з c0 до c1 (не включно).
 * Проміжок одразу за вузловими бісеринами на початку смуги чи одразу перед ними в кінці
 * в смугу не потрапляє: ці бісерини стають поруч зі своїм ромбом (див. stripStart / stripEnd).
 */
function stripSvg(c0: number, c1: number, labels: boolean, scale: number): string {
  if (!geom) return "";
  const { H, height: HT, px, py } = geom;
  const x0 = stripStart(geom, c0);
  const x1 = stripEnd(geom, c1);
  const lo = 2 * c0 - 1e-9;
  const hi = 2 * c1 + 1e-9;
  const shiftL = x0 - geom.colX[c0];
  const shiftR = x1 - geom.colX[c1];
  const shiftAt = (lx: number): number =>
    Math.abs(lx - 2 * c0) < 1e-6 ? shiftL : Math.abs(lx - 2 * c1) < 1e-6 ? shiftR : 0;
  const fr = frameFor(labels);
  const vb = [x0 - fr.left, -fr.top, x1 - x0 + fr.left + fr.right, HT + fr.top + fr.bottom];
  const parts: string[] = [];
  const edges: Edge[] = [];
  for (const e of geom.edges) {
    if (Math.min(e.lx0, e.lx1) < lo || Math.max(e.lx0, e.lx1) > hi) continue;
    const a = shiftAt(e.lx0);
    const b = shiftAt(e.lx1);
    if (!a && !b) {
      edges.push(e);
      continue;
    }
    const pts = [...e.pts];
    pts[0] += a;
    pts[pts.length - 2] += b;
    edges.push({ ...e, pts });
  }
  parts.push(`<path class="thread" d="${threadPath(edges, H)}"/>`);
  if (labels) parts.push(numberLabels(c0, c1, x0));
  const f = fills();
  for (const b of geom.beads) {
    if (b.lx < lo || b.lx > hi) continue;
    const id = f[b.k];
    const x = b.x + shiftAt(b.lx);
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
  const plan = planStrips(geom, project.cols, frameFor(labels), settings.printBead, labels, tableMm());
  pageSize.textContent = `@page { size: A4 ${plan.orient}; margin: 0; }`;
  const meta = metaText();
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

/* ---------- Картинка (PNG) ---------- */

let imageBusy = false;

/** Зберігає трафарет картинкою: з назвою, номерами й списком кольорів або (у «лише трафарет») без тексту. */
async function saveImage(): Promise<void> {
  if (!geom || imageBusy) return;
  imageBusy = true;
  const buttons = $$<HTMLButtonElement>("[data-png]");
  for (const b of buttons) b.disabled = true;
  document.body.classList.add("busy");
  try {
    const f = fills();
    let text: ImageText | null = null;
    if (!ui.clean) {
      const c = colorCounts();
      const legend: LegendRow[] = c.used.map((id) => {
        const v = colorView(id);
        const n = c.counts.get(id) ?? 0;
        return { hex: v.hex, code: v.code, name: v.name, count: num(n), grams: `≈ ${fmtGrams(gramsFor(n, settings.reserve))}` };
      });
      if (c.empty > 0) {
        legend.push({
          hex: null,
          code: "",
          name: "Не зафарбовано",
          count: num(c.empty),
          grams: `≈ ${fmtGrams(gramsFor(c.empty, settings.reserve))}`
        });
      }
      const reserve = settings.reserve ? `запас ${settings.reserve} %` : "без запасу";
      text = {
        title: project.name,
        meta: `${metaText()} · ${project.cols} ${plural(project.cols, "ромб", "ромби", "ромбів")} завдовжки`,
        rows: project.rows,
        cols: project.cols,
        labelScale: labelScale(project.side),
        total: `Усього бісерин: ${num(beadEls.size)} · купувати ≈ ${fmtGrams(totalGrams(c))} (${reserve})`,
        legend
      };
    }
    const png = await renderStencilPng({ geom, colorOf: (k) => (f[k] ? hexOf(f[k]) : undefined), text });
    if (!png) {
      showWarn("Не вдалося зробити картинку: браузеру забракло пам'яті. Спробуйте «Лише трафарет, без тексту» або менший трафарет.", 8000);
      return;
    }
    await saveImageToFile(project, png);
  } finally {
    imageBusy = false;
    for (const b of buttons) b.disabled = false;
    document.body.classList.remove("busy");
  }
}

for (const b of $$<HTMLButtonElement>("[data-png]")) b.addEventListener("click", () => void saveImage());

for (const b of $$<HTMLButtonElement>("[data-print]")) {
  b.addEventListener("click", () => window.print());
}

function syncCopy(): void {
  if (!ui.clean || !settings.two) return;
  copy.setAttribute("viewBox", viewBoxes.clean);
  copy.innerHTML = svg.innerHTML;
}

/** «8-рядна силянка · 3 бісерини в комірці», «… 5 бісерин у комірці». */
function metaText(): string {
  const s = project.side;
  const word = plural(s, "бісерина", "бісерини", "бісерин");
  return `${project.rows}-рядна силянка · ${s} ${word} ${word.endsWith("н") ? "у" : "в"} комірці`;
}

function updateMeta(): void {
  $("#meta").textContent = metaText();
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

/** Скільки купувати: «≈ 2,5 г» із поточним запасом. */
const gramsCell = (count: number): string =>
  `<span class="g">${count ? `≈ ${fmtGrams(gramsFor(count, settings.reserve))}` : "—"}</span>`;

function countRow(id: string | null, count: number, done: number): string {
  if (!id) {
    if (settings.weave) {
      return (
        `<li class="cnt cnt-empty"><span class="chip chip-empty"></span><span class="cnt-code"></span>` +
        `<span class="cnt-name">Не зафарбовано</span><span class="n">${num(count)}</span>${gramsCell(count)}${progressCell(done, count)}</li>`
      );
    }
    const canFill = count > 0 && !!settings.color;
    const cur = settings.color ? colorView(settings.color) : null;
    return (
      `<li class="cnt cnt-empty"><span class="chip chip-empty"></span><span class="cnt-code"></span>` +
      `<span class="cnt-name">Не зафарбовано</span><span class="n">${num(count)}</span>${gramsCell(count)}` +
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
    `<span class="n">${num(count)}</span>${gramsCell(count)}` +
    (settings.weave
      ? progressCell(done, count)
      : `<span class="cnt-act"><select class="cnt-replace" data-replace="${esc(id)}" aria-label="Замінити ${esc(fullLabel(v))} на інший колір"${others.length ? "" : " disabled"}>` +
        `<option value="">Замінити на…</option>${options}</select></span>`) +
    `</li>`
  );
}

/** Скільки бісерин кожного кольору (у порядку кольорів трафарету) і скільки з них нанизано. */
function colorCounts(): {
  used: string[];
  counts: Map<string, number>;
  done: Map<string, number>;
  empty: number;
  emptyDone: number;
} {
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
  const order = new Map(project.palette.map((id, i) => [id, i]));
  const used = Array.from(counts.keys()).sort(
    (a, b) => (order.get(a) ?? 1e6) - (order.get(b) ?? 1e6) || a.localeCompare(b)
  );
  return { used, counts, done, empty, emptyDone };
}

/** Скільки грамів купувати разом: сума по кольорах (кожен колір купують окремо й округлюють угору). */
function totalGrams(c: ReturnType<typeof colorCounts>): number {
  const grams = [...c.used.map((id) => c.counts.get(id) ?? 0), c.empty].reduce(
    (sum, n) => sum + gramsFor(n, settings.reserve),
    0
  );
  return Math.round(grams * 10) / 10;
}

function updateStats(): void {
  const c = colorCounts();
  const { used, counts, done, empty, emptyDone } = c;
  $("#st-total").textContent = num(beadEls.size);
  $("#st-step").textContent = num(beadsPerStep(project.rows, project.side));

  countsList.innerHTML =
    used.map((id) => countRow(id, counts.get(id) ?? 0, done.get(id) ?? 0)).join("") + countRow(null, empty, emptyDone);
  $("#st-grams").textContent = `≈ ${fmtGrams(totalGrams(c))}`;
  $("#st-reserve-note").textContent = settings.reserve ? ` (запас ${settings.reserve} %)` : " (без запасу)";
  syncCopy();
  // Від кількості рядків таблиці залежить, чи вміститься вона на аркуші з трафаретом.
  if (used.length !== tableRows) {
    tableRows = used.length;
    updatePrintInfo();
  }
}
let tableRows = -1;

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

const reserveSel = $<HTMLSelectElement>("#reserve");
reserveSel.addEventListener("change", () => {
  settings.reserve = Number(reserveSel.value);
  saveSettings(settings);
  updateStats();
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
  fillBtn.setAttribute("aria-pressed", String(ui.fill));
  svg.classList.toggle("filling", ui.fill && !settings.weave);
  mirrorBtn.setAttribute("aria-pressed", String(settings.mirror));
  mirrorLrBtn.setAttribute("aria-pressed", String(settings.mirrorLR));
  repeatBtn.setAttribute("aria-pressed", String(settings.repeat));
  svg.classList.toggle("erasing", ui.erase && !settings.weave);
  svg.classList.toggle("mirror-on", settings.mirror && !settings.weave);
  svg.classList.toggle("mirror-lr-on", settings.mirrorLR && !settings.weave);
  svg.classList.toggle("repeat-on", settings.repeat && !settings.weave);
  const cur = $("#cur-name");
  const brush = ui.erase ? "гумка" : settings.color ? fullLabel(colorView(settings.color)) : "не вибрано";
  cur.textContent = ui.fill ? (ui.erase ? "заливка гумкою" : `заливка — ${brush}`) : brush;
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
fillBtn.addEventListener("click", () => {
  ui.fill = !ui.fill;
  syncTools();
});
/* ---------- Дзеркала й повтор візерунка ---------- */

for (const [btn, key] of [
  [mirrorBtn, "mirror"],
  [mirrorLrBtn, "mirrorLR"],
  [repeatBtn, "repeat"]
] as const) {
  btn.addEventListener("click", () => {
    settings[key] = !settings[key];
    syncTools();
    saveSettings(settings);
  });
}

/** Поле кроку повтору: число й слова «кожні 5 ромбів», «кожен 21 ромб». */
function syncRepeatUi(): void {
  const n = project.repeat;
  if (document.activeElement !== repeatInput) repeatInput.value = String(n);
  repeatInput.max = String(MAX_SIDE);
  const one = n % 10 === 1 && n % 100 !== 11;
  $("#repeat-lead").textContent = one ? "кожен" : "кожні";
  $("#repeat-unit").textContent = plural(n, "ромб", "ромби", "ромбів");
}

function setRepeat(raw: string | number): void {
  const n = Math.round(Number(String(raw).replace(",", ".")));
  if (Number.isFinite(n) && n >= 1) {
    const next = clamp(n, 1, MAX_SIDE);
    if (next !== project.repeat) {
      project.repeat = next;
      markDirty();
      drawPeriods();
    }
  }
  repeatInput.value = String(project.repeat);
  syncRepeatUi();
}

repeatInput.addEventListener("change", () => setRepeat(repeatInput.value));
// Правильне число діє одразу, ще поки друкують (поле не переписуємо, щоб не заважати).
repeatInput.addEventListener("input", () => {
  const n = Number(repeatInput.value);
  if (!Number.isInteger(n) || n < 1 || n > MAX_SIDE || n === project.repeat) return;
  project.repeat = n;
  markDirty();
  drawPeriods();
  syncRepeatUi();
});
repeatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") repeatInput.blur();
});
for (const b of $$<HTMLButtonElement>("button[data-rep]")) {
  b.addEventListener("click", () => setRepeat(project.repeat + Number(b.dataset.rep)));
}

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

/** Поточні дзеркала й повтор. */
function symmetry(): Symmetry {
  return {
    tb: settings.mirror,
    lr: settings.mirrorLR,
    every: settings.repeat ? project.repeat : 0,
    rows: project.rows,
    cols: project.cols
  };
}

/** Бісерини, що фарбуються разом із даними: дзеркала й повтор візерунка (лише ті, що є в сітці). */
function withSymmetry(keys: string[]): string[] {
  if (!settings.mirror && !settings.mirrorLR && !settings.repeat) return keys;
  return [...symmetryClosure(keys, symmetry())].filter((t) => beadEls.has(t));
}

function paint(k: string, c: string | null): void {
  for (const t of withSymmetry([k])) setBead(t, c);
  scheduleStats();
}

/* ---------- Заливка ---------- */

/** Сусіди бісерин уздовж ниток: сусідні бісерини на одній стороні ромба. */
function neighborMap(): Map<string, string[]> {
  if (neighbors) return neighbors;
  const m = new Map<string, string[]>();
  const link = (a: string, b: string): void => {
    const list = m.get(a);
    if (list) list.push(b);
    else m.set(a, [b]);
  };
  for (const e of geom?.edges ?? []) {
    for (let i = 1; i < e.keys.length; i++) {
      link(e.keys[i - 1], e.keys[i]);
      link(e.keys[i], e.keys[i - 1]);
    }
  }
  neighbors = m;
  return m;
}

/** Область: бісерини того самого кольору (чи всі порожні), з'єднані з k нитками. */
function regionOf(k: string): string[] {
  const f = fills();
  const color = f[k];
  const near = neighborMap();
  const seen = new Set([k]);
  const queue = [k];
  for (let i = 0; i < queue.length; i++) {
    for (const n of near.get(queue[i]) ?? []) {
      if (seen.has(n) || f[n] !== color || !beadEls.has(n)) continue;
      seen.add(n);
      queue.push(n);
    }
  }
  return queue;
}

/** Заливає область під k поточним кольором (з гумкою — стирає її); одна дія для «Скасувати». */
function fillAt(k: string): void {
  if (!ui.erase && !settings.color) {
    needColor();
    return;
  }
  const f = fills();
  const target = ui.erase ? undefined : (settings.color ?? undefined);
  if (f[k] === target) {
    showWarn(ui.erase ? "Тут і так порожньо — стирати нічого." : "Ця область уже такого кольору.", 4000);
    return;
  }
  const changes = new Map<string, [string | undefined, string | undefined]>();
  for (const t of withSymmetry(regionOf(k))) if (f[t] !== target) changes.set(t, [f[t], target]);
  if (changes.size === 0) return;
  applyChanges(changes);
  const n = changes.size;
  showWarn(`${ui.erase ? "Стерто" : "Залито"} ${num(n)} ${plural(n, "бісерину", "бісерини", "бісерин")}.`, 3500);
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

/* ---------- Проміжки: клік у смузі з номерами ---------- */

/**
 * Місце для проміжку — між двома сусідніми лініями бісерин: «x» — між стовпчиками
 * (смуга з номерами ромбів згори), «y» — між рядками (смуга з номерами рядів зліва).
 * at і next — положення цих ліній у шостих частках ґратки; проміжок записується як at.
 */
type GapAt = { kind: "x" | "y"; at: number; next: number };

/** Проміжки між цими двома лініями (після зміни 3 ↔ 4 бісерини на сторону їх може бути кілька). */
const gapsIn = (g: GapAt): number[] => project.gaps[g.kind].filter((v) => v >= g.at && v < g.next);

/** Екранне положення лінії бісерин (шості частки ґратки). */
function linePos(kind: "x" | "y", v: number): number {
  if (!geom) return 0;
  return kind === "x" ? geom.px(v / GAP_UNIT) : geom.py(v / GAP_UNIT);
}

/** Межа між сусідніми лініями бісерин, на яку показує точка p (або null поза сіткою). */
function boundaryNear(kind: "x" | "y", p: number): GapAt | null {
  if (!geom) return null;
  const n = kind === "x" ? project.cols : project.rows;
  const step = geom.step;
  const last = knotLine(n) / step;
  if (p < linePos(kind, 0) || p > linePos(kind, knotLine(n))) return null;
  let lo = 0;
  let hi = last;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (linePos(kind, mid * step) <= p) lo = mid;
    else hi = mid;
  }
  return { kind, at: lo * step, next: (lo + 1) * step };
}

/** Межа під мишею: над трафаретом — між стовпчиками бісерин, зліва — між рядками. */
function gutterAt(e: { clientX: number; clientY: number }): GapAt | null {
  if (!geom || ui.clean || settings.weave) return null;
  const pt = svgPoint(e);
  if (!pt) return null;
  if (pt.y < -1 && pt.y >= -gutT()) return boundaryNear("x", pt.x);
  if (pt.x < -1 && pt.x >= -gutL()) return boundaryNear("y", pt.y);
  return null;
}

/** Де межа: між ромбами (рядами) — поруч із вузловими бісеринами, або всередині ромба (ряду). */
function gutterWhere(g: GapAt): string {
  const n = g.kind === "x" ? project.cols : project.rows;
  const one = knotLine(1);
  const knot = g.at % one === 0 ? g.at / one : g.next % one === 0 ? g.next / one : -1;
  if (knot >= 1 && knot < n) {
    return g.kind === "x" ? `між ромбами ${knot} і ${knot + 1}` : `між рядами ${knot} і ${knot + 1}`;
  }
  const inner = Math.floor(g.at / one) + 1;
  return g.kind === "x" ? `між стовпчиками бісерин у ромбі ${inner}` : `між рядками бісерин у ряду ${inner}`;
}

function gutterText(g: GapAt): string {
  return gapsIn(g).length ? `Клік — прибрати проміжок ${gutterWhere(g)}` : `Клік — проміжок ${gutterWhere(g)}`;
}

function setGutterHover(g: GapAt | null): void {
  if (g?.kind === hoverGutter?.kind && g?.at === hoverGutter?.at) return;
  hoverGutter = g;
  if (gapGuide && geom) {
    if (g) {
      const m = r2((linePos(g.kind, g.at) + linePos(g.kind, g.next)) / 2);
      if (g.kind === "x") {
        gapGuide.setAttribute("x1", m);
        gapGuide.setAttribute("x2", m);
        gapGuide.setAttribute("y1", r2(-gutT() + 3));
        gapGuide.setAttribute("y2", r2(geom.height + 3));
      } else {
        gapGuide.setAttribute("y1", m);
        gapGuide.setAttribute("y2", m);
        gapGuide.setAttribute("x1", r2(-gutL() + 3));
        gapGuide.setAttribute("x2", r2(geom.width + 3));
      }
    }
    gapGuide.classList.toggle("on", g !== null);
    gapGuide.classList.toggle("del", g !== null && gapsIn(g).length > 0);
  }
  hitRect?.classList.toggle("over", hoverKey !== null || g !== null);
}

/** Змінює проміжки однією дією (можна скасувати). */
function setGaps(next: { x: number[]; y: number[] }): void {
  const norm = (v: number[]): number[] => [...new Set(v)].sort((a, b) => a - b);
  const after: Gaps = { unit: GAP_UNIT, x: norm(next.x), y: norm(next.y) };
  const before = cloneGaps(project.gaps);
  if (before.x.join() === after.x.join() && before.y.join() === after.y.join()) return;
  drawHistory.push({ kind: "gaps", before, after: cloneGaps(after) });
  project.gaps = after;
  relayout();
  syncHistory();
  markDirty();
}

/** Клік по межі: є там проміжок — прибрати, немає — вставити. */
function toggleGap(g: GapAt): void {
  const list = project.gaps[g.kind];
  const next = gapsIn(g).length ? list.filter((v) => v < g.at || v >= g.next) : [...list, g.at];
  setGaps(g.kind === "x" ? { x: next, y: project.gaps.y } : { x: project.gaps.x, y: next });
}

/* ---------- Проміжки: панель «Проміжки» над трафаретом ---------- */

const gapsBtn = $<HTMLButtonElement>("#gaps-btn");
const gapsPop = $("#gaps-pop");
const gapsCount = $("#gaps-n");
const gapsState = $("#gaps-state");
const gapAxes = {
  x: {
    input: $<HTMLInputElement>("#gap-cols-n"),
    lead: $("#gap-cols-lead"),
    unit: $("#gap-cols-unit"),
    set: $<HTMLButtonElement>("#gap-cols-set"),
    clear: $<HTMLButtonElement>("#gap-cols-clear"),
    fallback: 5
  },
  y: {
    input: $<HTMLInputElement>("#gap-rows-n"),
    lead: $("#gap-rows-lead"),
    unit: $("#gap-rows-unit"),
    set: $<HTMLButtonElement>("#gap-rows-set"),
    clear: $<HTMLButtonElement>("#gap-rows-clear"),
    fallback: 4
  }
};

/** «Після кожних 5 ромбів», але «після кожного 21 ромба». */
function syncEveryWords(kind: "x" | "y"): void {
  const a = gapAxes[kind];
  const n = Math.round(Number(a.input.value));
  const one = n % 10 === 1 && n % 100 !== 11;
  a.lead.textContent = one ? "Після кожного" : "Після кожних";
  a.unit.textContent = kind === "x" ? (one ? "ромба" : "ромбів") : one ? "ряду" : "рядів";
}

/** «5, 10, 15» — перші кілька номерів. */
function numList(v: number[]): string {
  const head = v.slice(0, 8).join(", ");
  return v.length > 8 ? `${head} … (усього ${v.length})` : head;
}

/** Підсумок у панелі: номери ромбів (рядів), якщо всі проміжки між ними, інакше — скільки проміжків. */
function describeGaps(list: number[], kind: "x" | "y"): string {
  if (!list.length) return "";
  const one = knotLine(1);
  if (list.every((g) => g > 0 && g % one === 0)) {
    const where = numList(list.map((g) => g / one));
    return kind === "x" ? `Вертикальні — після ромбів ${where}.` : `Горизонтальні — після рядів ${where}.`;
  }
  return kind === "x" ? `Вертикальних проміжків — ${list.length}.` : `Горизонтальних проміжків — ${list.length}.`;
}

/** Лічильник на кнопці, стан кнопок і підсумок у панелі. */
function syncGapsUi(): void {
  if (!geom) return;
  const nx = geom.gx.length;
  const ny = geom.gy.length;
  gapsCount.textContent = nx + ny ? ` · ${nx + ny}` : "";
  for (const kind of ["x", "y"] as const) {
    const a = gapAxes[kind];
    const total = kind === "x" ? project.cols : project.rows;
    a.input.max = String(Math.max(1, total - 1));
    a.input.disabled = total < 2;
    a.set.disabled = total < 2;
    a.clear.disabled = (kind === "x" ? nx : ny) === 0;
    syncEveryWords(kind);
  }
  const text = [describeGaps(geom.gx, "x"), describeGaps(geom.gy, "y")].filter(Boolean).join(" ");
  gapsState.textContent = text || "Проміжків ще немає.";
}

/** Рівномірні проміжки: після кожних n ромбів (рядів). Інші проміжки цього напрямку прибираються. */
function spreadGaps(kind: "x" | "y"): void {
  const a = gapAxes[kind];
  const total = kind === "x" ? project.cols : project.rows;
  if (total < 2) return;
  let n = Math.round(Number(a.input.value));
  if (!Number.isFinite(n) || n < 1) n = a.fallback;
  n = clamp(n, 1, total - 1);
  a.input.value = String(n);
  const list: number[] = [];
  for (let v = n; v < total; v += n) list.push(knotLine(v));
  setGaps(kind === "x" ? { x: list, y: project.gaps.y } : { x: project.gaps.x, y: list });
  syncGapsUi();
}

function clearGaps(kind: "x" | "y"): void {
  setGaps(kind === "x" ? { x: [], y: project.gaps.y } : { x: project.gaps.x, y: [] });
  syncGapsUi();
}

/**
 * Спливна панель біля кнопки: кнопка відкриває й закриває її, клік поза панеллю чи Escape — закривають.
 * Повертає функцію, що відкриває (true) чи закриває (false) панель.
 */
function popover(btn: HTMLButtonElement, pop: HTMLElement, onOpen: () => void): (open: boolean) => void {
  const show = (open: boolean): void => {
    if (pop.hidden === !open) return;
    pop.hidden = !open;
    btn.setAttribute("aria-expanded", String(open));
    if (!open) return;
    onOpen();
    // Не виходити за правий край вікна: тоді панель вирівнюється по правому краю кнопки.
    pop.style.left = "";
    pop.style.right = "";
    if (pop.getBoundingClientRect().right > document.documentElement.clientWidth - 8) {
      pop.style.left = "auto";
      pop.style.right = "0";
    }
  };
  btn.addEventListener("click", () => show(pop.hidden));
  document.addEventListener(
    "pointerdown",
    (e) => {
      if (pop.hidden) return;
      const t = e.target as Node | null;
      if (t && (pop.contains(t) || btn.contains(t))) return;
      show(false);
    },
    true
  );
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || pop.hidden) return;
    show(false);
    btn.focus();
  });
  // Фокус клавіатурою пішов за межі панелі — закриваємо її.
  pop.addEventListener("focusout", (e) => {
    const t = e.relatedTarget as Node | null;
    if (t && !pop.contains(t) && !btn.contains(t)) show(false);
  });
  return show;
}

const showGapsPop = popover(gapsBtn, gapsPop, syncGapsUi);
for (const kind of ["x", "y"] as const) {
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

/* ---------- «Розмножити»: візерунок вибраних ромбів — праворуч до кінця ---------- */

const mulFrom = $<HTMLInputElement>("#mul-from");
const mulTo = $<HTMLInputElement>("#mul-to");
const mulInfo = $("#mul-info");
const mulGo = $<HTMLButtonElement>("#mul-go");

/** Ромби з a по b (з 1) або null, якщо поля заповнено неправильно. */
function mulRange(): [number, number] | null {
  const a = Math.round(Number(mulFrom.value));
  const b = Math.round(Number(mulTo.value));
  if (!mulFrom.value || !mulTo.value || !Number.isFinite(a) || !Number.isFinite(b)) return null;
  if (a < 1 || b < a || b > project.cols) return null;
  return [a, b];
}

/** Що станеться після «Розмножити» — або чому зараз не вийде. */
function syncMultiply(): void {
  const cols = project.cols;
  mulFrom.max = String(cols);
  mulTo.max = String(cols);
  const r = mulRange();
  let ok = false;
  if (!r) {
    mulInfo.textContent = `Вкажіть ромби від 1 до ${cols}; «по» — не менше, ніж «з».`;
  } else if (r[1] >= cols) {
    mulInfo.textContent = `Праворуч від ромба ${r[1]} ромбів уже немає — збільште трафарет у ширину.`;
  } else {
    const size = r[1] - r[0] + 1;
    const rest = cols - r[1];
    const full = Math.floor(rest / size);
    const part = rest % size;
    const what = [
      full ? `${full} ${plural(full, "повна копія", "повні копії", "повних копій")}` : "",
      part ? `частина копії (${part} ${plural(part, "ромб", "ромби", "ромбів")})` : ""
    ].filter(Boolean);
    mulInfo.textContent = `Заповнить ромби ${r[1] + 1}–${cols}: ${what.join(" і ")}.`;
    ok = true;
  }
  mulGo.disabled = !ok;
}

function openMultiply(): void {
  const r = mulRange();
  if (!r || r[1] >= project.cols) {
    mulFrom.value = "1";
    mulTo.value = String(Math.max(1, Math.min(project.repeat, project.cols - 1)));
  }
  syncMultiply();
}

/**
 * Копіює візерунок ромбів a…b праворуч, раз за разом до кінця трафарету (одна дія для «Скасувати»).
 * Самі ромби a…b не змінюються: копія починається за їхніми правими вузловими бісеринами.
 */
function multiply(a: number, b: number): void {
  if (!geom || b >= project.cols) return;
  const x0 = 2 * (a - 1);
  const x1 = 2 * b;
  const period = x1 - x0;
  const last = 2 * project.cols;
  const f = fills();
  const changes = new Map<string, [string | undefined, string | undefined]>();
  for (const bd of geom.beads) {
    if (bd.lx <= x0 + 1e-6 || bd.lx > x1 + 1e-6) continue;
    const src = f[bd.k];
    for (let t = bd.lx + period; t <= last + 1e-6; t += period) {
      const k = keyOf(t, bd.ly);
      if (!beadEls.has(k)) continue;
      if (f[k] !== src) changes.set(k, [f[k], src]);
    }
  }
  if (changes.size === 0) {
    showWarn("Праворуч уже такий самий візерунок — нічого не змінилося.", 5000);
    return;
  }
  applyChanges(changes);
  showWarn(`Візерунок ромбів ${a}–${b} розмножено до кінця трафарету. «Скасувати» поверне як було.`, 6000);
}

const showMulPop = popover($<HTMLButtonElement>("#multiply-btn"), $("#multiply-pop"), openMultiply);
mulFrom.addEventListener("input", syncMultiply);
mulTo.addEventListener("input", syncMultiply);
for (const inp of [mulFrom, mulTo]) {
  inp.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !mulGo.disabled) {
      e.preventDefault();
      mulGo.click();
    }
  });
}
mulGo.addEventListener("click", () => {
  const r = mulRange();
  if (!r) return;
  showMulPop(false);
  multiply(r[0], r[1]);
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
    extendPath(k);
  } else {
    const i = weave.unmark(k);
    if (i < 0) return;
    weaving.items.push([i, k]);
    // Шлях перемалюємо, коли відпустять мишу: під час руху повне перемальовування гальмує.
    pathStale = true;
  }
  refreshBead(k);
  moveLast(prev);
  scheduleWeaveInfo();
}

function endWeave(): void {
  if (!weaving) return;
  const w = weaving;
  weaving = null;
  // Після руху миші — один раз увесь шлях (якщо щось знімали чи дописаних відрізків уже багато).
  if (pathStale || pathExtra >= 300) drawPath();
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
  svg.classList.toggle("show-path", settings.path);
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
    showMulPop(false);
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
  drawPath();
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
  drawPath();
}

/* ---------- Шлях набору ---------- */

/** Шлях видно лише в режимі плетіння з галочкою, не в «лише трафарет» і не під час друку. */
const pathVisible = (): boolean => settings.weave && settings.path && !ui.clean && !printing;

/**
 * Стан намальованого шляху: скільки в ньому бісерин, остання з них, скільки відрізків дописано
 * окремими елементами і чи шлях застарів (його перемалюють, коли закінчиться рух миші).
 */
let pathCount = 0;
let pathPrev: Bead | undefined;
let pathExtra = 0;
let pathStale = false;

/** Стрілка напрямку (на кожному п'ятому відрізку) і номер (першої бісерини й кожної десятої). */
function pathMarks(n: number, prev: Bead | undefined, b: Bead): string {
  let out = "";
  if (prev && n % 5 === 2) {
    const angle = (Math.atan2(b.y - prev.y, b.x - prev.x) * 180) / Math.PI;
    out +=
      `<path class="pa" d="M-2.4 -2L2 0L-2.4 2z" transform="translate(${r2((prev.x + b.x) / 2)} ${r2((prev.y + b.y) / 2)})` +
      ` rotate(${r2(angle)})"/>`;
  }
  if (n === 1 || n % 10 === 0) out += `<text class="pn" x="${r2(b.x + 4.2)}" y="${r2(b.y - 4.2)}">${n}</text>`;
  return out;
}

/** Шлях набору: лінія через нанизані бісерини в порядку позначення, зі стрілками й номерами. */
function drawPath(): void {
  const g = pathGroup;
  pathCount = 0;
  pathPrev = undefined;
  pathExtra = 0;
  pathStale = false;
  if (!g) return;
  if (!pathVisible()) {
    if (g.firstChild) g.textContent = "";
    return;
  }
  let d = "";
  let marks = "";
  for (const k of wovenList()) {
    const b = beadPos.get(k);
    if (!b) continue;
    pathCount++;
    d += `${pathCount === 1 ? "M" : "L"}${r2(b.x)} ${r2(b.y)}`;
    marks += pathMarks(pathCount, pathPrev, b);
    pathPrev = b;
  }
  g.innerHTML = pathCount ? `<path class="pl" d="${d}"/>${marks}` : "";
}

/**
 * Нанизали ще одну бісерину в кінці набору: дописуємо до шляху один відрізок, а не малюємо
 * весь шлях наново — так на великих трафаретах браузер перемальовує лише малу ділянку.
 */
function extendPath(k: string): void {
  if (!pathGroup || !pathVisible() || pathStale) return;
  const b = beadPos.get(k);
  if (!b) return;
  if (weave.number(k) !== pathCount + 1) {
    pathStale = true;
    return;
  }
  pathCount++;
  const seg = pathPrev ? `<path class="pl" d="M${r2(pathPrev.x)} ${r2(pathPrev.y)}L${r2(b.x)} ${r2(b.y)}"/>` : "";
  pathGroup.insertAdjacentHTML("beforeend", seg + pathMarks(pathCount, pathPrev, b));
  pathPrev = b;
  pathExtra++;
}

wvPath.addEventListener("change", () => {
  settings.path = wvPath.checked;
  saveSettings(settings);
  syncStencilClasses();
  drawPath();
});

/* ---------- Події миші на сітці ---------- */

/** Остання бісерина, через яку пройшла миша під час малювання чи позначення. */
let strokeKey: string | null = null;

/** Поле, у якому щойно друкували, застосовує значення до кліку по трафарету (preventDefault не знімає фокус сам). */
function commitField(): void {
  const el = document.activeElement;
  if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement) el.blur();
}

svg.addEventListener("pointerdown", (e) => {
  lastPointer = e.pointerType;
  if (e.pointerType !== "mouse" || e.button !== 0 || ui.clean) return;
  commitField();
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
  if (ui.fill) {
    fillAt(k);
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
  commitField();
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
  if (ui.fill) {
    fillAt(k);
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
      const f = (project.fills[a.side] ??= {});
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
      relayout();
      break;
    case "mark": {
      const list = (project.woven[a.side] ??= []);
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
      const list = (project.woven[a.side] ??= []);
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
  } else if (e.code === "KeyF") {
    e.preventDefault();
    ui.fill = !ui.fill;
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
  const cells = maxCells(project.side);
  const cap = Math.min(MAX_SIDE, Math.floor(cells / other));
  const next = clamp(v, 1, cap);
  if (next < v) {
    showWarn(
      `Найбільше — 400 ромбів з кожного боку й до ${num(cells)} ромбів разом ` +
        `(для ${project.side} бісерин на сторону), щоб програма не зависала.`
    );
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
    const next: Side = Number(b.dataset.s);
    if (!Number.isInteger(next) || next === project.side) return;
    // Більші комірки — більше бісерин у кожному ромбі: завеликий трафарет спершу треба зменшити.
    const cells = maxCells(next);
    if (project.rows * project.cols > cells) {
      showWarn(
        `Для ${next} бісерин на сторону трафарет може мати до ${num(cells)} ромбів разом, ` +
          `а зараз ${num(project.rows * project.cols)}. Зменште висоту чи ширину й спробуйте ще раз.`,
        9000
      );
      return;
    }
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
  if (on) {
    showGapsPop(false);
    showMulPop(false);
  }
  cleanBox.checked = on;
  document.body.classList.toggle("clean", on);
  svg.setAttribute("viewBox", on ? viewBoxes.clean : viewBoxes.normal);
  syncStencilClasses();
  drawPath();
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
  if (Object.keys(project.fills[key] ?? {}).length === 0) return;
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
  for (const side of Object.values(p.fills)) {
    for (const id of Object.values(side)) {
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
  ensureFields(p);
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
    ensureFields(src);
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
    return Object.values(src.woven).some((list) => list.length > 0);
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
    ensureFields(p);
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
      ensureFields(p);
    }
    return saveBackupToFile(list);
  }
});

/** Трафарет, у якому ще нічого не робили: без кольорів, палітри й позначок. */
function isPristine(p: Project): boolean {
  return (
    p.palette.length === 0 &&
    Object.values(p.fills).every((f) => Object.keys(f).length === 0) &&
    Object.values(p.woven).every((w) => w.length === 0) &&
    p.gaps.x.length === 0 &&
    p.gaps.y.length === 0
  );
}

/** Мініатюра й прогрес для трафарету, що не відкривався в цьому браузері. */
function decorate(p: Project): void {
  const g = buildGeometry(p.cols, p.rows, p.side, p.gaps);
  const key = sideKey(p.side);
  p.thumb = makeThumb(g, p.fills[key] ?? {}, hexOf);
  const exist = new Set(g.beads.map((b) => b.k));
  p.progress = { done: (p.woven[key] ?? []).filter((k) => exist.has(k)).length, total: g.beads.length };
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
  wvPath.checked = settings.path;
  reserveSel.value = String(settings.reserve);
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
