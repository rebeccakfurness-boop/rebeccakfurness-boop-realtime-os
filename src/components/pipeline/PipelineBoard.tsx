"use client";

import { useMemo, useState, useTransition } from "react";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import PipelineColumn from "./PipelineColumn";
import type { PipelineCardData } from "./PipelineCard";
import { updateOrganisation } from "@/lib/actions/crm";
import type { PipelineStage } from "@prisma/client";

const STAGES: PipelineStage[] = ["outreach", "enquiry", "proposal_sent", "booked", "delivered", "invoiced", "paid"];

interface PipelineBoardProps {
  initialCards: (PipelineCardData & { stage: PipelineStage })[];
}

export default function PipelineBoard({ initialCards }: PipelineBoardProps) {
  const [cards, setCards] = useState(initialCards);
  const [search, setSearch] = useState("");
  const [onlyOutstanding, setOnlyOutstanding] = useState(false);
  const [, startTransition] = useTransition();

  const filtered = useMemo(
    () =>
      cards.filter((c) => {
        if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
        if (onlyOutstanding && c.paidStatus === "paid") return false;
        return true;
      }),
    [cards, search, onlyOutstanding],
  );

  const totalPipeline = cards.reduce((s, c) => s + (c.dealValueNzd ?? 0), 0);
  const totalInvoiced = cards.filter((c) => c.invoiced).reduce((s, c) => s + (c.dealValueNzd ?? 0), 0);
  const totalCollected = cards.filter((c) => c.paidStatus === "paid").reduce((s, c) => s + (c.dealValueNzd ?? 0), 0);
  const totalOutstanding = cards
    .filter((c) => c.invoiced && c.paidStatus !== "paid")
    .reduce((s, c) => s + (c.dealValueNzd ?? 0), 0);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const newStage = over.id as PipelineStage;
    if (!STAGES.includes(newStage)) return;

    setCards((prev) => prev.map((c) => (c.id === active.id ? { ...c, stage: newStage } : c)));
    startTransition(() => {
      updateOrganisation({ orgId: active.id as string, pipelineStage: newStage });
    });
  }

  return (
    <div className="flex h-full flex-col px-8 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-neutral-text">Sales pipeline</h1>
          <p className="mt-1 text-neutral-muted">Drag a card to move it through the pipeline.</p>
        </div>
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers…"
            className="rounded-lg border border-neutral-border px-3 py-1.5 text-sm"
          />
          <label className="flex items-center gap-1.5 rounded-lg border border-neutral-border px-3 py-1.5 text-sm text-neutral-muted">
            <input type="checkbox" checked={onlyOutstanding} onChange={(e) => setOnlyOutstanding(e.target.checked)} />
            Outstanding only
          </label>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryStat label="Pipeline value" value={totalPipeline} />
        <SummaryStat label="Invoiced" value={totalInvoiced} />
        <SummaryStat label="Collected" value={totalCollected} accent="teal" />
        <SummaryStat label="Outstanding" value={totalOutstanding} accent="warn" />
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="mt-6 flex flex-1 gap-4 overflow-x-auto pb-6">
          {STAGES.map((stage) => (
            <PipelineColumn key={stage} stage={stage} cards={filtered.filter((c) => c.stage === stage)} />
          ))}
        </div>
      </DndContext>
    </div>
  );
}

function SummaryStat({ label, value, accent }: { label: string; value: number; accent?: "teal" | "warn" }) {
  const color = accent === "teal" ? "text-teal-700" : accent === "warn" ? "text-amber-700" : "text-neutral-text";
  return (
    <div className="rounded-2xl border border-neutral-border bg-white p-4">
      <p className="text-xs font-medium text-neutral-muted">{label}</p>
      <p className={`mt-1 font-display text-2xl ${color}`}>${value.toLocaleString()} NZD</p>
    </div>
  );
}
