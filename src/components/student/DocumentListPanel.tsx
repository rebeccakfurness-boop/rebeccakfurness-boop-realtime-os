"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import Button from "@/components/Button";
import { buttonClasses } from "@/components/Button";

export interface DocumentListItem {
  id: string;
  title: string;
  updatedAt: string;
}

export default function DocumentListPanel({
  basePath,
  items,
  emptyLabel,
  newLabel,
  onCreate,
  onDelete,
}: {
  basePath: string;
  items: DocumentListItem[];
  emptyLabel: string;
  newLabel: string;
  onCreate: () => Promise<{ id: string }>;
  onDelete: (id: string) => Promise<void>;
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleCreate() {
    setCreating(true);
    const { id } = await onCreate();
    setCreating(false);
    router.push(`${basePath}/${id}`);
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this draft? This can't be undone.")) return;
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
    router.refresh();
  }

  return (
    <div>
      <Button scale="light" onClick={handleCreate} disabled={creating}>
        <Plus size={16} /> {creating ? "Creating…" : newLabel}
      </Button>

      <ul className="mt-4 flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between rounded-xl border border-neutral-border bg-white px-4 py-3">
            <Link href={`${basePath}/${item.id}`} className="font-medium text-light-700 hover:underline">
              {item.title}
            </Link>
            <button
              onClick={() => handleDelete(item.id)}
              disabled={deletingId === item.id}
              className={buttonClasses("light", "danger", "text-xs px-2 py-1")}
            >
              <Trash2 size={13} />
            </button>
          </li>
        ))}
        {items.length === 0 && <li className="text-sm text-neutral-muted">{emptyLabel}</li>}
      </ul>
    </div>
  );
}
