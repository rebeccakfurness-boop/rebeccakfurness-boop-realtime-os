"use client";

import { useMemo, useState } from "react";
import { format, isSameDay } from "date-fns";

export interface Slot {
  startTime: string;
  endTime: string;
}

export default function SlotPicker({
  slots,
  scale = "deep",
  onSelect,
}: {
  slots: Slot[];
  scale?: "deep" | "light";
  onSelect: (slot: Slot) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const byDay = useMemo(() => {
    const groups: { day: Date; slots: Slot[] }[] = [];
    for (const slot of slots) {
      const day = new Date(slot.startTime);
      const group = groups.find((g) => isSameDay(g.day, day));
      if (group) group.slots.push(slot);
      else groups.push({ day, slots: [slot] });
    }
    return groups.slice(0, 6);
  }, [slots]);

  const activeColor = scale === "deep" ? "bg-deep-500 text-white border-deep-500" : "bg-light-500 text-white border-light-500";

  return (
    <div className="flex flex-col gap-3">
      {byDay.map((group) => (
        <div key={group.day.toISOString()}>
          <p className="text-xs font-semibold tracking-wide text-neutral-muted uppercase">{format(group.day, "EEEE d MMM")}</p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {group.slots.map((slot) => (
              <button
                key={slot.startTime}
                type="button"
                onClick={() => {
                  setSelected(slot.startTime);
                  onSelect(slot);
                }}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
                  selected === slot.startTime ? activeColor : "border-neutral-border text-neutral-text hover:bg-neutral-card"
                }`}
              >
                {format(new Date(slot.startTime), "h:mmaaa")}
              </button>
            ))}
          </div>
        </div>
      ))}
      {byDay.length === 0 && <p className="text-sm text-neutral-muted">No slots available right now.</p>}
    </div>
  );
}
