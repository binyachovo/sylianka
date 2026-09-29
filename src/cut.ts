import { GAP_UNIT, sideAt, type Gaps } from "./geometry";
import { MAX_BEADS_SIDE, type Fills, type Shapes, type SideKey, type Woven } from "./projects";
import { keyOf, parseKey } from "./util";

/**
 * Видалення й вставка одного рядка бісерин.
 *
 * Рядок бісерин — горизонтальна лінія бісерин сторін усередині половини ряду ромбів: h — номер половини
 * (0 — верхня половина першого ряду, 1 — його нижня, 2 — верхня другого…), j — номер лінії в ній
 * від вузлових угорі (з 1; вузлові — лінії 0 і s − 1 для s бісерин на сторону). Вузлові рядки не видаляються:
 * на них тримаються ромби. Після видалення на сторонах ромбів цієї половини ряду на бісерину менше,
 * бісерини нижчих ліній тієї самої половини переходять на свої місця на коротших сторонах,
 * а решта трафарету не змінюється (ключі поза половиною ряду ті самі). Вставка — навпаки: на сторонах
 * на бісерину більше (до MAX_BEADS_SIDE), новий рядок порожній, нижчі лінії половини ряду опускаються.
 */

/** Що видалено з рядком бісерин — щоб «Скасувати» могло повернути. */
export interface LineRemoved {
  /** Кольори видалених бісерин (ключі — як були до видалення). */
  fills: Record<string, string>;
  /** Видалені позначки плетіння: [позиція в наборі до видалення, ключ] за зростанням позиції. */
  woven: [number, string][];
  /** Проміжки по висоті до видалення (у GAP_UNIT). */
  gapsY: number[];
  /** Список бісерин на сторону по половинах рядів до видалення (undefined — його не було). */
  shape: number[] | undefined;
}

/** Дані трафарету, які змінює видалення рядка бісерин. */
export interface LineCutData {
  rows: number;
  fills: Fills;
  woven: Woven;
  gaps: Gaps;
  shape: Shapes;
}

const EPS = 1e-3;

/**
 * Переносить ключ бісерини сторони в половині ряду h з from проміжків між вузловими на стороні
 * до to проміжків; index — нове місце лінії (null — бісерину видалено).
 * undefined — бісерина не всередині цієї половини ряду (не змінюється) або ключ не на стороні ромба.
 */
function moveInHalf(
  k: string,
  h: number,
  from: number,
  to: number,
  index: (j: number) => number | null
): string | null | undefined {
  const [x, y] = parseKey(k);
  if (!(y > h + EPS && y < h + 1 - EPS)) return undefined;
  const j = Math.round((y - h) * from);
  const t = j / from;
  if (Math.abs(y - h - t) > EPS) return undefined;
  // Вузлова бісерина цієї сторони вгорі половини ряду: ціле xa, і xa + h — непарне (так стоять вузлові).
  const knot = (v: number): boolean => Math.abs(v - Math.round(v)) < EPS && Math.abs(Math.round(v) + h) % 2 === 1;
  let dir: 1 | -1;
  if (knot(x - t)) dir = 1;
  else if (knot(x + t)) dir = -1;
  else return undefined;
  const xa = Math.round(x - dir * t);
  const nj = index(j);
  if (nj === null) return null;
  const nt = nj / to;
  return keyOf(xa + dir * nt, h + nt);
}

/** Бісерин на сторону в половині ряду h візерунка side. */
export const halfSide = (d: { shape: Shapes }, side: SideKey, h: number): number =>
  sideAt(d.shape[side] ?? [], h, Number(side));

/** Чи можна видалити лінію j половини ряду h: це рядок бісерин сторін, а не вузлових. */
export function canCutLine(d: LineCutData, side: SideKey, h: number, j: number): boolean {
  if (!Number.isInteger(h) || h < 0 || h >= 2 * d.rows || !Number.isInteger(j)) return false;
  const s = halfSide(d, side, h);
  return s > 2 && j >= 1 && j <= s - 2;
}

/**
 * Проміжки по висоті, коли в половині ряду h між вузловими стає to проміжків замість from:
 * seg — куди переходить відрізок q між лініями q і q + 1 (null — відрізок зникає разом із проміжками на ньому).
 * Решта проміжків лишається після тих самих рядків бісерин (так само пропорційно, якщо проміжок стоїть
 * між лініями — із візерунка з іншою кількістю).
 */
function moveGaps(list: number[], h: number, from: number, to: number, seg: (q: number) => number | null): number[] {
  const base = h * GAP_UNIT;
  const out: number[] = [];
  for (const v of list) {
    if (v < base || v >= base + GAP_UNIT) {
      out.push(v);
      continue;
    }
    const at = (v - base) * from;
    const q = Math.floor(at / GAP_UNIT);
    const nq = seg(q);
    if (nq === null) continue;
    out.push(base + Math.round((nq * GAP_UNIT + at - q * GAP_UNIT) / to));
  }
  return [...new Set(out)].sort((a, b) => a - b);
}

