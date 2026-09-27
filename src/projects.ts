import { clamp } from "./util";

export type Side = 3 | 4;
export type SideKey = "3" | "4";
/** Кольори бісерин окремо для 3 і 4 бісерин на сторону ромба: ключ бісерини → колір. */
export type Fills = Record<SideKey, Record<string, string>>;

export interface ProjectData {
  name: string;
  rows: number;
  cols: number;
  side: Side;
  fills: Fills;
}

export interface Project extends ProjectData {
  id: string;
  createdAt: number;
  updatedAt: number;
  /** Мініатюра для списку трафаретів (data URL). */
  thumb?: string;
}

export const MAX_SIDE = 400;
export const MAX_CELLS = 12000;
export const DEFAULT_ROWS = 8;
export const DEFAULT_COLS = 20;

const HEX = /^#[0-9a-f]{6}$/i;
const BEAD_KEY = /^\d+\.\d{3},\d+\.\d{3}$/;

export const emptyFills = (): Fills => ({ "3": {}, "4": {} });
export const cloneFills = (f: Fills): Fills => ({ "3": { ...f["3"] }, "4": { ...f["4"] } });
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

export function sanitizeFills(raw: unknown): Fills {
  const out = emptyFills();
  if (!raw || typeof raw !== "object") return out;
  for (const side of ["3", "4"] as const) {
    const src = (raw as Record<string, unknown>)[side];
    if (!src || typeof src !== "object") continue;
    for (const [k, v] of Object.entries(src as Record<string, unknown>)) {
      if (BEAD_KEY.test(k) && typeof v === "string" && HEX.test(v)) out[side][k] = v.toUpperCase();
    }
  }
  return out;
}

/** Перевіряє дані трафарету з файлу чи старого сховища. Повертає null, якщо це не трафарет. */
export function sanitizeProjectData(raw: unknown, fallbackName: string): ProjectData | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.rows !== "number" || typeof o.cols !== "number") return null;
  const data: ProjectData = {
    name: typeof o.name === "string" && o.name.trim() ? o.name.trim().slice(0, 80) : fallbackName,
    rows: o.rows,
    cols: o.cols,
    side: o.side === 4 ? 4 : 3,
    fills: sanitizeFills(o.fills)
  };
  fitSize(data);
  return data;
}

/**
 * Перший етап зберігав один трафарет у localStorage. Переносимо його як перший проєкт
 * і повертаємо разом з налаштуваннями інструментів.
 */
const V1_KEY = "sylianka-app-v1";
export interface V1Migration {
  project: Project;
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
  const data = sanitizeProjectData(raw, "Трафарет 1");
  if (!data) return null;
  const o = raw as Record<string, unknown>;
  const project: Project = { ...blankProject(data.name), ...data };
  try {
    localStorage.removeItem(V1_KEY);
  } catch {
    // не критично
  }
  return {
    project,
    color: typeof o.color === "string" && HEX.test(o.color) ? o.color.toUpperCase() : undefined,
    mirror: typeof o.mirror === "boolean" ? o.mirror : undefined,
    two: typeof o.two === "boolean" ? o.two : undefined
  };
}
