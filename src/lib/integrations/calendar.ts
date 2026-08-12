/**
 * Google Calendar integration boundary.
 *
 * Real usage: a staff member connects their Google account from
 * /staff/settings (see src/app/api/google/connect, src/lib/integrations/
 * google-auth.ts). Once GOOGLE_CLIENT_ID/SECRET are set AND a staff Google
 * account is connected, every call site below (booking from a Customer
 * Card, the pipeline, or a public/business booking link) transparently
 * starts reading/writing that real calendar instead of the mock.
 */

import { google } from "googleapis";
import { getAuthorizedGoogleClient, isGoogleConfigured } from "@/lib/integrations/google-auth";

export interface AvailabilitySlot {
  startTime: Date;
  endTime: Date;
}

export interface CalendarClient {
  listAvailability(days: number): Promise<AvailabilitySlot[]>;
  createEvent(input: { title: string; startTime: Date; endTime: Date }): Promise<{ calendarEventId: string }>;
}

const SLOT_HOURS = [9, 11, 14];
const SLOT_MINUTES = 45;

function candidateSlots(days: number): AvailabilitySlot[] {
  const slots: AvailabilitySlot[] = [];
  const now = new Date();
  let daysAdded = 0;
  let cursor = 1;

  while (daysAdded < days) {
    const date = new Date(now);
    date.setDate(date.getDate() + cursor);
    cursor += 1;
    const day = date.getDay();
    if (day === 0 || day === 6) continue; // weekdays only

    for (const hour of SLOT_HOURS) {
      const startTime = new Date(date);
      startTime.setHours(hour, 0, 0, 0);
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + SLOT_MINUTES);
      slots.push({ startTime, endTime });
    }
    daysAdded += 1;
  }
  return slots;
}

class MockCalendarClient implements CalendarClient {
  async listAvailability(days: number): Promise<AvailabilitySlot[]> {
    return candidateSlots(days);
  }

  async createEvent(input: { title: string; startTime: Date; endTime: Date }): Promise<{ calendarEventId: string }> {
    return { calendarEventId: `mock-evt-${input.startTime.getTime()}` };
  }
}

class GoogleCalendarClient implements CalendarClient {
  async listAvailability(days: number): Promise<AvailabilitySlot[]> {
    const auth = await getAuthorizedGoogleClient();
    if (!auth) return candidateSlots(days);

    const calendar = google.calendar({ version: "v3", auth });
    const candidates = candidateSlots(days);
    const timeMin = candidates[0]?.startTime ?? new Date();
    const timeMax = candidates[candidates.length - 1]?.endTime ?? new Date(Date.now() + days * 86400000);

    const freebusy = await calendar.freebusy.query({
      requestBody: { timeMin: timeMin.toISOString(), timeMax: timeMax.toISOString(), items: [{ id: "primary" }] },
    });
    const busy = freebusy.data.calendars?.primary?.busy ?? [];

    return candidates.filter((slot) => {
      return !busy.some((b) => {
        if (!b.start || !b.end) return false;
        return slot.startTime < new Date(b.end) && slot.endTime > new Date(b.start);
      });
    });
  }

  async createEvent(input: { title: string; startTime: Date; endTime: Date }): Promise<{ calendarEventId: string }> {
    const auth = await getAuthorizedGoogleClient();
    if (!auth) return { calendarEventId: `mock-evt-${input.startTime.getTime()}` };

    const calendar = google.calendar({ version: "v3", auth });
    const event = await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: input.title,
        start: { dateTime: input.startTime.toISOString() },
        end: { dateTime: input.endTime.toISOString() },
      },
    });
    return { calendarEventId: event.data.id ?? `google-evt-${input.startTime.getTime()}` };
  }
}

export async function createCalendarClient(): Promise<CalendarClient> {
  if (!isGoogleConfigured()) return new MockCalendarClient();
  return new GoogleCalendarClient();
}
