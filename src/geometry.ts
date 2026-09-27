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
  /** x0, y0, x1, y1, … — вершина, бісерини сторони, вершина. */
  pts: number[];
  /** Ключі тих самих бісерин по порядку: сусідні в списку з'єднані ниткою. */
  keys: string[];
}

/**
 * Одиниця положення ліній бісерин для проміжків: 1/2520 кроку ґратки. 2520 ділиться на
 * (бісерин на сторону − 1) для будь-якої кількості від 3 до 11, тож кожна лінія має ціле
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
  /** Півдіагональ ромба в одиницях SVG. */
  H: number;
  /** Ширина одного проміжку в одиницях SVG. */
  gap: number;
  width: number;
  height: number;
  /** Екранне x вузлових бісерин на межі ромбів j (ґратка 2j), j = 0…cols. */
  colX: number[];
  /** Екранне y вузлових бісерин на межі рядів r (ґратка 2r), r = 0…rows. */
  rowY: number[];
  /** Відстань між сусідніми лініями бісерин (у GAP_UNIT). */
  step: number;
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
 * Сіточка з ромбів: cols ромбів у ширину, rows рядів у висоту.
 * side — бісерин на сторону ромба разом із вузловими (3 або 4).
 * Вузлові бісерини стоять у вершинах ромбів, між ними — side − 2 бісерини сторони.
 * Проміжки розсувають сітку лише на екрані й у друці: усе, що правіше (нижче) від лінії
 * проміжку, зсувається, а нитки перетинають розрив.
 */
export function buildGeometry(cols: number, rows: number, side: number, gaps: Gaps = noGaps()): Geometry {
  const m = side - 2;
  const H = ((side - 1) / Math.SQRT2) * U;
  // Проміжок — пів ромба, але не ширший за три кроки бісерини (на великих комірках).
  const gap = Math.min(H, (3 * U) / Math.SQRT2);
  const gx = inside(gaps.x, cols);
  const gy = inside(gaps.y, rows);
  const px = (lx: number): number => lx * H + gap * countBefore(gx, lx * GAP_UNIT);
  const py = (ly: number): number => ly * H + gap * countBefore(gy, ly * GAP_UNIT);

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
        edges.push({ lx0: a[0], ly0: a[1], lx1: b[0], ly1: b[1], pts: line, keys });
      }
    }
  }

  const colX = Array.from({ length: cols + 1 }, (_, j) => px(2 * j));
  const rowY = Array.from({ length: rows + 1 }, (_, r) => py(2 * r));
  const step = lineStep(side);
  return { beads, edges, H, gap, width: px(2 * cols), height: py(2 * rows), colX, rowY, step, gx, gy, px, py };
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

/** Скільки бісерин додає кожен ромб довжини при заданій висоті. */
export function beadsPerStep(rows: number, side: number): number {
  return 2 * rows + 1 + 4 * rows * (side - 2);
}
