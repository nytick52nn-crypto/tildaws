import { notFound } from "next/navigation";
import CommentForm from "@/components/CommentForm";
import CopyLinkButton from "@/components/CopyLinkButton";
import SubtaskList from "@/components/SubtaskList";
import { getTaskWithComments } from "@/lib/data";
import { formatDueDate } from "@/lib/format";

const PRIORITY_LABEL: Record<string, { text: string; color: string }> = {
  low: { text: "Низкий", color: "bg-neutral-400" },
  medium: { text: "Средний", color: "bg-sky-500" },
  high: { text: "Высокий", color: "bg-amber-500" },
  urgent: { text: "Срочно", color: "bg-red-500" },
};

export const dynamic = "force-dynamic";

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const task = await getTaskWithComments(id);

  if (!task) notFound();

  return (
    <main className="mx-auto min-h-screen max-w-xl px-4 py-8 sm:px-8">
      <p className="mb-2 font-mono text-[11px] tracking-widest text-neutral-400 uppercase dark:text-neutral-600">
        {task.column.name} · {task.column.board.name}
      </p>
      <div className="mt-1 flex items-center gap-2">
        {task.priority && PRIORITY_LABEL[task.priority] && (
          <span className={`h-2 w-2 rounded-full ${PRIORITY_LABEL[task.priority].color}`} />
        )}
        <h1 className="text-2xl font-bold tracking-tight">{task.title}</h1>
      </div>

      {task.description && (
        <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
          {task.description}
        </p>
      )}

      {(task.taskLabels.length > 0 || task.dueDate || task.priority) && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {task.priority && PRIORITY_LABEL[task.priority] && (
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 font-mono text-[11px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
              {PRIORITY_LABEL[task.priority].text}
            </span>
          )}
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
        </div>
      )}

      <div className="mt-4">
        <CopyLinkButton taskId={task.id} />
      </div>

      <SubtaskList taskId={task.id} subtasks={task.subtasks} />

      <section className="mt-8">
        <h2 className="mb-3 text-xs font-semibold tracking-widest text-neutral-500 uppercase dark:text-neutral-400">
          Комментарии
        </h2>
        <div className="flex flex-col gap-3">
          {task.comments.length === 0 && (
            <p className="text-sm text-neutral-400 dark:text-neutral-600">
              Пока пусто — будь первым.
            </p>
          )}
          {task.comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium">{comment.authorName}</span>
                <span className="font-mono text-[11px] text-neutral-400 dark:text-neutral-600">
                  {formatDueDate(comment.createdAt)}
                </span>
              </div>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {comment.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <CommentForm taskId={task.id} />
        </div>
      </section>
    </main>
  );
}
