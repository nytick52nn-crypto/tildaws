"use client";

import type { BoardWithColumns } from "@/lib/data";

type TaskData = BoardWithColumns["columns"][number]["tasks"][number];

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
    <div className="rounded-md border border-neutral-200 bg-white p-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
      <p className="text-sm font-medium">{task.title}</p>
      {task.description && (
        <p className="mt-1 line-clamp-3 text-xs text-neutral-500">
          {task.description}
        </p>
      )}
      {(task.tag || task.dueDate) && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-neutral-500">
          {task.tag && (
            <span className="rounded bg-neutral-100 px-1.5 py-0.5 dark:bg-neutral-800">
              {task.tag}
            </span>
          )}
          {task.dueDate && (
            <span>{new Date(task.dueDate).toLocaleDateString("ru-RU")}</span>
          )}
        </div>
      )}
      <div className="mt-2 flex items-center justify-between">
        <div className="flex gap-1">
          <button
            type="button"
            aria-label="Переместить влево"
            disabled={disabled || !canMovePrev}
            onClick={() => onMove("prev")}
            className="rounded px-1.5 py-0.5 text-xs hover:bg-neutral-100 disabled:opacity-30 dark:hover:bg-neutral-800"
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Переместить вправо"
            disabled={disabled || !canMoveNext}
            onClick={() => onMove("next")}
            className="rounded px-1.5 py-0.5 text-xs hover:bg-neutral-100 disabled:opacity-30 dark:hover:bg-neutral-800"
          >
            →
          </button>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            disabled={disabled}
            onClick={onEdit}
            className="rounded px-1.5 py-0.5 text-xs hover:bg-neutral-100 disabled:opacity-30 dark:hover:bg-neutral-800"
          >
            Изм.
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={onDelete}
            className="rounded px-1.5 py-0.5 text-xs text-red-600 hover:bg-red-50 disabled:opacity-30 dark:hover:bg-red-950"
          >
            Удал.
          </button>
        </div>
      </div>
    </div>
  );
}
