import webpush from "web-push";
import { prisma } from "@/lib/db";

// dueDate хранится как введённые пользователем числа "как есть" (см. lib/actions.ts),
// поэтому сравнение с "текущим моментом" нужно делать в том же "виртуальном UTC",
// сдвинутом на реальное смещение часового пояса пользователя.
export const TASK_TZ_OFFSET_MINUTES = 180; // Москва, UTC+3, без перевода стрелок

export function fakeUtcNow(): Date {
  return new Date(Date.now() + TASK_TZ_OFFSET_MINUTES * 60_000);
}

let vapidConfigured = false;

function ensureVapidConfigured() {
  if (vapidConfigured) return;

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;

  if (!publicKey || !privateKey || !subject) {
    throw new Error("VAPID-ключи не настроены (см. .env.example)");
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  vapidConfigured = true;
}

export async function saveSubscription(sub: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}) {
  await prisma.pushSubscription.upsert({
    where: { endpoint: sub.endpoint },
    create: {
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
    },
    update: {
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
    },
  });
}

export async function deleteSubscriptionByEndpoint(endpoint: string) {
  await prisma.pushSubscription.deleteMany({ where: { endpoint } });
}

export async function sendPushToAll(payload: {
  title: string;
  body: string;
  url: string;
}) {
  ensureVapidConfigured();

  const subscriptions = await prisma.pushSubscription.findMany();
  const json = JSON.stringify(payload);

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        json
      )
    )
  );

  await Promise.all(
    results.map(async (result, i) => {
      if (result.status !== "rejected") return;
      const statusCode = (result.reason as { statusCode?: number })?.statusCode;
      if (statusCode === 404 || statusCode === 410) {
        await deleteSubscriptionByEndpoint(subscriptions[i].endpoint);
      }
    })
  );

  return {
    sent: results.filter((r) => r.status === "fulfilled").length,
    total: subscriptions.length,
  };
}
