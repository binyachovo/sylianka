import { BEAD_R, type Geometry } from "./geometry";

/** Невелика картинка трафарету для списку «Мої трафарети». */
export function makeThumb(geom: Geometry, fills: Record<string, string>, maxW = 260, maxH = 130): string {
  const e = BEAD_R + 1;
  const w = geom.width + 2 * e;
  const h = geom.height + 2 * e;
  const k = Math.min(maxW / w, maxH / h);
  const dpr = 2;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(w * k * dpr));
  canvas.height = Math.max(1, Math.round(h * k * dpr));
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.scale(k * dpr, k * dpr);
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, w, h);
  ctx.translate(e, e);
  for (const b of geom.beads) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, BEAD_R, 0, Math.PI * 2);
    ctx.fillStyle = fills[b.k] ?? "#E4E7E1";
    ctx.fill();
  }
  const webp = canvas.toDataURL("image/webp", 0.85);
  return webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/png");
}
