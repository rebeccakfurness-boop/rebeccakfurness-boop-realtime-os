"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { buttonClasses } from "@/components/Button";
import { deleteDocument } from "@/lib/actions/documents";

export default function DeleteDocumentButton({ documentId }: { documentId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!window.confirm("Delete this document and all its version history? This can't be undone.")) return;
    setPending(true);
    await deleteDocument({ documentId });
    router.push("/staff/documents");
  }

  return (
    <button onClick={handleDelete} disabled={pending} className={buttonClasses("deep", "danger", "text-xs")}>
      <Trash2 size={14} /> {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
