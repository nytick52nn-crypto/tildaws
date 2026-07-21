import { prisma } from "@/lib/db";

export async function getBoard() {
  return prisma.board.findFirst({
    include: {
      columns: {
        orderBy: { order: "asc" },
        include: {
          tasks: { orderBy: { order: "asc" } },
        },
      },
    },
  });
}

export type BoardWithColumns = NonNullable<Awaited<ReturnType<typeof getBoard>>>;
