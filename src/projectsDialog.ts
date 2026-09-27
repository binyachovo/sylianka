import type { Project } from "./projects";
import { $ } from "./util";

export interface ProjectsApi {
  currentId(): string;
  list(): Promise<Project[]>;
  open(id: string): Promise<void>;
  create(): Promise<void>;
  /** Повертає true, якщо в оригіналі були позначки плетіння (у копію вони не переносяться). */
  duplicate(id: string): Promise<boolean>;
  remove(id: string): Promise<void>;
  exportFile(id: string): Promise<void>;
  /** Відкриває файл трафарету або відновлює резервну копію; повертає підсумок для показу або null. */
  importFile(file: File): Promise<string | null>;
  /** Зберігає резервну копію всіх трафаретів; true — збережено. */
  backup(): Promise<boolean>;
}

const dateFmt = new Intl.DateTimeFormat("uk-UA", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit"
});

/** Вікно «Мої трафарети»: список збережених трафаретів і дії з ними. */
export function initProjectsDialog(api: ProjectsApi): { open(): Promise<void> } {
  const dlg = $<HTMLDialogElement>("#projects-dlg");
  const list = $("#project-list");
  const note = $("#dlg-note");
  const fileInput = $<HTMLInputElement>("#file-input");

  function showNote(text: string, isError = false): void {
    note.textContent = text;
    note.hidden = !text;
    note.classList.toggle("error", isError);
  }

  function actionButton(act: string, label: string, extra = ""): HTMLButtonElement {
    const b = document.createElement("button");
    b.type = "button";
    b.className = `tbtn ${extra}`.trim();
    b.dataset.act = act;
    b.textContent = label;
    return b;
  }

  function card(p: Project, isCurrent: boolean): HTMLLIElement {
    const li = document.createElement("li");
    li.className = isCurrent ? "card current" : "card";
    li.dataset.id = p.id;

    const thumb = document.createElement("button");
    thumb.type = "button";
    thumb.className = "card-thumb";
    thumb.dataset.act = "open";
    thumb.setAttribute("aria-label", `Відкрити «${p.name}»`);
    if (p.thumb) {
      const img = document.createElement("img");
      img.src = p.thumb;
      img.alt = "";
      thumb.append(img);
    }

    const body = document.createElement("div");
    body.className = "card-body";
    const name = document.createElement("b");
    name.className = "card-name";
    name.textContent = p.name;
    const meta = document.createElement("span");
    meta.className = "card-meta";
    meta.textContent = `${p.rows} × ${p.cols} ромбів · ${p.side} бісерини · ${dateFmt.format(p.updatedAt)}`;
    body.append(name, meta);
    if (p.progress && p.progress.done > 0) {
      const prog = document.createElement("span");
      prog.className = "card-meta";
      const pct = Math.floor((p.progress.done / Math.max(1, p.progress.total)) * 100);
      prog.textContent =
        `Нанизано ${p.progress.done.toLocaleString("uk-UA")} з ${p.progress.total.toLocaleString("uk-UA")}` +
        ` (${pct === 0 ? "менше 1" : pct} %)`;
      body.append(prog);
    }
    if (isCurrent) {
      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = "Відкритий зараз";
      body.append(badge);
    }

    const actions = document.createElement("div");
    actions.className = "card-actions";
    if (!isCurrent) actions.append(actionButton("open", "Відкрити", "primary"));
    actions.append(actionButton("dup", "Дублювати"), actionButton("export", "У файл"), actionButton("del", "Видалити", "danger"));

    li.append(thumb, body, actions);
    return li;
  }

  async function refresh(): Promise<void> {
    const items = (await api.list()).sort((a, b) => b.updatedAt - a.updatedAt);
    const current = api.currentId();
    list.textContent = "";
    for (const p of items) list.append(card(p, p.id === current));
  }

  list.addEventListener("click", async (e) => {
    const b = (e.target as Element).closest<HTMLButtonElement>("button[data-act]");
    const id = b?.closest<HTMLLIElement>("li.card")?.dataset.id;
    if (!b || !id) return;
    showNote("");
    switch (b.dataset.act) {
      case "open":
        if (id !== api.currentId()) await api.open(id);
        dlg.close();
        break;
      case "dup": {
        const hadProgress = await api.duplicate(id);
        await refresh();
        showNote(hadProgress ? "Копію додано до списку — без позначок плетіння." : "Копію додано до списку.");
        break;
      }
      case "export":
        await api.exportFile(id);
        break;
      case "del":
        if (!b.classList.contains("armed")) {
          b.classList.add("armed");
          b.textContent = "Точно видалити?";
          window.setTimeout(() => {
            b.classList.remove("armed");
            b.textContent = "Видалити";
          }, 3500);
          return;
        }
        await api.remove(id);
        await refresh();
        break;
    }
  });

  $("#new-project").addEventListener("click", async () => {
    await api.create();
    dlg.close();
  });
  $("#open-file").addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", async () => {
    const file = fileInput.files?.[0];
    fileInput.value = "";
    if (!file) return;
    try {
      const summary = await api.importFile(file);
      if (summary) {
        await refresh();
        showNote(summary);
      } else dlg.close();
    } catch (err) {
      showNote(err instanceof Error ? err.message : "Не вдалося відкрити файл.", true);
    }
  });
  $("#backup-all").addEventListener("click", async () => {
    showNote("");
    try {
      if (await api.backup()) showNote("Резервну копію збережено. Зберігайте її поза браузером — на диску чи в хмарі.");
    } catch {
      showNote("Не вдалося зберегти резервну копію.", true);
    }
  });
  $("#close-dlg").addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", (e) => {
    if (e.target === dlg) dlg.close();
  });

  return {
    async open() {
      showNote("");
      await refresh();
      if (!dlg.open) dlg.showModal();
    }
  };
}
