import type { CustomColor } from "./colors";
import type { Project } from "./projects";

/** Трафарети й «Мої кольори» зберігаються в IndexedDB цього браузера. */
const DB_NAME = "sylianka";
const DB_VERSION = 2;
const PROJECTS = "projects";
const COLORS = "colors";
type StoreName = typeof PROJECTS | typeof COLORS;

let dbPromise: Promise<IDBDatabase> | null = null;
let onBlocked: (() => void) | null = null;

/** Повідомлення, якщо оновленню сховища заважає інша відкрита вкладка зі старою версією. */
export function setBlockedHandler(fn: () => void): void {
  onBlocked = fn;
}

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(PROJECTS)) db.createObjectStore(PROJECTS, { keyPath: "id" });
        if (!db.objectStoreNames.contains(COLORS)) db.createObjectStore(COLORS, { keyPath: "id" });
      };
      req.onblocked = () => onBlocked?.();
      req.onsuccess = () => {
        const db = req.result;
        // Нова версія програми в іншій вкладці зможе оновити сховище.
        db.onversionchange = () => {
          db.close();
          dbPromise = null;
        };
        resolve(db);
      };
      req.onerror = () => {
        dbPromise = null;
        reject(req.error ?? new Error("Не вдалося відкрити сховище"));
      };
    });
  }
  return dbPromise;
}

function run<T>(store: StoreName, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(store, mode);
        const req = fn(t.objectStore(store));
        t.oncomplete = () => resolve(req.result);
        t.onerror = () => reject(t.error ?? req.error ?? new Error("Помилка сховища"));
        t.onabort = () => reject(t.error ?? new Error("Запис скасовано"));
      })
  );
}

export const dbGetAll = (): Promise<Project[]> => run<Project[]>(PROJECTS, "readonly", (s) => s.getAll());
export const dbGet = (id: string): Promise<Project | undefined> =>
  run<Project | undefined>(PROJECTS, "readonly", (s) => s.get(id));
export const dbPut = (p: Project): Promise<IDBValidKey> => run<IDBValidKey>(PROJECTS, "readwrite", (s) => s.put(p));
export const dbDelete = (id: string): Promise<undefined> => run<undefined>(PROJECTS, "readwrite", (s) => s.delete(id));

export const dbGetColors = (): Promise<CustomColor[]> => run<CustomColor[]>(COLORS, "readonly", (s) => s.getAll());
export const dbPutColor = (c: CustomColor): Promise<IDBValidKey> =>
  run<IDBValidKey>(COLORS, "readwrite", (s) => s.put(c));

/** Просимо браузер не очищати сховище самостійно (у Chrome/Edge рішення приймається тихо). */
export async function requestPersistence(): Promise<void> {
  try {
    if (navigator.storage?.persisted && !(await navigator.storage.persisted())) {
      await navigator.storage.persist?.();
    }
  } catch {
    // не критично
  }
}
