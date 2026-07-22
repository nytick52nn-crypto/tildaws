"use client";

import { useEffect, useState, type FormEvent, type MouseEvent } from "react";

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

const inputClass =
  "focus:border-accent rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition-colors dark:border-neutral-800 dark:bg-neutral-950";

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
    initial?.dueDate ? new Date(initial.dueDate).toISOString().slice(0, 16) : ""
  );
  const [tag, setTag] = useState(initial?.tag ?? "");

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  function handleBackdropClick(e: MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onCancel();
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title, description, dueDate, tag });
  }

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-5 shadow-xl dark:border-neutral-800 dark:bg-neutral-950"
      >
        <h3 className="mb-4 text-xs font-semibold tracking-widest text-neutral-500 uppercase dark:text-neutral-400">
          {initial ? "Редактировать задачу" : "Новая задача"}
        </h3>
        <div className="flex flex-col gap-2.5">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Название"
            className={inputClass}
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Описание"
            rows={3}
            className={inputClass}
          />
          <input
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={inputClass}
          />
          <input
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="Тег"
            className={inputClass}
          />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={disabled}
            className="rounded-lg px-3 py-2 text-sm text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-900"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={disabled || !title.trim()}
            className="bg-accent rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            Сохранить
          </button>
        </div>
      </form>
    </div>
  );
}
