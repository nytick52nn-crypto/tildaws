import Link from "next/link";
import type { AgendaDay, AgendaTask } from "@/lib/agenda";
import { formatDueTime } from "@/lib/format";

const WEEKDAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function formatDayDate(date: Date) {
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  });
}

function TaskRow({ task }: { task: AgendaTask }) {
  return (
    <Link
      href={`/task/${task.id}`}
      className="block rounded-lg border border-neutral-200 bg-neutral-50 p-2 text-sm hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-600"
    >
      {task.dueDate && (
        <span className="text-accent mr-1.5 font-mono text-[11px]">
          {formatDueTime(task.dueDate)}
        </span>
      )}
      <span className="text-neutral-900 dark:text-neutral-100">{task.title}</span>
      <span className="ml-1.5 text-[11px] text-neutral-400 dark:text-neutral-600">
        {task.columnName}
      </span>
    </Link>
  );
}

export default function Agenda({
  days,
  unscheduled,
  todayKey,
}: {
  days: AgendaDay[];
  unscheduled: AgendaTask[];
  todayKey: string;
}) {
  return (
    <div className="flex flex-col gap-5 p-4 sm:p-8">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-7">
        {days.map((day, i) => {
          const isToday = day.key === todayKey;
          return (
            <div
              key={day.key}
              className={`rounded-xl border p-3 ${
                isToday
                  ? "border-accent"
                  : "border-neutral-200 dark:border-neutral-900"
              }`}
            >
              <p
                className={`mb-2 text-xs font-semibold tracking-widest uppercase ${
                  isToday ? "text-accent" : "text-neutral-500 dark:text-neutral-400"
                }`}
              >
                {WEEKDAY_LABELS[i]} · {formatDayDate(day.date)}
              </p>
              <div className="flex flex-col gap-1.5">
                {day.tasks.length === 0 && (
                  <p className="text-xs text-neutral-400 dark:text-neutral-600">—</p>
                )}
                {day.tasks.map((task) => (
                  <TaskRow key={task.id} task={task} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {unscheduled.length > 0 && (
        <div>
          <h2 className="mb-2 text-xs font-semibold tracking-widest text-neutral-500 uppercase dark:text-neutral-400">
            Без даты
          </h2>
          <div className="flex flex-col gap-1.5">
            {unscheduled.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
