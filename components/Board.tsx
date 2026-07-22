"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTask, deleteTask, moveTask, updateTask } from "@/lib/actions";
import { pushDataLayerEvent } from "@/lib/analytics";
import type { BoardWithColumns } from "@/lib/data";
import Column from "./Column";
import TaskForm, { type TaskFormValues } from "./TaskForm";

type ColumnData = BoardWithColumns["columns"][number];
type TaskData = ColumnData["tasks"][number];

type FormState =
  | { mode: "create"; columnId: string }
  | { mode: "edit"; task: TaskData; columnId: string };

function errorMessageOf(err: unknown) {
  return err instanceof Error ? err.message : "Что-то пошло не так, попробуй ещё раз";
}

export default function Board({ board }: { board: BoardWithColumns }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formState, setFormState] = useState<FormState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const columns = board.columns;

  function closeForm() {
    setFormState(null);
  }

  function handleSubmit(values: TaskFormValues) {
    if (!formState) return;
    const state = formState;

    startTransition(async () => {
      try {
        if (state.mode === "create") {
          const task = await createTask({ columnId: state.columnId, ...values });
          const column = columns.find((c) => c.id === state.columnId);
          pushDataLayerEvent({
            event: "task_created",
            task_id: task.id,
            column_id: state.columnId,
            column_name: column?.name ?? "",
            has_due_date: Boolean(values.dueDate),
            has_tag: Boolean(values.tag),
          });
        } else {
          await updateTask(state.task.id, values);
        }
        setError(null);
        closeForm();
        router.refresh();
      } catch (err) {
        setError(errorMessageOf(err));
      }
    });
  }

  function handleDelete(task: TaskData, column: ColumnData) {
    if (!window.confirm(`Удалить задачу «${task.title}»?`)) return;

    startTransition(async () => {
      try {
        await deleteTask(task.id);
        pushDataLayerEvent({
          event: "task_deleted",
          task_id: task.id,
          column_id: column.id,
          column_name: column.name,
        });
        setError(null);
        router.refresh();
      } catch (err) {
        setError(errorMessageOf(err));
      }
    });
  }

  function handleMove(task: TaskData, fromColumn: ColumnData, direction: "prev" | "next") {
    const index = columns.findIndex((c) => c.id === fromColumn.id);
    const target = columns[direction === "prev" ? index - 1 : index + 1];
    if (!target) return;

    startTransition(async () => {
      try {
        await moveTask(task.id, target.id);
        pushDataLayerEvent({
          event: "task_moved",
          task_id: task.id,
          from_column_id: fromColumn.id,
          from_column_name: fromColumn.name,
          to_column_id: target.id,
          to_column_name: target.name,
        });
        setError(null);
        router.refresh();
      } catch (err) {
        setError(errorMessageOf(err));
      }
    });
  }

  return (
    <>
      {error && (
        <div className="mx-4 mt-4 flex items-center justify-between gap-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 sm:mx-6 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            aria-label="Закрыть"
            className="text-red-500 hover:text-red-700 dark:text-red-400"
          >
            ✕
          </button>
        </div>
      )}
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:overflow-x-auto sm:p-6">
        {columns.map((column, index) => (
          <Column
            key={column.id}
            column={column}
            isFirst={index === 0}
            isLast={index === columns.length - 1}
            disabled={isPending}
            onAddTask={() => setFormState({ mode: "create", columnId: column.id })}
            onEditTask={(task) => setFormState({ mode: "edit", task, columnId: column.id })}
            onDeleteTask={(task) => handleDelete(task, column)}
            onMoveTask={(task, direction) => handleMove(task, column, direction)}
          />
        ))}
      </div>
      {formState && (
        <TaskForm
          initial={formState.mode === "edit" ? formState.task : undefined}
          disabled={isPending}
          onCancel={closeForm}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
}
