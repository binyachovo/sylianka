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
