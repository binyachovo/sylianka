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
}

/** Проміжки для вигляду: після якого ромба (по довжині) і після якого ряду (по висоті), з 1. */
export interface Gaps {
  cols: number[];
  rows: number[];
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
  /** Екранне x межі ромбів j (ґратка 2j), j = 0…cols; проміжок після ромба j лежить праворуч від неї. */
  colX: number[];
  /** Екранне y межі рядів r (ґратка 2r), r = 0…rows; проміжок після ряду r лежить нижче від неї. */
  rowY: number[];
  /** Проміжки, що є в межах сітки. */
  colGaps: Set<number>;
  rowGaps: Set<number>;
  /** Координати ґратки → екран. */
  px(lx: number): number;
  py(ly: number): number;
}

export const noGaps = (): Gaps => ({ cols: [], rows: [] });

/** Скільки меж зі списку (відсортованого) лежить строго лівіше/вище від v. */
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

/**
 * Сіточка з ромбів: cols ромбів у ширину, rows рядів у висоту.
 * side — бісерин на сторону ромба разом із вузловими (3 або 4).
 * Вузлові бісерини стоять у вершинах ромбів, між ними — side − 2 бісерини сторони.
 * Проміжки розсувають сітку лише на екрані й у друці: вузлова бісерина на межі
 * лишається з лівого (верхнього) боку, а нитка перетинає розрив.
 */
export function buildGeometry(cols: number, rows: number, side: number, gaps: Gaps = noGaps()): Geometry {
  const m = side - 2;
  const H = ((side - 1) / Math.SQRT2) * U;
  const gap = H;
  const colGaps = new Set(gaps.cols.filter((c) => Number.isInteger(c) && c >= 1 && c < cols));
  const rowGaps = new Set(gaps.rows.filter((r) => Number.isInteger(r) && r >= 1 && r < rows));
  const xb = [...colGaps].sort((a, b) => a - b).map((c) => 2 * c);
  const yb = [...rowGaps].sort((a, b) => a - b).map((r) => 2 * r);
  const px = (lx: number): number => lx * H + gap * countBefore(xb, lx);
  const py = (ly: number): number => ly * H + gap * countBefore(yb, ly);

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
        for (let j = 1; j <= m; j++) {
          const t = j / (m + 1);
          const lx = a[0] + (b[0] - a[0]) * t;
          const ly = a[1] + (b[1] - a[1]) * t;
          add(lx, ly);
          line.push(px(lx), py(ly));
        }
        line.push(px(b[0]), py(b[1]));
        edges.push({ lx0: a[0], ly0: a[1], lx1: b[0], ly1: b[1], pts: line });
      }
    }
  }

  const colX = Array.from({ length: cols + 1 }, (_, j) => px(2 * j));
  const rowY = Array.from({ length: rows + 1 }, (_, r) => py(2 * r));
  return { beads, edges, H, gap, width: px(2 * cols), height: py(2 * rows), colX, rowY, colGaps, rowGaps, px, py };
}

/** Бісерина, дзеркальна відносно горизонтальної осі смужки. */
export function mirrorKey(k: string, rows: number): string {
  const [x, y] = parseKey(k);
  return keyOf(x, 2 * rows - y);
}

/** Скільки бісерин додає кожен ромб довжини при заданій висоті. */
export function beadsPerStep(rows: number, side: number): number {
  return 2 * rows + 1 + 4 * rows * (side - 2);
}
