"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { updateDocumentContent } from "@/lib/actions/documents";

interface DocumentEditorProps {
  documentId: string;
  initialContent: string;
  initialVariables: string[];
}

export default function DocumentEditor({ documentId, initialContent, initialVariables }: DocumentEditorProps) {
  const router = useRouter();
  const [content, setContent] = useState(initialContent);
  const [variablesText, setVariablesText] = useState(initialVariables.join(", "));
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setPending(true);
    setSaved(false);
    const variables = variablesText
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    await updateDocumentContent({ documentId, content, variables });
    setPending(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-neutral-border bg-white p-6">
      <label className="text-xs font-semibold tracking-wide text-neutral-muted uppercase">Content</label>
      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setSaved(false);
        }}
        rows={14}
        className="mt-2 w-full rounded-lg border border-neutral-border p-3 font-mono text-sm text-neutral-text"
      />

      <label className="mt-4 block text-xs font-semibold tracking-wide text-neutral-muted uppercase">
        Variables (comma separated, e.g. contact_name, organisation_name)
      </label>
      <input
        value={variablesText}
        onChange={(e) => {
          setVariablesText(e.target.value);
          setSaved(false);
        }}
        className="mt-2 w-full rounded-lg border border-neutral-border px-3 py-1.5 text-sm"
      />

      <div className="mt-4 flex items-center gap-3">
        <Button onClick={save} disabled={pending}>
          {pending ? "Saving…" : "Save new version"}
        </Button>
        {saved && <span className="text-xs text-neutral-muted">Saved.</span>}
      </div>
    </div>
  );
}
