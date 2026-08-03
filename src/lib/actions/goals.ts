"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { GoalCategory, TaskStatus } from "@prisma/client";

async function requireUser() {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");
  return session.user;
}

export async function createGoal(input: {
  title: string;
  description?: string;
  category: GoalCategory;
  targetDate?: string;
  path: string;
}) {
  const user = await requireUser();
  await prisma.goal.create({
    data: {
      ownerType: user.role === "staff" ? "staff" : "student",
      ownerUserId: user.id,
      title: input.title,
      description: input.description || undefined,
      category: input.category,
      targetDate: input.targetDate ? new Date(input.targetDate) : undefined,
    },
  });
  revalidatePath(input.path);
}

export async function createTask(input: { goalId: string; title: string; assigneeId?: string; dueDate?: string; path: string }) {
  await requireUser();
  const maxOrder = await prisma.task.aggregate({ where: { goalId: input.goalId }, _max: { orderIndex: true } });
  await prisma.task.create({
    data: {
      goalId: input.goalId,
      title: input.title,
      assigneeId: input.assigneeId || undefined,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      orderIndex: (maxOrder._max.orderIndex ?? -1) + 1,
    },
  });
  revalidatePath(input.path);
}

export async function setTaskStatus(input: { taskId: string; status: TaskStatus; path: string }) {
  await requireUser();
  await prisma.task.update({
    where: { id: input.taskId },
    data: {
      status: input.status,
      completedAt: input.status === "done" ? new Date() : null,
    },
  });
  revalidatePath(input.path);
}

export async function reassignTask(input: { taskId: string; assigneeId: string | null; path: string }) {
  await requireUser();
  await prisma.task.update({ where: { id: input.taskId }, data: { assigneeId: input.assigneeId } });
  revalidatePath(input.path);
}

export async function reorderTasks(input: { taskIds: string[]; path: string }) {
  await requireUser();
  await prisma.$transaction(
    input.taskIds.map((id, index) => prisma.task.update({ where: { id }, data: { orderIndex: index } })),
  );
  revalidatePath(input.path);
}

export async function deleteGoal(input: { goalId: string; path: string }) {
  await requireUser();
  await prisma.goal.delete({ where: { id: input.goalId } });
  revalidatePath(input.path);
}