/** Видаляє рядок бісерин j у половині ряду h візерунка side: змінює d на місці й повертає видалене (null — не можна). */
export function cutLine(d: LineCutData, side: SideKey, h: number, j: number): LineRemoved | null {
  if (!canCutLine(d, side, h, j)) return null;
  const s = halfSide(d, side, h);
  const from = s - 1;
  const index = (i: number): number | null => (i === j ? null : i < j ? i : i - 1);
  const removed: LineRemoved = { fills: {}, woven: [], gapsY: [...d.gaps.y], shape: d.shape[side] && [...d.shape[side]] };

  const src = d.fills[side] ?? {};
  const fills: Record<string, string> = {};
  for (const [k, id] of Object.entries(src)) {
    const nk = moveInHalf(k, h, from, from - 1, index);
    if (nk === null) removed.fills[k] = id;
    else fills[nk ?? k] = id;
  }

  const woven: string[] = [];
  (d.woven[side] ?? []).forEach((k, i) => {
    const nk = moveInHalf(k, h, from, from - 1, index);
    if (nk === null) removed.woven.push([i, k]);
    else woven.push(nk ?? k);
  });

  const shape = [...(d.shape[side] ?? [])];
  while (shape.length <= h) shape.push(Number(side));
  shape[h] = s - 1;

  d.fills = { ...d.fills, [side]: fills };
  if (d.woven[side]) d.woven = { ...d.woven, [side]: woven };
  // Проміжок одразу після видаленої лінії зникає.
  const seg = (q: number): number | null => (q === j ? null : q < j ? q : q - 1);
  d.gaps = { unit: GAP_UNIT, x: [...d.gaps.x], y: moveGaps(d.gaps.y, h, from, from - 1, seg) };
  d.shape = { ...d.shape, [side]: shape };
  return removed;
}

/** Повертає видалений рядок бісерин: зворотне до cutLine. */
export function uncutLine(d: LineCutData, side: SideKey, h: number, j: number, removed: LineRemoved): void {
  const s = halfSide(d, side, h) + 1;
  const to = s - 1;
  const index = (i: number): number => (i < j ? i : i + 1);

  const fills: Record<string, string> = {};
  for (const [k, id] of Object.entries(d.fills[side] ?? {})) fills[moveInHalf(k, h, to - 1, to, index) ?? k] = id;
  Object.assign(fills, removed.fills);

  const woven = (d.woven[side] ?? []).map((k) => moveInHalf(k, h, to - 1, to, index) ?? k);
  for (const [i, k] of removed.woven) woven.splice(Math.min(i, woven.length), 0, k);

  const shape: Shapes = { ...d.shape };
  if (removed.shape) shape[side] = [...removed.shape];
  else delete shape[side];

  d.fills = { ...d.fills, [side]: fills };
  if (d.woven[side] || removed.woven.length) d.woven = { ...d.woven, [side]: woven };
  d.gaps = { unit: GAP_UNIT, x: [...d.gaps.x], y: [...removed.gapsY] };
  d.shape = shape;
}

/** Чи можна вставити рядок бісерин у половину ряду h між лініями j − 1 і j (j від 1 до s − 1). */
export function canInsertLine(d: LineCutData, side: SideKey, h: number, j: number): boolean {
  if (!Number.isInteger(h) || h < 0 || h >= 2 * d.rows || !Number.isInteger(j)) return false;
  const s = halfSide(d, side, h);
  return s < MAX_BEADS_SIDE && j >= 1 && j <= s - 1;
}

/** Що було до вставки рядка бісерин — щоб «Скасувати» повернуло точно. */
export interface LineInserted {
  /** Проміжки по висоті до вставки (у GAP_UNIT). */
  gapsY: number[];
  /** Список бісерин на сторону по половинах рядів до вставки (undefined — його не було). */
  shape: number[] | undefined;
}

/**
 * Вставляє порожній рядок бісерин у половину ряду h візерунка side між лініями j − 1 і j: він стає лінією j,
 * на сторонах ромбів цієї половини ряду на бісерину більше, бісерини ліній від j опускаються на лінію нижче,
 * а решта трафарету не змінюється. Змінює d на місці; null — не можна (див. canInsertLine).
 */
export function insertLine(d: LineCutData, side: SideKey, h: number, j: number): LineInserted | null {
  if (!canInsertLine(d, side, h, j)) return null;
  const s = halfSide(d, side, h);
  const from = s - 1;
  const index = (i: number): number => (i < j ? i : i + 1);
  const before: LineInserted = { gapsY: [...d.gaps.y], shape: d.shape[side] && [...d.shape[side]] };

  const fills: Record<string, string> = {};
  for (const [k, id] of Object.entries(d.fills[side] ?? {})) fills[moveInHalf(k, h, from, s, index) ?? k] = id;
  const woven = (d.woven[side] ?? []).map((k) => moveInHalf(k, h, from, s, index) ?? k);

  const shape = [...(d.shape[side] ?? [])];
  while (shape.length <= h) shape.push(Number(side));
  shape[h] = s + 1;

  d.fills = { ...d.fills, [side]: fills };
  if (d.woven[side]) d.woven = { ...d.woven, [side]: woven };
  // Проміжок між лініями j − 1 і j лишається одразу після лінії j − 1, тобто перед новим рядком.
  d.gaps = { unit: GAP_UNIT, x: [...d.gaps.x], y: moveGaps(d.gaps.y, h, from, s, (q) => (q < j ? q : q + 1)) };
  d.shape = { ...d.shape, [side]: shape };
  return before;
}

/**
 * Прибирає вставлений рядок бісерин: зворотне до insertLine. Повертає, що на ньому було
 * (позначки плетіння, зроблені після вставки), — щоб «Повторити» (uncutLine) повернуло й їх.
 */
export function uninsertLine(d: LineCutData, side: SideKey, h: number, j: number, before: LineInserted): LineRemoved | null {
  const removed = cutLine(d, side, h, j);
  if (!removed) return null;
  const shape: Shapes = { ...d.shape };
  if (before.shape) shape[side] = [...before.shape];
  else delete shape[side];
  d.gaps = { unit: GAP_UNIT, x: [...d.gaps.x], y: [...before.gapsY] };
  d.shape = shape;
  return removed;
}
