"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Square, Clock } from "lucide-react";
import { startTimer, stopTimer } from "@/lib/actions/time";

interface ActiveEntry {
  id: string;
  startTime: string;
  orgName: string | null;
  taskTitle: string | null;
}

export default function FloatingTimer({
  activeEntry,
  orgs,
  tasks,
}: {
  activeEntry: ActiveEntry | null;
  orgs: { id: string; name: string }[];
  tasks: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [orgId, setOrgId] = useState("");
  const [taskId, setTaskId] = useState("");
  const [note, setNote] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!activeEntry) return;
    const start = new Date(activeEntry.startTime).getTime();
    const tick = () => setElapsed(Math.round((Date.now() - start) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [activeEntry]);

  async function handleStart() {
    setPending(true);
    await startTimer({ orgId: orgId || undefined, taskId: taskId || undefined, note });
    setPending(false);
    setOpen(false);
    setOrgId("");
    setTaskId("");
    setNote("");
    router.refresh();
  }

  async function handleStop() {
    if (!activeEntry) return;
    setPending(true);
    await stopTimer({ entryId: activeEntry.id });
    setPending(false);
    router.refresh();
  }

  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  const clock = `${h > 0 ? `${h}:` : ""}${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

  if (activeEntry) {
    return (
      <div className="fixed bottom-6 left-72 z-40 flex items-center gap-3 rounded-full border border-neutral-border bg-white px-4 py-2.5 shadow-lg">
        <span className="flex h-2 w-2 animate-pulse rounded-full bg-red-500" />
        <span className="font-display text-sm tabular-nums text-neutral-text">{clock}</span>
        <span className="max-w-[10rem] truncate text-xs text-neutral-muted">
          {activeEntry.orgName ?? activeEntry.taskTitle ?? "General"}
        </span>
        <button
          type="button"
          onClick={handleStop}
          disabled={pending}
          className="flex items-center gap-1 rounded-full bg-neutral-text px-3 py-1 text-xs font-semibold text-white"
        >
          <Square size={11} /> Stop
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-72 z-40">
      {open && (
        <div className="mb-2 flex w-64 flex-col gap-2 rounded-xl border border-neutral-border bg-white p-3 shadow-lg">
          <select value={orgId} onChange={(e) => setOrgId(e.target.value)} className="rounded-lg border border-neutral-border px-2 py-1.5 text-sm">
            <option value="">No customer (admin time)</option>
            {orgs.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
          <select value={taskId} onChange={(e) => setTaskId(e.target.value)} className="rounded-lg border border-neutral-border px-2 py-1.5 text-sm">
            <option value="">No specific task</option>
            {tasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What are you working on?"
            className="rounded-lg border border-neutral-border px-2 py-1.5 text-sm"
          />
          <button type="button" onClick={handleStart} disabled={pending} className="rounded-lg bg-deep-500 px-3 py-1.5 text-sm font-semibold text-white">
            {pending ? "Starting…" : "Start timer"}
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-neutral-border bg-white px-4 py-2.5 text-sm font-semibold text-neutral-text shadow-lg"
      >
        {open ? <Clock size={15} /> : <Play size={15} />} {open ? "Cancel" : "Start timer"}
      </button>
    </div>
  );
}
