"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-sm text-neutral-500">
        Что-то пошло не так. Попробуй ещё раз.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded bg-neutral-900 px-3 py-1.5 text-sm text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900"
      >
        Повторить
      </button>
    </div>
  );
}
