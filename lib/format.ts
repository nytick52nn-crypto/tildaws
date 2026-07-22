// dueDate хранится как введённые пользователем числа "как есть" (см. lib/actions.ts),
// поэтому показываем их через UTC-геттеры, а не через локальный часовой пояс браузера.
export function formatDueDate(value: Date | string) {
  const d = new Date(value);
  return d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

export function formatDueTime(value: Date | string) {
  const d = new Date(value);
  return d.toLocaleString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}
