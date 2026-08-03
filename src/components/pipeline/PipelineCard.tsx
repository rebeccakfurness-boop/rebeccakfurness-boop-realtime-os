"use client";

import Link from "next/link";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

export interface PipelineCardData {
  id: string;
  name: string;
  contactName: string | null;
  dealValueNzd: number | null;
  invoiced: boolean;
  paidStatus: "unpaid" | "partial" | "paid";
}

export default function PipelineCard({ card }: { card: PipelineCardData }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: card.id });

  const style = { transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.4 : 1 };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab touch-none rounded-xl border border-neutral-border bg-white p-3 shadow-sm active:cursor-grabbing"
    >
      <Link href={`/staff/crm/${card.id}`} onClick={(e) => e.stopPropagation()} className="text-sm font-semibold text-neutral-text hover:underline">
        {card.name}
      </Link>
      {card.contactName && <p className="mt-0.5 text-xs text-neutral-muted">{card.contactName}</p>}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-sm font-medium text-deep-600">{card.dealValueNzd ? `$${card.dealValueNzd.toFixed(0)}` : "—"}</span>
        <div className="flex gap-1">
          <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${card.invoiced ? "bg-teal-100 text-teal-700" : "bg-neutral-card text-neutral-muted"}`}>
            {card.invoiced ? "Invoiced" : "Not invoiced"}
          </span>
          <span
            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold capitalize ${
              card.paidStatus === "paid" ? "bg-deep-100 text-deep-700" : card.paidStatus === "partial" ? "bg-amber-100 text-amber-700" : "bg-neutral-card text-neutral-muted"
            }`}
          >
            {card.paidStatus}
          </span>
        </div>
      </div>
    </div>
  );
}
