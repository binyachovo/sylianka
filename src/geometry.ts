import { keyOf, parseKey } from "./util";

/** Одиниць SVG на одну бісерину (відстань між сусідніми бісеринами вздовж нитки). */
export const U = 10;
/** Радіус круглої бісерини в одиницях SVG. */
export const BEAD_R = 4;

export interface Bead {
  k: string;
  /** Координати в ґратці (для ключів, дзеркала, смуг друку). */
  lx: number;
  ly: number;
  /** Положення на екрані в одиницях SVG (з урахуванням проміжків). */
  x: number;
  y: number;
}

/** Сторона ромба: кінці в ґратці й ламана на екрані через усі її бісерини. */
export interface Edge {
  lx0: number;
  ly0: number;
  lx1: number;
  ly1: number;
  /** Зсув другого кінця від першого на екрані без проміжків: якщо pts з ним збігаються, сторона — пряма. */
  dx: number;
  dy: number;
  /** x0, y0, x1, y1, … — вершина, бісерини сторони, вершина. */
  pts: number[];
  /** Ключі тих самих бісерин по порядку: сусідні в списку з'єднані ниткою. */
  keys: string[];
}

/**
 * Одиниця положення ліній бісерин для проміжків: 1/2520 кроку ґратки. 2520 ділиться на
 * (бісерин на сторону − 1) для будь-якої кількості від 2 до 11, тож кожна лінія має ціле
 * положення, яке не змінюється, коли перемикають кількість бісерин на сторону.
 */
export const GAP_UNIT = 2520;
/** Межа ромбів (рядів) j у цих одиницях: там стоять вузлові бісерини. */
export const knotLine = (j: number): number => 2 * GAP_UNIT * j;
/** Відстань між сусідніми лініями бісерин (у GAP_UNIT) для side бісерин на сторону. */
export const lineStep = (side: number): number => GAP_UNIT / (side - 1);

/**
 * Проміжки для вигляду: після якої лінії бісерин вставлено розрив — окремо по x (вертикальні
 * проміжки між стовпчиками бісерин) і по y (горизонтальні — між рядками), у одиницях unit
 * на крок ґратки (завжди GAP_UNIT; старіші записи переводить sanitizeGaps).
 */
export interface Gaps {
  unit: number;
  x: number[];
  y: number[];
}

export interface Geometry {
  beads: Bead[];
  edges: Edge[];
  /** Півдіагональ ромба в одиницях SVG (по ширині; по висоті — див. halfSide). */
  H: number;
  /** Бісерин на сторону ромбів у кожній половині ряду: [верхня ряду 1, нижня ряду 1, верхня ряду 2, …]. */
  halfSide: number[];
  /** Ширина одного проміжку в одиницях SVG. */
  gap: number;
  width: number;
  height: number;
  /** Екранне x вузлових бісерин на межі ромбів j (ґратка 2j), j = 0…cols. */
  colX: number[];
  /** Екранне y вузлових бісерин на межі рядів r (ґратка 2r), r = 0…rows. */
  rowY: number[];
  /** Відстань між сусідніми лініями бісерин по ширині (у GAP_UNIT). */
  step: number;
  /** Положення всіх рядків бісерин по висоті (у GAP_UNIT) за зростанням, від 0 до knotLine(rows). */
  ylines: number[];
  /** Проміжки в межах сітки за зростанням (у GAP_UNIT). */
  gx: number[];
  gy: number[];
  /** Координати ґратки → екран. */
  px(lx: number): number;
  py(ly: number): number;
}

export const noGaps = (): Gaps => ({ unit: GAP_UNIT, x: [], y: [] });

