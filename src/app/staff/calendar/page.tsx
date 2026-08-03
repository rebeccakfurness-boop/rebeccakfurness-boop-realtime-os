import { format } from "date-fns";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getAvailableSlots } from "@/lib/actions/calendar";
import BookMeetingForm from "@/components/calendar/BookMeetingForm";

export default async function StaffCalendarPage() {
  const session = await auth();
  const staffId = session!.user.id;

  const [meetings, orgs, slots] = await Promise.all([
    prisma.meeting.findMany({
      where: { startTime: { gte: new Date() } },
      include: { org: true, staff: true },
      orderBy: { startTime: "asc" },
    }),
    prisma.organisation.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    getAvailableSlots(),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <h1 className="font-display text-3xl text-neutral-text">Calendar</h1>
      <p className="mt-1 text-neutral-muted">Every upcoming meeting, and open slots to book new ones into.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-neutral-border bg-white p-6">
          <h2 className="font-display text-lg text-neutral-text">Upcoming</h2>
          <ul className="mt-3 flex flex-col divide-y divide-neutral-border">
            {meetings.map((m) => (
              <li key={m.id} className="flex items-center justify-between py-2.5 text-sm">
                <div>
                  <p className="font-medium capitalize text-neutral-text">{m.type.replace("_", " ")}</p>
                  <p className="text-neutral-muted">{m.org?.name ?? "Internal"} · {m.staff.name}</p>
                </div>
                <span className="text-neutral-muted">{format(m.startTime, "EEE d MMM, h:mmaaa")}</span>
              </li>
            ))}
            {meetings.length === 0 && <li className="py-4 text-sm text-neutral-muted">Nothing booked yet.</li>}
          </ul>
        </div>

        <BookMeetingForm
          staffId={staffId}
          orgs={orgs}
          slots={slots.map((s) => ({ startTime: s.startTime.toISOString(), endTime: s.endTime.toISOString() }))}
        />
      </div>

      <p className="mt-6 text-sm text-neutral-muted">
        New enquiries can also book themselves in directly: share{" "}
        <a href="/book" className="font-medium text-deep-600">
          realtime.local/book
        </a>
        .
      </p>
    </div>
  );
}
