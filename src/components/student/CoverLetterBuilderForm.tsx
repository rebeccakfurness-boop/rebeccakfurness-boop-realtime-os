"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import PolishableTextarea from "@/components/student/PolishableTextarea";
import { updateCoverLetter } from "@/lib/actions/student-builders";
import { CATEGORY_LABELS, type CoverLetterContent } from "@/lib/student-content-types";

export default function CoverLetterBuilderForm({
  coverLetterId,
  initialContent,
}: {
  coverLetterId: string;
  initialContent: CoverLetterContent;
}) {
  const router = useRouter();
  const [content, setContent] = useState<CoverLetterContent>(initialContent);
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setPending(true);
    setSaved(false);
    await updateCoverLetter({ coverLetterId, content });
    setPending(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-neutral-border bg-white p-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={content.roleTitle}
            onChange={(e) => setContent({ ...content, roleTitle: e.target.value })}
            placeholder="Role you're applying for"
            className="rounded-lg border border-neutral-border px-3 py-2 text-sm"
          />
          <input
            value={content.companyName}
            onChange={(e) => setContent({ ...content, companyName: e.target.value })}
            placeholder="Company / organisation"
            className="rounded-lg border border-neutral-border px-3 py-2 text-sm"
          />
        </div>
        <div className="mt-3 flex gap-1 rounded-lg bg-neutral-card p-1 text-sm font-medium">
          <button
            type="button"
            onClick={() => setContent({ ...content, tone: "professional" })}
            className={`flex-1 rounded-md py-1.5 ${content.tone === "professional" ? "bg-white text-light-700 shadow-sm" : "text-neutral-muted"}`}
          >
            Professional
          </button>
          <button
            type="button"
            onClick={() => setContent({ ...content, tone: "early_career" })}
            className={`flex-1 rounded-md py-1.5 ${content.tone === "early_career" ? "bg-white text-light-700 shadow-sm" : "text-neutral-muted"}`}
          >
            Early-career friendly
          </button>
        </div>
      </div>

      {CATEGORY_LABELS.map(({ key, label, hint }) => (
        <div key={key} className="rounded-2xl border border-neutral-border bg-white p-6">
          <PolishableTextarea
            label={`Relevant ${label.toLowerCase()} experience`}
            hint={hint}
            value={content.categories[key]}
            onChange={(v) => setContent({ ...content, categories: { ...content.categories, [key]: v } })}
            rows={4}
          />
        </div>
      ))}

      <div className="rounded-2xl border border-neutral-border bg-white p-6">
        <PolishableTextarea
          label="Closing"
          hint="Why this role, and what you'll bring to it."
          value={content.closing}
          onChange={(v) => setContent({ ...content, closing: v })}
          rows={4}
        />
      </div>

      <div className="flex items-center gap-3">
        <Button scale="light" onClick={save} disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
        {saved && <span className="text-xs text-neutral-muted">Saved.</span>}
        <Link href={`/student/cover-letter-builder/${coverLetterId}/preview`} className="text-sm font-semibold text-light-700 hover:underline">
          View / print &rarr;
        </Link>
      </div>
    </div>
  );
}
