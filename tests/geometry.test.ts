import { describe, expect, it } from "vitest";
import { beadsPerStep, buildGeometry, symmetryClosure, symmetryKeys, type Symmetry } from "../src/geometry";
import { keyOf, parseKey } from "../src/util";

const near = (a: number, b: number): boolean => Math.abs(a - b) < 1e-6;
const beadAt = (g: ReturnType<typeof buildGeometry>, lx: number, ly: number) => {
  const b = g.beads.find((x) => near(x.lx, lx) && near(x.ly, ly));
  if (!b) throw new Error(`немає бісерини ${lx},${ly}`);
  return b;
};

describe("сітка", () => {
  it("кількість бісерин: вузлові й бісерини сторін", () => {
    for (const [rows, cols, side] of [
      [8, 20, 3],
      [8, 20, 4],
      [1, 1, 3],
      [30, 7, 4]
    ]) {
      const g = buildGeometry(cols, rows, side);
      const expected = rows * (cols + 1) + (rows + 1) * cols + 4 * rows * cols * (side - 2);
      expect(g.beads.length).toBe(expected);
      expect(new Set(g.beads.map((b) => b.k)).size).toBe(expected);
    }
    expect(buildGeometry(20, 8, 3).beads.length).toBe(988);
  });

  it("кожен ромб довжини додає beadsPerStep бісерин", () => {
    for (const side of [3, 4]) {
      const a = buildGeometry(10, 8, side).beads.length;
      const b = buildGeometry(11, 8, side).beads.length;
      expect(b - a).toBe(beadsPerStep(8, side));
    }
  });

  it("сусідні ключі на стороні ромба — наявні бісерини", () => {
    const g = buildGeometry(3, 2, 4);
    const keys = new Set(g.beads.map((b) => b.k));
    for (const e of g.edges) {
      expect(e.keys.length).toBe(4);
      for (const k of e.keys) expect(keys.has(k)).toBe(true);
    }
  });

  it("ключ бісерини перетворюється туди й назад", () => {
    const k = keyOf(19 + 2 / 3, 1 / 3);
    expect(k).toBe("19.667,0.333");
    expect(keyOf(...parseKey(k))).toBe(k);
  });
});

describe("проміжки", () => {
  it("горизонтальний проміжок між рядками бісерин (3 на сторону)", () => {
    const g0 = buildGeometry(4, 2, 3);
    const g = buildGeometry(4, 2, 3, { x: [], y: [3] }); // після лінії y = 1/2
    expect(beadAt(g, 1, 0).y).toBeCloseTo(beadAt(g0, 1, 0).y);
    expect(beadAt(g, 0.5, 0.5).y).toBeCloseTo(beadAt(g0, 0.5, 0.5).y);
    expect(beadAt(g, 0, 1).y).toBeCloseTo(beadAt(g0, 0, 1).y + g.gap);
    expect(g.height).toBeCloseTo(g0.height + g.gap);
  });

  it("той самий запис для 4 бісерин лежить між лініями 1/3 і 2/3", () => {
    const g0 = buildGeometry(4, 2, 4);
    const g = buildGeometry(4, 2, 4, { x: [], y: [3] });
    expect(beadAt(g, 2 / 3, 1 / 3).y).toBeCloseTo(beadAt(g0, 2 / 3, 1 / 3).y);
    expect(beadAt(g, 1 / 3, 2 / 3).y).toBeCloseTo(beadAt(g0, 1 / 3, 2 / 3).y + g.gap);
  });

  it("вертикальний проміжок перед вузловими між ромбами зсуває їх праворуч", () => {
    const g0 = buildGeometry(6, 2, 3);
    const g = buildGeometry(6, 2, 3, { x: [21], y: [] });
    expect(beadAt(g, 4, 1).x).toBeCloseTo(beadAt(g0, 4, 1).x + g.gap);
    expect(beadAt(g, 3.5, 0.5).x).toBeCloseTo(beadAt(g0, 3.5, 0.5).x);
    expect(g.colX[2]).toBeCloseTo(g0.colX[2] + g.gap);
  });

  it("проміжки поза сіткою не діють", () => {
    const g = buildGeometry(4, 2, 3, { x: [48, 60, -1], y: [24] });
    expect(g.gx).toEqual([]);
    expect(g.gy).toEqual([]);
    expect(g.width).toBeCloseTo(buildGeometry(4, 2, 3).width);
  });
});

describe("дзеркала й повтор", () => {
  const base: Symmetry = { tb: false, lr: false, every: 0, rows: 8, cols: 20 };
  const K = (x: number, y: number): string => keyOf(x, y);
  const same = (a: string[], b: string[]): void => expect([...a].sort()).toEqual([...b].sort());

  it("без симетрії — лише сама бісерина", () => same(symmetryKeys(K(2, 1), base), [K(2, 1)]));
  it("верх–низ і ліво–право разом — чотири", () =>
    same(symmetryKeys(K(2, 1), { ...base, tb: true, lr: true }), [K(2, 1), K(2, 15), K(38, 1), K(38, 15)]));
  it("бісерина на осі — одна", () => same(symmetryKeys(K(3, 8), { ...base, tb: true }), [K(3, 8)]));
  it("повтор кожні 5 ромбів — від будь-якого місця", () => {
    const all = [2, 12, 22, 32].map((x) => K(x, 1));
    same(symmetryKeys(K(2, 1), { ...base, every: 5 }), all);
    same(symmetryKeys(K(22, 1), { ...base, every: 5 }), all);
  });
  it("вузлові на межі повтору доходять до обох країв", () =>
    same(symmetryKeys(K(10, 1), { ...base, every: 5 }), [0, 10, 20, 30, 40].map((x) => K(x, 1))));
  it("повтор разом із дзеркалом ліво–право", () =>
    same(symmetryKeys(K(2, 1), { ...base, lr: true, every: 5 }), [2, 8, 12, 18, 22, 28, 32, 38].map((x) => K(x, 1))));
  it("крок не менший за довжину — повтору немає", () => same(symmetryKeys(K(2, 1), { ...base, every: 20 }), [K(2, 1)]));
  it("дробові координати (4 на сторону)", () =>
    same(symmetryKeys("19.667,0.333", { ...base, lr: true }), ["19.667,0.333", "20.333,0.333"]));
  it("замикання для набору бісерин — те саме, що для кожної окремо", () => {
    const s: Symmetry = { tb: true, lr: true, every: 3, rows: 4, cols: 11 };
    const set = [K(1, 0), K(2, 1), K(4.5, 2.5)];
    const one = new Set(set.flatMap((k) => symmetryKeys(k, s)));
    expect(symmetryClosure(set, s)).toEqual(one);
  });
});
