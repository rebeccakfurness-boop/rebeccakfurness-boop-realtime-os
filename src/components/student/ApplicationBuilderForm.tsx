"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import PolishableTextarea from "@/components/student/PolishableTextarea";
import { updateApplication } from "@/lib/actions/student-builders";
import { APPLICATION_SECTIONS, type ApplicationContent } from "@/lib/student-content-types";

export default function ApplicationBuilderForm({
  applicationId,
  initialContent,
}: {
  applicationId: string;
  initialContent: ApplicationContent;
}) {
  const router = useRouter();
  const [content, setContent] = useState<ApplicationContent>(initialContent);
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setPending(true);
    setSaved(false);
    await updateApplication({ applicationId, content });
    setPending(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-neutral-border bg-white p-6">
        <label className="block text-sm font-semibold text-neutral-text">Scholarship name</label>
        <input
          value={content.scholarshipTitle}
          onChange={(e) => setContent({ ...content, scholarshipTitle: e.target.value })}
          placeholder="e.g. Realtime Access Scholarship"
          className="mt-2 w-full rounded-lg border border-neutral-border px-3 py-2 text-sm"
        />
      </div>

      {APPLICATION_SECTIONS.map(({ key, label, hint, optional }) => (
        <div key={key} className="rounded-2xl border border-neutral-border bg-white p-6">
          <PolishableTextarea
            label={optional ? `${label} (optional)` : label}
            hint={hint}
            value={content[key]}
            onChange={(v) => setContent({ ...content, [key]: v })}
            rows={5}
          />
        </div>
      ))}

      <div className="flex items-center gap-3">
        <Button scale="light" onClick={save} disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
        {saved && <span className="text-xs text-neutral-muted">Saved.</span>}
        <Link href={`/student/application-builder/${applicationId}/preview`} className="text-sm font-semibold text-light-700 hover:underline">
          View / print &rarr;
        </Link>
      </div>
    </div>
  );
}
