import { describe, expect, it } from "vitest";
import { canCutLine, cutCoord, cutGrid, cutLine, uncutGrid, uncutCoord, uncutLine, type CutData, type LineCutData } from "../src/cut";
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

/** Трафарет з половинами рядів shape (для кожного візерунка свій список), кожна бісерина — свого «кольору». */
function shaped(cols: number, rows: number, shapes: Record<string, number[]>): LineCutData & CutData {
  const fills: CutData["fills"] = {};
  const woven: CutData["woven"] = {};
  for (const [side, shape] of Object.entries(shapes)) {
    const keys = buildGeometry(cols, rows, Number(side), undefined, shape)
      .beads.map((b) => b.k)
      .sort();
    fills[side] = Object.fromEntries(keys.map((k) => [k, `c:${side}:${k}`]));
    woven[side] = keys.filter((_, i) => i % 3 === 0).reverse();
  }
  return { rows, cols, fills, woven, gaps: { unit: GAP_UNIT, x: [], y: [] }, shape: JSON.parse(JSON.stringify(shapes)) };
}

const shapedKeys = (d: LineCutData & { cols: number }, side: string): string[] =>
  buildGeometry(d.cols, d.rows, Number(side), undefined, d.shape[side] ?? [])
    .beads.map((b) => b.k)
    .sort();

