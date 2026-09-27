import { BEAD_R, knotLine, type Geometry } from "./geometry";
import { plural } from "./util";

/**
 * Друк на A4 з полями 10 мм.
 * «Вмістити на аркуш» — трафарет (або дві копії) якомога більшим на одному аркуші.
 * «Смуги» — бісеринки заданого розміру; довгий трафарет ділиться на смуги, смуги — на аркуші.
 */
const MARGIN = 10;
const GAP = 8;
const SAFE = 3;
/** Висота підпису аркуша (назва й номер аркуша) у друку з текстом, мм. */
const HEADER = 11;
const STRIP_GAP = 6;

type Orient = "landscape" | "portrait";
type Dir = "column" | "row";
const PAGES: [number, number, Orient][] = [
  [297, 210, "landscape"],
  [210, 297, "portrait"]
];

/** Розкладка «вмістити на аркуш» для режиму «лише трафарет»: мм на одиницю SVG і орієнтація аркуша. */
export function applyPrintLayout(
  vw: number,
  vh: number,
  copies: 1 | 2,
  pageStyle: HTMLStyleElement
): { k: number; orient: Orient } {
  const dirs: Dir[] = copies === 2 ? ["column", "row"] : ["column"];
  let best: { k: number; orient: Orient; dir: Dir } | null = null;

  for (const [pw, ph, orient] of PAGES) {
    const cw = pw - 2 * MARGIN;
    const ch = ph - 2 * MARGIN - SAFE;
    for (const dir of dirs) {
      const bw = copies === 2 && dir === "row" ? (cw - GAP) / 2 : cw;
      const bh = copies === 2 && dir === "column" ? (ch - GAP) / 2 : ch;
      const k = Math.min(bw / vw, bh / vh);
      if (!best || k > best.k + 1e-9) best = { k, orient, dir };
    }
  }
  if (!best) return { k: 0, orient: "landscape" };

  pageStyle.textContent = `@page { size: A4 ${best.orient}; margin: 0; }`;
  const rs = document.documentElement.style;
  rs.setProperty("--print-w", `${Math.floor(vw * best.k * 10) / 10}mm`);
  rs.setProperty("--print-h", `${Math.floor(vh * best.k * 10) / 10}mm`);
  rs.setProperty("--print-dir", best.dir);
  return { k: best.k, orient: best.orient };
}

/** Мм на одиницю SVG у друку з текстом «вмістити на аркуш»: трафарет на всю ширину, не вище 118 мм. */
export function fitScaleWithText(vw: number, vh: number, orient: Orient): number {
  const aw = (orient === "landscape" ? 297 : 210) - 2 * MARGIN;
  return Math.min(aw / vw, 118 / vh);
}

/** Поля навколо сітки в одиницях SVG: з номерами рядів і ромбів або без. */
export interface Frame {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface StripPlan {
  orient: Orient;
  /** Мм на одиницю SVG. */
  scale: number;
  /** Діаметр бісеринки на папері, мм. */
  beadMm: number;
  /** Бісеринки довелося зменшити, щоб усі ряди вмістилися по висоті аркуша. */
  reduced: boolean;
  /** Найбільше ромбів в одній смузі. */
  perStrip: number;
  strips: number;
  stripsPerPage: number;
  pages: number;
  /** Ромби кожної смуги: [перший, після останнього), з 0. */
  ranges: [number, number][];
  /** Таблиця бісеру не вміщається під останньою смугою — буде на окремому аркуші. */
  tablePage: boolean;
  /** Усього аркушів разом із таблицею бісеру. */
  sheets: number;
}

/** Висота таблиці бісеру на папері, мм: заголовок і рядки (кольори й «не зафарбовано»). */
export const tableHeightMm = (rows: number): number => 8 + 8.5 * rows;

/** Скільки проміжків (відсортований список) лежить у [from, to). */
function countIn(list: number[], from: number, to: number): number {
  const lower = (v: number): number => {
    let lo = 0;
    let hi = list.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (list[mid] < v) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  };
  return lower(to) - lower(from);
}

/**
 * Смуги ріжуться між ромбами — по стовпчику вузлових бісерин, який друкується на обох смугах.
 * Проміжок одразу за цим стовпчиком не потрапляє на початок наступної смуги, а проміжок
 * одразу перед ним — у кінець попередньої: вузлові бісерини стають поруч зі своїм ромбом.
 */
export function stripStart(geom: Geometry, c0: number): number {
  if (c0 === 0) return geom.colX[0];
  return geom.colX[c0] + geom.gap * countIn(geom.gx, knotLine(c0), knotLine(c0) + geom.step);
}

/** Права межа смуги, що закінчується перед ромбом c1 (див. stripStart). */
export function stripEnd(geom: Geometry, c1: number): number {
  const last = geom.colX.length - 1;
  if (c1 === last) return geom.colX[last];
  return geom.colX[c1] - geom.gap * countIn(geom.gx, knotLine(c1) - geom.step, knotLine(c1));
}

const stripWidth = (geom: Geometry, c0: number, c1: number): number => stripEnd(geom, c1) - stripStart(geom, c0);

/** Біля вузлових бісерин між ромбами c і c + 1 є проміжок — тут смугу зручно розрізати. */
const gapAtCut = (geom: Geometry, c: number): boolean =>
  countIn(geom.gx, knotLine(c) - geom.step, knotLine(c) + geom.step) > 0;

/**
 * Жадібний поділ на смуги не ширші за maxW (у кожній смузі щонайменше один ромб).
 * alignGaps — закінчувати смугу на останньому проміжку, що в неї вліз.
 */
function split(geom: Geometry, cols: number, maxW: number, alignGaps: boolean): [number, number][] {
  const out: [number, number][] = [];
  let c0 = 0;
  while (c0 < cols) {
    let c1 = c0 + 1;
    while (c1 < cols && stripWidth(geom, c0, c1 + 1) <= maxW + 1e-9) c1++;
    if (alignGaps && c1 < cols) {
      let g = c1;
      while (g > c0 && !gapAtCut(geom, g)) g--;
      if (g > c0) c1 = g;
    }
    out.push([c0, c1]);
    c0 = c1;
  }
  return out;
}

/**
 * Смуги не ширші за maxW. Якщо поділ по проміжках не додає аркушів — ріжемо по проміжках;
 * інакше беремо найменше смуг і вирівнюємо їх за шириною (найширша якомога вужча).
 */
function stripRanges(geom: Geometry, cols: number, maxW: number, perPage: number): [number, number][] {
  const greedy = split(geom, cols, maxW, false);
  const n = greedy.length;
  if (n === 1) return greedy;
  if (geom.gx.length) {
    const aligned = split(geom, cols, maxW, true);
    const onGap = aligned.some(([a]) => a > 0 && gapAtCut(geom, a));
    if (onGap && Math.ceil(aligned.length / perPage) <= Math.ceil(n / perPage)) return aligned;
  }
  let lo = 0;
  let hi = maxW;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (split(geom, cols, mid, false).length <= n) hi = mid;
    else lo = mid;
  }
  const even = split(geom, cols, hi, false);
  return even.length === n ? even : greedy;
}

