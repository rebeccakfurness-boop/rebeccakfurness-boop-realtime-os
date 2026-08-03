"use client";

import { useState, useTransition } from "react";
import { Mail, StickyNote, RefreshCw } from "lucide-react";
import { addNote, syncGmail } from "@/lib/actions/crm";
import type { Activity, Email, Contact } from "@prisma/client";

interface ActivityTimelineProps {
  orgId: string;
  activities: Activity[];
  emails: Email[];
  contacts: Contact[];
}

export default function ActivityTimeline({ orgId, activities, emails, contacts }: ActivityTimelineProps) {
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const [syncing, setSyncing] = useState(false);

  const contactById = new Map(contacts.map((c) => [c.id, c]));

  const items = [
    ...activities.map((a) => ({ ...a, kind: "activity" as const, at: a.createdAt })),
    ...emails.map((e) => ({ ...e, kind: "email" as const, at: e.timestamp })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime());

  function submitNote(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    const value = note.trim();
    setNote("");
    startTransition(() => addNote({ orgId, note: value }));
  }

  async function handleSync() {
    setSyncing(true);
    await syncGmail({ orgId });
    setSyncing(false);
  }

  return (
    <div className="rounded-2xl border border-neutral-border bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg text-neutral-text">Activity</h2>
        <button
          type="button"
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-1.5 text-sm font-medium text-neutral-muted hover:text-neutral-text"
        >
          <RefreshCw size={14} className={syncing ? "animate-spin" : ""} /> {syncing ? "Syncing…" : "Sync Gmail"}
        </button>
      </div>

      <form onSubmit={submitNote} className="mt-3 flex gap-2">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note…"
          className="flex-1 rounded-lg border border-neutral-border px-3 py-1.5 text-sm"
        />
        <button type="submit" disabled={pending} className="rounded-lg bg-neutral-card px-3 py-1.5 text-sm font-medium text-neutral-text">
          Add
        </button>
      </form>

      <ul className="mt-4 flex flex-col gap-4">
        {items.map((item) => (
          <li key={`${item.kind}-${item.id}`} className="flex gap-3">
            <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-neutral-card text-neutral-muted">
              {item.kind === "email" ? <Mail size={14} /> : <StickyNote size={14} />}
            </span>
            <div className="min-w-0">
              {item.kind === "email" ? (
                <>
                  <p className="text-sm font-medium text-neutral-text">
                    {item.direction === "inbound" ? "From" : "To"} {contactById.get(item.contactId ?? "")?.name ?? "contact"}: {item.subject}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-neutral-muted">{item.body}</p>
                </>
              ) : (
                <p className="text-sm text-neutral-text">{item.summary}</p>
              )}
              <p className="mt-0.5 text-xs text-neutral-muted">{item.at.toLocaleString("en-NZ")}</p>
            </div>
          </li>
        ))}
        {items.length === 0 && <li className="text-sm text-neutral-muted">No activity yet.</li>}
      </ul>
    </div>
  );
}
