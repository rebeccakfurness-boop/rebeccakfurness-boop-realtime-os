/**
 * Google Calendar integration boundary.
 *
 * Real usage: set GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET, implement the OAuth
 * consent flow for a staff Google account, and swap MockCalendarClient below for
 * a real client backed by the Calendar API (freebusy.query for availability,
 * events.insert for booking). Every call site (booking a meeting from a Customer
 * Card, the pipeline, or a public/business booking link) goes through this one
 * interface, so nothing else needs to change when the real adapter lands.
 */

export interface AvailabilitySlot {
  startTime: Date;
  endTime: Date;
}

export interface CalendarClient {
  listAvailability(days: number): Promise<AvailabilitySlot[]>;
  createEvent(input: { title: string; startTime: Date; endTime: Date }): Promise<{ calendarEventId: string }>;
}

const SLOT_HOURS = [9, 11, 14];

class MockCalendarClient implements CalendarClient {
  async listAvailability(days: number): Promise<AvailabilitySlot[]> {
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
        endTime.setMinutes(endTime.getMinutes() + 45);
        slots.push({ startTime, endTime });
      }
      daysAdded += 1;
    }
    return slots;
  }

  async createEvent(input: { title: string; startTime: Date; endTime: Date }): Promise<{ calendarEventId: string }> {
    return { calendarEventId: `mock-evt-${input.startTime.getTime()}` };
  }
}

export function createCalendarClient(): CalendarClient {
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    // TODO: return a real Calendar API-backed client once OAuth credentials are live.
    console.warn("[calendar] GOOGLE_CLIENT_ID is set but no live Calendar client is implemented yet, falling back to mock.");
  }
  return new MockCalendarClient();
}
