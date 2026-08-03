"use client";

import { useRef, useState } from "react";
import { FileText, Upload } from "lucide-react";
import { uploadDocumentFile } from "@/lib/actions/crm";
import type { Document, DocumentLink } from "@prisma/client";

interface FilesPanelProps {
  orgId: string;
  links: (DocumentLink & { document: Document })[];
}

export default function FilesPanel({ orgId, links }: FilesPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPending(true);
    setError(null);
    const formData = new FormData();
    formData.append("orgId", orgId);
    formData.append("file", file);
    const result = await uploadDocumentFile(formData);
    setPending(false);
    if (result?.error) setError(result.error);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="rounded-2xl border border-neutral-border bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg text-neutral-text">Files</h2>
        <label className="flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-deep-600">
          <Upload size={15} /> {pending ? "Uploading…" : "Upload"}
          <input ref={inputRef} type="file" className="hidden" onChange={handleUpload} disabled={pending} />
        </label>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      <ul className="mt-3 flex flex-col gap-2">
        {links.map((link) => {
          const isUploadedFile = !link.document.isTemplate && link.document.content.startsWith("/uploads/");
          const href = isUploadedFile ? link.document.content : `/staff/documents/${link.documentId}`;
          return (
            <li key={link.documentId}>
              <a
                href={href}
                target={isUploadedFile ? "_blank" : undefined}
                rel={isUploadedFile ? "noopener noreferrer" : undefined}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-neutral-text hover:bg-neutral-card"
              >
                <FileText size={15} className="flex-shrink-0 text-neutral-muted" />
                <span className="truncate">{link.document.title}</span>
                {link.document.isTemplate && <span className="text-xs text-neutral-muted">(template)</span>}
              </a>
            </li>
          );
        })}
        {links.length === 0 && <li className="text-sm text-neutral-muted">No files attached yet.</li>}
      </ul>
    </div>
  );
}
