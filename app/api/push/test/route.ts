import { NextResponse } from "next/server";
import { sendPushToAll } from "@/lib/push";

// См. комментарий в app/api/push/subscribe/route.ts про природу этого "секрета".
function isAuthorized(request: Request) {
  const header = request.headers.get("x-push-token");
  return Boolean(header) && header === process.env.NEXT_PUBLIC_PUSH_TOKEN;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await sendPushToAll({
    title: "Тестовое уведомление",
    body: "Пуш работает ✅",
    url: "/",
  });

  return NextResponse.json(result);
}
