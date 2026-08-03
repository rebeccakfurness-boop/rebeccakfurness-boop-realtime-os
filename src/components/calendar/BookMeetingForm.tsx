"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SlotPicker, { type Slot } from "./SlotPicker";
import Button from "@/components/Button";
import { bookMeeting } from "@/lib/actions/calendar";
import type { MeetingType } from "@prisma/client";

const TYPES: MeetingType[] = ["sales_call", "follow_up", "event_delivery", "internal"];

export default function BookMeetingForm({
  staffId,
  orgs,
  slots,
}: {
  staffId: string;
  orgs: { id: string; name: string }[];
  slots: Slot[];
}) {
  const router = useRouter();
  const [orgId, setOrgId] = useState("");
  const [type, setType] = useState<MeetingType>("sales_call");
  const [slot, setSlot] = useState<Slot | null>(null);
  const [pending, setPending] = useState(false);

  async function submit() {
    if (!slot) return;
    setPending(true);
    await bookMeeting({
      staffId,
      orgId: orgId || undefined,
      type,
      startTime: slot.startTime,
      endTime: slot.endTime,
      path: "/staff/calendar",
    });
    setPending(false);
    setSlot(null);
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-neutral-border bg-white p-6">
      <h2 className="font-display text-lg text-neutral-text">Book a meeting</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        <select value={orgId} onChange={(e) => setOrgId(e.target.value)} className="rounded-lg border border-neutral-border px-3 py-1.5 text-sm">
          <option value="">Internal (no customer)</option>
          {orgs.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value as MeetingType)} className="rounded-lg border border-neutral-border px-3 py-1.5 text-sm capitalize">
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t.replace("_", " ")}
            </option>
          ))}
        </select>
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
