// Генерує src/data/preciosa.ts з data/preciosa-10-0.txt:
// українські назви кольорів, групи за кольором і порядок від світлих до темних.
// Запуск: node scripts/build-catalog.mjs [--dump]  (--dump друкує всі назви для перевірки)

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(root, "data/preciosa-10-0.txt");
const OUT = join(root, "src/data/preciosa.ts");

/* ---------- Кольори: англійська назва → прикметник чоловічого роду ---------- */

const COLOR = {
  black: "чорний",
  white: "білий",
  chalkwhite: "білий",
  grey: "сірий",
  brown: "коричневий",
  "dark brown": "темно-коричневий",
  "lt. brown": "світло-коричневий",
  beige: "бежевий",
  violet: "фіолетовий",
  "dark violet": "темно-фіолетовий",
  lila: "бузковий",
  lilac: "бузковий",
  levander: "лавандовий",
  purple: "пурпуровий",
  blue: "синій",
  "lt. blue": "блакитний",
  "dark blue": "темно-синій",
  "blue-green": "синьо-зелений",
  green: "зелений",
  "lt. green": "світло-зелений",
  "dark green": "темно-зелений",
  "teal green": "бірюзово-зелений",
  teal: "бірюзово-зелений",
  "sea green": "морсько-зелений",
  mint: "м'ятний",
  yellow: "жовтий",
  "lt. yellow": "світло-жовтий",
  "dark yellow": "темно-жовтий",
  "yellow-brown": "жовто-коричневий",
  "yellow amber": "бурштиново-жовтий",
  orange: "помаранчевий",
  apricot: "абрикосовий",
  red: "червоний",
  "lt. red": "світло-червоний",
  "lt.red": "світло-червоний",
  pink: "рожевий",
  "lt. pink": "світло-рожевий",
  rose: "рожевий",
  fuchsia: "фуксієвий",
  coral: "кораловий",
  coraline: "кораловий",
  "red coral": "коралово-червоний",
  salmon: "лососевий",
  mocca: "кавовий",
  ivory: "молочний",
  aqua: "бірюзовий",
  turquoise: "бірюзовий",
  "dark turquoise": "темно-бірюзовий",
  gold: "золотий",
  "pink gold": "рожево-золотий",
  silver: "срібний",
  bronze: "бронзовий",
  copper: "мідний",
  "neon green": "неоново-зелений",
  "neon orange": "неоново-помаранчевий",
  "neon pink": "неоново-рожевий",
  "neon violet": "неоново-фіолетовий",
  "neon yellow": "неоново-жовтий",
  "soft neon green": "м'який неоново-зелений",
  'yellow "limon"': "жовтий «лимон»",
  'brown "tango"': "коричневий «танго»"
};

/** Відмінює прикметник (або кілька слів, де відмінюється кожен прикметник). */
function decline(adj, form) {
  return adj
    .split(" ")
    .map((w) => {
      const m = /^(.*?)(ий|ій)(»?)$/.exec(w);
      if (!m || w.startsWith("«")) return w;
      const [, stem, end, tail] = m;
      const soft = end === "ій";
      const ends = soft
        ? { f: "я", ins: "ім", pl: "і", loc: "ьому" }
        : { f: "а", ins: "им", pl: "і", loc: "ому" };
      return stem + ends[form] + tail;
    })
    .join(" ");
}

function color(en) {
  const c = COLOR[en];
  if (!c) throw new Error(`Невідомий колір: «${en}»`);
  return c;
}

/* ---------- Основа (перша частина опису) ---------- */

const GEMS = {
  crystal: ["кришталь", "m"],
  amethyst: ["аметист", "m"],
  aquamarine: ["аквамарин", "m"],
  sapphire: ["сапфір", "m"],
  topaz: ["топаз", "m"],
  turquoise: ["бірюза", "f"],
  hyacinth: ["гіацинт", "m"],
  ruby: ["рубін", "m"],
  garnet: ["гранат", "m"],
  hematite: ["гематит", "m"],
  shell: ["мушля", "f"],
  silver: ["срібло", "n"],
  bronze: ["бронза", "f"]
};
const LIGHT = { m: "світлий", f: "світла", n: "світле" };
const DARK = { m: "темний", f: "темна", n: "темне" };

/** Основа під фарбуванням: «dyed crystal» тощо. */
const DYE_BASE = {
  crystal: "кришталь",
  chalkwhite: "крейдяно-білий",
  chalk: "крейдяно-білий",
  alabaster: "алебастр",
  "alabaster white": "білий алебастр",
  black: "чорний",
  coral: "корал"
};

