import { describe, expect, it } from "vitest";
import { buildGeometry, type Gaps } from "../src/geometry";
import { describePlan, planStrips, stripEnd, stripStart, tableHeightMm } from "../src/print";

const frame = { left: 27, right: 9, top: 20, bottom: 9 };
const sizes = (ranges: [number, number][]): number[] => ranges.map(([a, b]) => b - a);
function covers(ranges: [number, number][], cols: number): boolean {
  let c = 0;
  for (const [a, b] of ranges) {
    if (a !== c || b <= a) return false;
    c = b;
  }
  return c === cols;
}

describe("друк смугами", () => {
  it("без проміжків — рівні смуги", () => {
    const p = planStrips(buildGeometry(60, 12, 3), 60, frame, 4, true);
    expect(sizes(p.ranges)).toEqual([12, 12, 12, 12, 12]);
    expect(describePlan(p)).toBe("Вийде 5 аркушів: 5 смуг по 12 ромбів, бісеринки 4 мм.");
  });

  it("смуги покривають усі ромби й уміщаються на аркуші", () => {
    const gaps: Gaps = { x: [84, 156, 600, 612, 624, 1188], y: [24, 60] };
    for (const side of [3, 4]) {
      const g = buildGeometry(100, 10, side, gaps);
      for (const bead of [2.3, 4, 6]) {
        const p = planStrips(g, 100, frame, bead, true);
        expect(covers(p.ranges, 100)).toBe(true);
        const aw = (p.orient === "landscape" ? 297 : 210) - 20;
        for (const [a, b] of p.ranges) {
          expect((stripEnd(g, b) - stripStart(g, a) + frame.left + frame.right) * p.scale).toBeLessThanOrEqual(aw + 1e-6);
        }
      }
    }
  });

  it("проміжки кожні 5 ромбів — ріжемо по них, якщо аркушів не більше", () => {
    const x = Array.from({ length: 11 }, (_, i) => 60 * (i + 1));
    const p = planStrips(buildGeometry(60, 8, 3, { x, y: [] }), 60, frame, 4, true);
    expect(p.ranges.slice(1).every(([a]) => a % 5 === 0)).toBe(true);
  });

  it("проміжок далеко від розрізу не заважає вирівнювати смуги", () => {
    const g = buildGeometry(29, 4, 3, { x: [15], y: [] }); // усередині ромба 2
    const p = planStrips(g, 29, frame, 5, true);
    // Жадібно вийшло б 8 + 9 + 9 + 3; вирівняні смуги — не довші за 8 ромбів.
    expect(p.strips).toBe(4);
    expect(sizes(p.ranges)).toEqual([7, 8, 8, 6]);
  });

  it("проміжок біля вузлових на розрізі не потрапляє в смугу", () => {
    const before = buildGeometry(6, 2, 3, { x: [21], y: [] });
    const plain = buildGeometry(6, 2, 3);
    expect(stripEnd(before, 2)).toBeCloseTo(plain.colX[2]);
    const after = buildGeometry(6, 2, 3, { x: [24], y: [] });
    expect(stripStart(after, 2)).toBeCloseTo(after.colX[2] + after.gap);
    const edges = buildGeometry(6, 2, 3, { x: [0, 69], y: [] });
    expect(stripStart(edges, 0)).toBe(0);
    expect(stripEnd(edges, 6)).toBeCloseTo(edges.width);
  });

  it("таблиця бісеру, що не вміщається під смугами, — окремий аркуш", () => {
    const g = buildGeometry(40, 8, 3);
    const without = planStrips(g, 40, frame, 4, true, 0);
    const withTable = planStrips(g, 40, frame, 4, true, tableHeightMm(60));
    expect(withTable.tablePage).toBe(true);
    expect(withTable.sheets).toBe(withTable.pages + 1);
    expect(without.tablePage).toBe(false);
    expect(describePlan(withTable)).toMatch(/таблиця бісеру — на окремому аркуші/);
  });
});
