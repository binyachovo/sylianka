import "@fontsource/alegreya/cyrillic-800.css";
import "@fontsource/alegreya/latin-800.css";
import "@fontsource/arsenal/cyrillic-400.css";
import "@fontsource/arsenal/latin-400.css";
import "@fontsource/arsenal/cyrillic-700.css";
import "@fontsource/arsenal/latin-700.css";
import "@fontsource/ibm-plex-mono/cyrillic-500.css";
import "@fontsource/ibm-plex-mono/latin-500.css";
import "./styles.css";

import { registerSW } from "virtual:pwa-register";
import { BEAD_R, beadsPerStep, buildGeometry, mirrorKey } from "./geometry";
import { PALETTE, paletteName, paletteRank } from "./palette";
import { applyPrintLayout } from "./print";
import { MAX_CELLS, MAX_SIDE, loadState, scheduleSave, type Side } from "./store";
import { $, $$, clamp, num, r2 } from "./util";

registerSW({ immediate: true });

const GUT_L = 27;
const GUT_T = 20;
const PAD = 9;

const state = loadState();
const ui = { erase: false, clean: false };

const svg = $<SVGSVGElement>("#strip");
const copy = $<SVGSVGElement>("#strip2");
const pal = $("#palette");
const eraseBtn = $<HTMLButtonElement>("#erase");
const mirrorBtn = $<HTMLButtonElement>("#mirror");
const clearBtn = $<HTMLButtonElement>("#clear");
const inRows = $<HTMLInputElement>("#in-rows");
const inCols = $<HTMLInputElement>("#in-cols");
const cleanBox = $<HTMLInputElement>("#clean");
const twoBox = $<HTMLInputElement>("#two");
const twoFloat = $<HTMLInputElement>("#two-float");
const exitBtn = $<HTMLButtonElement>("#exit-clean");
const warn = $("#warn");
const pageSize = $<HTMLStyleElement>("#page-size");
const installBtn = $<HTMLButtonElement>("#install");

let beadEls = new Map<string, SVGElement>();
const viewBoxes = { normal: "0 0 1 1", clean: "0 0 1 1" };
let cleanDims: [number, number] = [1, 1];

const fills = (): Record<string, string> => state.fills[String(state.side) as "3" | "4"];
const save = (): void => scheduleSave(state);

/* ---------- Малювання сітки ---------- */

function render(): void {
  const g = buildGeometry(state.cols, state.rows, state.side);
  const { H, width: W, height: HT } = g;
  const vb = [-GUT_L, -GUT_T, W + GUT_L + PAD, HT + GUT_T + PAD];
  const e = BEAD_R + 1;
  const vbc = [-e, -e, W + 2 * e, HT + 2 * e];
  viewBoxes.normal = vb.map(r2).join(" ");
  viewBoxes.clean = vbc.map(r2).join(" ");
  cleanDims = [vbc[2], vbc[3]];

  const f = fills();
  const parts: string[] = [];
  let d = "";
  for (const s of g.segs) d += `M${r2(s[0] * H)} ${r2(s[1] * H)}L${r2(s[2] * H)} ${r2(s[3] * H)}`;
  parts.push(`<path class="thread" d="${d}"/>`);
  const axisY = r2(state.rows * H);
  parts.push(`<line class="axis" x1="-6" y1="${axisY}" x2="${r2(W + 6)}" y2="${axisY}"/>`);

  const colEvery = state.cols > 40 ? 5 : 1;
  const rowEvery = state.rows > 40 ? 5 : 1;
  for (let i = 0; i < state.cols; i++) {
    const label = i + 1;
    if (colEvery === 1 || label === 1 || label % colEvery === 0) {
      parts.push(`<text class="lc" x="${r2((2 * i + 1) * H)}" y="-8" text-anchor="middle">${label}</text>`);
    }
  }
  for (let r = 0; r < state.rows; r++) {
    const label = r + 1;
    if (rowEvery === 1 || label === 1 || label % rowEvery === 0) {
      parts.push(
        `<text class="lr" x="-7.5" y="${r2((2 * r + 1) * H)}" text-anchor="end" dominant-baseline="central">${label}</text>`
      );
    }
  }
  for (const b of g.beads) {
    const c = f[b.k];
    parts.push(
      `<circle class="bd" data-k="${b.k}" cx="${r2(b.x)}" cy="${r2(b.y)}" r="${BEAD_R}"${c ? ` style="fill:${c}"` : ""}/>`
    );
  }

  svg.setAttribute("viewBox", ui.clean ? viewBoxes.clean : viewBoxes.normal);
  svg.style.minWidth = `${Math.round(vb[2] * 1.2)}px`;
  svg.style.maxWidth = `${Math.round(vb[2] * 3)}px`;
  svg.innerHTML = parts.join("");
  svg.setAttribute("aria-label", `Сітка силянки: ${state.rows} у висоту, ${state.cols} у ширину`);

  beadEls = new Map();
  for (const el of $$<SVGElement>(".bd", svg)) beadEls.set(el.getAttribute("data-k") ?? "", el);

  syncTools();
  updateMeta();
  updateStats();
  printLayout();
}

