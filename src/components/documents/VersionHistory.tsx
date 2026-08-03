"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { History } from "lucide-react";
import { buttonClasses } from "@/components/Button";
import { revertToVersion } from "@/lib/actions/documents";

export interface VersionEntry {
  id: string;
  version: number;
  content: string;
  createdAt: string;
}

export default function VersionHistory({ documentId, versions }: { documentId: string; versions: VersionEntry[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function revert(versionId: string) {
    setPendingId(versionId);
    await revertToVersion({ documentId, versionId });
    setPendingId(null);
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-neutral-border bg-white p-6">
      <h2 className="flex items-center gap-2 font-display text-lg text-neutral-text">
        <History size={17} /> Version history
      </h2>
      <p className="mt-1 text-xs text-neutral-muted">Last {versions.length} snapshot{versions.length === 1 ? "" : "s"} kept.</p>

      <ul className="mt-3 flex flex-col gap-2">
        {versions.map((v) => (
          <li key={v.id} className="flex items-center justify-between rounded-lg border border-neutral-border px-3 py-2">
            <div>
              <p className="text-sm font-medium text-neutral-text">Version {v.version}</p>
              <p className="text-xs text-neutral-muted">{format(new Date(v.createdAt), "d MMM yyyy, h:mma")}</p>
            </div>
            <button
              onClick={() => revert(v.id)}
              disabled={pendingId === v.id}
              className={buttonClasses("deep", "secondary", "text-xs px-3 py-1")}
            >
              {pendingId === v.id ? "Reverting…" : "Revert to this"}
            </button>
          </li>
        ))}
        {versions.length === 0 && <li className="text-sm text-neutral-muted">No earlier versions yet, this is the first draft.</li>}
      </ul>
    </div>
  );
}
