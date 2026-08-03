import { getAvailableSlots } from "@/lib/actions/calendar";
import BusinessBookingForm from "@/components/calendar/BusinessBookingForm";

export default async function BusinessBookPage() {
  const slots = await getAvailableSlots();

  return (
    <div className="mx-auto max-w-2xl px-8 py-10">
      <h1 className="font-display text-3xl text-neutral-text">Book a meeting</h1>
      <p className="mt-1 text-neutral-muted">See what&apos;s available and book straight in, no need to wait on an email back and forth.</p>

      <div className="mt-8">
        <BusinessBookingForm slots={slots.map((s) => ({ startTime: s.startTime.toISOString(), endTime: s.endTime.toISOString() }))} />
      </div>
    </div>
  );
}