const FIXED_BASE = {
  black: "чорний",
  chalkwhite: "крейдяно-білий",
  "alabaster white": "білий алебастр",
  "alabaster blue": "синій алебастр",
  "alabaster green": "зелений алебастр",
  "green aqua": "зелений аквамарин",
  "green turquoise": "зелена бірюза",
  "golden bronze": "золота бронза",
  "bronze copper": "мідна бронза",
  "gold iris": "золотий ірис",
  "rose terra": "рожева терра",
  "soft bronze": "м'яка бронза",
  "soft bronze multi": "м'яка бронза, мульти",
  "soft copper": "м'яка мідь",
  "soft dk.copper": "м'яка темна мідь",
  "soft gold": "м'яке золото",
  "soft red": "м'який червоний",
  "soft silver": "м'яке срібло",
  "copper dyed crystal": "кришталь, фарбований під мідь",
  "steel dyed crystal": "кришталь, фарбований під сталь",
  "soft pearl aqua dyed chalkwhite": "крейдяно-білий, фарбований м'яким бірюзовим перламутром",
  "soft pearl violet dyed chalkwhite": "крейдяно-білий, фарбований м'яким фіолетовим перламутром",
  "yellow stripes on green": "жовті смужки на зеленому",
  "white stripes on black": "білі смужки на чорному",
  "blue and red stripes on chalkwhite": "синьо-червоні смужки на крейдяно-білому"
};

const HARLEQUIN = {
  "aquamarine-yellow": "аквамариново-жовтий",
  "chalkwhite-blue": "біло-синій",
  "crystal-topaz": "кришталево-топазовий",
  "green-red": "зелено-червоний",
  "red-yellow": "червоно-жовтий",
  "sapphire-yellow": "сапфірово-жовтий",
  "yellow-blue": "жовто-синій"
};

/** «travertine on …» — місцевий відмінок. */
const ON = {
  black: "чорному",
  chalkwhite: "крейдяно-білому",
  turquoise: "бірюзі",
  "green turquoise": "зеленій бірюзі"
};

function base(en) {
  const s = en.toLowerCase();
  if (FIXED_BASE[s]) return FIXED_BASE[s];

  let m;
  // Самоцвітні назви зі «світлий/темний»
  if ((m = /^(lt\. |dark )?(\w+)$/.exec(s)) && GEMS[m[2]]) {
    const [noun, g] = GEMS[m[2]];
    const pre = m[1] === "lt. " ? LIGHT[g] + " " : m[1] === "dark " ? DARK[g] + " " : "";
    return pre + noun;
  }
  if ((m = /^transp\. (.+)$/.exec(s))) return `прозорий ${color(m[1])}`;
  if ((m = /^opaque (.+)$/.exec(s))) return `непрозорий ${color(m[1])}`;
  if ((m = /^ceylon (.+)$/.exec(s))) return `цейлон ${color(m[1])}`;
  if ((m = /^harlequin (.+)$/.exec(s))) {
    if (!HARLEQUIN[m[1]]) throw new Error(`Арлекін: ${s}`);
    return `арлекін ${HARLEQUIN[m[1]]}`;
  }
  if ((m = /^travertine on (.+)$/.exec(s))) {
    let t = m[1];
    if (ON[t]) return `травертин на ${ON[t]}`;
    if ((m = /^opaque (.+)$/.exec(t))) return `травертин на ${decline("непрозорий " + color(m[1]), "loc")}`;
    throw new Error(`Травертин: ${s}`);
  }
  if ((m = /^(.+?) iris$/.exec(s))) return `${color(m[1])} ірис`;
  if ((m = /^(.+?) solgel metallic$/.exec(s))) return `${color(m[1])} металік, сольгель`;
  if ((m = /^(.+?) metallic$/.exec(s))) return `${color(m[1])} металік`;

  // Фарбування: «pink 2 dyed crystal», «blue metallic dyed chalkwhite», «green terra pearl dyed alabaster»…
  if ((m = /^(.+?)(?: (\d))? (intensive |metallic |pearl |terra pearl )?dyed (.+)$/.exec(s))) {
    const [, c, n, kind = "", b] = m;
    const baseName = DYE_BASE[b];
    if (!baseName) throw new Error(`Основа фарбування: ${s}`);
    const col = decline(color(c), "ins") + (n ? ` ${n}` : "");
    const how = {
      "": `фарбований ${col}`,
      "intensive ": `насичено фарбований ${col}`,
      "metallic ": `фарбований ${col} металіком`,
      "pearl ": `фарбований ${col} перламутром`,
      "terra pearl ": `фарбований ${col} перламутром терра`
    }[kind];
    return `${baseName}, ${how}`;
  }
  throw new Error(`Невідома основа: «${en}»`);
}

