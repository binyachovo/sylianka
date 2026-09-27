import { COLOR_ID, HEX } from "./projects";

/** Налаштування інструментів, спільні для всіх трафаретів. */
export interface Settings {
  /** Поточний колір пензля (ідентифікатор) або null, якщо кольорів ще немає. */
  color: string | null;
  /** Дзеркало «верх–низ»: фарбувати й бісерину, симетричну відносно середини по висоті. */
  mirror: boolean;
  /** Дзеркало «ліво–право»: симетрично відносно середини по довжині. */
  mirrorLR: boolean;
  /** Повтор візерунка: фарбувати одразу в усіх повторах (крок — у трафареті). */
  repeat: boolean;
  two: boolean;
  lastProjectId: string | null;
  /** Нещодавно додані до трафаретів кольори, найновіші спершу. */
  recent: string[];
  /** Режим плетіння (інакше — малювання). */
  weave: boolean;
  /** Приглушувати нанизані бісерини в режимі плетіння. */
  dim: boolean;
  /** Показувати в режимі плетіння шлях набору — лінію через нанизані бісерини по порядку. */
  path: boolean;
  /** Масштаб трафарету на екрані у відсотках (100 % — бісеринка 16 px) або null — «Авто». */
  zoom: number | null;
  /** Діаметр бісеринки на папері, мм, або null — «вмістити на аркуш». */
  printBead: number | null;
}

const KEY = "sylianka-settings-v1";
const MAX_RECENT = 30;

/** Колір пензля зі старої версії (HEX), щоб після перенесення вибрати відповідний свій колір. */
export let legacyBrushHex: string | null = null;

export function loadSettings(): Settings {
  const s: Settings = {
    color: null,
    mirror: false,
    mirrorLR: false,
    repeat: false,
    two: false,
    lastProjectId: null,
    recent: [],
    weave: false,
    dim: true,
    path: false,
    zoom: null,
    printBead: null
  };
  try {
    const o = JSON.parse(localStorage.getItem(KEY) || "null") as Record<string, unknown> | null;
    if (o && typeof o === "object") {
      if (typeof o.color === "string" && COLOR_ID.test(o.color)) s.color = o.color;
      else if (typeof o.color === "string" && HEX.test(o.color)) legacyBrushHex = o.color.toUpperCase();
      if (typeof o.mirror === "boolean") s.mirror = o.mirror;
      if (typeof o.mirrorLR === "boolean") s.mirrorLR = o.mirrorLR;
      if (typeof o.repeat === "boolean") s.repeat = o.repeat;
      if (typeof o.two === "boolean") s.two = o.two;
      if (typeof o.weave === "boolean") s.weave = o.weave;
      if (typeof o.dim === "boolean") s.dim = o.dim;
      if (typeof o.path === "boolean") s.path = o.path;
      if (typeof o.zoom === "number" && Number.isFinite(o.zoom)) s.zoom = Math.min(400, Math.max(5, o.zoom));
      if (typeof o.printBead === "number" && o.printBead >= 1 && o.printBead <= 10) s.printBead = o.printBead;
      if (typeof o.lastProjectId === "string") s.lastProjectId = o.lastProjectId;
      if (Array.isArray(o.recent)) {
        s.recent = o.recent.filter((v): v is string => typeof v === "string" && COLOR_ID.test(v)).slice(0, MAX_RECENT);
      }
    }
  } catch {
    // лишаємо типові
  }
  return s;
}

export function saveSettings(s: Settings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // сховище недоступне
  }
}

/** Запам'ятовує колір як нещодавній. */
export function rememberRecent(s: Settings, id: string): void {
  s.recent = [id, ...s.recent.filter((v) => v !== id)].slice(0, MAX_RECENT);
}
