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

export type CreateTaskInput = {
  columnId: string;
  title: string;
  description?: string;
  dueDate?: string;
  tag?: string;
};

export type UpdateTaskInput = {
  title: string;
  description?: string;
  dueDate?: string;
  tag?: string;
};

export async function createTask(input: CreateTaskInput) {
  const title = input.title.trim();
  if (!title) throw new Error("Название задачи обязательно");

  const last = await prisma.task.findFirst({
    where: { columnId: input.columnId },
    orderBy: { order: "desc" },
  });

  const task = await prisma.task.create({
    data: {
      columnId: input.columnId,
      title,
      description: input.description?.trim() || null,
      dueDate: parseDueDate(input.dueDate),
      tag: input.tag?.trim() || null,
      order: (last?.order ?? -1) + 1,
    },
  });

  revalidatePath("/");
  return task;
}

export async function updateTask(taskId: string, input: UpdateTaskInput) {
  const title = input.title.trim();
  if (!title) throw new Error("Название задачи обязательно");

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      title,
      description: input.description?.trim() || null,
      dueDate: parseDueDate(input.dueDate),
      tag: input.tag?.trim() || null,
    },
  });

  revalidatePath("/");
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
