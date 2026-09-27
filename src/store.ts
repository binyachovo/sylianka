import { clamp } from "./util";

export type Side = 3 | 4;

export const MAX_SIDE = 400;
export const MAX_CELLS = 12000;

const KEY = "sylianka-app-v1";
const HEX = /^#[0-9a-f]{6}$/i;

export interface State {
  rows: number;
  cols: number;
  side: Side;
  color: string;
  mirror: boolean;
  two: boolean;
  /** Кольори бісерин окремо для 3 і 4 бісерин на сторону ромба. */
  fills: Record<"3" | "4", Record<string, string>>;
}

export function defaultState(): State {
  return {
    rows: 8,
    cols: 20,
    side: 3,
    color: "#C8202E",
    mirror: false,
    two: false,
    fills: { "3": {}, "4": {} }
  };
}

export function fitSize(s: State): void {
  s.rows = clamp(Math.round(s.rows), 1, MAX_SIDE);
  s.cols = clamp(Math.round(s.cols), 1, Math.min(MAX_SIDE, Math.floor(MAX_CELLS / s.rows)));
}

export function loadState(): State {
  const s = defaultState();
  let raw: unknown = null;
  try {
    raw = JSON.parse(localStorage.getItem(KEY) || "null");
  } catch {
    raw = null;
  }
  if (!raw || typeof raw !== "object") return s;
  const o = raw as Record<string, unknown>;
  if (typeof o.rows === "number" && Number.isInteger(o.rows)) s.rows = o.rows;
  if (typeof o.cols === "number" && Number.isInteger(o.cols)) s.cols = o.cols;
  fitSize(s);
  if (o.side === 3 || o.side === 4) s.side = o.side;
  if (typeof o.mirror === "boolean") s.mirror = o.mirror;
  if (typeof o.two === "boolean") s.two = o.two;
  if (typeof o.color === "string" && HEX.test(o.color)) s.color = o.color.toUpperCase();
  const fills = o.fills;
  if (fills && typeof fills === "object") {
    for (const side of ["3", "4"] as const) {
      const src = (fills as Record<string, unknown>)[side];
      if (!src || typeof src !== "object") continue;
      for (const [k, v] of Object.entries(src as Record<string, unknown>)) {
        if (typeof v === "string" && HEX.test(v)) s.fills[side][k] = v.toUpperCase();
      }
    }
  }
  return s;
}

let timer = 0;
export function scheduleSave(s: State): void {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch {
      // Сховище недоступне: просто не запам'ятовуємо.
    }
  }, 250);
}
