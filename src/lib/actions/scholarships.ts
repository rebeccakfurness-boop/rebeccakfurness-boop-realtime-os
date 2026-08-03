"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireStudent() {
  const session = await auth();
  if (!session?.user || session.user.role !== "student") throw new Error("Student only");
  return session.user;
}

export async function toggleBookmark(input: { scholarshipId: string }) {
  const user = await requireStudent();
  const existing = await prisma.studentBookmark.findUnique({
    where: { studentId_scholarshipId: { studentId: user.id, scholarshipId: input.scholarshipId } },
  });

  if (existing) {
    await prisma.studentBookmark.delete({
      where: { studentId_scholarshipId: { studentId: user.id, scholarshipId: input.scholarshipId } },
    });
  } else {
    await prisma.studentBookmark.create({ data: { studentId: user.id, scholarshipId: input.scholarshipId } });
  }

  revalidatePath("/student/scholarships");
}
