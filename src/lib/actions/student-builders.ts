"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createAiClient } from "@/lib/integrations/ai";
import { EMPTY_CV, EMPTY_APPLICATION, EMPTY_COVER_LETTER } from "@/lib/student-content-types";
import type { CvContent, ApplicationContent, CoverLetterContent } from "@/lib/student-content-types";

async function requireStudent() {
  const session = await auth();
  if (!session?.user || session.user.role !== "student") throw new Error("Student only");
  return session.user;
}

export async function polishDraft(input: { content: string }) {
  await requireStudent();
  if (!input.content.trim()) return { content: "", usedRealAi: false };
  const client = createAiClient();
  return client.polishText({ content: input.content });
}

// --- CV -----------------------------------------------------------------

export async function getOrCreateCv() {
  const user = await requireStudent();
  const existing = await prisma.cvDocument.findFirst({ where: { studentId: user.id }, orderBy: { createdAt: "asc" } });
  if (existing) return { id: existing.id, content: existing.structuredContent as unknown as CvContent };

  const created = await prisma.cvDocument.create({
    data: {
      studentId: user.id,
      structuredContent: { ...EMPTY_CV, fullName: user.name ?? "", email: user.email ?? "" } as unknown as object,
    },
  });
  return { id: created.id, content: created.structuredContent as unknown as CvContent };
}

export async function updateCv(input: { cvId: string; content: CvContent }) {
  const user = await requireStudent();
  const cv = await prisma.cvDocument.findUnique({ where: { id: input.cvId } });
  if (!cv || cv.studentId !== user.id) throw new Error("Not found");
  await prisma.cvDocument.update({ where: { id: input.cvId }, data: { structuredContent: input.content as unknown as object } });
  revalidatePath("/student/cv-builder");
}

// --- Scholarship application builder ------------------------------------

export async function listApplications() {
  const user = await requireStudent();
  return prisma.applicationDocument.findMany({ where: { studentId: user.id }, orderBy: { updatedAt: "desc" } });
}

export async function getApplication(input: { applicationId: string }) {
  const user = await requireStudent();
  const application = await prisma.applicationDocument.findUnique({ where: { id: input.applicationId } });
  if (!application || application.studentId !== user.id) return null;
  return application;
}

export async function createApplication() {
  const user = await requireStudent();
  const created = await prisma.applicationDocument.create({
    data: { studentId: user.id, structuredContent: EMPTY_APPLICATION as unknown as object },
  });
  revalidatePath("/student/application-builder");
  return { id: created.id };
}

export async function updateApplication(input: { applicationId: string; content: ApplicationContent }) {
  const user = await requireStudent();
  const application = await prisma.applicationDocument.findUnique({ where: { id: input.applicationId } });
  if (!application || application.studentId !== user.id) throw new Error("Not found");
  await prisma.applicationDocument.update({
    where: { id: input.applicationId },
    data: { structuredContent: input.content as unknown as object },
  });
  revalidatePath(`/student/application-builder/${input.applicationId}`);
}

export async function deleteApplication(input: { applicationId: string }) {
  const user = await requireStudent();
  const application = await prisma.applicationDocument.findUnique({ where: { id: input.applicationId } });
  if (!application || application.studentId !== user.id) throw new Error("Not found");
  await prisma.applicationDocument.delete({ where: { id: input.applicationId } });
  revalidatePath("/student/application-builder");
}

// --- Cover letter builder -------------------------------------------------

export async function listCoverLetters() {
  const user = await requireStudent();
  return prisma.coverLetter.findMany({ where: { studentId: user.id }, orderBy: { updatedAt: "desc" } });
}

export async function getCoverLetter(input: { coverLetterId: string }) {
  const user = await requireStudent();
  const coverLetter = await prisma.coverLetter.findUnique({ where: { id: input.coverLetterId } });
  if (!coverLetter || coverLetter.studentId !== user.id) return null;
  return coverLetter;
}

export async function createCoverLetter() {
  const user = await requireStudent();
  const created = await prisma.coverLetter.create({
    data: { studentId: user.id, structuredContent: EMPTY_COVER_LETTER as unknown as object },
  });
  revalidatePath("/student/cover-letter-builder");
  return { id: created.id };
}

export async function updateCoverLetter(input: { coverLetterId: string; content: CoverLetterContent }) {
  const user = await requireStudent();
  const coverLetter = await prisma.coverLetter.findUnique({ where: { id: input.coverLetterId } });
  if (!coverLetter || coverLetter.studentId !== user.id) throw new Error("Not found");
  await prisma.coverLetter.update({
    where: { id: input.coverLetterId },
    data: { structuredContent: input.content as unknown as object },
  });
  revalidatePath(`/student/cover-letter-builder/${input.coverLetterId}`);
}

export async function deleteCoverLetter(input: { coverLetterId: string }) {
  const user = await requireStudent();
  const coverLetter = await prisma.coverLetter.findUnique({ where: { id: input.coverLetterId } });
  if (!coverLetter || coverLetter.studentId !== user.id) throw new Error("Not found");
  await prisma.coverLetter.delete({ where: { id: input.coverLetterId } });
  revalidatePath("/student/cover-letter-builder");
}
