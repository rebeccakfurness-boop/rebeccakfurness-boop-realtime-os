"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createCalendarClient } from "@/lib/integrations/calendar";
import type { MeetingType } from "@prisma/client";

export async function getAvailableSlots(staffId?: string) {
  const client = await createCalendarClient();
  const slots = await client.listAvailability(14);

  const staff = staffId ? [staffId] : (await prisma.user.findMany({ where: { role: "staff" }, select: { id: true } })).map((s) => s.id);
  const existing = await prisma.meeting.findMany({
    where: { staffId: { in: staff }, startTime: { gte: new Date() } },
    select: { startTime: true },
  });
  const taken = new Set(existing.map((m) => m.startTime.getTime()));

  return slots.filter((s) => !taken.has(s.startTime.getTime()));
}

interface CreateMeetingInput {
  staffId: string;
  orgId?: string;
  type: MeetingType;
  startTime: string;
  endTime: string;
}

async function createMeetingRecord(input: CreateMeetingInput) {
  const client = await createCalendarClient();
  const startTime = new Date(input.startTime);
  const endTime = new Date(input.endTime);

  const { calendarEventId } = await client.createEvent({
    title: `Realtime — ${input.type.replace("_", " ")}`,
    startTime,
    endTime,
  });

  const meeting = await prisma.meeting.create({
    data: { orgId: input.orgId, staffId: input.staffId, type: input.type, startTime, endTime, calendarEventId },
  });

  if (input.orgId) {
    await prisma.activity.create({
      data: {
        orgId: input.orgId,
        type: "meeting",
        summary: `Booked a ${input.type.replace("_", " ")} for ${startTime.toLocaleString("en-NZ")}.`,
      },
    });
  }

  return meeting;
}

/** Staff booking a meeting (from the Customer Card, the pipeline, or the internal calendar). */
export async function bookMeeting(input: CreateMeetingInput & { path?: string }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "staff") throw new Error("Staff only");

  const meeting = await createMeetingRecord(input);
  if (input.path) revalidatePath(input.path);
  revalidatePath("/staff/calendar");
  return meeting;
}

/** A business customer self-booking a session for their own organisation. */
export async function bookAsBusinessCustomer(input: Omit<CreateMeetingInput, "orgId" | "staffId">) {
  const session = await auth();
  if (!session?.user || session.user.role !== "business_customer" || !session.user.orgId) {
    throw new Error("Business customer only");
  }
  const staff = await prisma.user.findFirst({ where: { role: "staff" }, orderBy: { createdAt: "asc" } });
  if (!staff) throw new Error("No staff member available to assign this booking to.");

  const meeting = await createMeetingRecord({ ...input, orgId: session.user.orgId, staffId: staff.id });
  revalidatePath("/business");
  return meeting;
}

/** Public/unauthenticated booking: a new enquiry books a slot before they're a customer. */
export async function bookPublicEnquiry(input: {
  organisationName: string;
  contactName: string;
  contactEmail: string;
  type: MeetingType;
  startTime: string;
  endTime: string;
}) {
  const staff = await prisma.user.findFirst({ where: { role: "staff" }, orderBy: { createdAt: "asc" } });
  if (!staff) throw new Error("No staff member available to assign this booking to.");

  const org = await prisma.organisation.create({
    data: { name: input.organisationName, type: "school", source: "Public booking link", pipelineStage: "enquiry" },
  });
  await prisma.contact.create({ data: { orgId: org.id, name: input.contactName, email: input.contactEmail } });

  await createMeetingRecord({ staffId: staff.id, orgId: org.id, type: input.type, startTime: input.startTime, endTime: input.endTime });
  await prisma.activity.create({ data: { orgId: org.id, type: "note", summary: "New enquiry booked via the public booking link." } });

  return { ok: true };
}
