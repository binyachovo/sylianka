import { allCustomsForBackup, customIdsIn, customsForFile } from "./colors";
import { sanitizeProjectData, type Project, type ProjectData } from "./projects";

/**
 * Формат файлу трафарету. Номер формату дозволяє змінювати структуру без втрати старих файлів:
 *   1 — кольори бісерин як HEX (до каталогу Preciosa);
 *   2 — ідентифікатори кольорів, палітра трафарету й дані своїх кольорів
 *       (з етапу 4 — ще й позначки плетіння «woven», необов'язкові).
 */
const APP = "sylianka";
const FORMAT = 2;

export function serializeProject(p: Project): string {
  const data = {
    app: APP,
    format: FORMAT,
    project: {
      name: p.name,
      rows: p.rows,
      cols: p.cols,
      side: p.side,
      palette: p.palette,
      fills: p.fills,
      woven: p.woven,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    },
    colors: customsForFile(customIdsIn(p.fills, p.palette))
  };
  return JSON.stringify(data, null, 1);
}

export function fileNameFor(p: Project): string {
  const base = p.name.replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim() || "Трафарет";
  return `${base}.sylianka.json`;
}

export interface ParsedFile {
  kind: "project";
  data: ProjectData;
  /** Свої кольори з файлу (формат 2). */
  colors: unknown;
  /** true — старий файл, кольори бісерин у HEX. */
  legacyHex: boolean;
}

/** Трафарет із резервної копії — з ідентифікатором і датами, щоб розпізнати вже наявні. */
export interface BackupProject extends ProjectData {
  id: string;
  createdAt: number;
  updatedAt: number;
}

export interface ParsedBackup {
  kind: "backup";
  projects: BackupProject[];
  colors: unknown;
  savedAt: number;
}

/** Резервна копія: усі трафарети й усі свої кольори одним файлом. */
export function serializeBackup(projects: Project[]): string {
  const data = {
    app: APP,
    format: FORMAT,
    kind: "backup",
    savedAt: Date.now(),
    projects: projects.map((p) => ({
      id: p.id,
      name: p.name,
      rows: p.rows,
      cols: p.cols,
      side: p.side,
      palette: p.palette,
      fills: p.fills,
      woven: p.woven,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    })),
    colors: allCustomsForBackup()
  };
  return JSON.stringify(data);
}

export function backupFileName(): string {
  const d = new Date();
  const pad = (n: number): string => String(n).padStart(2, "0");
  return `Трафарети силянки — резервна копія ${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.json`;
}

const ID = /^[0-9A-Za-z-]{6,64}$/;
/** Дата з файлу: мілісекунди, не з майбутнього (з запасом на доби різниці годинників). */
const validTime = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v) && v > 0 && v <= Date.now() + 86_400_000;

/** Розбирає вміст файлу: один трафарет або резервну копію. Кидає помилку з поясненням українською. */
export function parseProjectFile(text: string, fileName: string): ParsedFile | ParsedBackup {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error("Файл не вдалося прочитати: це не файл трафарету силянки.");
  }
  const o = raw as Record<string, unknown> | null;
  if (!o || typeof o !== "object" || o.app !== APP) throw new Error("Це не файл трафарету силянки.");
  const format = typeof o.format === "number" ? o.format : 1;
  if (format > FORMAT) {
    throw new Error("Файл зроблено новішою версією програми. Оновіть сторінку й спробуйте ще раз.");
  }
  if (o.kind === "backup") {
    if (!Array.isArray(o.projects)) throw new Error("Резервна копія пошкоджена: у ній немає трафаретів.");
    const projects: BackupProject[] = [];
    const seen = new Set<string>();
    for (const item of o.projects) {
      const r = item as Record<string, unknown> | null;
      if (!r || typeof r !== "object" || typeof r.id !== "string" || !ID.test(r.id) || seen.has(r.id)) continue;
      const data = sanitizeProjectData(r, "Трафарет з копії", "id");
      if (!data) continue;
      seen.add(r.id);
      const now = Date.now();
      projects.push({
        ...data,
        id: r.id,
        createdAt: validTime(r.createdAt) ? r.createdAt : now,
        updatedAt: validTime(r.updatedAt) ? r.updatedAt : now
      });
    }
    return { kind: "backup", projects, colors: o.colors, savedAt: validTime(o.savedAt) ? o.savedAt : 0 };
  }
  if (typeof o.project !== "object") throw new Error("Це не файл трафарету силянки.");
  const legacyHex = format < 2;
  const fallback = fileName.replace(/\.sylianka\.json$|\.json$/i, "").trim() || "Трафарет з файлу";
  const data = sanitizeProjectData(o.project, fallback, legacyHex ? "hex" : "id");
  if (!data) throw new Error("Файл пошкоджений: у ньому немає розмірів трафарету.");
  return { kind: "project", data, colors: legacyHex ? [] : o.colors, legacyHex };
}

interface SavePickerOptions {
  suggestedName?: string;
  types?: { description?: string; accept: Record<string, string[]> }[];
}
type SavePicker = (options: SavePickerOptions) => Promise<FileSystemFileHandle>;

/** Зберігає трафарет у файл. Повертає false, якщо збереження скасували. */
export function saveProjectToFile(p: Project): Promise<boolean> {
  return saveJson(fileNameFor(p), serializeProject(p));
}

/** Зберігає резервну копію всіх трафаретів. Повертає false, якщо збереження скасували. */
export function saveBackupToFile(projects: Project[]): Promise<boolean> {
  return saveJson(backupFileName(), serializeBackup(projects));
}

/**
 * У Chrome та Edge відкривається звичайне вікно «Зберегти як»,
 * в інших браузерах файл завантажується.
 */
async function saveJson(name: string, text: string): Promise<boolean> {
  const blob = new Blob([text], { type: "application/json" });
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