/**
 * Як поділити трафарет на смуги й аркуші для бісеринок заданого розміру.
 * tailMm — скільки місця треба після смуг (таблиця бісеру у друці з текстом), 0 — нічого.
 */
export function planStrips(
  geom: Geometry,
  cols: number,
  frame: Frame,
  beadMm: number,
  header: boolean,
  tailMm = 0
): StripPlan {
  const hUnits = geom.height + frame.top + frame.bottom;
  let best: StripPlan | null = null;
  for (const [pw, ph, orient] of PAGES) {
    const aw = pw - 2 * MARGIN;
    const ah = ph - 2 * MARGIN - SAFE - (header ? HEADER : 0);
    let scale = beadMm / (2 * BEAD_R);
    let reduced = false;
    if (hUnits * scale > ah) {
      scale = ah / hUnits;
      reduced = true;
    }
    const stripsPerPage = Math.max(1, Math.floor((ah + STRIP_GAP) / (hUnits * scale + STRIP_GAP)));
    const ranges = stripRanges(geom, cols, aw / scale - frame.left - frame.right, stripsPerPage);
    const strips = ranges.length;
    const perStrip = Math.max(...ranges.map(([a, b]) => b - a));
    const pages = Math.ceil(strips / stripsPerPage);
    const onLast = strips - (pages - 1) * stripsPerPage;
    const tablePage = tailMm > 0 && onLast * (hUnits * scale + STRIP_GAP) + tailMm > ah;
    const plan: StripPlan = {
      orient,
      scale,
      beadMm: 2 * BEAD_R * scale,
      reduced,
      perStrip,
      strips,
      stripsPerPage,
      pages,
      ranges,
      tablePage,
      sheets: pages + (tablePage ? 1 : 0)
    };
    if (!best || better(plan, best)) best = plan;
  }
  return best as StripPlan;
}

function better(a: StripPlan, b: StripPlan): boolean {
  if (a.reduced !== b.reduced) return !a.reduced;
  if (a.reduced) return a.beadMm > b.beadMm + 1e-6;
  if (a.sheets !== b.sheets) return a.sheets < b.sheets;
  return a.beadMm > b.beadMm + 1e-6;
}

const mm = new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 1 });
export const fmtMm = (v: number): string => `${mm.format(v)} мм`;

/** Короткий опис плану для панелі «Друк». */
export function describePlan(p: StripPlan): string {
  const pages = `${p.sheets} ${plural(p.sheets, "аркуш", "аркуші", "аркушів")}`;
  // «по N ромбів», якщо всі смуги, крім останньої, однакові; інакше «до N ромбів».
  const even = p.ranges.slice(0, -1).every(([a, b]) => b - a === p.perStrip);
  const strips =
    p.strips === 1
      ? "одна смуга"
      : `${p.strips} ${plural(p.strips, "смуга", "смуги", "смуг")} ` +
        (even
          ? `по ${p.perStrip} ${plural(p.perStrip, "ромбу", "ромби", "ромбів")}`
          : `до ${p.perStrip} ${plural(p.perStrip, "ромба", "ромбів", "ромбів")}`);
  const bead = p.reduced
    ? `бісеринки зменшено до ${fmtMm(p.beadMm)}, щоб вмістилися всі ряди`
    : `бісеринки ${fmtMm(p.beadMm)}`;
  const table = p.tablePage ? "; таблиця бісеру — на окремому аркуші" : "";
  return `Вийде ${pages}: ${strips}, ${bead}${table}.`;
}

export { HEADER as PRINT_HEADER_MM, STRIP_GAP as PRINT_STRIP_GAP_MM };
