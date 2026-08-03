"use client";

import { useDroppable } from "@dnd-kit/core";
import PipelineCard, { type PipelineCardData } from "./PipelineCard";
import type { PipelineStage } from "@prisma/client";

const STAGE_LABEL: Record<PipelineStage, string> = {
  outreach: "Outreach",
  enquiry: "Enquiry",
  proposal_sent: "Proposal sent",
  booked: "Booked / customer",
  delivered: "Delivered",
  invoiced: "Invoiced",
  paid: "Paid",
};

export default function PipelineColumn({ stage, cards }: { stage: PipelineStage; cards: PipelineCardData[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const total = cards.reduce((sum, c) => sum + (c.dealValueNzd ?? 0), 0);

  return (
    <div ref={setNodeRef} className={`flex w-72 flex-shrink-0 flex-col rounded-2xl p-3 ${isOver ? "bg-deep-50" : "bg-neutral-card/60"}`}>
      <div className="flex items-baseline justify-between px-1 pb-2">
        <h3 className="text-sm font-semibold text-neutral-text">{STAGE_LABEL[stage]}</h3>
        <span className="text-xs text-neutral-muted">{cards.length}</span>
      </div>
      <p className="px-1 pb-2 text-xs text-neutral-muted">${total.toLocaleString()} NZD</p>
      <div className="flex flex-col gap-2">
        {cards.map((card) => (
          <PipelineCard key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}
