import { DATA, FAMILIES } from "./data/preciosa";

export { FAMILIES };

/** Один колір каталогу Preciosa 10/0. */
export interface PreciosaColor {
  /** Код кольору, напр. «23980». */
  code: string;
  /** Артикул: 311-19001 (круглий отвір) або 331-19001 (квадратний отвір). */
  article: string;
  hex: string;
  family: number;
  /** Назва українською. */
  name: string;
  /** Опис з каталогу Preciosa англійською. */
  en: string;
}

const ARTICLES: Record<string, string> = { r: "311-19001", s: "331-19001" };

/** Усі кольори каталогу, по групах і від світлих до темних. */
export const PRECIOSA: readonly PreciosaColor[] = DATA.split("\n").map((line) => {
  const [code, hole, hex, family, name, en] = line.split("|");
  return { code, article: ARTICLES[hole] ?? "311-19001", hex: `#${hex}`, family: Number(family), name, en };
});

const BY_CODE = new Map(PRECIOSA.map((c) => [c.code.toLowerCase(), c]));

export function preciosaByCode(code: string): PreciosaColor | undefined {
  return BY_CODE.get(code.toLowerCase());
}
