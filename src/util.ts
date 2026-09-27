export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/** Координати ґратки округлюємо до тисячних, щоб ключі бісерин були стабільними. */
export function fmt(v: number): string {
  return (Math.round(v * 1000) / 1000).toFixed(3);
}

export function keyOf(x: number, y: number): string {
  return `${fmt(x)},${fmt(y)}`;
}

export function parseKey(k: string): [number, number] {
  const i = k.indexOf(",");
  return [parseFloat(k.slice(0, i)), parseFloat(k.slice(i + 1))];
}

/** Число для атрибутів SVG: до сотих, без зайвих нулів. */
export function r2(v: number): string {
  return String(Math.round(v * 100) / 100);
}

export function num(v: number): string {
  return v.toLocaleString("uk-UA");
}

export function $<T extends Element = HTMLElement>(sel: string, root: ParentNode = document): T {
  const el = root.querySelector<T>(sel);
  if (!el) throw new Error(`Не знайдено елемент ${sel}`);
  return el;
}

export function $$<T extends Element = HTMLElement>(sel: string, root: ParentNode = document): T[] {
  return Array.from(root.querySelectorAll<T>(sel));
}

/** Екранує текст для вставлення в HTML. */
export function esc(s: string): string {
  return s.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);
}

/** Українська множина: 1 колір, 2 кольори, 5 кольорів. */
export function plural(n: number, one: string, few: string, many: string): string {
  const d = Math.abs(n) % 100;
  const u = d % 10;
  if (d > 10 && d < 20) return many;
  if (u === 1) return one;
  if (u >= 2 && u <= 4) return few;
  return many;
}