function printLayout(): void {
  applyPrintLayout(cleanDims[0], cleanDims[1], state.two ? 2 : 1, pageSize);
}

function syncCopy(): void {
  if (!ui.clean || !state.two) return;
  copy.setAttribute("viewBox", viewBoxes.clean);
  copy.innerHTML = svg.innerHTML;
}

function updateMeta(): void {
  $("#meta").textContent = `${state.rows}-рядна силянка · ${state.side} бісерини в комірці`;
  inRows.value = String(state.rows);
  inCols.value = String(state.cols);
  for (const b of $$<HTMLButtonElement>("button[data-s]")) {
    b.setAttribute("aria-pressed", String(Number(b.dataset.s) === state.side));
  }
}

/* ---------- Підрахунок ---------- */

function addCountRow(ul: HTMLElement, color: string | null, name: string, count: number): void {
  const li = document.createElement("li");
  const chip = document.createElement("span");
  chip.className = color ? "chip" : "chip chip-empty";
  if (color) chip.style.setProperty("--c", color);
  const nm = document.createElement("span");
  nm.textContent = name;
  const n = document.createElement("span");
  n.className = "n";
  n.textContent = num(count);
  li.append(chip, nm, n);
  ul.append(li);
}

function updateStats(): void {
  const f = fills();
  const counts = new Map<string, number>();
  let empty = 0;
  for (const k of beadEls.keys()) {
    const c = f[k];
    if (c) counts.set(c, (counts.get(c) ?? 0) + 1);
    else empty++;
  }
  $("#st-total").textContent = num(beadEls.size);
  $("#st-step").textContent = num(beadsPerStep(state.rows, state.side));

  const used = Array.from(counts.keys()).sort((a, b) => paletteRank(a) - paletteRank(b) || a.localeCompare(b));
  const ul = $("#st-colors");
  ul.textContent = "";
  for (const c of used) addCountRow(ul, c, paletteName(c) ?? `Свій ${c.toLowerCase()}`, counts.get(c) ?? 0);
  addCountRow(ul, null, "Не зафарбовано", empty);
  syncCopy();
}

let statsQueued = false;
function scheduleStats(): void {
  if (statsQueued) return;
  statsQueued = true;
  requestAnimationFrame(() => {
    statsQueued = false;
    updateStats();
  });
}

/* ---------- Палітра й інструменти ---------- */

for (const p of PALETTE) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "sw";
  b.dataset.c = p.hex;
  b.title = p.name;
  b.setAttribute("aria-label", p.name);
  b.setAttribute("aria-pressed", "false");
  b.innerHTML = `<span class="chip" style="--c:${p.hex}"></span>`;
  pal.append(b);
}
const custom = document.createElement("label");
custom.className = "sw sw-custom";
custom.title = "Свій колір";
custom.innerHTML =
  '<span class="chip" id="custom-chip"></span><input type="color" id="custom-color" value="#8e5ac8" aria-label="Свій колір">';
pal.append(custom);
const customInput = $<HTMLInputElement>("#custom-color");
const customChip = $("#custom-chip");
customChip.style.setProperty("--c", customInput.value);

function syncTools(): void {
  const named = paletteName(state.color);
  for (const b of $$<HTMLButtonElement>("button.sw", pal)) {
    b.setAttribute("aria-pressed", String(!ui.erase && b.dataset.c === state.color));
  }
  custom.classList.toggle("on", !ui.erase && !named);
  if (!named) {
    customInput.value = state.color.toLowerCase();
    customChip.style.setProperty("--c", state.color);
  }
  eraseBtn.setAttribute("aria-pressed", String(ui.erase));
  mirrorBtn.setAttribute("aria-pressed", String(state.mirror));
  svg.classList.toggle("erasing", ui.erase);
  svg.classList.toggle("mirror-on", state.mirror);
  $("#cur-name").textContent = ui.erase ? "гумка" : (named ?? "свій").toLowerCase();
}

function selectColor(c: string): void {
  state.color = c.toUpperCase();
  ui.erase = false;
  syncTools();
  save();
}

pal.addEventListener("click", (e) => {
  const b = (e.target as Element).closest<HTMLButtonElement>("button.sw");
  if (b?.dataset.c) selectColor(b.dataset.c);
});
customInput.addEventListener("input", () => selectColor(customInput.value));
customInput.addEventListener("click", () => selectColor(customInput.value));

eraseBtn.addEventListener("click", () => {
  ui.erase = !ui.erase;
  syncTools();
});
mirrorBtn.addEventListener("click", () => {
  state.mirror = !state.mirror;
  syncTools();
  save();
});

/* ---------- Фарбування ---------- */

function modeFor(k: string): string | null {
  if (ui.erase) return null;
  return fills()[k] === state.color ? null : state.color;
}