/** Скільки проміжків зі списку (відсортованого, у GAP_UNIT) лежить строго лівіше/вище від v. */
function countBefore(bounds: number[], v: number): number {
  let lo = 0;
  let hi = bounds.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (bounds[mid] < v - 1e-6) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/** Проміжки, що лежать усередині сітки (після лінії від 0 до передостанньої), без повторів і за зростанням. */
function inside(list: number[], n: number): number[] {
  return [...new Set(list.filter((g) => Number.isInteger(g) && g >= 0 && g < knotLine(n)))].sort((a, b) => a - b);
}

/**
 * Бісерин на сторону в половині ряду h: зі списку shape, а чого там немає (чи незрозуміле) — side.
 * До 11: для такої кількості кожна лінія бісерин ще має ціле положення в GAP_UNIT.
 */
export function sideAt(shape: readonly number[], h: number, side: number): number {
  const v = shape[h];
  return Number.isInteger(v) && v >= 2 && v <= 11 ? v : side;
}

/**
 * Сіточка з ромбів: cols ромбів у ширину, rows рядів у висоту.
 * side — бісерин на сторону ромба разом із вузловими (від 2 до 10).
 * Вузлові бісерини стоять у вершинах ромбів, між ними — side − 2 бісерини сторони (для 2 — жодної).
 * shape — бісерин на сторону окремо для кожної половини ряду (див. sideAt): коли рядок бісерин видалено,
 * у цій половині ряду на сторонах ромбів менше бісерин, і вона нижча на екрані. Ширина ромбів однакова.
 * Проміжки розсувають сітку лише на екрані й у друці: усе, що правіше (нижче) від лінії
 * проміжку, зсувається, а нитки перетинають розрив.
 */
export function buildGeometry(
  cols: number,
  rows: number,
  side: number,
  gaps: Gaps = noGaps(),
  shape: readonly number[] = []
): Geometry {
  const H = ((side - 1) / Math.SQRT2) * U;
  // Проміжок — пів ромба, але не ширший за три кроки бісерини (на великих комірках).
  const gap = Math.min(H, (3 * U) / Math.SQRT2);
  const gx = inside(gaps.x, cols);
  const gy = inside(gaps.y, rows);

  // Висота половини ряду — як у ромба з такою кількістю бісерин на сторону.
  const halves = 2 * rows;
  const halfSide = Array.from({ length: halves }, (_, h) => sideAt(shape, h, side));
  const hh = halfSide.map((s) => ((s - 1) / Math.SQRT2) * U);
  const top = [0];
  for (let h = 0; h < halves; h++) top.push(top[h] + hh[h]);
  /** Координата ґратки по висоті → екран без проміжків (поза сіткою — як у крайніх половинах рядів). */
  const yOf = (ly: number): number => {
    if (ly <= 0) return ly * (hh[0] ?? H);
    if (ly >= halves) return top[halves] + (ly - halves) * (hh[halves - 1] ?? H);
    const h = Math.floor(ly);
    return top[h] + (ly - h) * hh[h];
  };
  const px = (lx: number): number => lx * H + gap * countBefore(gx, lx * GAP_UNIT);
  const py = (ly: number): number => yOf(ly) + gap * countBefore(gy, ly * GAP_UNIT);

  const beads: Bead[] = [];
  const edges: Edge[] = [];
  const seen = new Set<string>();

  const add = (lx: number, ly: number): void => {
    const k = keyOf(lx, ly);
    if (seen.has(k)) return;
    seen.add(k);
    beads.push({ k, lx, ly, x: px(lx), y: py(ly) });
  };

  for (let r = 0; r < rows; r++) for (let i = 0; i <= cols; i++) add(2 * i, 2 * r + 1);
  for (let r = 0; r <= rows; r++) for (let i = 0; i < cols; i++) add(2 * i + 1, 2 * r);

  for (let r = 0; r < rows; r++) {
    for (let i = 0; i < cols; i++) {
      const cx = 2 * i + 1;
      const cy = 2 * r + 1;
      const pts: [number, number][] = [
        [cx - 1, cy],
        [cx, cy - 1],
        [cx + 1, cy],
        [cx, cy + 1]
      ];
      for (let e = 0; e < 4; e++) {
        const a = pts[e];
        const b = pts[(e + 1) % 4];
        // Сторони 0 і 1 — у верхній половині ряду, 2 і 3 — у нижній.
        const m = halfSide[e < 2 ? 2 * r : 2 * r + 1] - 2;
        const line = [px(a[0]), py(a[1])];
        const keys = [keyOf(a[0], a[1])];
        for (let j = 1; j <= m; j++) {
          const t = j / (m + 1);
          const lx = a[0] + (b[0] - a[0]) * t;
          const ly = a[1] + (b[1] - a[1]) * t;
          add(lx, ly);
          line.push(px(lx), py(ly));
          keys.push(keyOf(lx, ly));
        }
        line.push(px(b[0]), py(b[1]));
        keys.push(keyOf(b[0], b[1]));
        edges.push({
          lx0: a[0],
          ly0: a[1],
          lx1: b[0],
          ly1: b[1],
          dx: (b[0] - a[0]) * H,
          dy: yOf(b[1]) - yOf(a[1]),
          pts: line,
          keys
        });
      }
    }
  }

  const ylines: number[] = [];
  for (let h = 0; h < halves; h++) {
    const k = halfSide[h] - 1;
    for (let j = 0; j < k; j++) ylines.push(h * GAP_UNIT + (j * GAP_UNIT) / k);
  }
  ylines.push(knotLine(rows));

  const colX = Array.from({ length: cols + 1 }, (_, j) => px(2 * j));
  const rowY = Array.from({ length: rows + 1 }, (_, r) => py(2 * r));
  const step = lineStep(side);
  const width = px(2 * cols);
  const height = py(2 * rows);
  return { beads, edges, H, halfSide, gap, width, height, colX, rowY, step, ylines, gx, gy, px, py };
}

/** Бісерина, дзеркальна відносно горизонтальної осі смужки. */
export function mirrorKey(k: string, rows: number): string {
  const [x, y] = parseKey(k);
  return keyOf(x, 2 * rows - y);
}

/** Що фарбується разом: дзеркало «верх–низ», «ліво–право» й повтор кожні every ромбів (0 — без повтору). */
export interface Symmetry {
  tb: boolean;
  lr: boolean;
  every: number;
  rows: number;
  cols: number;
}

/**
 * Бісерини, що фарбуються разом із даними: вони самі, їхні дзеркальні відображення
 * і всі повтори вздовж трафарету (повтор — кроками по 2·every у ґратці, доки не вийде за край).
 */
export function symmetryClosure(keys: Iterable<string>, s: Symmetry): Set<string> {
  const out = new Set(keys);
  const map = (fn: (x: number, y: number) => [number, number]): void => {
    for (const k of [...out]) {
      const [x, y] = parseKey(k);
      const [a, b] = fn(x, y);
      out.add(keyOf(a, b));
    }
  };
  if (s.tb) map((x, y) => [x, 2 * s.rows - y]);
  if (s.lr) map((x, y) => [2 * s.cols - x, y]);
  if (s.every > 0 && s.every < s.cols) {
    const period = 2 * s.every;
    let frontier = [...out];
    while (frontier.length) {
      const next: string[] = [];
      for (const k of frontier) {
        const [x, y] = parseKey(k);
        for (const t of [x + period, x - period]) {
          if (t < -1e-6 || t > 2 * s.cols + 1e-6) continue;
          const nk = keyOf(t, y);
          if (!out.has(nk)) {
            out.add(nk);
            next.push(nk);
          }
        }
      }
      frontier = next;
    }
  }
  return out;
}

/** Ключі бісерин, що фарбуються разом із k (див. symmetryClosure). */
export function symmetryKeys(k: string, s: Symmetry): string[] {
  return [...symmetryClosure([k], s)];
}

/**
 * У скільки разів збільшити номери ромбів і рядів (і смуги для них): на великих комірках
 * звичайні номери губляться поруч із ромбами. До 4 бісерин на сторону — як завжди.
 */
export function labelScale(side: number): number {
  return side <= 4 ? 1 : Math.min(2, (side - 1) / 3);
}

/** Скільки бісерин додає кожен ромб довжини при заданій висоті (shape — як у buildGeometry). */
export function beadsPerStep(rows: number, side: number, shape: readonly number[] = []): number {
  let n = 2 * rows + 1;
  for (let h = 0; h < 2 * rows; h++) n += 2 * (sideAt(shape, h, side) - 2);
  return n;
}
