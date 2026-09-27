import { BEAD_R, type Geometry } from "./geometry";
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
  /** Ромбів у смузі (остання може бути коротшою). */
  perStrip: number;
  strips: number;
  stripsPerPage: number;
  pages: number;
}

/** Як поділити трафарет на смуги й аркуші для бісеринок заданого розміру. */
export function planStrips(geom: Geometry, cols: number, frame: Frame, beadMm: number, header: boolean): StripPlan {
  const hUnits = geom.height + frame.top + frame.bottom;
  const colW = 2 * geom.H;
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
    const fit = Math.max(1, Math.floor((aw / scale - frame.left - frame.right) / colW));
    const strips = Math.ceil(cols / fit);
    const perStrip = Math.ceil(cols / strips);
    const stripsPerPage = Math.max(1, Math.floor((ah + STRIP_GAP) / (hUnits * scale + STRIP_GAP)));
    const pages = Math.ceil(strips / stripsPerPage);
    const plan: StripPlan = { orient, scale, beadMm: 2 * BEAD_R * scale, reduced, perStrip, strips, stripsPerPage, pages };
    if (!best || better(plan, best)) best = plan;
  }
  return best as StripPlan;
}

function better(a: StripPlan, b: StripPlan): boolean {
  if (a.reduced !== b.reduced) return !a.reduced;
  if (a.reduced) return a.beadMm > b.beadMm + 1e-6;
  if (a.pages !== b.pages) return a.pages < b.pages;
  return a.beadMm > b.beadMm + 1e-6;
}

const mm = new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 1 });
export const fmtMm = (v: number): string => `${mm.format(v)} мм`;

/** Короткий опис плану для панелі «Друк». */
export function describePlan(p: StripPlan): string {
  const pages = `${p.pages} ${plural(p.pages, "аркуш", "аркуші", "аркушів")}`;
  const strips =
    p.strips === 1
      ? "одна смуга"
      : `${p.strips} ${plural(p.strips, "смуга", "смуги", "смуг")} по ${p.perStrip} ${plural(p.perStrip, "ромбу", "ромби", "ромбів")}`;
  const bead = p.reduced
    ? `бісеринки зменшено до ${fmtMm(p.beadMm)}, щоб вмістилися всі ряди`
    : `бісеринки ${fmtMm(p.beadMm)}`;
  return `Вийде ${pages}: ${strips}, ${bead}.`;
}

export { HEADER as PRINT_HEADER_MM, STRIP_GAP as PRINT_STRIP_GAP_MM };