/* ---------- Покриття (наступні частини опису) ---------- */

const FIXED_FINISH = {
  rainbow: "райдужний",
  sfinx: "сфінкс",
  matt: "матовий",
  lustered: "глянець",
  "2x lustered": "подвійний глянець",
  travertine: "травертин",
  "silver lined": "срібна серединка",
  "copper lined": "мідна серединка",
  "bronze lined": "бронзова серединка",
  "aluminium lined": "алюмінієва серединка",
  "genuine gold plated": "справжня позолота",
  "bronze iris sfinx": "бронзовий ірис, сфінкс",
  "soft coral red": "м'який коралово-червоний"
};

function finish(en) {
  const s = en.toLowerCase();
  if (FIXED_FINISH[s]) return FIXED_FINISH[s];
  let m;
  if ((m = /^metallic colour lined (.+)$/.exec(s))) return `${decline(color(m[1]), "f")} металізована серединка`;
  if ((m = /^colour lined (.+) pearl$/.exec(s))) return `${decline(color(m[1]), "f")} перламутрова серединка`;
  if ((m = /^colour lined (.+)$/.exec(s))) return `${decline(color(m[1]), "f")} серединка`;
  if ((m = /^intensive (.+) lined$/.exec(s))) return `насичена ${decline(color(m[1]), "f")} серединка`;
  if ((m = /^(neon .+) lined$/.exec(s))) return `${decline(color(m[1]), "f")} серединка`;
  if ((m = /^bronze (.+) iris$/.exec(s))) return `бронзово-${color(m[1])} ірис`;
  if ((m = /^(.+?) iris$/.exec(s))) return `${color(m[1])} ірис`;
  if ((m = /^(.+?) lust(?:ered|er)$/.exec(s))) return `${color(m[1])} глянець`;
  throw new Error(`Невідоме покриття: «${en}»`);
}

/** Кольори з порожнім описом у каталозі (перламутрові). */
const NO_DESC = {
  "23730": "рожевий перламутр",
  "23830": "жовтий перламутр",
  "26630": "блакитний перламутр",
  "26850": "помаранчевий перламутр",
  "26960": "червоний перламутр"
};

