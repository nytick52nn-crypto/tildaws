"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Значение из <input type="datetime-local"> ("YYYY-MM-DDTHH:mm") трактуем как
// введённые пользователем числа "как есть", без конвертации через часовой пояс
// сервера — иначе 15:00, введённые в браузере, могли бы сохраниться как другое время.
function parseDueDate(value?: string): Date | null {
  if (!value) return null;
  return new Date(`${value}:00Z`);
}

export type Priority = "low" | "medium" | "high" | "urgent";
const VALID_PRIORITIES: Priority[] = ["low", "medium", "high", "urgent"];

function parsePriority(value?: string): Priority | null {
  if (!value) return null;
  return (VALID_PRIORITIES as string[]).includes(value) ? (value as Priority) : null;
}

const LABEL_COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ec4899", "#06b6d4", "#84cc16"];

function colorForLabel(name: string): string {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return LABEL_COLORS[hash % LABEL_COLORS.length];
}

function parseLabelNames(raw?: string): string[] {
  if (!raw) return [];
  const names = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return Array.from(new Set(names));
}

async function syncTaskLabels(taskId: string, labelNames: string[]) {
  await prisma.taskLabel.deleteMany({ where: { taskId } });
  for (const name of labelNames) {
    const label = await prisma.label.upsert({
      where: { name },
      create: { name, color: colorForLabel(name) },
      update: {},
    });
    await prisma.taskLabel.create({ data: { taskId, labelId: label.id } });
  }
}

async function syncTaskReminders(taskId: string, dueDate: Date | null, offsets: number[]) {
  await prisma.reminder.deleteMany({ where: { taskId } });
  if (!dueDate) return;
  for (const offsetMinutes of offsets) {
    await prisma.reminder.create({ data: { taskId, offsetMinutes } });
  }
}

export type CreateTaskInput = {
  columnId: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority?: string;
  labels?: string;
  reminderOffsets?: number[];
};

export type UpdateTaskInput = {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: string;
  labels?: string;
  reminderOffsets?: number[];
};

export async function createTask(input: CreateTaskInput) {
  const title = input.title.trim();
  if (!title) throw new Error("Название задачи обязательно");

  const last = await prisma.task.findFirst({
    where: { columnId: input.columnId },
    orderBy: { order: "desc" },
  });

  const dueDate = parseDueDate(input.dueDate);

  const task = await prisma.task.create({
    data: {
      columnId: input.columnId,
      title,
      description: input.description?.trim() || null,
      dueDate,
      priority: parsePriority(input.priority),
      order: (last?.order ?? -1) + 1,
    },
  });

  await syncTaskLabels(task.id, parseLabelNames(input.labels));
  await syncTaskReminders(task.id, dueDate, input.reminderOffsets ?? []);

  revalidatePath("/");
  return task;
}

export async function updateTask(taskId: string, input: UpdateTaskInput) {
  const title = input.title.trim();
  if (!title) throw new Error("Название задачи обязательно");

  const dueDate = parseDueDate(input.dueDate);

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      title,
      description: input.description?.trim() || null,
      dueDate,
      priority: parsePriority(input.priority),
    },
  });

  await syncTaskLabels(taskId, parseLabelNames(input.labels));
  await syncTaskReminders(taskId, dueDate, input.reminderOffsets ?? []);

  revalidatePath("/");
  revalidatePath(`/task/${taskId}`);
  return task;
}

export async function moveTask(taskId: string, toColumnId: string) {
  const last = await prisma.task.findFirst({
    where: { columnId: toColumnId },
    orderBy: { order: "desc" },
  });

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      columnId: toColumnId,
      order: (last?.order ?? -1) + 1,
    },
  });

  revalidatePath("/");
  return task;
}

export async function deleteTask(taskId: string) {
  await prisma.task.delete({ where: { id: taskId } });
  revalidatePath("/");
}

export type AddCommentInput = {
  taskId: string;
  authorName?: string;
  body: string;
};

export async function addComment(input: AddCommentInput) {
  const body = input.body.trim();
  if (!body) throw new Error("Комментарий не может быть пустым");

  const comment = await prisma.comment.create({
    data: {
      taskId: input.taskId,
      authorName: input.authorName?.trim() || "Гость",
      body,
    },
  });

  revalidatePath(`/task/${input.taskId}`);
  return comment;
}

export type AddSubtaskInput = {
  taskId: string;
  title: string;
};

export async function addSubtask(input: AddSubtaskInput) {
  const title = input.title.trim();
  if (!title) throw new Error("Название пункта обязательно");

  const last = await prisma.subtask.findFirst({
    where: { taskId: input.taskId },
    orderBy: { order: "desc" },
  });

  const subtask = await prisma.subtask.create({
    data: {
      taskId: input.taskId,
      title,
      order: (last?.order ?? -1) + 1,
    },
  });

  revalidatePath(`/task/${input.taskId}`);
  revalidatePath("/");
  return subtask;
}

export async function toggleSubtask(id: string) {
  const subtask = await prisma.subtask.findUnique({ where: { id } });
  if (!subtask) throw new Error("Пункт не найден");

  const updated = await prisma.subtask.update({
    where: { id },
    data: { done: !subtask.done },
  });

  revalidatePath(`/task/${subtask.taskId}`);
  revalidatePath("/");
  return updated;
}

export async function deleteSubtask(id: string) {
  const subtask = await prisma.subtask.delete({ where: { id } });
  revalidatePath(`/task/${subtask.taskId}`);
  revalidatePath("/");
}
