"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import PolishableTextarea from "@/components/student/PolishableTextarea";
import { updateCv } from "@/lib/actions/student-builders";
import { CATEGORY_LABELS, type CvContent } from "@/lib/student-content-types";

export default function CvBuilderForm({ cvId, initialContent }: { cvId: string; initialContent: CvContent }) {
  const router = useRouter();
  const [content, setContent] = useState<CvContent>(initialContent);
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setPending(true);
    setSaved(false);
    await updateCv({ cvId, content });
    setPending(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-neutral-border bg-white p-6">
        <h2 className="font-display text-lg text-neutral-text">About you</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <input
            value={content.fullName}
            onChange={(e) => setContent({ ...content, fullName: e.target.value })}
            placeholder="Full name"
            className="rounded-lg border border-neutral-border px-3 py-2 text-sm"
          />
          <input
            value={content.email}
            onChange={(e) => setContent({ ...content, email: e.target.value })}
            placeholder="Email"
            className="rounded-lg border border-neutral-border px-3 py-2 text-sm"
          />
          <input
            value={content.phone}
            onChange={(e) => setContent({ ...content, phone: e.target.value })}
            placeholder="Phone (optional)"
            className="rounded-lg border border-neutral-border px-3 py-2 text-sm sm:col-span-2"
          />
        </div>
        <div className="mt-3">
          <PolishableTextarea
            label="Summary"
            hint="A couple of sentences on who you are and what you're working towards."
            value={content.summary}
            onChange={(v) => setContent({ ...content, summary: v })}
            rows={2}
          />
        </div>
      </div>

      {CATEGORY_LABELS.map(({ key, label, hint }) => (
        <div key={key} className="rounded-2xl border border-neutral-border bg-white p-6">
          <PolishableTextarea
            label={label}
            hint={`${hint} One line per entry.`}
            value={content.categories[key]}
            onChange={(v) => setContent({ ...content, categories: { ...content.categories, [key]: v } })}
            rows={4}
          />
        </div>
      ))}

      <div className="flex items-center gap-3">
        <Button scale="light" onClick={save} disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
        {saved && <span className="text-xs text-neutral-muted">Saved.</span>}
        <Link href="/student/cv-builder/preview" className="text-sm font-semibold text-light-700 hover:underline">
          View / print CV &rarr;
        </Link>
      </div>
    </div>
  );
}
