import { GAP_UNIT, beadsPerStep, knotLine, type Gaps } from "./geometry";
import { clamp } from "./util";

/** Бісерин на сторону ромба разом із вузловими: від MIN_BEADS_SIDE до MAX_BEADS_SIDE. */
export type Side = number;
/** Ключ візерунка для кількості бісерин на сторону: "3", "4", … */
export type SideKey = string;
/** Кольори бісерин окремо для кожної кількості бісерин на сторону: ключ бісерини → ідентифікатор кольору. */
export type Fills = Record<SideKey, Record<string, string>>;
/** Нанизані бісерини в порядку позначення (окремо для кожної кількості): номер у наборі = позиція + 1. */
export type Woven = Record<SideKey, string[]>;
/**
 * Бісерин на сторону ромбів у кожній половині ряду (окремо для кожної кількості бісерин на сторону):
 * [верхня половина ряду 1, нижня половина ряду 1, верхня ряду 2, …]. Коли видаляють рядок бісерин,
 * у його половині ряду на сторонах ромбів стає на бісерину менше, коли вставляють — більше. Чого в списку
 * немає — як у всьому трафареті (див. sideAt у geometry.ts); порожній запис — усі ромби однакові.
 */
export type Shapes = Record<SideKey, number[]>;

export const MIN_BEADS_SIDE = 2;
export const MAX_BEADS_SIDE = 10;
/** Для нового трафарету й коли в даних незрозуміла кількість. */
export const DEFAULT_SIDE = 3;
const isSide = (v: unknown): v is Side => typeof v === "number" && Number.isInteger(v) && v >= MIN_BEADS_SIDE && v <= MAX_BEADS_SIDE;
const isSideKey = (k: string): boolean => /^\d+$/.test(k) && isSide(Number(k));

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
  /** Проміжки для вигляду (див. Gaps). */
  gaps: Gaps;
  /** Крок повтору візерунка, ромбів: для «Повтору» й «Розмножити». */
  repeat: number;
  /** Половини рядів з іншою кількістю бісерин на сторону (див. Shapes). */
  shape: Shapes;
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
/** Скільки приблизно бісерин може бути в трафареті, щоб програма не гальмувала. */
export const MAX_BEADS = 130000;

/** Найбільше ромбів разом для side бісерин на сторону: кожен ромб додає ≈ 4·(side − 2) + 2 бісерини. */
export function maxCells(side: Side): number {
  return Math.min(MAX_CELLS, Math.floor(MAX_BEADS / (4 * (side - 2) + 2)));
}

/** Скільки бісерин у трафареті rows × cols для side бісерин на сторону з половинами рядів shape. */
export function beadTotal(rows: number, cols: number, side: Side, shape: readonly number[] = []): number {
  return cols * beadsPerStep(rows, side, shape) + rows;
}

/**
 * Чи не забагато бісерин через вставлені рядки бісерин: з ними трафарет не більший за MAX_BEADS бісерин
 * (а якщо й без них більший — то не більший, ніж без них). Кількість ромбів обмежує maxCells.
 */
export function beadsFit(rows: number, cols: number, side: Side, shape: readonly number[]): boolean {
  return beadTotal(rows, cols, side, shape) <= Math.max(MAX_BEADS, beadTotal(rows, cols, side));
}

export const MAX_PALETTE = 300;
export const MAX_WOVEN = 200000;
export const DEFAULT_ROWS = 8;
export const DEFAULT_COLS = 20;
export const DEFAULT_REPEAT = 10;

export const HEX = /^#[0-9a-f]{6}$/i;
/** «p:23980» — колір Preciosa, «u:…» — свій колір. */
export const COLOR_ID = /^(p:[0-9A-Za-z]{5}|u:[0-9a-z]{4,32})$/;
const BEAD_KEY = /^\d+\.\d{3},\d+\.\d{3}$/;

export const emptyFills = (): Fills => ({ "3": {}, "4": {} });
export const cloneFills = (f: Fills): Fills => Object.fromEntries(Object.entries(f).map(([k, v]) => [k, { ...v }]));
export const emptyWoven = (): Woven => ({ "3": [], "4": [] });
export const cloneWoven = (w: Woven): Woven => Object.fromEntries(Object.entries(w).map(([k, v]) => [k, [...v]]));
export const sideKey = (side: Side): SideKey => String(side);
export const cloneShapes = (s: Shapes): Shapes => Object.fromEntries(Object.entries(s).map(([k, v]) => [k, [...v]]));
/** Бісерин на сторону по половинах рядів для візерунка side (для buildGeometry). */
export const shapeOf = (p: { shape: Shapes }, side: Side): number[] => p.shape[sideKey(side)] ?? [];
/** Чи є в трафареті половини рядів з іншою кількістю бісерин на сторону (для будь-якого візерунка). */
export function hasShape(p: { shape: Shapes }): boolean {
  return Object.entries(p.shape).some(([k, list]) => list.some((v) => v !== Number(k)));
}

export function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function fitSize(p: { rows: number; cols: number; side: Side; shape?: Shapes }): void {
  const cells = maxCells(p.side);
  p.rows = clamp(Math.round(p.rows), 1, Math.min(MAX_SIDE, cells));
  p.cols = clamp(Math.round(p.cols), 1, Math.min(MAX_SIDE, Math.floor(cells / p.rows)));
  // Із вставленими рядками бісерин кожен ромб довжини має більше бісерин.
  const shape = p.shape?.[sideKey(p.side)] ?? [];
  while (p.cols > 1 && !beadsFit(p.rows, p.cols, p.side, shape)) p.cols--;
}

