"use client";

import { useState } from "react";
import { pushDataLayerEvent } from "@/lib/analytics";

export default function CopyLinkButton({ taskId }: { taskId: string }) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    await navigator.clipboard.writeText(window.location.href);
    pushDataLayerEvent({ event: "task_shared", task_id: taskId });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-700 dark:border-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
    >
      {copied ? "Скопировано!" : "🔗 Скопировать ссылку"}
    </button>
  );
}
