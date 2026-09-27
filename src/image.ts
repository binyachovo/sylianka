import { BEAD_R, type Geometry } from "./geometry";

/**
 * Картинка трафарету (PNG), щоб надіслати в месенджері: сам трафарет або разом із назвою,
 * номерами ромбів і рядів та списком кольорів. Малюємо на canvas — так беруться ті самі шрифти,
 * що й на сторінці.
 */

/** Рядок списку кольорів під трафаретом. */
export interface LegendRow {
  /** Колір кружечка; null — «не зафарбовано». */
  hex: string | null;
  code: string;
  name: string;
  count: string;
  grams: string;
}

export interface ImageText {
  title: string;
  meta: string;
  rows: number;
  cols: number;
  /** «Усього бісерин: …» */
  total: string;
  legend: LegendRow[];
}

export interface ImageOptions {
  geom: Geometry;
  /** Колір кожної бісерини (HEX) або undefined — порожня. */
  colorOf: (key: string) => string | undefined;
  /** null — лише трафарет, без тексту. */
  text: ImageText | null;
}

const INK = "#1B1D22";
const MUTED = "#5A5F69";
const LINE = "#D7DAD2";
const THREAD = "#C9CDD3";
const BEAD_EMPTY = "#EEF0EB";
const BEAD_STROKE = "#8C929B";
const PAD = 28;
/** Найбільше пікселів на одиницю трафарету (бісеринка ≈ 24 px) і межі розміру картинки. */
const MAX_SCALE = 3;
const MAX_SIDE_PX = 16000;
const MAX_AREA_PX = 64_000_000;
const FONTS = {
  title: '800 30px Alegreya, Georgia, serif',
  meta: '400 17px Arsenal, "Segoe UI", sans-serif',
  head: '700 19px Arsenal, "Segoe UI", sans-serif',
  body: '400 16px Arsenal, "Segoe UI", sans-serif',
  mono: '500 15px "IBM Plex Mono", ui-monospace, monospace',
  label: '500 9.5px "IBM Plex Mono", ui-monospace, monospace'
};
const ROW_H = 30;

/** Чекаємо шрифтів (і кириличних частин), інакше canvas візьме запасні. */
async function fontsReady(): Promise<void> {
  if (!("fonts" in document)) return;
  const sample = "Бісер Трафарет 0123 АБВ abc";
  await Promise.all(Object.values(FONTS).map((f) => document.fonts.load(f, sample).catch(() => [])));
}

/** Поля навколо сітки в одиницях трафарету: з номерами чи без. */
const frameFor = (labels: boolean): { l: number; r: number; t: number; b: number } =>
  labels ? { l: 27, r: 9, t: 20, b: 9 } : { l: BEAD_R + 1, r: BEAD_R + 1, t: BEAD_R + 1, b: BEAD_R + 1 };

