import { preciosaByCode } from "./catalog";
import { dbGetColors, dbPutColor } from "./db";
import { COLOR_ID, HEX, type Fills } from "./projects";

/**
 * Кольори в трафареті позначаються ідентифікаторами:
 *   «p:23980» — колір Preciosa з кодом 23980;
 *   «u:…»     — свій колір із «Моїх кольорів».
 */

/** Свій колір користувача. Видалений лише ховається, щоб старі трафарети не втратили колір. */
export interface CustomColor {
  id: string;
  name: string;
  hex: string;
  /** Необов'язковий код (наприклад, іншого виробника). */
  code: string;
  createdAt: number;
  deleted?: boolean;
}

/** Усе, що треба знати про колір для показу. */
export interface ColorView {
  id: string;
  kind: "preciosa" | "custom" | "missing";
  code: string;
  name: string;
  hex: string;
  /** Опис Preciosa англійською. */
  en?: string;
  /** Артикул Preciosa. */
  article?: string;
}

const MISSING_HEX = "#9AA0A6";
const customs = new Map<string, CustomColor>();
const listeners = new Set<(id: string) => void>();

export const preciosaId = (code: string): string => `p:${code}`;

export function newCustomId(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return `u:${Array.from(bytes, (b) => (b % 36).toString(36)).join("")}`;
}

/** Підписка на зміни «Моїх кольорів»: слухач отримує ідентифікатор зміненого кольору. */
export function onCustomsChange(fn: (id: string) => void): void {
  listeners.add(fn);
}

function changed(id: string): void {
  for (const fn of listeners) fn(id);
}

export async function loadCustomColors(): Promise<void> {
  const list = await dbGetColors();
  customs.clear();
  for (const c of list) customs.set(c.id, c);
}

/** «Мої кольори» у порядку додавання (без видалених). */
export function customColors(): CustomColor[] {
  return [...customs.values()].filter((c) => !c.deleted).sort((a, b) => a.createdAt - b.createdAt);
}

export function getCustom(id: string): CustomColor | undefined {
  return customs.get(id);
}

export async function putCustom(c: CustomColor): Promise<void> {
  customs.set(c.id, c);
  changed(c.id);
  await dbPutColor(c);
}

export function colorView(id: string): ColorView {
  if (id.startsWith("p:")) {
    const p = preciosaByCode(id.slice(2));
    if (p) return { id, kind: "preciosa", code: p.code, name: p.name, hex: p.hex, en: p.en, article: p.article };
    return { id, kind: "missing", code: id.slice(2), name: "Немає в каталозі", hex: MISSING_HEX };
  }
  const c = customs.get(id);
  if (c) return { id, kind: "custom", code: c.code, name: c.name, hex: c.hex };
  return { id, kind: "missing", code: "", name: "Невідомий колір", hex: MISSING_HEX };
}

export function hexOf(id: string): string {
  if (id.startsWith("p:")) return preciosaByCode(id.slice(2))?.hex ?? MISSING_HEX;
  return customs.get(id)?.hex ?? MISSING_HEX;
}

/** «23980 · Чорний», або лише назва для свого кольору без коду. */
export function fullLabel(v: ColorView): string {
  return v.code ? `${v.code} · ${v.name}` : v.name;
}

/** Підказка для кольору: назва, код, артикул і опис Preciosa. */
export function colorTitle(v: ColorView): string {
  if (v.kind === "preciosa") return `${v.code} — ${v.name}\nPreciosa ${v.article}, 10/0 · ${v.en || "без опису"}`;
  if (v.kind === "custom") return v.code ? `${v.code} — ${v.name}\nМій колір` : `${v.name}\nМій колір`;
  return v.code ? `${v.code} — ${v.name}` : v.name;
}

/** Ідентифікатори своїх кольорів, що трапляються в трафареті або в його палітрі. */
export function customIdsIn(fills: Fills, palette: readonly string[]): string[] {
  const ids = new Set<string>();
  for (const id of palette) if (id.startsWith("u:")) ids.add(id);
  for (const side of Object.values(fills)) {
    for (const id of Object.values(side)) if (id.startsWith("u:")) ids.add(id);
  }
  return [...ids];
}

/** Дані своїх кольорів для файлу трафарету. */
export function customsForFile(ids: string[]): Pick<CustomColor, "id" | "name" | "hex" | "code">[] {
  const out: Pick<CustomColor, "id" | "name" | "hex" | "code">[] = [];
  for (const id of ids) {
    const c = customs.get(id);
    if (c) out.push({ id: c.id, name: c.name, hex: c.hex, code: c.code });
  }
  return out;
}

/** Додає до «Моїх кольорів» кольори з файлу, яких ще немає в цьому браузері. */
export async function adoptCustomColors(raw: unknown): Promise<void> {
  if (!Array.isArray(raw)) return;
  let t = Date.now();
  for (const item of raw.slice(0, 500)) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    if (typeof o.id !== "string" || !o.id.startsWith("u:") || !COLOR_ID.test(o.id)) continue;
    if (typeof o.hex !== "string" || !HEX.test(o.hex)) continue;
    const existing = customs.get(o.id);
    if (existing) {
      if (existing.deleted) await putCustom({ ...existing, deleted: false });
      continue;
    }
    await putCustom({
      id: o.id,
      name: cleanName(o.name) || `Колір ${o.hex.toUpperCase()}`,
      hex: o.hex.toUpperCase(),
      code: cleanCode(o.code),
      createdAt: t++
    });
  }
}

/** Усі свої кольори, зокрема сховані, — для резервної копії. */
export function allCustomsForBackup(): CustomColor[] {
  return [...customs.values()].map((c) => ({ ...c }));
}

/** Відновлює свої кольори з резервної копії: додає відсутні, наявні лишає як є. Повертає, скільки додано. */
export async function restoreCustomColors(raw: unknown): Promise<number> {
  if (!Array.isArray(raw)) return 0;
  let added = 0;
  let t = Date.now();
  for (const item of raw.slice(0, 2000)) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    if (typeof o.id !== "string" || !o.id.startsWith("u:") || !COLOR_ID.test(o.id) || customs.has(o.id)) continue;
    if (typeof o.hex !== "string" || !HEX.test(o.hex)) continue;
    await putCustom({
      id: o.id,
      name: cleanName(o.name) || `Колір ${o.hex.toUpperCase()}`,
      hex: o.hex.toUpperCase(),
      code: cleanCode(o.code),
      createdAt: typeof o.createdAt === "number" && Number.isFinite(o.createdAt) ? o.createdAt : t++,
      deleted: o.deleted === true ? true : undefined
    });
    added++;
  }
  return added;
}

/** Свій колір із таким самим відтінком і назвою або новий — для старих трафаретів з HEX-кольорами. */
export async function customForHex(hex: string, name: string): Promise<string> {
  const H = hex.toUpperCase();
  for (const c of customs.values()) {
    if (!c.deleted && c.hex === H && c.name === name) return c.id;
  }
  const c: CustomColor = { id: newCustomId(), name, hex: H, code: "", createdAt: Date.now() };
  await putCustom(c);
  return c.id;
}

export function cleanName(v: unknown): string {
  return typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, 40) : "";
}

export function cleanCode(v: unknown): string {
  return typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, 20) : "";
}
