import { clamp } from "./util";

export type Side = 3 | 4;
export type SideKey = "3" | "4";
/** Кольори бісерин окремо для 3 і 4 бісерин на сторону ромба: ключ бісерини → ідентифікатор кольору. */
export type Fills = Record<SideKey, Record<string, string>>;
/** Нанизані бісерини в порядку позначення (окремо для 3 і 4): номер у наборі = позиція + 1. */
export type Woven = Record<SideKey, string[]>;

export interface ProjectData {
  name: string;
  rows: number;
  cols: number;
  side: Side;
  fills: Fills;
  /** Кольори для швидкого вибору в цьому трафареті (ідентифікатори). */
  palette: string[];
  /** Позначки плетіння. */
  woven: Woven;
}

export interface Project extends ProjectData {
  id: string;
  createdAt: number;
  updatedAt: number;
  /** Мініатюра для списку трафаретів (data URL). */
  thumb?: string;
  /** Скільки бісерин нанизано — для списку трафаретів. */
  progress?: { done: number; total: number };
}

export const MAX_SIDE = 400;
export const MAX_CELLS = 12000;
export const MAX_PALETTE = 300;
export const MAX_WOVEN = 200000;
export const DEFAULT_ROWS = 8;
export const DEFAULT_COLS = 20;

export const HEX = /^#[0-9a-f]{6}$/i;
/** «p:23980» — колір Preciosa, «u:…» — свій колір. */
export const COLOR_ID = /^(p:[0-9A-Za-z]{5}|u:[0-9a-z]{4,32})$/;
const BEAD_KEY = /^\d+\.\d{3},\d+\.\d{3}$/;

export const emptyFills = (): Fills => ({ "3": {}, "4": {} });
export const cloneFills = (f: Fills): Fills => ({ "3": { ...f["3"] }, "4": { ...f["4"] } });
export const emptyWoven = (): Woven => ({ "3": [], "4": [] });
export const cloneWoven = (w: Woven): Woven => ({ "3": [...w["3"]], "4": [...w["4"]] });
export const sideKey = (side: Side): SideKey => (side === 4 ? "4" : "3");

export function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function fitSize(p: { rows: number; cols: number }): void {
  p.rows = clamp(Math.round(p.rows), 1, MAX_SIDE);
  p.cols = clamp(Math.round(p.cols), 1, Math.min(MAX_SIDE, Math.floor(MAX_CELLS / p.rows)));
}

export function blankProject(name: string): Project {
  const now = Date.now();
  return {
    id: newId(),
    name,
    rows: DEFAULT_ROWS,
    cols: DEFAULT_COLS,
    side: 3,
    fills: emptyFills(),
    palette: [],
    woven: emptyWoven(),
    createdAt: now,
    updatedAt: now
  };
}

export function nextName(existing: string[]): string {
  const taken = new Set(existing);
  let n = 1;
  while (taken.has(`Трафарет ${n}`)) n++;
  return `Трафарет ${n}`;
}

/** Старі трафарети (до каталогу Preciosa) зберігали колір бісерини як HEX і не мали палітри. */
export function isLegacyProject(p: Project): boolean {
  return !Array.isArray((p as Partial<Project>).palette);
}

/** Трафарети, збережені до режиму плетіння, не мають позначок — додаємо порожні. */
export function ensureWoven(p: Project): void {
  const w = (p as Partial<Project>).woven;
  if (!w || !Array.isArray(w["3"]) || !Array.isArray(w["4"])) p.woven = emptyWoven();
}

/**
 * Перевіряє кольори бісерин. mode "id" — формат з каталогом (ідентифікатори кольорів),
 * "hex" — старий формат, де зберігався сам колір.
 */
export function sanitizeFills(raw: unknown, mode: "id" | "hex"): Fills {
  const out = emptyFills();
  if (!raw || typeof raw !== "object") return out;
  const valid = mode === "id" ? COLOR_ID : HEX;
  for (const side of ["3", "4"] as const) {
    const src = (raw as Record<string, unknown>)[side];
    if (!src || typeof src !== "object") continue;
    for (const [k, v] of Object.entries(src as Record<string, unknown>)) {
      if (BEAD_KEY.test(k) && typeof v === "string" && valid.test(v)) out[side][k] = mode === "hex" ? v.toUpperCase() : v;
    }
  }
  return out;
}

export function sanitizeWoven(raw: unknown): Woven {
  const out = emptyWoven();
  if (!raw || typeof raw !== "object") return out;
  for (const side of ["3", "4"] as const) {
    const src = (raw as Record<string, unknown>)[side];
    if (!Array.isArray(src)) continue;
    const seen = new Set<string>();
    for (const k of src) {
      if (typeof k !== "string" || !BEAD_KEY.test(k) || seen.has(k)) continue;
      seen.add(k);
      out[side].push(k);
      if (out[side].length >= MAX_WOVEN) break;
    }
  }
  return out;
}

export function sanitizePalette(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const out = new Set<string>();
  for (const v of raw) {
    if (typeof v === "string" && COLOR_ID.test(v)) out.add(v);
    if (out.size >= MAX_PALETTE) break;
  }
  return [...out];
}

/** Перевіряє дані трафарету з файлу чи старого сховища. Повертає null, якщо це не трафарет. */
export function sanitizeProjectData(raw: unknown, fallbackName: string, mode: "id" | "hex"): ProjectData | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.rows !== "number" || typeof o.cols !== "number") return null;
  const data: ProjectData = {
    name: typeof o.name === "string" && o.name.trim() ? o.name.trim().slice(0, 80) : fallbackName,
    rows: o.rows,
    cols: o.cols,
    side: o.side === 4 ? 4 : 3,
    fills: sanitizeFills(o.fills, mode),
    palette: mode === "id" ? sanitizePalette(o.palette) : [],
    woven: sanitizeWoven(o.woven)
  };
  fitSize(data);
  return data;
}

/**
 * Перший етап зберігав один трафарет у localStorage. Переносимо його як перший проєкт
 * (кольори ще у форматі HEX) і повертаємо разом з налаштуваннями інструментів.
 */
const V1_KEY = "sylianka-app-v1";
export interface V1Migration {
  data: ProjectData;
  color?: string;
  mirror?: boolean;
  two?: boolean;
}
export function migrateV1(): V1Migration | null {
  let raw: unknown = null;
  try {
    raw = JSON.parse(localStorage.getItem(V1_KEY) || "null");
  } catch {
    raw = null;
  }
  const data = sanitizeProjectData(raw, "Трафарет 1", "hex");
  if (!data) return null;
  const o = raw as Record<string, unknown>;
  return {
    data,
    color: typeof o.color === "string" && HEX.test(o.color) ? o.color.toUpperCase() : undefined,
    mirror: typeof o.mirror === "boolean" ? o.mirror : undefined,
    two: typeof o.two === "boolean" ? o.two : undefined
  };
}

/** Прибирає трафарет першого етапу після того, як його збережено в новому сховищі. */
export function forgetV1(): void {
  try {
    localStorage.removeItem(V1_KEY);
  } catch {
    // не критично
  }
}
