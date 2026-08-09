"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createGmailClient } from "@/lib/integrations/gmail";
import { createStorageClient } from "@/lib/integrations/storage";
import type { OrgType, PipelineStage, PaidStatus } from "@prisma/client";

async function requireStaff() {
  const session = await auth();
  if (!session?.user || session.user.role !== "staff") throw new Error("Staff only");
  return session.user;
}

export async function createOrganisation(input: { name: string; type: OrgType; region?: string; source?: string }) {
  await requireStaff();
  const org = await prisma.organisation.create({
    data: { name: input.name, type: input.type, region: input.region || undefined, source: input.source || undefined },
  });
  await prisma.activity.create({ data: { orgId: org.id, type: "note", summary: "Customer card created." } });
  revalidatePath("/staff/crm");
  return { id: org.id };
}

export async function updateOrganisation(input: {
  orgId: string;
  name?: string;
  type?: OrgType;
  region?: string;
  status?: string;
  notes?: string;
  pipelineStage?: PipelineStage;
  dealValueNzd?: number;
  invoiced?: boolean;
  paidStatus?: PaidStatus;
}) {
  await requireStaff();
  const { orgId, ...data } = input;
  await prisma.organisation.update({ where: { id: orgId }, data });
  revalidatePath(`/staff/crm/${orgId}`);
  revalidatePath("/staff/pipeline");
  revalidatePath("/staff/crm");
}

export async function createContact(input: { orgId: string; name: string; title?: string; email?: string; phone?: string }) {
  await requireStaff();
  await prisma.contact.create({
    data: { orgId: input.orgId, name: input.name, title: input.title, email: input.email, phone: input.phone },
  });
  await prisma.activity.create({ data: { orgId: input.orgId, type: "note", summary: `Added contact: ${input.name}.` } });
  revalidatePath(`/staff/crm/${input.orgId}`);
}

export async function addNote(input: { orgId: string; note: string }) {
  await requireStaff();
  await prisma.activity.create({ data: { orgId: input.orgId, type: "note", summary: input.note } });
  revalidatePath(`/staff/crm/${input.orgId}`);
}

export async function syncGmail(input: { orgId: string }) {
  await requireStaff();
  const contacts = await prisma.contact.findMany({ where: { orgId: input.orgId, email: { not: null } } });
  const addresses = contacts.map((c) => c.email!).filter(Boolean);
  if (addresses.length === 0) return;

  const client = createGmailClient();
  const messages = await client.listMessagesForAddresses(addresses);

  const contactByEmail = new Map(contacts.map((c) => [c.email, c]));
  await prisma.$transaction(
    messages.map((m) =>
      prisma.email.create({
        data: {
          orgId: input.orgId,
          contactId: contactByEmail.get(m.contactEmail)?.id,
          subject: m.subject,
          body: m.body,
          direction: m.direction,
          timestamp: m.timestamp,
        },
      }),
    ),
  );
  await prisma.activity.create({
    data: { orgId: input.orgId, type: "email", summary: `Synced ${messages.length} email(s) from Gmail.` },
  });
  revalidatePath(`/staff/crm/${input.orgId}`);
}

export async function uploadDocumentFile(formData: FormData) {
  const user = await requireStaff();
  const orgId = String(formData.get("orgId"));
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "Choose a file first." };

  const bytes = Buffer.from(await file.arrayBuffer());
  const { url } = await createStorageClient().uploadFile({ filename: file.name, buffer: bytes, contentType: file.type });

  const doc = await prisma.document.create({
    data: {
      title: file.name,
      type: "resource",
      content: url,
      isTemplate: false,
      createdById: user.id,
    },
  });
  await prisma.documentLink.create({ data: { documentId: doc.id, orgId } });
  await prisma.activity.create({ data: { orgId, type: "document", summary: `Uploaded file: ${file.name}.` } });
  revalidatePath(`/staff/crm/${orgId}`);
  return { ok: true };
}

export async function inviteBusinessCustomer(input: { orgId: string; email: string; name?: string }) {
  await requireStaff();
  const token = randomUUID();
  await prisma.invite.create({
    data: {
      email: input.email.toLowerCase(),
      role: "business_customer",
      orgId: input.orgId,
      token,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    },
  });
  await prisma.activity.create({
    data: { orgId: input.orgId, type: "note", summary: `Invited ${input.email} to the business portal.` },
  });
  revalidatePath(`/staff/crm/${input.orgId}`);
  // In production this would email the invite link (see src/lib/mailer.ts). In dev, the
  // link is: /invite/accept?token=<token>
  return { token };
}
