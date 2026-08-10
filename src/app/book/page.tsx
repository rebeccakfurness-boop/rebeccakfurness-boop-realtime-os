import Mark from "@/components/Mark";
import { getAvailableSlots } from "@/lib/actions/calendar";
import PublicBookingForm from "@/components/calendar/PublicBookingForm";

export const dynamic = "force-dynamic";

export default async function PublicBookPage() {
  const slots = await getAvailableSlots();

  return (
    <div className="min-h-screen bg-neutral-bg px-6 py-16">
      <div className="mx-auto max-w-lg">
        <Mark size={40} />
        <h1 className="mt-4 font-display text-3xl text-neutral-text">Book a time with Realtime</h1>
        <p className="mt-2 text-neutral-muted">
          Tell us a little about your school or organisation and pick a time that works, we'll take it from there.
        </p>

        <div className="mt-8 rounded-2xl border border-neutral-border bg-white p-6">
          <PublicBookingForm slots={slots.map((s) => ({ startTime: s.startTime.toISOString(), endTime: s.endTime.toISOString() }))} />
        </div>
      </div>
    </div>
  );
}
