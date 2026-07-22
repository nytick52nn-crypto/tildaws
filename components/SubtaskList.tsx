"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { addSubtask, deleteSubtask, toggleSubtask } from "@/lib/actions";

type Subtask = { id: string; title: string; done: boolean };

export default function SubtaskList({
  taskId,
  subtasks,
}: {
  taskId: string;
  subtasks: Subtask[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");

  function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    startTransition(async () => {
      await addSubtask({ taskId, title });
      setTitle("");
      router.refresh();
    });
  }

  function handleToggle(id: string) {
    startTransition(async () => {
      await toggleSubtask(id);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteSubtask(id);
      router.refresh();
    });
  }

  return (
    <section className="mt-8">
      <h2 className="mb-3 text-xs font-semibold tracking-widest text-neutral-500 uppercase dark:text-neutral-400">
        Подзадачи
      </h2>
      <div className="flex flex-col gap-1.5">
        {subtasks.map((s) => (
          <div
            key={s.id}
            className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <input
              type="checkbox"
              checked={s.done}
              disabled={isPending}
              onChange={() => handleToggle(s.id)}
              className="accent-accent"
            />
            <span
              className={`flex-1 text-sm ${
                s.done ? "text-neutral-400 line-through dark:text-neutral-600" : ""
              }`}
            >
              {s.title}
            </span>
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleDelete(s.id)}
              aria-label="Удалить пункт"
              className="text-xs text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <form onSubmit={handleAdd} className="mt-2 flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Добавить пункт"
          className="focus:border-accent flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm outline-none dark:border-neutral-800 dark:bg-neutral-950"
        />
        <button
          type="submit"
          disabled={isPending || !title.trim()}
          className="bg-accent rounded-lg px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
        >
          +
        </button>
      </form>
    </section>
  );
}
