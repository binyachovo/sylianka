import { BEAD_R, type Bead } from "./geometry";

/**
 * Швидкий пошук бісерини під курсором. Бісерини розкладено по клітинках,
 * тож браузеру не доводиться перевіряти кожне з десятків тисяч кіл при кожному русі миші.
 */
export class HitIndex {
  private readonly cell = BEAD_R * 2;
  private readonly cells = new Map<number, number[]>();
  private readonly stride: number;

  constructor(
    private readonly beads: readonly Bead[],
    width: number
  ) {
    this.stride = Math.ceil(width / this.cell) + 8;
    for (let i = 0; i < beads.length; i++) {
      const key = this.key(this.col(beads[i].x), this.row(beads[i].y));
      const list = this.cells.get(key);
      if (list) list.push(i);
      else this.cells.set(key, [i]);
    }
  }

  private col(x: number): number {
    return Math.floor(x / this.cell) + 4;
  }

  private row(y: number): number {
    return Math.floor(y / this.cell) + 4;
  }

  private key(c: number, r: number): number {
    return r * this.stride + c;
  }

  /** Індекс найближчої бісерини не далі maxDist (в одиницях SVG) або -1. */
  nearest(x: number, y: number, maxDist = BEAD_R + 1): number {
    const c = this.col(x);
    const r = this.row(y);
    if (c < 1 || c >= this.stride - 1 || r < 1) return -1;
    let best = -1;
    let bestD = maxDist * maxDist;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const list = this.cells.get(this.key(c + dc, r + dr));
        if (!list) continue;
        for (const i of list) {
          const b = this.beads[i];
          const d = (b.x - x) ** 2 + (b.y - y) ** 2;
          if (d <= bestD) {
            bestD = d;
            best = i;
          }
        }
      }
    }
    return best;
  }
}
