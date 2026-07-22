import { NextResponse } from "next/server";
import { deleteSubscriptionByEndpoint } from "@/lib/push";

// См. комментарий в app/api/push/subscribe/route.ts про природу этого "секрета".
function isAuthorized(request: Request) {
  const header = request.headers.get("x-push-token");
  return Boolean(header) && header === process.env.NEXT_PUBLIC_PUSH_TOKEN;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  if (!body?.endpoint) {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  await deleteSubscriptionByEndpoint(body.endpoint);
  return NextResponse.json({ ok: true });
}
