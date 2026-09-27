/**
 * Скільки бісеру купувати. Preciosa 10/0 (≈ 2,3 мм): продавці вказують близько 1 800 бісерин
 * на 20 г і 2 600 на 30 г, тож рахуємо ≈ 90 бісерин у грамі. Для своїх кольорів — так само.
 */
export const BEADS_PER_GRAM = 90;
/** Запас на брак і втрати, відсотки. */
export const RESERVES = [0, 10, 20, 30] as const;
export const DEFAULT_RESERVE = 10;

/** Скільки грамів купувати (із запасом), округлено вгору до десятих. */
export function gramsFor(count: number, reservePct: number): number {
  if (count <= 0) return 0;
  return Math.ceil(((count * (1 + reservePct / 100)) / BEADS_PER_GRAM) * 10 - 1e-9) / 10;
}

const oneDecimal = new Intl.NumberFormat("uk-UA", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const whole = new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 0 });

/** «0,4 г», «2,5 г», від 10 г — цілими (вгору): «12 г». */
export function fmtGrams(g: number): string {
  if (g <= 0) return "0 г";
  return g < 10 ? `${oneDecimal.format(g)} г` : `${whole.format(Math.ceil(g - 1e-9))} г`;
}
