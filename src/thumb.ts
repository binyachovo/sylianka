import { BEAD_R, type Geometry } from "./geometry";

/** Невелика картинка трафарету для списку «Мої трафарети». */
export function makeThumb(
  geom: Geometry,
  fills: Record<string, string>,
  hexOf: (id: string) => string,
  maxW = 260,
  maxH = 130
): string {
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

  // Малюємо однаковий колір одним контуром — у рази швидше на великих трафаретах.
  const groups = new Map<string, { x: number; y: number }[]>();
  for (const b of geom.beads) {
    const id = fills[b.k];
    const color = id ? hexOf(id) : "#E4E7E1";
    const list = groups.get(color);
    if (list) list.push(b);
    else groups.set(color, [b]);
  }
  // Бісерини, менші за піксель-два, досить позначити квадратиком.
  const tiny = BEAD_R * k * dpr < 1.5;
  for (const [color, list] of groups) {
    ctx.beginPath();
    for (const b of list) {
      if (tiny) ctx.rect(b.x - BEAD_R, b.y - BEAD_R, 2 * BEAD_R, 2 * BEAD_R);
      else {
        ctx.moveTo(b.x + BEAD_R, b.y);
        ctx.arc(b.x, b.y, BEAD_R, 0, Math.PI * 2);
      }
    }
    ctx.fillStyle = color;
    ctx.fill();
  }
  const webp = canvas.toDataURL("image/webp", 0.85);
  return webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/png");
}
