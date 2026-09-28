import { GAP_UNIT, knotLine, type Gaps } from "./geometry";
import type { Fills, SideKey, Woven } from "./projects";
import { keyOf, parseKey } from "./util";

/**
 * Видалення ряду чи стовпця ромбів посередині трафарету.
 *
 * Ряд (стовпець) n (з 1) займає в ґратці смугу від 2(n − 1) до 2n. Видаляються все, що всередині
 * смуги, і вузлові бісерини на її нижньому (правому) краї; вузлові на верхньому (лівому) краї
 * лишаються й стають межею з наступним рядом (стовпцем). Усе нижче (правіше) зсувається на 2
 * одиниці ґратки вгору (ліворуч). Так само для всіх кількостей бісерин на сторону — візерунки
 * й позначки плетіння для кожної зсуваються однаково, а проміжки на видалених лініях зникають.
 */

export type CutAxis = "row" | "col";

/** Що видалено — щоб «Скасувати» могло повернути. */
export interface CutRemoved {
  /** Кольори видалених бісерин (ключі — як були до видалення). */
  fills: Fills;
  /** Видалені позначки плетіння: [позиція в наборі до видалення, ключ] за зростанням позиції. */
  woven: Record<SideKey, [number, string][]>;
  /** Видалені проміжки цього напрямку (у GAP_UNIT). */
  gaps: number[];
}

/** Дані трафарету, які змінює видалення. */
export interface CutData {
  rows: number;
  cols: number;
  fills: Fills;
  woven: Woven;
  gaps: Gaps;
}

const EPS = 1e-3;

/** Нове положення лінії v (координата ґратки вздовж осі) після видалення смуги n; null — лінію видалено. */
export function cutCoord(v: number, n: number): number | null {
  if (v <= 2 * (n - 1) + EPS) return v;
  if (v <= 2 * n + EPS) return null;
  return v - 2;
}

/** Зворотне до cutCoord для ліній, що лишилися. */
export function uncutCoord(v: number, n: number): number {
  return v <= 2 * (n - 1) + EPS ? v : v + 2;
}

function mapKey(k: string, axis: CutAxis, f: (v: number) => number | null): string | null {
  const [x, y] = parseKey(k);
  if (axis === "col") {
    const nx = f(x);
    return nx === null ? null : keyOf(nx, y);
  }
  const ny = f(y);
  return ny === null ? null : keyOf(x, ny);
}

const gapAxis = (axis: CutAxis): "x" | "y" => (axis === "col" ? "x" : "y");

/** Проміжки з новим списком для одного напрямку (другий — копія як був). */
const withAxis = (gaps: Gaps, g: "x" | "y", list: number[]): Gaps =>
  g === "x" ? { unit: GAP_UNIT, x: list, y: [...gaps.y] } : { unit: GAP_UNIT, x: [...gaps.x], y: list };

/** Видаляє ряд (стовпець) n: змінює d на місці й повертає видалене. */
export function cutGrid(d: CutData, axis: CutAxis, n: number): CutRemoved {
  const removed: CutRemoved = { fills: {}, woven: {}, gaps: [] };
  const cut = (v: number): number | null => cutCoord(v, n);

  const fills: Fills = {};
  for (const [side, src] of Object.entries(d.fills)) {
    const dst: Record<string, string> = {};
    const gone: Record<string, string> = {};
    for (const [k, id] of Object.entries(src)) {
      const nk = mapKey(k, axis, cut);
      if (nk === null) gone[k] = id;
      else dst[nk] = id;
    }
    fills[side] = dst;
    if (Object.keys(gone).length) removed.fills[side] = gone;
  }

  const woven: Woven = {};
  for (const [side, list] of Object.entries(d.woven)) {
    const dst: string[] = [];
    const gone: [number, string][] = [];
    list.forEach((k, i) => {
      const nk = mapKey(k, axis, cut);
      if (nk === null) gone.push([i, k]);
      else dst.push(nk);
    });
    woven[side] = dst;
    if (gone.length) removed.woven[side] = gone;
  }

  const lo = knotLine(n - 1);
  const hi = knotLine(n);
  const one = knotLine(1);
  const g = gapAxis(axis);
  const kept: number[] = [];
  for (const v of d.gaps[g]) {
    if (v <= lo) kept.push(v);
    else if (v <= hi) removed.gaps.push(v);
    else kept.push(v - one);
  }

  d.fills = fills;
  d.woven = woven;
  d.gaps = withAxis(d.gaps, g, kept);
  if (axis === "row") d.rows -= 1;
  else d.cols -= 1;
  return removed;
}

/** Повертає видалений ряд (стовпець) n: зворотне до cutGrid. */
export function uncutGrid(d: CutData, axis: CutAxis, n: number, removed: CutRemoved): void {
  const back = (v: number): number => uncutCoord(v, n);

  const fills: Fills = {};
  for (const [side, src] of Object.entries(d.fills)) {
    const dst: Record<string, string> = {};
    for (const [k, id] of Object.entries(src)) dst[mapKey(k, axis, back) ?? k] = id;
    fills[side] = dst;
  }
  for (const [side, gone] of Object.entries(removed.fills)) Object.assign((fills[side] ??= {}), gone);

  const woven: Woven = {};
  for (const [side, list] of Object.entries(d.woven)) woven[side] = list.map((k) => mapKey(k, axis, back) ?? k);
  for (const [side, gone] of Object.entries(removed.woven)) {
    const list = (woven[side] ??= []);
    for (const [i, k] of gone) list.splice(Math.min(i, list.length), 0, k);
  }

  const lo = knotLine(n - 1);
  const one = knotLine(1);
  const g = gapAxis(axis);
  const restored = d.gaps[g].map((v) => (v <= lo ? v : v + one));
  d.gaps = withAxis(d.gaps, g, [...new Set([...restored, ...removed.gaps])].sort((a, b) => a - b));

  d.fills = fills;
  d.woven = woven;
  if (axis === "row") d.rows += 1;
  else d.cols += 1;
}
