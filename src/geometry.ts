import { keyOf, parseKey } from "./util";

/** Одиниць SVG на одну бісерину (відстань між сусідніми бісеринами вздовж нитки). */
export const U = 10;
/** Радіус круглої бісерини в одиницях SVG. */
export const BEAD_R = 4;

export interface Bead {
  k: string;
  x: number;
  y: number;
}

export type Seg = [number, number, number, number];

export interface Geometry {
  beads: Bead[];
  /** Відрізки нитки в координатах ґратки. */
  segs: Seg[];
  /** Півдіагональ ромба в одиницях SVG. */
  H: number;
  width: number;
  height: number;
}

/**
 * Сіточка з ромбів: cols ромбів у ширину, rows рядів у висоту.
 * side — бісерин на сторону ромба разом із вузловими (3 або 4).
 * Вузлові бісерини стоять у вершинах ромбів, між ними — side − 2 бісерини сторони.
 */
export function buildGeometry(cols: number, rows: number, side: number): Geometry {
  const m = side - 2;
  const H = ((side - 1) / Math.SQRT2) * U;
  const beads: Bead[] = [];
  const segs: Seg[] = [];
  const seen = new Set<string>();

  const add = (lx: number, ly: number): void => {
    const k = keyOf(lx, ly);
    if (seen.has(k)) return;
    seen.add(k);
    beads.push({ k, x: lx * H, y: ly * H });
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
        segs.push([a[0], a[1], b[0], b[1]]);
        for (let j = 1; j <= m; j++) {
          const t = j / (m + 1);
          add(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t);
        }
      }
    }
  }

  return { beads, segs, H, width: 2 * cols * H, height: 2 * rows * H };
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
