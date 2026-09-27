import type { Project } from "./projects";

/** Трафарети зберігаються в IndexedDB цього браузера. */
const DB_NAME = "sylianka";
const DB_VERSION = 1;
const STORE = "projects";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error ?? new Error("Не вдалося відкрити сховище"));
    });
  }
  return dbPromise;
}

function run<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = fn(t.objectStore(STORE));
        t.oncomplete = () => resolve(req.result);
        t.onerror = () => reject(t.error ?? req.error ?? new Error("Помилка сховища"));
        t.onabort = () => reject(t.error ?? new Error("Запис скасовано"));
      })
  );
}

export const dbGetAll = (): Promise<Project[]> => run<Project[]>("readonly", (s) => s.getAll());
export const dbGet = (id: string): Promise<Project | undefined> => run<Project | undefined>("readonly", (s) => s.get(id));
export const dbPut = (p: Project): Promise<IDBValidKey> => run<IDBValidKey>("readwrite", (s) => s.put(p));
export const dbDelete = (id: string): Promise<undefined> => run<undefined>("readwrite", (s) => s.delete(id));

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
