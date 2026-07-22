import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fakeUtcNow } from "@/lib/dueDate";
import { sendPushToAll } from "@/lib/push";

const LOOKBACK_MS = 30 * 60_000; // 30 минут — запас на случай пропущенных/поздних тиков

function isAuthorized(request: Request) {
  const header = request.headers.get("authorization");
  return header === `Bearer ${process.env.CRON_SECRET}`;
}

function offsetLabel(offsetMinutes: number): string {
  if (offsetMinutes <= 0) return "Сейчас";
  if (offsetMinutes < 60) return `Через ${offsetMinutes} мин`;
  if (offsetMinutes < 24 * 60) return "Через час";
  return "Через день";
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const now = fakeUtcNow();
  const windowStart = new Date(now.getTime() - LOOKBACK_MS);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const pending = await prisma.reminder.findMany({
    where: { sentAt: null, task: { dueDate: { not: null } } },
    include: { task: { include: { taskLabels: { include: { label: true } } } } },
  });

  let sentCount = 0;

  for (const reminder of pending) {
    const dueDate = reminder.task.dueDate;
    if (!dueDate) continue;

    const fireAt = new Date(dueDate.getTime() - reminder.offsetMinutes * 60_000);
    if (fireAt < windowStart || fireAt > now) continue;

    const labelNames = reminder.task.taskLabels.map((tl) => tl.label.name);

    await sendPushToAll({
      title: `${offsetLabel(reminder.offsetMinutes)}: ${reminder.task.title}`,
      body: labelNames.length > 0 ? labelNames.join(", ") : "Наступает время задачи",
      url: `${siteUrl}/task/${reminder.task.id}`,
    });

    await prisma.reminder.update({
      where: { id: reminder.id },
      data: { sentAt: new Date() },
    });

    sentCount += 1;
  }

  return NextResponse.json({ checked: pending.length, sent: sentCount });
}
