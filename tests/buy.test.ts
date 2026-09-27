import { describe, expect, it } from "vitest";
import { BEADS_PER_GRAM, fmtGrams, gramsFor } from "../src/buy";

describe("скільки купувати", () => {
  it("≈ 90 бісерин у грамі, угору до десятих", () => {
    expect(BEADS_PER_GRAM).toBe(90);
    expect(gramsFor(90, 0)).toBe(1);
    expect(gramsFor(91, 0)).toBe(1.1);
    expect(gramsFor(0, 10)).toBe(0);
    expect(gramsFor(1, 0)).toBe(0.1);
  });

  it("запас додається до кількості", () => {
    expect(gramsFor(900, 10)).toBe(11);
    expect(gramsFor(900, 20)).toBe(12);
    expect(gramsFor(988, 10)).toBe(12.1);
  });

  it("запис грамів", () => {
    expect(fmtGrams(0)).toBe("0 г");
    expect(fmtGrams(0.4)).toBe("0,4 г");
    expect(fmtGrams(2)).toBe("2,0 г");
    expect(fmtGrams(12.1)).toBe("13 г");
    expect(fmtGrams(12)).toBe("12 г");
  });
});