describe("видалення рядка бісерин", () => {
  it("після видалення будь-якого рядка бісерини точно лягають на сітку з коротшими сторонами", () => {
    for (const side of [3, 4, 5, 10]) {
      const s = String(side);
      for (let h = 0; h < 6; h++) {
        for (let j = 1; j <= side - 2; j++) {
          const d = shaped(4, 3, { [s]: [] });
          expect(cutLine(d, s, h, j)).not.toBeNull();
          expect(d.shape[s][h]).toBe(side - 1);
          expect(Object.keys(d.fills[s]).sort()).toEqual(shapedKeys(d, s));
        }
      }
    }
  });

  it("решта трафарету не змінюється, нижчі рядки половини ряду переходять на коротші сторони", () => {
    const d = shaped(3, 2, { "4": [] });
    const before = { ...d.fills["4"] };
    cutLine(d, "4", 0, 1);
    const f = d.fills["4"];
    // Верхня половина ряду 1, сторона від вузлової (1, 0) вниз ліворуч: лінія 1 зникла, лінія 2 стала посередині.
    expect(f[keyOf(2 / 3, 1 / 3)]).toBeUndefined();
    expect(f[keyOf(0.5, 0.5)]).toBe(`c:4:${keyOf(1 / 3, 2 / 3)}`);
    expect(f[keyOf(1.5, 0.5)]).toBe(`c:4:${keyOf(5 / 3, 2 / 3)}`);
    // Вузлові й інші половини рядів — ті самі.
    for (const k of [keyOf(1, 0), keyOf(0, 1), keyOf(1 / 3, 4 / 3), keyOf(5 / 3, 2 + 1 / 3), keyOf(2, 3)]) {
      expect(f[k]).toBe(before[k]);
    }
  });

  it("вузлові рядки не видаляються, у половині ряду з 2 бісеринами на сторону — нічого видаляти", () => {
    const d = shaped(3, 2, { "3": [3, 2] });
    const before = JSON.parse(JSON.stringify(d));
    expect(canCutLine(d, "3", 0, 0)).toBe(false);
    expect(canCutLine(d, "3", 0, 2)).toBe(false);
    expect(canCutLine(d, "3", 1, 1)).toBe(false);
    expect(canCutLine(d, "3", 4, 1)).toBe(false);
    expect(canCutLine(d, "3", 2, 1)).toBe(true);
    expect(cutLine(d, "3", 1, 1)).toBeNull();
    expect(cutLine(d, "3", 0, 0)).toBeNull();
    expect(d).toEqual(before);
  });

  it("можна видаляти рядки один за одним, доки лишаться самі вузлові", () => {
    const d = shaped(3, 2, { "5": [] });
    for (let n = 0; n < 3; n++) expect(cutLine(d, "5", 3, 1)).not.toBeNull();
    expect(d.shape["5"]).toEqual([5, 5, 5, 2]);
    expect(cutLine(d, "5", 3, 1)).toBeNull();
    expect(Object.keys(d.fills["5"]).sort()).toEqual(shapedKeys(d, "5"));
  });

  it("інші візерунки (інша кількість бісерин на сторону) не змінюються", () => {
    const d = shaped(3, 2, { "3": [], "4": [] });
    const other = JSON.parse(JSON.stringify(d.fills["3"]));
    cutLine(d, "4", 1, 2);
    expect(d.fills["3"]).toEqual(other);
    expect(d.shape["3"]).toEqual([]);
  });

  it("«Скасувати» повертає все як було — для кожного рядка, усіх кількостей бісерин", () => {
    for (const side of [3, 4, 6]) {
      const s = String(side);
      for (let h = 0; h < 4; h++) {
        for (let j = 1; j <= side - 2; j++) {
          const d = shaped(3, 2, { [s]: [side, side - 1], "3": [] });
          d.gaps = { unit: GAP_UNIT, x: [840], y: [0, 840, 1260, 1680, 2520, 3360, 5040] };
          const before = JSON.parse(JSON.stringify(d));
          const removed = cutLine(d, s, h, j);
          if (!removed) {
            expect(canCutLine(before, s, h, j)).toBe(false);
            continue;
          }
          uncutLine(d, s, h, j, removed);
          expect(d).toEqual(before);
        }
      }
    }
  });

  it("позначки плетіння: видалені прибираються, порядок решти зберігається; зроблені після — лишаються", () => {
    const d: LineCutData = {
      rows: 1,
      fills: {},
      woven: { "4": [keyOf(1, 0), keyOf(2 / 3, 1 / 3), keyOf(1 / 3, 2 / 3), keyOf(0, 1)] },
      gaps: { unit: GAP_UNIT, x: [], y: [] },
      shape: {}
    };
    const removed = cutLine(d, "4", 0, 1);
    expect(d.woven["4"]).toEqual([keyOf(1, 0), keyOf(0.5, 0.5), keyOf(0, 1)]);
    expect(removed?.woven).toEqual([[1, keyOf(2 / 3, 1 / 3)]]);
    d.woven["4"].push(keyOf(1.5, 0.5)); // нанизали після видалення — це стара бісерина (5/3, 2/3)
    if (removed) uncutLine(d, "4", 0, 1, removed);
    expect(d.woven["4"]).toEqual([keyOf(1, 0), keyOf(2 / 3, 1 / 3), keyOf(1 / 3, 2 / 3), keyOf(0, 1), keyOf(5 / 3, 2 / 3)]);
  });

  it("проміжки: після видаленого рядка зникає, решта в половині ряду переходить до тих самих рядків", () => {
    const d = shaped(2, 1, { "4": [] });
    // Лінії верхньої половини: 0, 840, 1680, 2520. 2100 — між лініями (з візерунка з іншою кількістю).
    d.gaps = { unit: GAP_UNIT, x: [840], y: [0, 840, 1680, 2100, 2520, 3360] };
    cutLine(d, "4", 0, 1);
    expect(d.gaps.y).toEqual([0, 1260, 1890, 2520, 3360]);
    expect(d.gaps.x).toEqual([840]);
  });

  it("видалення цілого ряду прибирає й обидві його половини зі списку, «Скасувати» повертає", () => {
    const d = shaped(3, 3, { "4": [4, 3, 2, 4, 3] });
    const before = JSON.parse(JSON.stringify(d));
    const removed = cutGrid(d, "row", 2);
    expect(d.shape?.["4"]).toEqual([4, 3, 3]);
    expect(Object.keys(d.fills["4"]).sort()).toEqual(shapedKeys(d, "4"));
    uncutGrid(d, "row", 2, removed);
    expect(d).toEqual(before);
    // Стовпці половин рядів не зачіпають.
    const c = shaped(3, 3, { "4": [4, 3] });
    cutGrid(c, "col", 1);
    expect(c.shape?.["4"]).toEqual([4, 3]);
    expect(Object.keys(c.fills["4"]).sort()).toEqual(shapedKeys(c, "4"));
  });
});
