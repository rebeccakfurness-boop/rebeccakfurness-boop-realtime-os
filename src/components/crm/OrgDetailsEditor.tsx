"use client";

import { useState, useTransition } from "react";
import { updateOrganisation } from "@/lib/actions/crm";
import type { Organisation, PipelineStage, PaidStatus } from "@prisma/client";

const STAGES: PipelineStage[] = ["outreach", "enquiry", "proposal_sent", "booked", "delivered", "invoiced", "paid"];
const PAID_STATUSES: PaidStatus[] = ["unpaid", "partial", "paid"];

type SerialisedOrg = Omit<Organisation, "dealValueNzd"> & { dealValueNzd: number | null };

export default function OrgDetailsEditor({ org }: { org: SerialisedOrg }) {
  const [pending, startTransition] = useTransition();
  const [dealValue, setDealValue] = useState(org.dealValueNzd ? Number(org.dealValueNzd).toString() : "");
  const [notes, setNotes] = useState(org.notes ?? "");

  function save(partial: Omit<Parameters<typeof updateOrganisation>[0], "orgId">) {
    startTransition(() => {
      updateOrganisation({ orgId: org.id, ...partial });
    });
  }

  return (
    <div className="rounded-2xl border border-neutral-border bg-white p-6">
      <h2 className="font-display text-lg text-neutral-text">Deal details</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-text">
          Pipeline stage
          <select
            defaultValue={org.pipelineStage}
            onChange={(e) => save({ pipelineStage: e.target.value as PipelineStage })}
            className="rounded-lg border border-neutral-border px-3 py-2 text-sm capitalize"
          >
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-text">
          Deal value (NZD)
          <input
            type="number"
            value={dealValue}
            onChange={(e) => setDealValue(e.target.value)}
            onBlur={() => save({ dealValueNzd: dealValue ? Number(dealValue) : undefined })}
            className="rounded-lg border border-neutral-border px-3 py-2 text-sm"
          />
        </label>

        <label className="flex items-center gap-2 text-sm font-medium text-neutral-text">
          <input
            type="checkbox"
            defaultChecked={org.invoiced}
            onChange={(e) => save({ invoiced: e.target.checked })}
            className="h-4 w-4 rounded border-neutral-border"
          />
          Invoiced
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-text">
          Payment status
          <select
            defaultValue={org.paidStatus}
            onChange={(e) => save({ paidStatus: e.target.value as PaidStatus })}
            className="rounded-lg border border-neutral-border px-3 py-2 text-sm capitalize"
          >
            {PAID_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-4 flex flex-col gap-1.5 text-sm font-medium text-neutral-text">
        Notes
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => save({ notes })}
          rows={3}
          className="rounded-lg border border-neutral-border px-3 py-2 text-sm"
        />
      </label>
      {pending && <p className="mt-2 text-xs text-neutral-muted">Saving…</p>}
    </div>
  );
}