function setBead(k: string, c: string | null): void {
  const f = fills();
  if (c) f[k] = c;
  else delete f[k];
  const el = beadEls.get(k);
  if (el) el.style.fill = c ?? "";
}

function paint(k: string, c: string | null): void {
  setBead(k, c);
  if (state.mirror) {
    const mk = mirrorKey(k, state.rows);
    if (mk !== k && beadEls.has(mk)) setBead(mk, c);
  }
  scheduleStats();
}

const beadKey = (target: EventTarget | null): string | null =>
  (target as Element | null)?.closest?.(".bd")?.getAttribute("data-k") ?? null;

let painting: { mode: string | null } | null = null;
let lastPointer = "";

svg.addEventListener("pointerdown", (e) => {
  lastPointer = e.pointerType;
  if (e.pointerType !== "mouse" || e.button !== 0) return;
  const k = beadKey(e.target);
  if (!k) return;
  e.preventDefault();
  painting = { mode: modeFor(k) };
  paint(k, painting.mode);
});
svg.addEventListener("pointerover", (e) => {
  if (!painting) return;
  const k = beadKey(e.target);
  if (k) paint(k, painting.mode);
});
const stopPainting = (): void => {
  if (!painting) return;
  painting = null;
  save();
};
window.addEventListener("pointerup", stopPainting);
window.addEventListener("pointercancel", stopPainting);
svg.addEventListener("click", (e) => {
  if (lastPointer === "mouse") return;
  const k = beadKey(e.target);
  if (!k) return;
  paint(k, modeFor(k));
  save();
});

/* ---------- Розмір ---------- */

let warnTimer = 0;
function setSize(name: "rows" | "cols", raw: string | number): void {
  let v = Math.round(Number(raw));
  if (!Number.isFinite(v)) v = state[name];
  const other = name === "rows" ? state.cols : state.rows;
  const cap = Math.min(MAX_SIDE, Math.floor(MAX_CELLS / other));
  const next = clamp(v, 1, cap);
  if (next < v) {
    warn.hidden = false;
    window.clearTimeout(warnTimer);
    warnTimer = window.setTimeout(() => {
      warn.hidden = true;
    }, 7000);
  }
  state[name] = next;
  render();
  save();
}

for (const b of $$<HTMLButtonElement>("[data-step]")) {
  b.addEventListener("click", () => {
    const p = b.dataset.step === "rows" ? "rows" : "cols";
    setSize(p, state[p] + Number(b.dataset.d));
  });
}
inRows.addEventListener("change", () => setSize("rows", inRows.value));
inCols.addEventListener("change", () => setSize("cols", inCols.value));
for (const b of $$<HTMLButtonElement>("button[data-s]")) {
  b.addEventListener("click", () => {
    state.side = Number(b.dataset.s) === 4 ? 4 : (3 as Side);
    render();
    save();
  });
}

/* ---------- Друк ---------- */

function setClean(on: boolean): void {
  ui.clean = on;
  cleanBox.checked = on;
  document.body.classList.toggle("clean", on);
  svg.setAttribute("viewBox", on ? viewBoxes.clean : viewBoxes.normal);
  syncCopy();
  if (on) window.scrollTo(0, 0);
}

function setTwo(on: boolean): void {
  state.two = on;
  twoBox.checked = on;
  twoFloat.checked = on;
  document.body.classList.toggle("two", on);
  printLayout();
  syncCopy();
  save();
}

cleanBox.addEventListener("change", () => setClean(cleanBox.checked));
twoBox.addEventListener("change", () => setTwo(twoBox.checked));
twoFloat.addEventListener("change", () => setTwo(twoFloat.checked));
exitBtn.addEventListener("click", () => {
  setClean(false);
  cleanBox.focus();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && ui.clean) setClean(false);
});

/* ---------- Стерти все (з підтвердженням на сторінці) ---------- */

let armTimer = 0;
function disarm(): void {
  window.clearTimeout(armTimer);
  clearBtn.classList.remove("armed");
  clearBtn.textContent = "Стерти все";
}
clearBtn.addEventListener("click", () => {
  if (!clearBtn.classList.contains("armed")) {
    clearBtn.classList.add("armed");
    clearBtn.textContent = "Натисніть ще раз, щоб стерти";
    armTimer = window.setTimeout(disarm, 3500);
    return;
  }
  disarm();
  state.fills = { "3": {}, "4": {} };
  for (const el of beadEls.values()) el.style.fill = "";
  updateStats();
  save();
});

/* ---------- Встановлення як програми ---------- */

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
let installPrompt: BeforeInstallPromptEvent | null = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  installPrompt = e as BeforeInstallPromptEvent;
  installBtn.hidden = false;
});
installBtn.addEventListener("click", async () => {
  if (!installPrompt) return;
  await installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt = null;
  installBtn.hidden = true;
});
window.addEventListener("appinstalled", () => {
  installBtn.hidden = true;
});

/* ---------- Старт ---------- */

twoBox.checked = state.two;
twoFloat.checked = state.two;
document.body.classList.toggle("two", state.two);
render();
