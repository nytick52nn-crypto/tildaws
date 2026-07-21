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

export default function Board({ board }: { board: BoardWithColumns }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formState, setFormState] = useState<FormState | null>(null);

  const columns = board.columns;

  function closeForm() {
    setFormState(null);
  }

  function handleSubmit(values: TaskFormValues) {
    if (!formState) return;
    const state = formState;

    startTransition(async () => {
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
      closeForm();
      router.refresh();
    });
  }

  function handleDelete(task: TaskData, column: ColumnData) {
    startTransition(async () => {
      await deleteTask(task.id);
      pushDataLayerEvent({
        event: "task_deleted",
        task_id: task.id,
        column_id: column.id,
        column_name: column.name,
      });
      router.refresh();
    });
  }

  function handleMove(task: TaskData, fromColumn: ColumnData, direction: "prev" | "next") {
    const index = columns.findIndex((c) => c.id === fromColumn.id);
    const target = columns[direction === "prev" ? index - 1 : index + 1];
    if (!target) return;

    startTransition(async () => {
      await moveTask(task.id, target.id);
      pushDataLayerEvent({
        event: "task_moved",
        task_id: task.id,
        from_column_id: fromColumn.id,
        from_column_name: fromColumn.name,
        to_column_id: target.id,
        to_column_name: target.name,
      });
      router.refresh();
    });
  }

  return (
    <>
      <div className="flex gap-4 overflow-x-auto p-6">
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
