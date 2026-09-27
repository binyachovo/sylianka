import { describe, expect, it } from "vitest";
import { DEFAULT_REPEAT, sanitizeGaps, sanitizeProjectData, sanitizeRepeat } from "../src/projects";

describe("перевірка даних трафарету", () => {
  it("проміжки першого вигляду (номери ромбів і рядів) переводяться в лінії бісерин", () => {
    expect(sanitizeGaps({ cols: [5, 10, 5], rows: [4] })).toEqual({ x: [60, 120], y: [48] });
  });

  it("нові проміжки: цілі невід'ємні, без повторів, за зростанням", () => {
    expect(sanitizeGaps({ x: [3, 0, 3, -1, 1.5, 99999], y: ["7", 12] })).toEqual({ x: [0, 3], y: [12] });
    expect(sanitizeGaps("щось")).toEqual({ x: [], y: [] });
    expect(sanitizeGaps(null)).toEqual({ x: [], y: [] });
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
    expect(d?.gaps).toEqual({ x: [24], y: [] });
    expect(d?.repeat).toBe(12);
  });

  it("не трафарет — null", () => {
    expect(sanitizeProjectData({ name: "x" }, "y", "id")).toBeNull();
    expect(sanitizeProjectData(42, "y", "id")).toBeNull();
  });
});
