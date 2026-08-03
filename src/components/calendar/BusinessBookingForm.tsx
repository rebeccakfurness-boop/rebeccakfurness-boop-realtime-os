"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SlotPicker, { type Slot } from "./SlotPicker";
import Button from "@/components/Button";
import { bookAsBusinessCustomer } from "@/lib/actions/calendar";
import type { MeetingType } from "@prisma/client";

const TYPES: { value: MeetingType; label: string }[] = [
  { value: "sales_call", label: "Sales call" },
  { value: "follow_up", label: "Follow-up" },
  { value: "event_delivery", label: "Event delivery" },
];

export default function BusinessBookingForm({ slots }: { slots: Slot[] }) {
  const router = useRouter();
  const [type, setType] = useState<MeetingType>("sales_call");
  const [slot, setSlot] = useState<Slot | null>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    if (!slot) return;
    setPending(true);
    await bookAsBusinessCustomer({ type, startTime: slot.startTime, endTime: slot.endTime });
    setPending(false);
    setDone(true);
    router.refresh();
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-neutral-border bg-white p-6">
        <p className="text-neutral-text">You&apos;re booked in. Check your overview page for the confirmed time.</p>
        <Button className="mt-3" onClick={() => setDone(false)}>
          Book another
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-border bg-white p-6">
      <h2 className="font-display text-lg text-neutral-text">Book a session</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setType(t.value)}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
              type === t.value ? "border-deep-500 bg-deep-50 text-deep-700" : "border-neutral-border text-neutral-text hover:bg-neutral-card"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <SlotPicker slots={slots} onSelect={setSlot} />
      </div>

      <Button className="mt-4" disabled={!slot || pending} onClick={submit}>
        {pending ? "Booking…" : "Confirm booking"}
      </Button>
    </div>
  );
}