function ukName(code, desc) {
  if (!desc) {
    if (!NO_DESC[code]) throw new Error(`Немає опису: ${code}`);
    return NO_DESC[code];
  }
  const parts = desc.split(", ");
  // «PermaLux dyed chalk, apricot[, matt]»
  if (parts[0] === "PermaLux dyed chalk") {
    const rest = parts.slice(2).map(finish);
    return [`${color(parts[1])} PermaLux`, ...rest].join(", ");
  }
  return [base(parts[0]), ...parts.slice(1).map(finish)].join(", ");
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/* ---------- Групи за кольором ---------- */

export const FAMILIES = [
  "Білі",
  "Сірі",
  "Чорні",
  "Жовті",
  "Помаранчеві",
  "Червоні",
  "Бордові",
  "Рожеві",
  "Фіолетові",
  "Сині",
  "Блакитні",
  "Бірюзові",
  "Зелені",
  "Коричневі й бежеві"
];
const F = Object.fromEntries(FAMILIES.map((n, i) => [n, i]));

const channels = (hex) => [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
const linear = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);

/** Відтінок і насиченість за HSL. */
function hsl(hex) {
  const [r, g, b] = channels(hex);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const c = max - min;
  const l = (max + min) / 2;
  const s = c === 0 ? 0 : c / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (c > 0) {
    if (max === r) h = 60 * (((g - b) / c) % 6);
    else if (max === g) h = 60 * ((b - r) / c + 2);
    else h = 60 * ((r - g) / c + 4);
  }
  if (h < 0) h += 360;
  return { h, s };
}

/** Світлота L* і хроматичність C* за CIELAB (D65) — так, як їх бачить око. */
function lab(hex) {
  const [r, g, b] = channels(hex).map(linear);
  const x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047;
  const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
  const f = (t) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
  const L = 116 * f(y) - 16;
  const A = 500 * (f(x) - f(y));
  const B = 200 * (f(y) - f(z));
  return { L, C: Math.hypot(A, B) };
}

/** Відносна яскравість (для сортування від світлих до темних). */
function luminance(hex) {
  const [r, g, b] = channels(hex).map(linear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const NEUTRAL_WHITE =
  /^(crystal|chalkwhite|alabaster white)(, (rainbow|sfinx|silver lined|aluminium lined|lustered|rainbow, lustered))*$/;

/** Колірні слова в описі — для майже сірих фото, де відтінок ледь помітний. */
const WORD_FAMILY = [
  [/\b(pink|rose|fuchsia|coraline)\b/, "Рожеві"],
  [/\b(red|ruby|coral)\b/, "Червоні"],
  [/\bgarnet\b/, "Бордові"],
  [/\b(orange|hyacinth|apricot|salmon)\b/, "Помаранчеві"],
  [/\b(yellow|amber|limon|gold)\b/, "Жовті"],
  [/\b(blue-green|teal|aqua|aquamarine|turquoise)\b/, "Бірюзові"],
  [/\b(green|mint)\b/, "Зелені"],
  [/\b(blue|sapphire)\b/, "Сині"],
  [/\b(violet|amethyst|lila|lilac|levander|purple)\b/, "Фіолетові"],
  [/\b(brown|topaz|beige|bronze|copper|mocca|tango|ivory)\b/, "Коричневі й бежеві"]
];

function wordFamily(desc) {
  let best = null;
  for (const [re, fam] of WORD_FAMILY) {
    const m = re.exec(desc);
    if (m && (!best || m.index < best.index)) best = { index: m.index, fam };
  }
  return best?.fam ?? null;
}

function family(hex, desc) {
  if (NEUTRAL_WHITE.test(desc)) return F["Білі"];
  if (/^black(,|$)/.test(desc)) return F["Чорні"];
  if (/^(silver|soft silver|hematite)$/.test(desc)) return F["Сірі"];
  const { L, C } = lab(hex);
  const { h, s } = hsl(hex);

  if (C < 10) {
    // Ледь помітний відтінок: беремо колір з назви, якщо він там є.
    let fam = C >= 4 ? wordFamily(desc.toLowerCase()) : null;
    if (fam === "Сині" && L >= 68) fam = "Блакитні";
    if (fam) return F[fam];
    if (L >= 78) return F["Білі"];
    if (L < 24) return F["Чорні"];
    return F["Сірі"];
  }
  if (L < 8) return F["Чорні"];
  if ((h >= 320 || h < 15) && L < 36) return F["Бордові"];
  if (h < 12 || h >= 345) return L > 78 ? F["Рожеві"] : F["Червоні"];
  if (h < 48 && (L < 45 || s < 0.38)) return F["Коричневі й бежеві"];
  if (h < 42) return F["Помаранчеві"];
  if (h < 75 && L < 50) return F["Зелені"];
  if (h < 65) return F["Жовті"];
  if (h < 160) return F["Зелені"];
  if (h < 197) return F["Бірюзові"];
  if (h < 255) return L >= 68 ? F["Блакитні"] : F["Сині"];
  if (h < 315) return F["Фіолетові"];
  return F["Рожеві"];
}

/* ---------- Збірка ---------- */

const rows = readFileSync(SRC, "utf8")
  .split("\n")
  .filter((l) => l && !l.startsWith("#"))
  .map((line) => {
    const [code, hole, hex, , , desc] = line.split("|");
    return { code, hole, hex, desc, uk: cap(ukName(code, desc)), fam: family(hex, desc), lum: luminance(hex) };
  });

rows.sort((a, b) => a.fam - b.fam || b.lum - a.lum || a.code.localeCompare(b.code));

if (process.argv.includes("--dump")) {
  for (const r of rows) console.log(`${FAMILIES[r.fam].padEnd(18)} ${r.code} ${r.hex}  ${r.uk}   ← ${r.desc}`);
  const counts = FAMILIES.map((n, i) => `${n}: ${rows.filter((r) => r.fam === i).length}`);
  console.log(counts.join(" · "));
}

const clean = (s) => s.replace(/[|\n`\\$]/g, " ");
const body = rows.map((r) => [r.code, r.hole, r.hex, r.fam, clean(r.uk), clean(r.desc)].join("|")).join("\n");
const ts = `/* Згенеровано scripts/build-catalog.mjs з data/preciosa-10-0.txt. Не редагувати вручну. */

/** Групи кольорів у каталозі (індекс — номер групи в рядку даних). */
export const FAMILIES: readonly string[] = ${JSON.stringify(FAMILIES)};

/** Рядок на колір: код|отвір (r/s)|HEX|група|назва українською|опис Preciosa англійською. Від світлих до темних. */
export const DATA = \`${body}\`;
`;
writeFileSync(OUT, ts);
console.log(`Записано кольорів: ${rows.length} → ${OUT}`);
