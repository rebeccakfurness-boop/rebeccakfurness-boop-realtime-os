"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createManualEntry } from "@/lib/actions/time";

export default function ManualEntryForm({ orgs, tasks }: { orgs: { id: string; name: string }[]; tasks: { id: string; title: string }[] }) {
  const router = useRouter();
  const [orgId, setOrgId] = useState("");
  const [taskId, setTaskId] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(30);
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    await createManualEntry({ orgId: orgId || undefined, taskId: taskId || undefined, note, date, hours, minutes });
    setPending(false);
    setNote("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-2 rounded-2xl border border-neutral-border bg-white p-4">
      <label className="flex flex-col gap-1 text-xs font-medium text-neutral-muted">
        Date
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-lg border border-neutral-border px-2 py-1.5 text-sm" />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-neutral-muted">
        Customer
        <select value={orgId} onChange={(e) => setOrgId(e.target.value)} className="rounded-lg border border-neutral-border px-2 py-1.5 text-sm">
          <option value="">Admin</option>
          {orgs.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-neutral-muted">
        Task
        <select value={taskId} onChange={(e) => setTaskId(e.target.value)} className="rounded-lg border border-neutral-border px-2 py-1.5 text-sm">
          <option value="">None</option>
          {tasks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-neutral-muted">
        Hours
        <input type="number" min={0} value={hours} onChange={(e) => setHours(Number(e.target.value))} className="w-16 rounded-lg border border-neutral-border px-2 py-1.5 text-sm" />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-neutral-muted">
        Minutes
        <input type="number" min={0} max={59} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} className="w-16 rounded-lg border border-neutral-border px-2 py-1.5 text-sm" />
      </label>
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note" className="min-w-[10rem] flex-1 rounded-lg border border-neutral-border px-2 py-1.5 text-sm" />
      <button type="submit" disabled={pending} className="rounded-lg bg-deep-500 px-4 py-1.5 text-sm font-semibold text-white">
        {pending ? "Saving…" : "Add entry"}
      </button>
    </form>
  );
}
