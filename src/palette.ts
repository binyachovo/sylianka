/** Тимчасова палітра. На етапі 3 її замінить каталог Preciosa 10/0. */
export interface PaletteColor {
  hex: string;
  name: string;
}

export const PALETTE: PaletteColor[] = [
  { hex: "#FFFFFF", name: "Білий" },
  { hex: "#1B1B1E", name: "Чорний" },
  { hex: "#C8202E", name: "Червоний" },
  { hex: "#7C1630", name: "Бордовий" },
  { hex: "#F1C232", name: "Жовтий" },
  { hex: "#E4772B", name: "Помаранчевий" },
  { hex: "#2F8A45", name: "Зелений" },
  { hex: "#2340A8", name: "Синій" },
  { hex: "#74B9E6", name: "Блакитний" },
  { hex: "#BF9A45", name: "Золотистий" }
];

const NAMES = new Map(PALETTE.map((p) => [p.hex, p.name]));

export function paletteName(hex: string): string | undefined {
  return NAMES.get(hex);
}

export function paletteRank(hex: string): number {
  const i = PALETTE.findIndex((p) => p.hex === hex);
  return i < 0 ? 99 : i;
}
