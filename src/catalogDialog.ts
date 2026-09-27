import { FAMILIES, PRECIOSA } from "./catalog";
import {
  cleanCode,
  cleanName,
  colorTitle,
  colorView,
  customColors,
  getCustom,
  newCustomId,
  onCustomsChange,
  preciosaId,
  putCustom,
  type CustomColor
} from "./colors";
import { $, $$, esc, num, plural } from "./util";

export interface CatalogApi {
  /** Кольори трафарету (палітра швидкого вибору). */
  palette(): readonly string[];
  /** Нещодавні кольори. */
  recent(): readonly string[];
  /** Додає колір до трафарету й робить його поточним. */
  add(id: string): void;
  /** Прибирає колір із палітри трафарету. */
  remove(id: string): void;
  /** Колір пензля (для початкового значення нового свого кольору). */
  currentHex(): string | null;
}

interface Item {
  el: HTMLElement;
  btn: HTMLButtonElement;
  id: string;
  code: string;
  family: number;
  mine: boolean;
  text: string;
}

type Filter = "all" | "chosen" | "recent" | "mine" | `fam:${number}`;

/** Схожі кирилиця й латиниця в кодах (16A58, 0T930, 382PA): шукаємо однаково. */
const LOOKALIKE: Record<string, string> = {
  а: "a", в: "b", е: "e", к: "k", м: "m", н: "h", о: "o", р: "p", с: "c", т: "t", х: "x", і: "i"
};
const latin = (s: string): string => s.replace(/[авекмнорстхі]/g, (ch) => LOOKALIKE[ch] ?? ch);
const norm = (s: string): string => s.toLowerCase().replace(/[’ʼ`]/g, "'").replace(/\s+/g, " ").trim();

const EDIT_ICON =
  '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10.8 2.8l2.4 2.4-7.4 7.4-3.1.7.7-3.1z"/><path d="M9.3 4.3l2.4 2.4"/></svg>';

/** Вікно «Кольори»: каталог Preciosa 10/0 і «Мої кольори». */
export function initCatalogDialog(api: CatalogApi): { open(filter?: Filter): void; refresh(): void } {
  const dlg = $<HTMLDialogElement>("#catalog-dlg");
  const body = $("#cat-body");
  const search = $<HTMLInputElement>("#cat-search");
  const found = $("#cat-found");
  const filters = $("#cat-filters");
  const chosen = $("#cat-chosen");
  const empty = $("#cat-empty");

  let items: Item[] = [];
  let mineItems: Item[] = [];
  let built = false;
  let filter: Filter = "all";
  let editing: string | null = null;

  /* ---------- Побудова ---------- */

  function itemHtml(id: string, code: string, name: string, hex: string, title: string): string {
    return (
      `<button type="button" class="ci" data-id="${esc(id)}" aria-pressed="false" title="${esc(title)}">` +
      `<span class="chip" style="--c:${hex}"></span>` +
      `<span class="ci-text">${code ? `<span class="ci-code">${esc(code)}</span>` : ""}` +
      `<span class="ci-name${code ? "" : " ci-solo"}">${esc(name)}</span></span></button>`
    );
  }

  function buildFilters(): void {
    const chips: [Filter, string][] = [
      ["all", "Усі"],
      ["chosen", "У трафареті"],
      ["recent", "Нещодавні"],
      ["mine", "Мої кольори"],
      ...FAMILIES.map((name, i): [Filter, string] => [`fam:${i}`, name])
    ];
    filters.innerHTML = chips
      .map(([f, label]) => `<button type="button" class="fchip" data-f="${f}" aria-pressed="false">${esc(label)}</button>`)
      .join("");
  }

  function build(): void {
    buildFilters();
    const groups = FAMILIES.map(() => [] as string[]);
    for (const c of PRECIOSA) {
      const v = colorView(preciosaId(c.code));
      groups[c.family]?.push(itemHtml(v.id, c.code, c.name, c.hex, colorTitle(v)));
    }
    body.innerHTML =
      `<section class="cs cs-mine" data-sec="mine">` +
      `<div class="cs-head"><h3>Мої кольори <span class="cs-count"></span></h3></div>` +
      `<form class="cform" id="cform" hidden autocomplete="off">` +
      `<label class="cform-swatch" title="Вибрати відтінок"><span class="chip" id="cf-chip"></span>` +
      `<input type="color" id="cf-hex" aria-label="Відтінок"></label>` +
      `<label class="cform-field"><span>Назва</span><input type="text" id="cf-name" maxlength="40" required placeholder="Напр. Бордо з ярмарку"></label>` +
      `<label class="cform-field cform-code"><span>Код</span><input type="text" id="cf-code" maxlength="20" placeholder="необов'язково"></label>` +
      `<div class="cform-actions"><button type="submit" class="tbtn primary" id="cf-save">Додати</button>` +
      `<button type="button" class="tbtn" id="cf-cancel">Скасувати</button>` +
      `<button type="button" class="tbtn danger" id="cf-delete" hidden>Видалити</button></div>` +
      `<p class="cform-note" id="cf-note"></p></form>` +
      `<div class="cs-grid" id="cs-mine-grid"></div>` +
      `<p class="cs-hint" id="cs-mine-hint">Тут з'являться кольори, яких немає в каталозі: свої назви й будь-який відтінок.</p>` +
      `</section>` +
      FAMILIES.map(
        (name, i) =>
          `<section class="cs" data-sec="fam:${i}"><div class="cs-head"><h3>${esc(name)} <span class="cs-count"></span></h3></div>` +
          `<div class="cs-grid">${groups[i].join("")}</div></section>`
      ).join("");

    const famOf = new Map(PRECIOSA.map((c) => [preciosaId(c.code), c.family]));
    items = $$<HTMLButtonElement>(".cs[data-sec^='fam'] .ci", body).map((btn) => {
      const id = btn.dataset.id ?? "";
      const c = colorView(id);
      return {
        el: btn,
        btn,
        id,
        code: norm(c.code),
        family: famOf.get(id) ?? -1,
        mine: false,
        text: norm(`${c.code} ${c.name} ${c.en ?? ""}`)
      };
    });
    buildMine();
    wireForm();
    built = true;
  }

  function buildMine(): void {
    const grid = $("#cs-mine-grid", body);
    const list = customColors();
    grid.innerHTML = list
      .map(
        (c) =>
          `<div class="ci-wrap">${itemHtml(c.id, c.code, c.name, c.hex, colorTitle(colorView(c.id)))}` +
          `<button type="button" class="ci-edit" data-edit="${esc(c.id)}" aria-label="Змінити «${esc(c.name)}»" title="Змінити">${EDIT_ICON}</button></div>`
      )
      .join("");
    $("#cs-mine-hint", body).hidden = list.length > 0;
    mineItems = $$<HTMLElement>(".ci-wrap", grid).map((wrap) => {
      const btn = $<HTMLButtonElement>(".ci", wrap);
      const id = btn.dataset.id ?? "";
      const c = colorView(id);
      return { el: wrap, btn, id, code: norm(c.code), family: -1, mine: true, text: norm(`${c.code} ${c.name} мій свій`) };
    });
  }

  /* ---------- Фільтри й пошук ---------- */

  function matches(it: Item, words: string[], pal: Set<string>, rec: Set<string>): boolean {
    switch (filter) {
      case "all":
        break;
      case "chosen":
        if (!pal.has(it.id)) return false;
        break;
      case "recent":
        if (!rec.has(it.id)) return false;
        break;
      case "mine":
        if (!it.mine) return false;
        break;
      default:
        if (it.mine || `fam:${it.family}` !== filter) return false;
    }
    return words.every((w) => it.text.includes(w) || (it.code !== "" && it.code.includes(latin(w))));
  }

  function apply(): void {
    const words = norm(search.value).split(" ").filter(Boolean);
    const pal = new Set(api.palette());
    const rec = new Set(api.recent());
    let total = 0;
    const perSection = new Map<string, number>();
    for (const it of [...mineItems, ...items]) {
      const show = matches(it, words, pal, rec);
      it.el.hidden = !show;
      it.btn.setAttribute("aria-pressed", String(pal.has(it.id)));
      if (show) {
        total++;
        const sec = it.mine ? "mine" : `fam:${it.family}`;
        perSection.set(sec, (perSection.get(sec) ?? 0) + 1);
      }
    }
    for (const sec of $$<HTMLElement>(".cs", body)) {
      const key = sec.dataset.sec ?? "";
      const n = perSection.get(key) ?? 0;
      $(".cs-count", sec).textContent = n ? num(n) : "";
      // «Мої кольори» лишаємо видимими без пошуку, щоб можна було додати новий колір.
      const keepMine = key === "mine" && words.length === 0 && (filter === "all" || filter === "mine");
      sec.hidden = n === 0 && !keepMine;
    }
    found.textContent = words.length || filter !== "all" ? `Знайдено: ${num(total)}` : `${num(total)} ${plural(total, "колір", "кольори", "кольорів")}`;
    empty.hidden = total > 0 || (filter === "mine" && words.length === 0);
    if (!empty.hidden) {
      empty.textContent =
        words.length > 0
          ? "Нічого не знайдено. Спробуйте інший код або частину назви."
          : filter === "recent"
            ? "Тут з'являться кольори, які ви додавали до трафаретів."
            : filter === "chosen"
              ? "У трафареті ще немає кольорів."
              : "У цій групі немає кольорів.";
    }
    for (const b of $$<HTMLButtonElement>(".fchip", filters)) b.setAttribute("aria-pressed", String(b.dataset.f === filter));
  }

  function renderChosen(): void {
    const pal = api.palette();
    if (pal.length === 0) {
      chosen.innerHTML = `<span class="cat-chosen-label">У трафареті ще немає кольорів — натисніть на колір нижче, щоб додати.</span>`;
      return;
    }
    chosen.innerHTML =
      `<span class="cat-chosen-label">У трафареті ${num(pal.length)}:</span>` +
      pal
        .map((id) => {
          const v = colorView(id);
          const label = v.code || v.name;
          return (
            `<span class="pill pill-static" title="${esc(colorTitle(v))}"><span class="chip" style="--c:${v.hex}"></span>` +
            `<span class="pill-code${v.code ? "" : " pill-name"}">${esc(label)}</span>` +
            `<button type="button" class="pill-x" data-remove="${esc(id)}" aria-label="Прибрати ${esc(label)} з трафарету">` +
            `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 4.5l7 7"/><path d="M11.5 4.5l-7 7"/></svg></button></span>`
          );
        })
        .join("");
  }

  function refresh(): void {
    if (!built) return;
    renderChosen();
    apply();
  }

  /* ---------- Свій колір ---------- */

  function wireForm(): void {
    const form = $<HTMLFormElement>("#cform", body);
    const hexIn = $<HTMLInputElement>("#cf-hex", body);
    const chip = $("#cf-chip", body);
    const nameIn = $<HTMLInputElement>("#cf-name", body);
    const codeIn = $<HTMLInputElement>("#cf-code", body);
    const saveBtn = $<HTMLButtonElement>("#cf-save", body);
    const delBtn = $<HTMLButtonElement>("#cf-delete", body);
    const note = $("#cf-note", body);

    const syncChip = (): void => chip.style.setProperty("--c", hexIn.value);
    hexIn.addEventListener("input", syncChip);

    function openForm(c: CustomColor | null): void {
      editing = c?.id ?? null;
      hexIn.value = (c?.hex ?? api.currentHex() ?? "#8E5AC8").toLowerCase();
      nameIn.value = c?.name ?? "";
      codeIn.value = c?.code ?? "";
      saveBtn.textContent = c ? "Зберегти" : "Додати";
      delBtn.hidden = !c;
      delBtn.classList.remove("armed");
      delBtn.textContent = "Видалити";
      note.textContent = c ? "Зміни застосуються в усіх трафаретах з цим кольором." : "";
      syncChip();
      form.hidden = false;
      nameIn.focus();
    }

    function closeForm(): void {
      form.hidden = true;
      editing = null;
    }

    $("#cf-new").addEventListener("click", () => {
      search.value = "";
      if (filter !== "all" && filter !== "mine") setFilter("mine");
      else apply();
      openForm(null);
      $(".cs-mine", body).scrollIntoView({ block: "nearest" });
    });
    $("#cf-cancel", body).addEventListener("click", closeForm);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = cleanName(nameIn.value);
      if (!name) {
        nameIn.focus();
        return;
      }
      const hex = hexIn.value.toUpperCase();
      const code = cleanCode(codeIn.value);
      const prev = editing ? getCustom(editing) : undefined;
      if (prev) {
        void putCustom({ ...prev, name, hex, code });
        closeForm();
        return;
      }
      const c: CustomColor = { id: newCustomId(), name, hex, code, createdAt: Date.now() };
      void putCustom(c).then(() => {
        api.add(c.id);
        refresh();
      });
      closeForm();
    });

    delBtn.addEventListener("click", () => {
      const prev = editing ? getCustom(editing) : undefined;
      if (!prev) return;
      if (!delBtn.classList.contains("armed")) {
        delBtn.classList.add("armed");
        delBtn.textContent = "Точно видалити?";
        return;
      }
      // Колір лише ховається: трафарети, де він уже є, не втратять його.
      void putCustom({ ...prev, deleted: true });
      api.remove(prev.id);
      closeForm();
    });

    body.addEventListener("click", (e) => {
      const edit = (e.target as Element).closest<HTMLButtonElement>("[data-edit]");
      if (edit) {
        const c = getCustom(edit.dataset.edit ?? "");
        if (c) openForm(c);
      }
    });
  }

  onCustomsChange(() => {
    if (!built) return;
    buildMine();
    refresh();
  });

  /* ---------- Події ---------- */

  function setFilter(f: Filter): void {
    filter = f;
    apply();
    body.scrollTop = 0;
  }

  filters.addEventListener("click", (e) => {
    const b = (e.target as Element).closest<HTMLButtonElement>(".fchip");
    if (b?.dataset.f) setFilter(b.dataset.f as Filter);
  });

  body.addEventListener("click", (e) => {
    const b = (e.target as Element).closest<HTMLButtonElement>(".ci");
    if (!b?.dataset.id) return;
    const id = b.dataset.id;
    if (api.palette().includes(id)) api.remove(id);
    else api.add(id);
    refresh();
  });

  chosen.addEventListener("click", (e) => {
    const b = (e.target as Element).closest<HTMLButtonElement>("[data-remove]");
    if (!b?.dataset.remove) return;
    api.remove(b.dataset.remove);
    refresh();
  });

  let searchTimer = 0;
  search.addEventListener("input", () => {
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(apply, 80);
  });
  search.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    window.clearTimeout(searchTimer);
    apply();
    // Enter додає колір, якщо код збігся точно або знайдено лише один колір.
    const q = latin(norm(search.value));
    const visible = [...mineItems, ...items].filter((it) => !it.el.hidden);
    const exact = visible.find((it) => it.code !== "" && it.code === q);
    const target = exact ?? (visible.length === 1 ? visible[0] : undefined);
    if (target) {
      // Уже доданий колір просто стає поточним.
      api.add(target.id);
      refresh();
      search.select();
    }
  });

  $("#catalog-done").addEventListener("click", () => dlg.close());
  $("#catalog-close").addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", (e) => {
    if (e.target === dlg) dlg.close();
  });

  return {
    open(f: Filter = "all") {
      if (!built) build();
      filter = f;
      editing = null;
      search.value = "";
      $<HTMLFormElement>("#cform", body).hidden = true;
      refresh();
      if (!dlg.open) dlg.showModal();
      body.scrollTop = 0;
      search.focus();
    },
    refresh
  };
}
