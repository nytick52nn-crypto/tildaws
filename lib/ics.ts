import type { TaskWithDueDate } from "@/lib/data";

export function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\r|\n/g, "\\n");
}

function utf8Length(s: string): number {
  return new TextEncoder().encode(s).length;
}

// RFC5545 §3.1: строки длиннее 75 октетов сворачиваются через CRLF + пробел,
// который при разборе игнорируется (не часть содержимого).
export function foldLine(line: string): string {
  const maxOctets = 75;
  if (utf8Length(line) <= maxOctets) return line;

  let result = "";
  let currentOctets = 0;
  let isFirstPhysicalLine = true;

  for (const ch of line) {
    const chOctets = utf8Length(ch);
    const limit = isFirstPhysicalLine ? maxOctets : maxOctets - 1; // -1 за пробел-продолжение
    if (currentOctets + chOctets > limit) {
      result += "\r\n ";
      currentOctets = 0;
      isFirstPhysicalLine = false;
    }
    result += ch;
    currentOctets += chOctets;
  }

  return result;
}

// Цифры "как ввёл пользователь" (см. lib/dueDate.ts) — просто переклеиваем
// ярлык часового пояса TZID=Europe/Moscow, без пересчёта смещения.
function toIcsLocalDateTime(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  const ss = String(date.getUTCSeconds()).padStart(2, "0");
  return `${y}${m}${d}T${hh}${mm}${ss}`;
}

// DTSTAMP, в отличие от DTSTART, — реальный момент генерации фида в UTC.
function toIcsUtcDateTime(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function uidDomain(siteUrl: string): string {
  try {
    return new URL(siteUrl).host || "tasks.local";
  } catch {
    return "tasks.local";
  }
}

// RFC5545: 1 (высший) .. 9 (низший), 0/отсутствует — не задан.
const ICS_PRIORITY: Record<string, number> = {
  urgent: 1,
  high: 3,
  medium: 5,
  low: 9,
};

export function buildIcsFeed(
  tasks: TaskWithDueDate[],
  boardName: string,
  siteUrl: string
): string {
  const now = new Date();
  const domain = uidDomain(siteUrl);
  const lines: string[] = [];

  lines.push("BEGIN:VCALENDAR");
  lines.push("VERSION:2.0");
  lines.push("PRODID:-//tildaws//task-tracker//RU");
  lines.push("CALSCALE:GREGORIAN");
  lines.push(`X-WR-CALNAME:${escapeIcsText(boardName)}`);
  lines.push("X-WR-TIMEZONE:Europe/Moscow");

  // Москва — фиксированный UTC+3 без перевода стрелок с 2014 года (тот же факт,
  // что зашит как TASK_TZ_OFFSET_MINUTES в lib/dueDate.ts), поэтому VTIMEZONE —
  // один статичный STANDARD-блок без RRULE/RDATE.
  lines.push("BEGIN:VTIMEZONE");
  lines.push("TZID:Europe/Moscow");
  lines.push("BEGIN:STANDARD");
  lines.push("DTSTART:19700101T000000");
  lines.push("TZOFFSETFROM:+0300");
  lines.push("TZOFFSETTO:+0300");
  lines.push("TZNAME:MSK");
  lines.push("END:STANDARD");
  lines.push("END:VTIMEZONE");

  for (const task of tasks) {
    if (!task.dueDate) continue;
    const due = new Date(task.dueDate);

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${task.id}@${domain}`);
    lines.push(`DTSTAMP:${toIcsUtcDateTime(now)}`);
    lines.push(`DTSTART;TZID=Europe/Moscow:${toIcsLocalDateTime(due)}`);
    lines.push("DURATION:PT30M");
    lines.push(`SUMMARY:${escapeIcsText(task.title)}`);
    if (task.description) {
      lines.push(`DESCRIPTION:${escapeIcsText(task.description)}`);
    }
    if (task.priority && ICS_PRIORITY[task.priority]) {
      lines.push(`PRIORITY:${ICS_PRIORITY[task.priority]}`);
    }
    const labelNames = task.taskLabels.map((tl) => tl.label.name);
    if (labelNames.length > 0) {
      lines.push(`CATEGORIES:${labelNames.map(escapeIcsText).join(",")}`);
    }
    if (siteUrl) {
      lines.push(`URL:${siteUrl}/task/${task.id}`);
    }
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");

  return lines.map(foldLine).join("\r\n") + "\r\n";
}
