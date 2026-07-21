"use client";

import { useState, type FormEvent } from "react";

export type TaskFormValues = {
  title: string;
  description?: string;
  dueDate?: string;
  tag?: string;
};

type InitialTask = {
  title: string;
  description?: string | null;
  dueDate?: Date | string | null;
  tag?: string | null;
};

export default function TaskForm({
  initial,
  disabled,
  onCancel,
  onSubmit,
}: {
  initial?: InitialTask;
  disabled?: boolean;
  onCancel: () => void;
  onSubmit: (values: TaskFormValues) => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [dueDate, setDueDate] = useState(
    initial?.dueDate ? new Date(initial.dueDate).toISOString().slice(0, 10) : ""
  );
  const [tag, setTag] = useState(initial?.tag ?? "");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title, description, dueDate, tag });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg bg-white p-4 shadow-lg dark:bg-neutral-900"
      >
        <h3 className="mb-3 text-sm font-medium">
          {initial ? "Редактировать задачу" : "Новая задача"}
        </h3>
        <div className="flex flex-col gap-2">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Название"
            className="rounded border border-neutral-300 px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-950"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Описание"
            rows={3}
            className="rounded border border-neutral-300 px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-950"
          />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="rounded border border-neutral-300 px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-950"
          />
          <input
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="Тег"
            className="rounded border border-neutral-300 px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-950"
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={disabled}
            className="rounded px-3 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={disabled || !title.trim()}
            className="rounded bg-neutral-900 px-3 py-1.5 text-sm text-white hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900"
          >
            Сохранить
          </button>
        </div>
      </form>
    </div>
  );
}
