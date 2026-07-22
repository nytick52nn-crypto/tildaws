"use client";

import Link from "next/link";
import type { BoardWithColumns } from "@/lib/data";
import { formatDueDate } from "@/lib/format";

type TaskData = BoardWithColumns["columns"][number]["tasks"][number];

const PRIORITY_COLOR: Record<string, string> = {
  low: "bg-neutral-400",
  medium: "bg-sky-500",
  high: "bg-amber-500",
  urgent: "bg-red-500",
};

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
  const subtaskTotal = task.subtasks?.length ?? 0;
  const subtaskDone = task.subtasks?.filter((s) => s.done).length ?? 0;
  const priorityColor = task.priority ? PRIORITY_COLOR[task.priority] : null;

  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-start gap-1.5">
        {priorityColor && (
          <span
            className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${priorityColor}`}
            aria-hidden
          />
        )}
        <Link
          href={`/task/${task.id}`}
          className="hover:text-accent block text-sm font-medium text-neutral-900 hover:underline dark:text-neutral-100"
        >
          {task.title}
        </Link>
      </div>
      {task.description && (
        <p className="mt-1 line-clamp-3 text-xs text-neutral-500 dark:text-neutral-400">
          {task.description}
        </p>
      )}
      {(task.taskLabels.length > 0 || task.dueDate || subtaskTotal > 0) && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {task.taskLabels.map((tl) => (
            <span
              key={tl.label.id}
              className="rounded-full px-2 py-0.5 font-mono text-[11px] text-white"
              style={{ backgroundColor: tl.label.color }}
            >
              {tl.label.name}
            </span>
          ))}
          {task.dueDate && (
            <span className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
              {formatDueDate(task.dueDate)}
            </span>
          )}
          {subtaskTotal > 0 && (
            <span className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
              {subtaskDone}/{subtaskTotal}
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
