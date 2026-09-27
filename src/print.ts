/**
 * Розкладка друку на A4 з полями 10 мм: обирає орієнтацію й розташування копій,
 * за яких трафарет виходить найбільшим і все вміщується на один аркуш.
 */
const MARGIN = 10;
const GAP = 8;
const SAFE = 3;

type Orient = "landscape" | "portrait";
type Dir = "column" | "row";

export function applyPrintLayout(vw: number, vh: number, copies: 1 | 2, pageStyle: HTMLStyleElement): void {
  const pages: [number, number, Orient][] = [
    [297, 210, "landscape"],
    [210, 297, "portrait"]
  ];
  const dirs: Dir[] = copies === 2 ? ["column", "row"] : ["column"];
  let best: { k: number; orient: Orient; dir: Dir } | null = null;

  for (const [pw, ph, orient] of pages) {
    const cw = pw - 2 * MARGIN;
    const ch = ph - 2 * MARGIN - SAFE;
    for (const dir of dirs) {
      const bw = copies === 2 && dir === "row" ? (cw - GAP) / 2 : cw;
      const bh = copies === 2 && dir === "column" ? (ch - GAP) / 2 : ch;
      const k = Math.min(bw / vw, bh / vh);
      if (!best || k > best.k + 1e-9) best = { k, orient, dir };
    }
  }
  if (!best) return;

  pageStyle.textContent = `@page { size: A4 ${best.orient}; margin: 0; }`;
  const rs = document.documentElement.style;
  rs.setProperty("--print-w", `${Math.floor(vw * best.k * 10) / 10}mm`);
  rs.setProperty("--print-h", `${Math.floor(vh * best.k * 10) / 10}mm`);
  rs.setProperty("--print-dir", best.dir);
}
