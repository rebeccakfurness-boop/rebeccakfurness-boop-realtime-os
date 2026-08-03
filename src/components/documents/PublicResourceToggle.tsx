"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe2 } from "lucide-react";
import { setPublicResource } from "@/lib/actions/documents";

export default function PublicResourceToggle({ documentId, initialValue }: { documentId: string; initialValue: boolean }) {
  const router = useRouter();
  const [checked, setChecked] = useState(initialValue);
  const [pending, setPending] = useState(false);

  async function toggle() {
    const next = !checked;
    setChecked(next);
    setPending(true);
    await setPublicResource({ documentId, isPublicResource: next });
    setPending(false);
    router.refresh();
  }

  return (
    <label className="flex items-center gap-2 rounded-xl border border-neutral-border bg-white px-4 py-3 text-sm text-neutral-text">
      <Globe2 size={16} className="text-neutral-muted" />
      <input type="checkbox" checked={checked} disabled={pending} onChange={toggle} />
      Publish to the student and business resource library
    </label>
  );
}
