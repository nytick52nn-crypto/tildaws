// dueDate хранится как введённые пользователем числа "как есть" (см. parseDueDate
// в lib/actions.ts, formatDueDate в lib/format.ts) — это не настоящий UTC-момент,
// а "цифры, помеченные как UTC". Поэтому любое сравнение с "текущим моментом"
// (напоминания, agenda-вид "что сегодня") нужно делать в том же виртуальном UTC,
// сдвинутом на реальное смещение часового пояса пользователя — иначе получится
// сдвиг на TASK_TZ_OFFSET_MINUTES относительно того, что человек реально имел в виду.
export const TASK_TZ_OFFSET_MINUTES = 180; // Москва, UTC+3, без перевода стрелок

export function fakeUtcNow(): Date {
  return new Date(Date.now() + TASK_TZ_OFFSET_MINUTES * 60_000);
}
