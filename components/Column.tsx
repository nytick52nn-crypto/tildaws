"use client";

import TaskCard from "./TaskCard";
import type { BoardWithColumns } from "@/lib/data";

type ColumnData = BoardWithColumns["columns"][number];
type TaskData = ColumnData["tasks"][number];

const STATUS_ACCENT: Record<string, string> = {
  "To Do": "bg-neutral-300 dark:bg-neutral-700",
  "In Progress": "bg-amber-400",
  Done: "bg-emerald-500",
};

export default function Column({
  column,
  isFirst,
  isLast,
  disabled,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onMoveTask,
}: {
  column: ColumnData;
  isFirst: boolean;
  isLast: boolean;
  disabled?: boolean;
  onAddTask: () => void;
  onEditTask: (task: TaskData) => void;
  onDeleteTask: (task: TaskData) => void;
  onMoveTask: (task: TaskData, direction: "prev" | "next") => void;
}) {
  const accent = STATUS_ACCENT[column.name] ?? "bg-neutral-300 dark:bg-neutral-700";

  return (
    <div className="flex w-full shrink-0 flex-col rounded-xl border border-neutral-200 bg-white sm:w-80 dark:border-neutral-900 dark:bg-neutral-950">
      <div className={`h-1 rounded-t-xl ${accent}`} />
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-xs font-semibold tracking-widest text-neutral-500 uppercase dark:text-neutral-400">
          {column.name}
        </h2>
        <span className="rounded-full border border-neutral-200 px-2 py-0.5 font-mono text-[11px] text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
          {column.tasks.length}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 px-3 pb-3">
        {column.tasks.length === 0 && (
          <p className="px-1 py-4 text-center text-xs text-neutral-400 dark:text-neutral-600">
            Пусто
          </p>
        )}
        {column.tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            canMovePrev={!isFirst}
            canMoveNext={!isLast}
            disabled={disabled}
            onEdit={() => onEditTask(task)}
            onDelete={() => onDeleteTask(task)}
            onMove={(direction) => onMoveTask(task, direction)}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={onAddTask}
        disabled={disabled}
        className="hover:border-accent hover:text-accent m-3 rounded-lg border border-dashed border-neutral-300 py-2 text-sm text-neutral-500 transition-colors disabled:opacity-50 dark:border-neutral-800"
      >
        + Добавить задачу
      </button>
    </div>
  );
}
