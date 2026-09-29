import { describe, expect, it } from "vitest";
import { canCutLine, canInsertLine, cutLine, insertLine, uncutLine, uninsertLine, type LineCutData } from "../src/cut";
import { GAP_UNIT, buildGeometry } from "../src/geometry";
import { keyOf, parseKey } from "../src/util";

/** Трафарет з половинами рядів shape (для кожного візерунка свій список), кожна бісерина — свого «кольору». */
function shaped(cols: number, rows: number, shapes: Record<string, number[]>): LineCutData & { cols: number } {
  const fills: LineCutData["fills"] = {};
  const woven: LineCutData["woven"] = {};
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
});

describe("вставка рядка бісерин", () => {
  it("після вставки будь-де всі бісерини лягають на сітку з довшими сторонами, новий рядок — порожній", () => {
    for (const side of [2, 3, 4, 9]) {
      const s = String(side);
      for (let h = 0; h < 6; h++) {
        for (let j = 1; j <= side - 1; j++) {
          const d = shaped(4, 3, { [s]: [] });
          const count = Object.keys(d.fills[s]).length;
          expect(insertLine(d, s, h, j)).not.toBeNull();
          expect(d.shape[s][h]).toBe(side + 1);
          const keys = shapedKeys(d, s);
          const filled = new Set(Object.keys(d.fills[s]));
          expect(filled.size).toBe(count);
          expect([...filled].every((k) => keys.includes(k))).toBe(true);
          // Порожні — лише бісерини нового рядка: по дві на ромб.
          const empty = keys.filter((k) => !filled.has(k));
          expect(empty.length).toBe(2 * 4);
          for (const k of empty) expect(parseKey(k)[1]).toBeCloseTo(h + j / side, 3);
        }
      }
    }
  });

  it("решта трафарету не змінюється, рядки від місця вставки опускаються", () => {
    const d = shaped(3, 2, { "4": [] });
    const before = { ...d.fills["4"] };
    insertLine(d, "4", 0, 1);
    const f = d.fills["4"];
    // Верхня половина ряду 1: тепер 5 бісерин на сторону, лінії через чверть. Новий рядок — лінія 1.
    expect(f[keyOf(0.75, 0.25)]).toBeUndefined();
    expect(f[keyOf(1.25, 0.25)]).toBeUndefined();
    expect(f[keyOf(0.5, 0.5)]).toBe(`c:4:${keyOf(2 / 3, 1 / 3)}`);
    expect(f[keyOf(0.25, 0.75)]).toBe(`c:4:${keyOf(1 / 3, 2 / 3)}`);
    expect(f[keyOf(1.5, 0.5)]).toBe(`c:4:${keyOf(4 / 3, 1 / 3)}`);
    for (const k of [keyOf(1, 0), keyOf(0, 1), keyOf(1 / 3, 4 / 3), keyOf(5 / 3, 2 + 1 / 3), keyOf(2, 3)]) {
      expect(f[k]).toBe(before[k]);
    }
  });

  it("не більше 10 бісерин на сторону; вставляють лише між рядками половини ряду", () => {
    const d = shaped(3, 1, { "9": [] });
    expect(canInsertLine(d, "9", 0, 0)).toBe(false);
    expect(canInsertLine(d, "9", 0, 9)).toBe(false);
    expect(canInsertLine(d, "9", 2, 1)).toBe(false);
    expect(canInsertLine(d, "9", 0, 8)).toBe(true);
    expect(insertLine(d, "9", 0, 8)).not.toBeNull();
    expect(d.shape["9"]).toEqual([10]);
    const before = JSON.parse(JSON.stringify(d));
    expect(insertLine(d, "9", 0, 1)).toBeNull();
    expect(d).toEqual(before);
    expect(canInsertLine(shaped(2, 1, { "10": [] }), "10", 1, 1)).toBe(false);
  });

  it("«Скасувати» повертає все як було, «Повторити» — як після вставки", () => {
    for (const side of [2, 3, 4, 6, 9]) {
      const s = String(side);
      for (let h = 0; h < 4; h++) {
        for (let j = 1; j <= side - 1; j++) {
          const d = shaped(3, 2, { [s]: [side, Math.max(2, side - 1)], "3": [] });
          d.gaps = { unit: GAP_UNIT, x: [840], y: [0, 504, 840, 1260, 1680, 2520, 3360, 4000, 5040] };
          const before = JSON.parse(JSON.stringify(d));
          const ins = insertLine(d, s, h, j);
          if (!ins) {
            // У другій половині ряду 1 на бісерину менше: там і місць для вставки на одне менше.
            expect([h, j]).toEqual([1, side - 1]);
            expect(d).toEqual(before);
            continue;
          }
          const after = JSON.parse(JSON.stringify(d));
          const removed = uninsertLine(d, s, h, j, ins);
          expect(d).toEqual(before);
          if (removed) uncutLine(d, s, h, j, removed);
          expect(d).toEqual(after);
        }
      }
    }
  });

  it("проміжки лишаються після тих самих рядків; проміжок перед місцем вставки — перед новим рядком", () => {
    const d = shaped(2, 1, { "4": [] });
    // Лінії верхньої половини: 0, 840, 1680, 2520. 2100 — між лініями (з візерунка з іншою кількістю).
    d.gaps = { unit: GAP_UNIT, x: [840], y: [0, 840, 1680, 2100, 2520, 3360] };
    insertLine(d, "4", 0, 1);
    expect(d.gaps.y).toEqual([0, 1260, 1890, 2205, 2520, 3360]);
    expect(d.gaps.x).toEqual([840]);
  });

  it("позначки плетіння переходять разом із бісеринами; зроблені на новому рядку повертає «Повторити»", () => {
    const d: LineCutData = {
      rows: 1,
      fills: {},
      woven: { "4": [keyOf(1, 0), keyOf(2 / 3, 1 / 3), keyOf(1 / 3, 2 / 3), keyOf(0, 1)] },
      gaps: { unit: GAP_UNIT, x: [], y: [] },
      shape: {}
    };
    const ins = insertLine(d, "4", 0, 2);
    expect(d.woven["4"]).toEqual([keyOf(1, 0), keyOf(0.75, 0.25), keyOf(0.25, 0.75), keyOf(0, 1)]);
    d.woven["4"].push(keyOf(0.5, 0.5)); // нанизали бісерину нового рядка
    const removed = ins && uninsertLine(d, "4", 0, 2, ins);
    expect(d.woven["4"]).toEqual([keyOf(1, 0), keyOf(2 / 3, 1 / 3), keyOf(1 / 3, 2 / 3), keyOf(0, 1)]);
    if (removed) uncutLine(d, "4", 0, 2, removed);
    expect(d.woven["4"]).toEqual([keyOf(1, 0), keyOf(0.75, 0.25), keyOf(0.25, 0.75), keyOf(0, 1), keyOf(0.5, 0.5)]);
  });

  it("вставлений рядок можна видалити, а видалений — вставити назад (візерунок лишиться, крім кольорів рядка)", () => {
    const d = shaped(3, 2, { "5": [] });
    const before = JSON.parse(JSON.stringify(d.fills["5"]));
    insertLine(d, "5", 1, 3);
    cutLine(d, "5", 1, 3);
    expect(d.fills["5"]).toEqual(before);
    expect(d.shape["5"]).toEqual([5, 5]);
  });
});
