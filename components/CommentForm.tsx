"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { addComment } from "@/lib/actions";
import { pushDataLayerEvent } from "@/lib/analytics";

const inputClass =
  "focus:border-accent rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition-colors dark:border-neutral-800 dark:bg-neutral-950";

export default function CommentForm({ taskId }: { taskId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [authorName, setAuthorName] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;

    startTransition(async () => {
      try {
        await addComment({ taskId, authorName, body });
        pushDataLayerEvent({
          event: "comment_added",
          task_id: taskId,
          author_provided: Boolean(authorName.trim()),
        });
        setBody("");
        setError(null);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Не удалось отправить комментарий");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <input
        value={authorName}
        onChange={(e) => setAuthorName(e.target.value)}
        placeholder="Имя (необязательно)"
        className={inputClass}
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Комментарий"
        rows={3}
        className={inputClass}
      />
      <button
        type="submit"
        disabled={isPending || !body.trim()}
        className="bg-accent self-start rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        Отправить
      </button>
    </form>
  );
}
