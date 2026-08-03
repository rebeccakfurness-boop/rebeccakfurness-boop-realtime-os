"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import Button from "@/components/Button";
import { createDocument } from "@/lib/actions/documents";
import type { DocumentType } from "@prisma/client";

const TYPES: DocumentType[] = ["script", "presentation", "proposal", "resource"];

export default function NewDocumentForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<DocumentType>("proposal");
  const [isTemplate, setIsTemplate] = useState(true);
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setPending(true);
    const doc = await createDocument({
      title: title.trim(),
      type,
      isTemplate,
      content: isTemplate
        ? "Dear {{contact_name}},\n\nThank you for the chance to put together a proposal for {{organisation_name}}.\n\n"
        : "",
    });
    setPending(false);
    setOpen(false);
    setTitle("");
    router.push(`/staff/documents/${doc.id}`);
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus size={16} /> New document
      </Button>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 rounded-xl border border-neutral-border bg-white p-4">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Document title"
        className="rounded-lg border border-neutral-border px-3 py-1.5 text-sm"
      />
      <div className="flex items-center gap-3">
        <select
          value={type}
          onChange={(e) => setType(e.target.value as DocumentType)}
          className="rounded-lg border border-neutral-border px-2 py-1.5 text-sm capitalize"
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-1.5 text-sm text-neutral-text">
          <input type="checkbox" checked={isTemplate} onChange={(e) => setIsTemplate(e.target.checked)} />
          Template (with {"{{variables}}"})
        </label>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={pending} className="flex-1">
          {pending ? "Creating…" : "Create"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
