"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Доска" },
  { href: "/agenda", label: "Календарь" },
];

export default function ViewTabs() {
  const pathname = usePathname();

  return (
    <div className="flex gap-3 text-xs">
      {TABS.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={
              isActive
                ? "text-accent font-medium"
                : "text-neutral-400 hover:text-neutral-700 dark:text-neutral-600 dark:hover:text-neutral-300"
            }
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
