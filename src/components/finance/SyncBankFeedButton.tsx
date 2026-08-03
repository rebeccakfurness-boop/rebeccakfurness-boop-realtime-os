"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { syncBankFeed } from "@/lib/actions/finance";

export default function SyncBankFeedButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function sync() {
    setPending(true);
    setMessage(null);
    const result = await syncBankFeed();
    setPending(false);
    setMessage(
      result.count > 0
        ? `Synced ${result.count} transaction(s) from the bank feed.`
        : "No live bank feed connected yet, use CSV import below.",
    );
    if (result.count > 0) router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={sync}
        disabled={pending}
        className="flex items-center gap-1.5 rounded-lg bg-neutral-card px-3 py-1.5 text-sm font-medium text-neutral-text"
      >
        <RefreshCw size={14} /> {pending ? "Syncing…" : "Sync bank feed"}
      </button>
      {message && <p className="text-xs text-neutral-muted">{message}</p>}
    </div>
  );
}
