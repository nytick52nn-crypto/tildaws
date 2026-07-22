import type { BoardWithColumns } from "@/lib/data";
import { fakeUtcNow } from "@/lib/dueDate";

export type AgendaTask = BoardWithColumns["columns"][number]["tasks"][number] & {
  columnName: string;
};

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

// Понедельник недели, содержащей date — считаем через UTC-геттеры, потому что
// date здесь всегда живёт в "виртуальном UTC" dueDate/fakeUtcNow (см. lib/dueDate.ts).
export function mondayOfWeek(date: Date): Date {
  const day = date.getUTCDay(); // 0 (вс) .. 6 (сб)
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = addDays(date, diffToMonday);
  return new Date(
    Date.UTC(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate())
  );
}

export function dayKeyUtc(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseWeekParam(value: string | undefined): Date {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split("-").map(Number);
    const parsed = new Date(Date.UTC(y, m - 1, d));
    if (!Number.isNaN(parsed.getTime())) return mondayOfWeek(parsed);
  }
  return mondayOfWeek(fakeUtcNow());
}

export type AgendaDay = {
  date: Date;
  key: string;
  tasks: AgendaTask[];
};

export function groupTasksByWeek(tasks: AgendaTask[], mondayAnchor: Date) {
  const days: AgendaDay[] = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(mondayAnchor, i);
    return { date, key: dayKeyUtc(date), tasks: [] };
  });
  const dayByKey = new Map(days.map((d) => [d.key, d]));
  const unscheduled: AgendaTask[] = [];

  for (const task of tasks) {
    if (!task.dueDate) {
      unscheduled.push(task);
      continue;
    }
    const bucket = dayByKey.get(dayKeyUtc(new Date(task.dueDate)));
    bucket?.tasks.push(task);
  }

  for (const day of days) {
    day.tasks.sort((a, b) => {
      if (!a.dueDate || !b.dueDate) return 0;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }

  return { days, unscheduled };
}
