"use client";

import type { BoardWithColumns } from "@/lib/data";

type TaskData = BoardWithColumns["columns"][number]["tasks"][number];

// dueDate хранится как введённые пользователем числа "как есть" (см. lib/actions.ts),
// поэтому показываем их через UTC-геттеры, а не через локальный часовой пояс браузера.
function formatDueDate(value: Date | string) {
  const d = new Date(value);
  return d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

export default function TaskCard({
  task,
  canMovePrev,
  canMoveNext,
  disabled,
  onEdit,
  onDelete,
  onMove,
}: {
  task: TaskData;
  canMovePrev: boolean;
  canMoveNext: boolean;
  disabled?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMove: (direction: "prev" | "next") => void;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
        {task.title}
      </p>
      {task.description && (
        <p className="mt-1 line-clamp-3 text-xs text-neutral-500 dark:text-neutral-400">
          {task.description}
        </p>
      )}
      {(task.tag || task.dueDate) && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {task.tag && (
            <span className="bg-accent/10 text-accent rounded-full px-2 py-0.5 font-mono text-[11px]">
              {task.tag}
            </span>
          )}
          {task.dueDate && (
            <span className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
              {formatDueDate(task.dueDate)}
            </span>
          )}
        </div>
      )}
      <div className="mt-3 flex items-center justify-between border-t border-neutral-200 pt-2 dark:border-neutral-800">
        <div className="flex gap-1">
          <button
            type="button"
            aria-label="Переместить влево"
            disabled={disabled || !canMovePrev}
            onClick={() => onMove("prev")}
            className="rounded px-1.5 py-0.5 text-xs text-neutral-500 hover:bg-neutral-200 disabled:opacity-30 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Переместить вправо"
            disabled={disabled || !canMoveNext}
            onClick={() => onMove("next")}
            className="rounded px-1.5 py-0.5 text-xs text-neutral-500 hover:bg-neutral-200 disabled:opacity-30 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            →
          </button>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            disabled={disabled}
            onClick={onEdit}
            aria-label="Редактировать"
            className="rounded px-1.5 py-0.5 text-xs text-neutral-500 hover:bg-neutral-200 disabled:opacity-30 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            ✎
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={onDelete}
            aria-label="Удалить"
            className="rounded px-1.5 py-0.5 text-xs text-red-500 hover:bg-red-50 disabled:opacity-30 dark:hover:bg-red-950"
          >
            🗑
          </button>
        </div>
      </div>
    </div>
  );
}
