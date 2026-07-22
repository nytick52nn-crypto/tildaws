"use client";

import TaskCard from "./TaskCard";
import type { BoardWithColumns } from "@/lib/data";

type ColumnData = BoardWithColumns["columns"][number];
type TaskData = ColumnData["tasks"][number];

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
  return (
    <div className="flex w-full shrink-0 flex-col rounded-lg bg-neutral-100 sm:w-72 dark:bg-neutral-900">
      <div className="flex items-center justify-between px-3 py-2">
        <h2 className="text-sm font-medium">{column.name}</h2>
        <span className="text-xs text-neutral-500">{column.tasks.length}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2 px-2 pb-2">
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
        className="m-2 rounded-md border border-dashed border-neutral-300 py-1.5 text-sm text-neutral-500 hover:border-neutral-400 hover:text-neutral-700 disabled:opacity-50 dark:border-neutral-700"
      >
        + Добавить задачу
      </button>
    </div>
  );
}
