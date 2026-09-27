import { sanitizeProjectData, type Project, type ProjectData } from "./projects";

/** Формат файлу трафарету. Номер формату дозволить змінювати структуру без втрати старих файлів. */
const APP = "sylianka";
const FORMAT = 1;

export function serializeProject(p: Project): string {
  const data = {
    app: APP,
    format: FORMAT,
    project: {
      name: p.name,
      rows: p.rows,
      cols: p.cols,
      side: p.side,
      fills: p.fills,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    }
  };
  return JSON.stringify(data, null, 1);
}

export function fileNameFor(p: Project): string {
  const base = p.name.replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim() || "Трафарет";
  return `${base}.sylianka.json`;
}

/** Розбирає вміст файлу. Кидає помилку з поясненням українською. */
export function parseProjectFile(text: string, fileName: string): ProjectData {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error("Файл не вдалося прочитати: це не файл трафарету силянки.");
  }
  const o = raw as Record<string, unknown> | null;
  if (!o || typeof o !== "object" || o.app !== APP || typeof o.project !== "object") {
    throw new Error("Це не файл трафарету силянки.");
  }
  if (typeof o.format === "number" && o.format > FORMAT) {
    throw new Error("Файл зроблено новішою версією програми. Оновіть сторінку й спробуйте ще раз.");
  }
  const fallback = fileName.replace(/\.sylianka\.json$|\.json$/i, "").trim() || "Трафарет з файлу";
  const data = sanitizeProjectData(o.project, fallback);
  if (!data) throw new Error("Файл пошкоджений: у ньому немає розмірів трафарету.");
  return data;
}

interface SavePickerOptions {
  suggestedName?: string;
  types?: { description?: string; accept: Record<string, string[]> }[];
}
type SavePicker = (options: SavePickerOptions) => Promise<FileSystemFileHandle>;

/**
 * Зберігає трафарет у файл. У Chrome та Edge відкривається звичайне вікно «Зберегти як»,
 * в інших браузерах файл завантажується. Повертає false, якщо збереження скасували.
 */
export async function saveProjectToFile(p: Project): Promise<boolean> {
  const name = fileNameFor(p);
  const blob = new Blob([serializeProject(p)], { type: "application/json" });
  const picker = (window as unknown as { showSaveFilePicker?: SavePicker }).showSaveFilePicker;
  if (picker) {
    try {
      const handle = await picker({
        suggestedName: name,
        types: [{ description: "Трафарет силянки", accept: { "application/json": [".json"] } }]
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return true;
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return false;
      // інакше пробуємо звичайне завантаження
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
  return true;
}