export async function renderStencilPng(o: ImageOptions): Promise<Blob | null> {
  await fontsReady();
  const { geom, text } = o;
  const fr = frameFor(!!text);
  const uw = geom.width + fr.l + fr.r;
  const uh = geom.height + fr.t + fr.b;
  const scale = Math.min(MAX_SCALE, MAX_SIDE_PX / uw, MAX_SIDE_PX / uh, Math.sqrt(MAX_AREA_PX / (uw * uh)));
  const stencilW = Math.ceil(uw * scale);
  const stencilH = Math.ceil(uh * scale);

  const measure = document.createElement("canvas").getContext("2d");
  if (!measure) return null;

  // Розмітка тексту: заголовок угорі, список кольорів під трафаретом.
  let headH = 0;
  let legendH = 0;
  let textW = 0;
  let cols = { code: 0, name: 0, count: 0, grams: 0 };
  if (text) {
    measure.font = FONTS.title;
    textW = Math.max(textW, measure.measureText(text.title).width);
    measure.font = FONTS.meta;
    textW = Math.max(textW, measure.measureText(text.meta).width);
    headH = 38 + 26 + 14;
    const w = (font: string, s: string): number => {
      measure.font = font;
      return measure.measureText(s).width;
    };
    cols = {
      code: Math.max(0, ...text.legend.map((r) => w(FONTS.mono, r.code))),
      name: Math.max(0, ...text.legend.map((r) => w(FONTS.body, r.name))),
      count: Math.max(0, ...text.legend.map((r) => w(FONTS.mono, r.count))),
      grams: Math.max(0, ...text.legend.map((r) => w(FONTS.mono, r.grams)))
    };
    const legendW = 22 + 12 + cols.code + 16 + cols.name + 28 + cols.count + 24 + cols.grams;
    textW = Math.max(textW, legendW, w(FONTS.head, "Бісер") + 16 + w(FONTS.body, text.total));
    legendH = 24 + 30 + 8 + text.legend.length * ROW_H;
  }
  const width = Math.ceil(Math.max(stencilW, textW) + 2 * PAD);
  const height = Math.ceil(PAD + headH + stencilH + legendH + PAD);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, height);
  ctx.textBaseline = "alphabetic";

  let y = PAD;
  if (text) {
    ctx.fillStyle = INK;
    ctx.font = FONTS.title;
    ctx.fillText(text.title, PAD, y + 30);
    ctx.fillStyle = MUTED;
    ctx.font = FONTS.meta;
    ctx.fillText(text.meta, PAD, y + 30 + 28);
    y += headH;
  }

  // Трафарет: нитки, бісерини (однаковий колір — одним контуром), номери.
  ctx.save();
  ctx.translate(PAD + fr.l * scale, y + fr.t * scale);
  ctx.scale(scale, scale);
  ctx.beginPath();
  for (const e of geom.edges) {
    const p = e.pts;
    ctx.moveTo(p[0], p[1]);
    for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i], p[i + 1]);
  }
  ctx.strokeStyle = THREAD;
  ctx.lineWidth = 1;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();

  const groups = new Map<string, { x: number; y: number }[]>();
  for (const b of geom.beads) {
    const c = o.colorOf(b.k) ?? BEAD_EMPTY;
    const list = groups.get(c);
    if (list) list.push(b);
    else groups.set(c, [b]);
  }
  for (const [color, list] of groups) {
    ctx.beginPath();
    for (const b of list) {
      ctx.moveTo(b.x + BEAD_R, b.y);
      ctx.arc(b.x, b.y, BEAD_R, 0, Math.PI * 2);
    }
    ctx.fillStyle = color;
    ctx.fill();
  }
  ctx.beginPath();
  for (const b of geom.beads) {
    ctx.moveTo(b.x + BEAD_R, b.y);
    ctx.arc(b.x, b.y, BEAD_R, 0, Math.PI * 2);
  }
  ctx.strokeStyle = BEAD_STROKE;
  ctx.lineWidth = 0.6;
  ctx.stroke();

  if (text) {
    ctx.fillStyle = MUTED;
    ctx.font = FONTS.label;
    ctx.textAlign = "center";
    const colEvery = text.cols > 40 ? 5 : 1;
    for (let i = 0; i < text.cols; i++) {
      const n = i + 1;
      if (colEvery === 1 || n === 1 || n % colEvery === 0) ctx.fillText(String(n), geom.px(2 * i + 1), -8);
    }
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    const rowEvery = text.rows > 40 ? 5 : 1;
    for (let r = 0; r < text.rows; r++) {
      const n = r + 1;
      if (rowEvery === 1 || n === 1 || n % rowEvery === 0) ctx.fillText(String(n), -7.5, geom.py(2 * r + 1));
    }
  }
  ctx.restore();
  y += stencilH;

  // Список кольорів: кружечок, код, назва, кількість, скільки грамів купувати.
  if (text) {
    y += 24;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = INK;
    ctx.font = FONTS.head;
    ctx.fillText("Бісер", PAD, y + 20);
    const headW = ctx.measureText("Бісер").width;
    ctx.fillStyle = MUTED;
    ctx.font = FONTS.body;
    ctx.fillText(text.total, PAD + headW + 16, y + 20);
    y += 30 + 8;
    const xCode = PAD + 22 + 12;
    const xName = xCode + cols.code + 16;
    const xCount = xName + cols.name + 28 + cols.count;
    const xGrams = xCount + 24 + cols.grams;
    for (const row of text.legend) {
      ctx.strokeStyle = LINE;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(PAD, y + 0.5);
      ctx.lineTo(xGrams, y + 0.5);
      ctx.stroke();
      const cy = y + ROW_H / 2;
      ctx.beginPath();
      ctx.arc(PAD + 11, cy, 9, 0, Math.PI * 2);
      ctx.fillStyle = row.hex ?? "#FFFFFF";
      ctx.fill();
      ctx.strokeStyle = row.hex ? "rgba(0, 0, 0, 0.28)" : BEAD_STROKE;
      ctx.stroke();
      ctx.textBaseline = "middle";
      ctx.fillStyle = INK;
      ctx.font = FONTS.mono;
      ctx.textAlign = "left";
      ctx.fillText(row.code, xCode, cy);
      ctx.font = FONTS.body;
      ctx.fillStyle = row.hex ? INK : MUTED;
      ctx.fillText(row.name, xName, cy);
      ctx.font = FONTS.mono;
      ctx.fillStyle = INK;
      ctx.textAlign = "right";
      ctx.fillText(row.count, xCount, cy);
      ctx.fillStyle = MUTED;
      ctx.fillText(row.grams, xGrams, cy);
      y += ROW_H;
    }
  }

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
}
