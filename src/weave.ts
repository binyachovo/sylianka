/**
 * Позначки плетіння одного трафарету: які бісерини вже нанизано і в якому порядку.
 * Номер бісерини в наборі — порядок, у якому її позначили (рахуються лише бісерини,
 * що є в поточній сітці; після зменшення сітки позначки поза нею зберігаються, але не рахуються).
 */
export class Weave {
  private list: string[] = [];
  private marked = new Set<string>();
  private numbers = new Map<string, number>();
  private exists: (k: string) => boolean = () => true;
  /** Остання позначена бісерина — «де зупинилися». */
  last: string | null = null;

  /** Прив'язує до масиву позначок трафарету (масив змінюється на місці). */
  bind(list: string[], exists: (k: string) => boolean): void {
    this.list = list;
    this.exists = exists;
    this.rebuild();
  }

  /** Перераховує номери після зміни масиву позначок. */
  rebuild(): void {
    this.marked = new Set(this.list);
    this.numbers = new Map();
    this.last = null;
    let n = 0;
    for (const k of this.list) {
      if (!this.exists(k)) continue;
      this.numbers.set(k, ++n);
      this.last = k;
    }
  }

  has(k: string): boolean {
    return this.marked.has(k);
  }

  /** Номер бісерини в наборі (з 1) або undefined, якщо не нанизана. */
  number(k: string): number | undefined {
    return this.numbers.get(k);
  }

  /** Скільки бісерин поточної сітки нанизано. */
  get done(): number {
    return this.numbers.size;
  }

  /** Позначає бісерину нанизаною — вона отримує наступний номер. false, якщо вже позначена. */
  mark(k: string): boolean {
    if (this.marked.has(k)) return false;
    this.list.push(k);
    this.marked.add(k);
    if (this.exists(k)) {
      this.numbers.set(k, this.numbers.size + 1);
      this.last = k;
    }
    return true;
  }

  /** Знімає позначку; номери наступних бісерин зсуваються. Повертає позицію, з якої її знято, або -1. */
  unmark(k: string): number {
    if (!this.marked.has(k)) return -1;
    const i = this.list.indexOf(k);
    if (i < 0) return -1;
    this.list.splice(i, 1);
    this.rebuild();
    return i;
  }
}
