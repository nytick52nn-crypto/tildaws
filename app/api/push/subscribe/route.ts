import { NextResponse } from "next/server";
import { saveSubscription } from "@/lib/push";

// Эти роуты дёргаются из браузера, поэтому "секрет" тут не настоящий (виден
// в сетевых запросах со страницы) — задача не в защите от владельца устройства,
// а в том, чтобы случайный сканер интернета не наткнулся на голый POST-эндпоинт.
function isAuthorized(request: Request) {
  const header = request.headers.get("x-push-token");
  return Boolean(header) && header === process.env.NEXT_PUBLIC_PUSH_TOKEN;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  if (!body?.endpoint || !body?.keys?.p256dh || !body?.keys?.auth) {
    return NextResponse.json({ error: "invalid subscription" }, { status: 400 });
  }

  await saveSubscription(body);
  return NextResponse.json({ ok: true });
}
