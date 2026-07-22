"use client";

import { useEffect, useState, type FormEvent, type MouseEvent } from "react";
import type { Priority } from "@/lib/actions";

export type TaskFormValues = {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: string;
  labels?: string;
  reminderOffsets: number[];
};

type InitialTask = {
  title: string;
  description?: string | null;
  dueDate?: Date | string | null;
  priority?: string | null;
  taskLabels?: { label: { name: string } }[];
  reminders?: { offsetMinutes: number }[];
};

const inputClass =
  "focus:border-accent rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition-colors dark:border-neutral-800 dark:bg-neutral-950";

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: "low", label: "Низкий", color: "bg-neutral-400" },
  { value: "medium", label: "Средний", color: "bg-sky-500" },
  { value: "high", label: "Высокий", color: "bg-amber-500" },
  { value: "urgent", label: "Срочно", color: "bg-red-500" },
];

const REMINDER_OPTIONS = [
  { offsetMinutes: 0, label: "Вовремя" },
  { offsetMinutes: 60, label: "За час" },
  { offsetMinutes: 1440, label: "За день" },
];

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
  const [priority, setPriority] = useState<string | null>(initial?.priority ?? null);
  const [labels, setLabels] = useState(
    initial?.taskLabels?.map((tl) => tl.label.name).join(", ") ?? ""
  );
  const [reminderOffsets, setReminderOffsets] = useState<number[]>(
    initial?.reminders?.map((r) => r.offsetMinutes) ?? (initial ? [] : [0])
  );

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

  function toggleReminder(offsetMinutes: number) {
    setReminderOffsets((prev) =>
      prev.includes(offsetMinutes)
        ? prev.filter((o) => o !== offsetMinutes)
        : [...prev, offsetMinutes]
    );
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title,
      description,
      dueDate,
      priority: priority ?? undefined,
      labels,
      reminderOffsets: dueDate ? reminderOffsets : [],
    });
  }

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
    >
      <form
        onSubmit={handleSubmit}
        className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-5 shadow-xl dark:border-neutral-800 dark:bg-neutral-950"
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

          {dueDate && (
            <div className="flex flex-wrap gap-3 px-1 text-xs text-neutral-500 dark:text-neutral-400">
              {REMINDER_OPTIONS.map((opt) => (
                <label key={opt.offsetMinutes} className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={reminderOffsets.includes(opt.offsetMinutes)}
                    onChange={() => toggleReminder(opt.offsetMinutes)}
                    className="accent-accent"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          )}

          <input
            value={labels}
            onChange={(e) => setLabels(e.target.value)}
            placeholder="Метки через запятую"
            className={inputClass}
          />

          <div className="flex flex-wrap gap-1.5">
            {PRIORITIES.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPriority(priority === p.value ? null : p.value)}
                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors ${
                  priority === p.value
                    ? "border-neutral-400 dark:border-neutral-500"
                    : "border-neutral-200 text-neutral-500 dark:border-neutral-800 dark:text-neutral-400"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${p.color}`} />
                {p.label}
              </button>
            ))}
          </div>
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
