import { customForHex } from "./colors";
import { emptyFills, type Fills } from "./projects";

/**
 * До каталогу Preciosa трафарети зберігали кольори як HEX зі стандартної палітри.
 * Такі кольори переходять у «Мої кольори» зі старими назвами.
 */
const OLD_PALETTE: [string, string][] = [
  ["#FFFFFF", "Білий"],
  ["#1B1B1E", "Чорний"],
  ["#C8202E", "Червоний"],
  ["#7C1630", "Бордовий"],
  ["#F1C232", "Жовтий"],
  ["#E4772B", "Помаранчевий"],
  ["#2F8A45", "Зелений"],
  ["#2340A8", "Синій"],
  ["#74B9E6", "Блакитний"],
  ["#BF9A45", "Золотистий"]
];
const NAMES = new Map(OLD_PALETTE);
const RANK = new Map(OLD_PALETTE.map(([hex], i) => [hex, i]));

export const legacyName = (hex: string): string => NAMES.get(hex) ?? `Колір ${hex}`;

/** Замінює HEX-кольори бісерин на свої кольори. Повертає нові кольори й палітру трафарету. */
export async function convertHexFills(fills: Fills): Promise<{ fills: Fills; palette: string[] }> {
  const hexes = new Set<string>();
  for (const side of Object.values(fills)) for (const v of Object.values(side)) hexes.add(v.toUpperCase());
  const order = [...hexes].sort((a, b) => (RANK.get(a) ?? 99) - (RANK.get(b) ?? 99) || a.localeCompare(b));
  const ids = new Map<string, string>();
  for (const hex of order) ids.set(hex, await customForHex(hex, legacyName(hex)));

  const out = emptyFills();
  for (const [side, src] of Object.entries(fills)) {
    const dst: Record<string, string> = (out[side] ??= {});
    for (const [k, v] of Object.entries(src)) {
      const id = ids.get(v.toUpperCase());
      if (id) dst[k] = id;
    }
  }
  return { fills: out, palette: order.map((h) => ids.get(h) ?? "").filter(Boolean) };
}
