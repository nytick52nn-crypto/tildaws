import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fakeUtcNow } from "@/lib/dueDate";
import { sendPushToAll } from "@/lib/push";

const LOOKBACK_MS = 30 * 60_000; // 30 минут — запас на случай пропущенных/поздних тиков

function isAuthorized(request: Request) {
  const header = request.headers.get("authorization");
  return header === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const now = fakeUtcNow();
  const windowStart = new Date(now.getTime() - LOOKBACK_MS);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const dueTasks = await prisma.task.findMany({
    where: {
      dueDate: { gte: windowStart, lte: now },
      reminderSentAt: null,
    },
  });

  for (const task of dueTasks) {
    await sendPushToAll({
      title: task.title,
      body: task.tag ? `Тег: ${task.tag}` : "Наступило время задачи",
      url: `${siteUrl}/task/${task.id}`,
    });

    await prisma.task.update({
      where: { id: task.id },
      data: { reminderSentAt: new Date() },
    });
  }

  return NextResponse.json({ checked: dueTasks.length });
}
