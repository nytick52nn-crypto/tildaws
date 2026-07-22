import Link from "next/link";
import PushManager from "@/components/PushManager";
import ViewTabs from "@/components/ViewTabs";
import Agenda from "@/components/Agenda";
import {
  addDays,
  dayKeyUtc,
  groupTasksByWeek,
  parseWeekParam,
  type AgendaTask,
} from "@/lib/agenda";
import { fakeUtcNow } from "@/lib/dueDate";
import { getBoard } from "@/lib/data";

export const dynamic = "force-dynamic";

function weekParamOf(date: Date) {
  return dayKeyUtc(date);
}

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  const board = await getBoard();

  if (!board) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6 text-center text-sm text-neutral-500">
        Доска не найдена. Запусти <code className="mx-1">npm run db:seed</code>,
        чтобы создать первую доску.
      </main>
    );
  }

  const mondayAnchor = parseWeekParam(week);
  const prevWeek = addDays(mondayAnchor, -7);
  const nextWeek = addDays(mondayAnchor, 7);
  const todayKey = dayKeyUtc(fakeUtcNow());

  const allTasks: AgendaTask[] = board.columns.flatMap((column) =>
    column.tasks.map((task) => ({ ...task, columnName: column.name }))
  );

  const { days, unscheduled } = groupTasksByWeek(allTasks, mondayAnchor);

  return (
    <main className="min-h-screen">
      <header className="border-b border-neutral-200 px-4 py-5 sm:px-8 dark:border-neutral-900">
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {board.name}
          </h1>
          <div className="flex items-center gap-3 font-mono text-xs text-neutral-500">
            <Link href={`/agenda?week=${weekParamOf(prevWeek)}`} className="hover:text-accent">
              ← Пред.
            </Link>
            <Link href="/agenda" className="hover:text-accent">
              Сегодня
            </Link>
            <Link href={`/agenda?week=${weekParamOf(nextWeek)}`} className="hover:text-accent">
              След. →
            </Link>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-4">
          <ViewTabs />
          <PushManager />
        </div>
      </header>
      <Agenda days={days} unscheduled={unscheduled} todayKey={todayKey} />
    </main>
  );
}
