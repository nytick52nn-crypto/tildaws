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

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black">
      <h1 className="px-6 pt-6 text-xl font-semibold">{board.name}</h1>
      <Board board={board} />
    </main>
  );
}
