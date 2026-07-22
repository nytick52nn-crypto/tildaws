import { NextResponse } from "next/server";
import { getBoardName, getTasksWithDueDate } from "@/lib/data";
import { buildIcsFeed } from "@/lib/ics";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const expected = process.env.ICS_FEED_TOKEN;

  if (!expected || token !== expected) {
    return new NextResponse("Not found", { status: 404 });
  }

  const [tasks, boardName] = await Promise.all([
    getTasksWithDueDate(),
    getBoardName(),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const ics = buildIcsFeed(tasks, boardName, siteUrl);

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="tasks.ics"',
      "Cache-Control": "public, max-age=300",
    },
  });
}
