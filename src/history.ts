import type { CutAxis, CutRemoved, LineInserted, LineRemoved } from "./cut";
import type { Gaps } from "./geometry";
import type { Fills, Side, SideKey } from "./projects";

/** Одна дія користувача, яку можна скасувати й повторити. */
export type Action =
  | { kind: "paint"; side: SideKey; changes: Map<string, [string | undefined, string | undefined]> }
  | { kind: "size"; before: [number, number]; after: [number, number] }
  | { kind: "side"; before: Side; after: Side }
  | { kind: "clear"; before: Fills; after: Fills }
  | { kind: "gaps"; before: Gaps; after: Gaps }
  /** Видалено ряд чи стовпець n (з 1); size — [рядів, стовпців] до видалення. */
  | { kind: "cut"; axis: CutAxis; n: number; size: [number, number]; removed: CutRemoved }
  /** Видалено рядок бісерин j у половині ряду h візерунка side (див. cutLine). */
  | { kind: "cutline"; side: SideKey; h: number; j: number; removed: LineRemoved }
  /**
   * Вставлено порожній рядок бісерин j у половину ряду h візерунка side (див. insertLine); removed — що було
   * на ньому, коли вставку скасували (для «Повторити»).
   */
  | { kind: "insline"; side: SideKey; h: number; j: number; before: LineInserted; removed?: LineRemoved }
  /** Позначено нанизаними (додано в кінець набору в цьому порядку). */
  | { kind: "mark"; side: SideKey; keys: string[] }
  /** Знято позначки: [позиція в наборі на момент зняття, ключ] у порядку зняття. */
  | { kind: "unmark"; side: SideKey; items: [number, string][] };

export class History {
  private done: Action[] = [];
  private undone: Action[] = [];

  constructor(private readonly limit = 200) {}

  push(a: Action): void {
    this.done.push(a);
    if (this.done.length > this.limit) this.done.shift();
    this.undone = [];
  }

  undo(): Action | undefined {
    const a = this.done.pop();
    if (a) this.undone.push(a);
    return a;
  }

  redo(): Action | undefined {
    const a = this.undone.pop();
    if (a) this.done.push(a);
    return a;
  }

  clear(): void {
    this.done = [];
    this.undone = [];
  }

  get canUndo(): boolean {
    return this.done.length > 0;
  }

  get canRedo(): boolean {
    return this.undone.length > 0;
  }
}
