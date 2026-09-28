import { describe, expect, it } from "vitest";
import { GAP_UNIT, buildGeometry, knotLine } from "../src/geometry";
import {
  DEFAULT_REPEAT,
  DEFAULT_SIDE,
  MAX_BEADS,
  beadTotal,
  beadsFit,
  fitSize,
  hasShape,
  maxCells,
  sanitizeGaps,
  sanitizeProjectData,
  sanitizeRepeat,
  sanitizeShape
} from "../src/projects";

describe("перевірка даних трафарету", () => {
  it("проміжки першого вигляду (номери ромбів і рядів) переводяться в лінії бісерин", () => {
    expect(sanitizeGaps({ cols: [5, 10, 5], rows: [4] })).toEqual({ unit: GAP_UNIT, x: [knotLine(5), knotLine(10)], y: [knotLine(4)] });
  });

  it("проміжки в шостих частках ґратки (без unit) переводяться в GAP_UNIT", () => {
    expect(sanitizeGaps({ x: [3, 0, 3, -1, 1.5, 99999], y: ["7", 12] })).toEqual({ unit: GAP_UNIT, x: [0, 1260], y: [5040] });
  });

  it("проміжки в GAP_UNIT лишаються як є", () => {
    expect(sanitizeGaps({ unit: GAP_UNIT, x: [1260, 280, 280], y: [] })).toEqual({ unit: GAP_UNIT, x: [280, 1260], y: [] });
    expect(sanitizeGaps("щось")).toEqual({ unit: GAP_UNIT, x: [], y: [] });
    expect(sanitizeGaps(null)).toEqual({ unit: GAP_UNIT, x: [], y: [] });
  });

  it("розмір обмежується кількістю бісерин у ромбі", () => {
    expect(maxCells(2)).toBe(12000);
    expect(maxCells(3)).toBe(12000);
    expect(maxCells(4)).toBe(12000);
    expect(maxCells(10)).toBeLessThan(4000);
    const p = { rows: 30, cols: 400, side: 10 };
    fitSize(p);
    expect(p.rows * p.cols).toBeLessThanOrEqual(maxCells(10));
  });

  it("крок повтору: ціле 1…400, інакше типовий", () => {
    expect(sanitizeRepeat(7)).toBe(7);
    for (const bad of [0, -3, 2.5, 401, "5", null, undefined]) expect(sanitizeRepeat(bad)).toBe(DEFAULT_REPEAT);
  });

  it("трафарет із файлу: розміри обмежуються, невідомі поля й погані значення відкидаються", () => {
    const d = sanitizeProjectData(
      {
        name: "  Весільна  ",
        rows: 8,
        cols: 5000,
        side: 4,
        palette: ["p:23980", "bad", "u:abcd1234"],
        fills: { "4": { "0.000,1.000": "p:23980", "x": "p:23980", "2.000,1.000": "<b>" } },
        woven: { "4": ["0.000,1.000", "0.000,1.000", 5] },
        gaps: { cols: [2] },
        repeat: 12
      },
      "Запасна назва",
      "id"
    );
    expect(d).not.toBeNull();
    expect(d?.name).toBe("Весільна");
    expect(d?.cols).toBe(400);
    expect(d?.side).toBe(4);
    expect(d?.palette).toEqual(["p:23980", "u:abcd1234"]);
    expect(d?.fills["4"]).toEqual({ "0.000,1.000": "p:23980" });
    expect(d?.woven["4"]).toEqual(["0.000,1.000"]);
    expect(d?.gaps).toEqual({ unit: GAP_UNIT, x: [knotLine(2)], y: [] });
    expect(d?.repeat).toBe(12);
  });

  it("будь-яка кількість бісерин на сторону від 2 до 10", () => {
    const d = sanitizeProjectData(
      { rows: 2, cols: 3, side: 7, fills: { "7": { "1.000,0.000": "p:23980" }, "11": { "1.000,0.000": "p:23980" }, x: {} } },
      "x",
      "id"
    );
    expect(d?.side).toBe(7);
    expect(d?.fills["7"]).toEqual({ "1.000,0.000": "p:23980" });
    expect(d?.fills["11"]).toBeUndefined();
    const two = sanitizeProjectData({ rows: 2, cols: 3, side: 2, fills: { "2": { "1.000,0.000": "p:23980" } } }, "x", "id");
    expect(two?.side).toBe(2);
    expect(two?.fills["2"]).toEqual({ "1.000,0.000": "p:23980" });
    for (const bad of [1, 11, 2.5, "4", null]) {
      expect(sanitizeProjectData({ rows: 2, cols: 3, side: bad }, "x", "id")?.side).toBe(DEFAULT_SIDE);
    }
  });

  it("половини рядів: від 2 до 10 бісерин на сторону, незрозуміле — як у трафареті", () => {
    const raw = { "4": [4, 3, 2, 1, 5, 10, 11, 2.5, "3", 3, 4, 4], "3": [3, 3], "11": [2], x: [2], "5": "2" };
    expect(sanitizeShape(raw)).toEqual({ "4": [4, 3, 2, 4, 5, 10, 4, 4, 4, 3] });
    expect(sanitizeShape(null)).toEqual({});
    expect(sanitizeShape({ "3": new Array(1000).fill(2) })["3"].length).toBe(800);
    expect(hasShape({ shape: { "4": [4, 3] } })).toBe(true);
    expect(hasShape({ shape: { "4": [4, 4], "3": [] } })).toBe(false);
    const d = sanitizeProjectData({ rows: 2, cols: 3, side: 4, shape: { "4": [4, 3] } }, "x", "id");
    expect(d?.shape).toEqual({ "4": [4, 3] });
    expect(sanitizeProjectData({ rows: 2, cols: 3 }, "x", "id")?.shape).toEqual({});
  });

  it("бісерин разом — як у сітці; вставлені рядки бісерин не роблять трафарет завеликим", () => {
    for (const [rows, cols, side, shape] of [
      [3, 5, 4, []],
      [2, 4, 3, [3, 5, 2, 10]],
      [4, 2, 10, [9, 10, 2]]
    ] as const) {
      expect(beadTotal(rows, cols, side, shape)).toBe(buildGeometry(cols, rows, side, undefined, shape).beads.length);
    }
    // 30 × 400 ромбів по 3 бісерини на сторону — можна; якщо в кожній половині ряду 10 — лише 127 ромбів довжини.
    const p = { rows: 30, cols: 400, side: 3, shape: { "3": new Array(60).fill(10) } };
    expect(beadsFit(30, 400, 3, [])).toBe(true);
    expect(beadsFit(30, 400, 3, p.shape["3"])).toBe(false);
    fitSize(p);
    expect([p.rows, p.cols]).toEqual([30, 127]);
    expect(beadTotal(30, 127, 3, p.shape["3"])).toBeLessThanOrEqual(MAX_BEADS);
    // Візерунок для іншої кількості бісерин на сторону не заважає; без вставлених рядків — як раніше.
    const q = { rows: 30, cols: 400, side: 4, shape: { "3": new Array(60).fill(10) } };
    fitSize(q);
    expect(q.cols).toBe(Math.floor(maxCells(4) / 30));
    const big = { rows: 10, cols: 400, side: 10, shape: {} };
    fitSize(big);
    expect(big.cols).toBe(Math.floor(maxCells(10) / 10));
  });

  it("не трафарет — null", () => {
    expect(sanitizeProjectData({ name: "x" }, "y", "id")).toBeNull();
    expect(sanitizeProjectData(42, "y", "id")).toBeNull();
  });
});
