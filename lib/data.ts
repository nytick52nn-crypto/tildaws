import { prisma } from "@/lib/db";

export async function getBoard() {
  return prisma.board.findFirst({
    include: {
      columns: {
        orderBy: { order: "asc" },
        include: {
          tasks: {
            orderBy: { order: "asc" },
            include: {
              taskLabels: { include: { label: true } },
              subtasks: { orderBy: { order: "asc" } },
              reminders: true,
            },
          },
        },
      },
    },
  });
}

export type BoardWithColumns = NonNullable<Awaited<ReturnType<typeof getBoard>>>;

export async function getTaskWithComments(id: string) {
  return prisma.task.findUnique({
    where: { id },
    include: {
      column: { include: { board: true } },
      comments: { orderBy: { createdAt: "asc" } },
      taskLabels: { include: { label: true } },
      subtasks: { orderBy: { order: "asc" } },
      reminders: { orderBy: { offsetMinutes: "asc" } },
    },
  });
}

export type TaskWithComments = NonNullable<
  Awaited<ReturnType<typeof getTaskWithComments>>
>;

export async function getTasksWithDueDate() {
  return prisma.task.findMany({
    where: { dueDate: { not: null } },
    orderBy: { dueDate: "asc" },
    include: {
      taskLabels: { include: { label: true } },
    },
  });
}

export type TaskWithDueDate = Awaited<
  ReturnType<typeof getTasksWithDueDate>
>[number];

export async function getBoardName() {
  const board = await prisma.board.findFirst({ select: { name: true } });
  return board?.name ?? "Мои задачи";
}
