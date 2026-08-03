"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createAiClient } from "@/lib/integrations/ai";
import type { DocumentType } from "@prisma/client";

const MAX_KEPT_VERSIONS = 10;

async function requireStaff() {
  const session = await auth();
  if (!session?.user || session.user.role !== "staff") throw new Error("Staff only");
  return session.user;
}

export async function createDocument(input: {
  title: string;
  type: DocumentType;
  content: string;
  isTemplate: boolean;
  variables?: string[];
}) {
  const user = await requireStaff();
  const doc = await prisma.document.create({
    data: {
      title: input.title,
      type: input.type,
      content: input.content,
      isTemplate: input.isTemplate,
      variables: input.variables && input.variables.length > 0 ? input.variables : undefined,
      createdById: user.id,
    },
  });
  revalidatePath("/staff/documents");
  return { id: doc.id };
}

/**
 * Snapshots the document's current content into DocumentVersion, then writes
 * the new content as the live version. Keeps at most MAX_KEPT_VERSIONS history
 * rows per document, pruning the oldest first.
 */
async function snapshotAndUpdate(documentId: string, newContent: string, newVariables?: string[]) {
  const doc = await prisma.document.findUnique({ where: { id: documentId } });
  if (!doc) throw new Error("Document not found");

  await prisma.documentVersion.create({
    data: { documentId, version: doc.version, content: doc.content, variables: doc.variables ?? undefined },
  });

  await prisma.document.update({
    where: { id: documentId },
    data: {
      content: newContent,
      variables: newVariables && newVariables.length > 0 ? newVariables : undefined,
      version: doc.version + 1,
    },
  });

  const oldVersions = await prisma.documentVersion.findMany({
    where: { documentId },
    orderBy: { version: "desc" },
    skip: MAX_KEPT_VERSIONS,
    select: { id: true },
  });
  if (oldVersions.length > 0) {
    await prisma.documentVersion.deleteMany({ where: { id: { in: oldVersions.map((v) => v.id) } } });
  }
}

export async function updateDocumentContent(input: { documentId: string; content: string; variables?: string[] }) {
  await requireStaff();
  await snapshotAndUpdate(input.documentId, input.content, input.variables);
  revalidatePath(`/staff/documents/${input.documentId}`);
  revalidatePath("/staff/documents");
}

export async function revertToVersion(input: { documentId: string; versionId: string }) {
  await requireStaff();
  const version = await prisma.documentVersion.findUnique({ where: { id: input.versionId } });
  if (!version || version.documentId !== input.documentId) throw new Error("Version not found");

  await snapshotAndUpdate(input.documentId, version.content, (version.variables as string[] | null) ?? undefined);
  revalidatePath(`/staff/documents/${input.documentId}`);
}

export async function setPublicResource(input: { documentId: string; isPublicResource: boolean }) {
  await requireStaff();
  await prisma.document.update({ where: { id: input.documentId }, data: { isPublicResource: input.isPublicResource } });
  revalidatePath(`/staff/documents/${input.documentId}`);
  revalidatePath("/student/resources");
  revalidatePath("/business/resources");
}

export async function deleteDocument(input: { documentId: string }) {
  await requireStaff();
  await prisma.document.delete({ where: { id: input.documentId } });
  revalidatePath("/staff/documents");
}

export async function linkDocumentToOrg(input: { documentId: string; orgId: string }) {
  await requireStaff();
  await prisma.documentLink.upsert({
    where: { documentId_orgId: { documentId: input.documentId, orgId: input.orgId } },
    create: { documentId: input.documentId, orgId: input.orgId },
    update: {},
  });
  revalidatePath(`/staff/documents/${input.documentId}`);
  revalidatePath(`/staff/crm/${input.orgId}`);
}

export async function unlinkDocumentFromOrg(input: { documentId: string; orgId: string }) {
  await requireStaff();
  await prisma.documentLink.delete({
    where: { documentId_orgId: { documentId: input.documentId, orgId: input.orgId } },
  });
  revalidatePath(`/staff/documents/${input.documentId}`);
  revalidatePath(`/staff/crm/${input.orgId}`);
}

export async function previewAiRewrite(input: { documentId: string; customerContext: string }) {
  await requireStaff();
  const doc = await prisma.document.findUnique({ where: { id: input.documentId } });
  if (!doc) throw new Error("Document not found");

  const client = createAiClient();
  const result = await client.rewriteWithBrandVoice({ templateContent: doc.content, customerContext: input.customerContext });
  return result;
}

export async function applyAiRewrite(input: { documentId: string; content: string }) {
  await requireStaff();
  await snapshotAndUpdate(input.documentId, input.content);
  revalidatePath(`/staff/documents/${input.documentId}`);
}
