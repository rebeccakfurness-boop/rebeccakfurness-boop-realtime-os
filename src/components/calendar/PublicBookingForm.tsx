"use client";

import { useState } from "react";
import SlotPicker, { type Slot } from "./SlotPicker";
import Button from "@/components/Button";
import { bookPublicEnquiry } from "@/lib/actions/calendar";
import type { MeetingType } from "@prisma/client";

export default function PublicBookingForm({ slots }: { slots: Slot[] }) {
  const [organisationName, setOrganisationName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [type, setType] = useState<MeetingType>("sales_call");
  const [slot, setSlot] = useState<Slot | null>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!slot || !organisationName || !contactName || !contactEmail) return;
    setPending(true);
    await bookPublicEnquiry({
      organisationName,
      contactName,
      contactEmail,
      type,
      startTime: slot.startTime,
      endTime: slot.endTime,
    });
    setPending(false);
    setDone(true);
  }

  if (done) {
    return (
      <p className="text-neutral-text">
        You're booked in. A confirmation would normally land in your inbox, in dev it's printed to the server console instead.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <input
        value={organisationName}
        onChange={(e) => setOrganisationName(e.target.value)}
        placeholder="School / organisation name"
        required
        className="rounded-lg border border-neutral-border px-3 py-2 text-sm"
      />
      <input
        value={contactName}
        onChange={(e) => setContactName(e.target.value)}
        placeholder="Your name"
        required
        className="rounded-lg border border-neutral-border px-3 py-2 text-sm"
      />
      <input
        type="email"
        value={contactEmail}
        onChange={(e) => setContactEmail(e.target.value)}
        placeholder="Your email"
        required
        className="rounded-lg border border-neutral-border px-3 py-2 text-sm"
      />
      <select value={type} onChange={(e) => setType(e.target.value as MeetingType)} className="rounded-lg border border-neutral-border px-3 py-2 text-sm capitalize">
        <option value="sales_call">Sales call</option>
        <option value="follow_up">Follow-up</option>
      </select>

      <div className="mt-2">
        <SlotPicker slots={slots} onSelect={setSlot} />
      </div>

      <Button type="submit" disabled={!slot || pending} className="mt-2">
        {pending ? "Booking…" : "Confirm booking"}
      </Button>
    </form>
  );
}
