"use client";

export default function UndoToast({
  taskTitle,
  onUndo,
}: {
  taskTitle: string;
  onUndo: () => void;
}) {
  return (
    <div className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
      <span className="text-neutral-600 dark:text-neutral-400">
        Задача «{taskTitle}» удалена
      </span>
      <button
        type="button"
        onClick={onUndo}
        className="text-accent font-medium hover:opacity-80"
      >
        Отменить
      </button>
    </div>
  );
}
