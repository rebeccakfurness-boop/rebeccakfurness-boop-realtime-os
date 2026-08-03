"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireStaff() {
  const session = await auth();
  if (!session?.user || session.user.role !== "staff") throw new Error("Staff only");
  return session.user;
}

export async function startTimer(input: { orgId?: string; taskId?: string; note?: string }) {
  const user = await requireStaff();
  const existing = await prisma.timeEntry.findFirst({ where: { userId: user.id, endTime: null } });
  if (existing) throw new Error("A timer is already running, stop it first.");

  await prisma.timeEntry.create({
    data: { userId: user.id, orgId: input.orgId || undefined, taskId: input.taskId || undefined, note: input.note, startTime: new Date() },
  });
  revalidatePath("/staff");
}

export async function stopTimer(input: { entryId: string; note?: string }) {
  await requireStaff();
  const entry = await prisma.timeEntry.findUnique({ where: { id: input.entryId } });
  if (!entry) return;

  const endTime = new Date();
  const durationSeconds = Math.max(0, Math.round((endTime.getTime() - entry.startTime.getTime()) / 1000));
  await prisma.timeEntry.update({
    where: { id: input.entryId },
    data: { endTime, durationSeconds, note: input.note ?? entry.note },
  });
  revalidatePath("/staff");
  revalidatePath("/staff/time");
}

export async function createManualEntry(input: {
  orgId?: string;
  taskId?: string;
  note?: string;
  date: string;
  hours: number;
  minutes: number;
}) {
  const user = await requireStaff();
  const durationSeconds = input.hours * 3600 + input.minutes * 60;
  const startTime = new Date(input.date);
  const endTime = new Date(startTime.getTime() + durationSeconds * 1000);

  await prisma.timeEntry.create({
    data: {
      userId: user.id,
      orgId: input.orgId || undefined,
      taskId: input.taskId || undefined,
      note: input.note,
      startTime,
      endTime,
      durationSeconds,
    },
  });
  revalidatePath("/staff/time");
}
