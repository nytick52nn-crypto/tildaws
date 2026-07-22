"use client";

import { useState } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

async function pushFetch(path: string, body: unknown) {
  return fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-push-token": process.env.NEXT_PUBLIC_PUSH_TOKEN ?? "",
    },
    body: JSON.stringify(body),
  });
}

export default function PushManager() {
  const [status, setStatus] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleEnable() {
    setBusy(true);
    setStatus(null);
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setStatus("Браузер не поддерживает push-уведомления");
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("Уведомления не разрешены");
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) {
        setStatus("VAPID-ключ не настроен");
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const res = await pushFetch("/api/push/subscribe", subscription.toJSON());
      if (!res.ok) throw new Error("Сервер отклонил подписку");

      setSubscribed(true);
      setStatus("Уведомления включены");
    } catch (err) {
      setStatus(`Ошибка: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleTest() {
    setBusy(true);
    setStatus(null);
    try {
      const res = await pushFetch("/api/push/test", {});
      const data = await res.json();
      setStatus(res.ok ? `Отправлено на ${data.sent}/${data.total} устройств` : "Ошибка отправки");
    } catch (err) {
      setStatus(`Ошибка: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <button
        type="button"
        onClick={handleEnable}
        disabled={busy}
        className="rounded-lg border border-neutral-200 px-3 py-1.5 text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-700 disabled:opacity-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
      >
        🔔 {subscribed ? "Уведомления включены" : "Включить уведомления"}
      </button>
      <button
        type="button"
        onClick={handleTest}
        disabled={busy}
        className="rounded-lg border border-neutral-200 px-3 py-1.5 text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-700 disabled:opacity-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
      >
        📨 Тестовый пуш
      </button>
      {status && <span className="text-neutral-400 dark:text-neutral-600">{status}</span>}
    </div>
  );
}