export function blankProject(name: string): Project {
  const now = Date.now();
  return {
    id: newId(),
    name,
    rows: DEFAULT_ROWS,
    cols: DEFAULT_COLS,
    side: DEFAULT_SIDE,
    fills: emptyFills(),
    palette: [],
    woven: emptyWoven(),
    gaps: emptyGaps(),
    repeat: DEFAULT_REPEAT,
    shape: {},
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

/**
 * Трафарети зі старіших версій: без позначок плетіння чи проміжків — додаємо порожні;
 * проміжки першого вигляду (номери ромбів і рядів) переводимо в лінії бісерин.
 */
export function ensureFields(p: Project): void {
  const w = (p as Partial<Project>).woven;
  if (!w || typeof w !== "object" || Object.values(w).some((list) => !Array.isArray(list))) p.woven = emptyWoven();
  if (!isSide(p.side)) p.side = DEFAULT_SIDE;
  p.gaps = sanitizeGaps((p as Partial<Project>).gaps);
  p.repeat = sanitizeRepeat((p as Partial<Project>).repeat);
  p.shape = sanitizeShape((p as Partial<Project>).shape);
}

/** Крок повтору: ціле число ромбів 1…MAX_SIDE, інакше типовий. */
export function sanitizeRepeat(raw: unknown): number {
  return typeof raw === "number" && Number.isInteger(raw) && raw >= 1 && raw <= MAX_SIDE ? raw : DEFAULT_REPEAT;
}

/**
 * Перевіряє половини рядів: для кожної кількості бісерин на сторону — цілі від MIN_BEADS_SIDE до MAX_BEADS_SIDE
 * (незрозуміле — як у всьому трафареті), не довше за 2·MAX_SIDE. Однакові з трафаретом у кінці списку
 * відкидаються, порожні списки — теж.
 */
export function sanitizeShape(raw: unknown): Shapes {
  const out: Shapes = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [key, src] of Object.entries(raw as Record<string, unknown>)) {
    if (!isSideKey(key) || !Array.isArray(src)) continue;
    const side = Number(key);
    const list = src
      .slice(0, 2 * MAX_SIDE)
      .map((v): number => (isSide(v) ? v : side));
    while (list.length > 0 && list[list.length - 1] === side) list.pop();
    if (list.length > 0) out[key] = list;
  }
  return out;
}

export const emptyGaps = (): Gaps => ({ unit: GAP_UNIT, x: [], y: [] });
export const cloneGaps = (g: Gaps): Gaps => ({ unit: g.unit, x: [...g.x], y: [...g.y] });
/** Найдальша лінія проміжку (у GAP_UNIT). */
const MAX_GAP = knotLine(MAX_SIDE);

/**
 * Перевіряє проміжки: цілі числа 0…MAX_GAP без повторів, за зростанням, у GAP_UNIT.
 * Старіші записи переводить: { cols, rows } — номери ромбів і рядів (після ромба j — межа j),
 * { x, y } без unit — положення в шостих частках ґратки.
 */
export function sanitizeGaps(raw: unknown): Gaps {
  if (!raw || typeof raw !== "object") return emptyGaps();
  const o = raw as Record<string, unknown>;
  const list = (v: unknown, k: number): number[] =>
    Array.isArray(v)
      ? [
          ...new Set(
            v.filter((n): n is number => Number.isInteger(n)).map((n) => n * k).filter((n) => n >= 0 && n < MAX_GAP)
          )
        ].sort((a, b) => a - b)
      : [];
  if (Array.isArray(o.x) || Array.isArray(o.y)) {
    const k = o.unit === GAP_UNIT ? 1 : GAP_UNIT / 6;
    return { unit: GAP_UNIT, x: list(o.x, k), y: list(o.y, k) };
  }
  return { unit: GAP_UNIT, x: list(o.cols, knotLine(1)).filter((n) => n > 0), y: list(o.rows, knotLine(1)).filter((n) => n > 0) };
}

/**
 * Перевіряє кольори бісерин. mode "id" — формат з каталогом (ідентифікатори кольорів),
 * "hex" — старий формат, де зберігався сам колір.
 */
export function sanitizeFills(raw: unknown, mode: "id" | "hex"): Fills {
  const out = emptyFills();
  if (!raw || typeof raw !== "object") return out;
  const valid = mode === "id" ? COLOR_ID : HEX;
  for (const [side, src] of Object.entries(raw as Record<string, unknown>)) {
    if (!isSideKey(side) || !src || typeof src !== "object") continue;
    const dst: Record<string, string> = {};
    for (const [k, v] of Object.entries(src as Record<string, unknown>)) {
      if (BEAD_KEY.test(k) && typeof v === "string" && valid.test(v)) dst[k] = mode === "hex" ? v.toUpperCase() : v;
    }
    out[side] = dst;
  }
  return out;
}

export function sanitizeWoven(raw: unknown): Woven {
  const out = emptyWoven();
  if (!raw || typeof raw !== "object") return out;
  for (const [side, src] of Object.entries(raw as Record<string, unknown>)) {
    if (!isSideKey(side) || !Array.isArray(src)) continue;
    const seen = new Set<string>();
    const dst: string[] = [];
    for (const k of src) {
      if (typeof k !== "string" || !BEAD_KEY.test(k) || seen.has(k)) continue;
      seen.add(k);
      dst.push(k);
      if (dst.length >= MAX_WOVEN) break;
    }
    out[side] = dst;
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
    side: isSide(o.side) ? o.side : DEFAULT_SIDE,
    fills: sanitizeFills(o.fills, mode),
    palette: mode === "id" ? sanitizePalette(o.palette) : [],
    woven: sanitizeWoven(o.woven),
    gaps: sanitizeGaps(o.gaps),
    repeat: sanitizeRepeat(o.repeat),
    shape: sanitizeShape(o.shape)
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
