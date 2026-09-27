/** Налаштування інструментів, спільні для всіх трафаретів. */
export interface Settings {
  color: string;
  mirror: boolean;
  two: boolean;
  lastProjectId: string | null;
}

const KEY = "sylianka-settings-v1";
const HEX = /^#[0-9a-f]{6}$/i;

export function loadSettings(): Settings {
  const s: Settings = { color: "#C8202E", mirror: false, two: false, lastProjectId: null };
  try {
    const o = JSON.parse(localStorage.getItem(KEY) || "null") as Record<string, unknown> | null;
    if (o && typeof o === "object") {
      if (typeof o.color === "string" && HEX.test(o.color)) s.color = o.color.toUpperCase();
      if (typeof o.mirror === "boolean") s.mirror = o.mirror;
      if (typeof o.two === "boolean") s.two = o.two;
      if (typeof o.lastProjectId === "string") s.lastProjectId = o.lastProjectId;
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
