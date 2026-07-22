import Board from "@/components/Board";
import { getBoard } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const board = await getBoard();

  if (!board) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6 text-center text-sm text-neutral-500">
        Доска не найдена. Запусти <code className="mx-1">npm run db:seed</code>,
        чтобы создать первую доску.
      </main>
    );
  }

  const totalTasks = board.columns.reduce((sum, c) => sum + c.tasks.length, 0);

  return (
    <main className="min-h-screen">
      <header className="border-b border-neutral-200 px-4 py-5 sm:px-8 dark:border-neutral-900">
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {board.name}
          </h1>
          <span className="font-mono text-xs text-neutral-500">
            {String(totalTasks).padStart(2, "0")}{" "}
            {totalTasks === 1 ? "задача" : "задачи"}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] tracking-widest text-neutral-400 uppercase dark:text-neutral-600">
          {board.columns.map((c) => (
            <span key={c.id}>{c.name}</span>
          ))}
        </div>
      </header>
      <Board board={board} />
    </main>
  );
}
