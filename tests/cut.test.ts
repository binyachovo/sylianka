import { describe, expect, it } from "vitest";
import { cutCoord, cutGrid, uncutGrid, uncutCoord, type CutData } from "../src/cut";
import { GAP_UNIT, buildGeometry, knotLine } from "../src/geometry";
import { keyOf, parseKey } from "../src/util";

const keysOf = (cols: number, rows: number, side: number): string[] =>
  buildGeometry(cols, rows, side).beads.map((b) => b.k).sort();

/** Трафарет, де кожна бісерина має свій «колір» — щоб бачити, куди що переїхало. */
function sample(cols: number, rows: number, sides: number[]): CutData {
  const fills: CutData["fills"] = {};
  const woven: CutData["woven"] = {};
  for (const side of sides) {
    const keys = keysOf(cols, rows, side);
    fills[String(side)] = Object.fromEntries(keys.map((k) => [k, `c:${side}:${k}`]));
    // Позначки в «довільному» порядку: кожна третя бісерина, від кінця.
    woven[String(side)] = keys.filter((_, i) => i % 3 === 0).reverse();
  }
  return {
    rows,
    cols,
    fills,
    woven,
    gaps: { unit: GAP_UNIT, x: [0, knotLine(1), knotLine(2) - 840, knotLine(2), knotLine(3)], y: [1260, knotLine(1)] }
  };
}

const clone = (d: CutData): CutData => JSON.parse(JSON.stringify(d));

describe("видалення ряду чи стовпця", () => {
  it("координати: лівий край смуги лишається, решта смуги зникає, далі — зсув на 2", () => {
    expect(cutCoord(2, 2)).toBe(2);
    expect(cutCoord(2.5, 2)).toBeNull();
    expect(cutCoord(4, 2)).toBeNull();
    expect(cutCoord(4 + 1 / 3, 2)).toBeCloseTo(2 + 1 / 3);
    expect(cutCoord(0, 1)).toBe(0);
    expect(cutCoord(1, 1)).toBeNull();
    expect(uncutCoord(2, 2)).toBe(2);
    expect(uncutCoord(2.5, 2)).toBe(4.5);
  });

  it("після видалення будь-якого стовпця чи ряду бісерини точно лягають на меншу сітку", () => {
    for (const side of [2, 3, 4, 7, 10]) {
      for (const axis of ["col", "row"] as const) {
        const [cols, rows] = [5, 4];
        const total = axis === "col" ? cols : rows;
        for (let n = 1; n <= total; n++) {
          const d = sample(cols, rows, [side]);
          cutGrid(d, axis, n);
          const expected = axis === "col" ? keysOf(cols - 1, rows, side) : keysOf(cols, rows - 1, side);
          expect(Object.keys(d.fills[String(side)]).sort()).toEqual(expected);
        }
      }
    }
  });

  it("решта візерунка зсувається цілою: колір бісерини правіше переїжджає на 2 ліворуч", () => {
    const d = sample(5, 2, [3]);
    cutGrid(d, "col", 2);
    const f = d.fills["3"];
    expect(f[keyOf(1, 0)]).toBe(`c:3:${keyOf(1, 0)}`); // стовпець 1 без змін
    expect(f[keyOf(2, 1)]).toBe(`c:3:${keyOf(2, 1)}`); // лівий край видаленого стовпця лишився
    expect(f[keyOf(3, 0)]).toBe(`c:3:${keyOf(5, 0)}`); // стовпець 3 став другим
    expect(f[keyOf(2.5, 0.5)]).toBe(`c:3:${keyOf(4.5, 0.5)}`);
    expect(d.cols).toBe(4);
    expect(d.rows).toBe(2);
  });

  it("ряд: верхній край лишається, нижчі ряди піднімаються", () => {
    const d = sample(3, 3, [4]);
    cutGrid(d, "row", 1);
    const f = d.fills["4"];
    expect(f[keyOf(1, 0)]).toBe(`c:4:${keyOf(1, 0)}`);
    expect(f[keyOf(0, 1)]).toBe(`c:4:${keyOf(0, 3)}`);
    expect(f[keyOf(1 / 3, 2 / 3)]).toBe(`c:4:${keyOf(1 / 3, 2 + 2 / 3)}`);
    expect(d.rows).toBe(2);
  });

  it("проміжки: на видалених лініях зникають, далі — зсуваються; другого напрямку не чіпає", () => {
    const d = sample(5, 2, [3]);
    const removed = cutGrid(d, "col", 2);
    expect(d.gaps.x).toEqual([0, knotLine(1), knotLine(2)]);
    expect(removed.gaps).toEqual([knotLine(2) - 840, knotLine(2)]);
    expect(d.gaps.y).toEqual([1260, knotLine(1)]);
    const r = sample(5, 2, [3]);
    cutGrid(r, "row", 1);
    expect(r.gaps.y).toEqual([]);
    expect(r.gaps.x).toEqual(sample(5, 2, [3]).gaps.x);
  });

  it("позначки плетіння: видалені прибираються, порядок решти зберігається", () => {
    const d: CutData = {
      rows: 1,
      cols: 3,
      fills: {},
      woven: { "3": [keyOf(0, 1), keyOf(3, 0), keyOf(4.5, 0.5), keyOf(4, 1), keyOf(2, 1)] },
      gaps: { unit: GAP_UNIT, x: [], y: [] }
    };
    const removed = cutGrid(d, "col", 2);
    expect(d.woven["3"]).toEqual([keyOf(0, 1), keyOf(2.5, 0.5), keyOf(2, 1)]);
    expect(removed.woven["3"]).toEqual([
      [1, keyOf(3, 0)],
      [3, keyOf(4, 1)]
    ]);
  });

  it("«Скасувати» повертає все як було — для кожного стовпця й ряду, усіх кількостей бісерин", () => {
    for (const axis of ["col", "row"] as const) {
      for (let n = 1; n <= 4; n++) {
        const d = sample(4, 4, [2, 3, 5, 10]);
        const before = clone(d);
        const removed = cutGrid(d, axis, n);
        uncutGrid(d, axis, n, removed);
        expect(d).toEqual(before);
      }
    }
  });

  it("позначки, зроблені після видалення, після «Скасувати» лишаються на тих самих бісеринах", () => {
    const d = sample(4, 2, [3]);
    d.woven["3"] = [keyOf(0, 1), keyOf(1, 0), keyOf(6, 1)];
    const removed = cutGrid(d, "col", 1);
    expect(d.woven["3"]).toEqual([keyOf(0, 1), keyOf(4, 1)]);
    d.woven["3"].push(keyOf(2, 1)); // нанизали після видалення — це стара бісерина (4, 1)
    uncutGrid(d, "col", 1, removed);
    expect(d.woven["3"]).toEqual([keyOf(0, 1), keyOf(1, 0), keyOf(6, 1), keyOf(4, 1)]);
    expect(parseKey(d.woven["3"][3])[0]).toBe(4);
  });
});
