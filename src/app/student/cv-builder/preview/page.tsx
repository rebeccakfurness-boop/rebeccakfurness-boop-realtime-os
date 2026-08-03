import Link from "next/link";
import { getOrCreateCv } from "@/lib/actions/student-builders";
import { CATEGORY_LABELS } from "@/lib/student-content-types";
import PrintButton from "@/components/finance/PrintButton";

function Bullets({ text }: { text: string }) {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return null;
  return (
    <ul className="mt-1 list-disc pl-5 text-sm text-neutral-text">
      {lines.map((line, i) => (
        <li key={i}>{line}</li>
      ))}
    </ul>
  );
}

export default async function CvPreviewPage() {
  const cv = await getOrCreateCv();
  const { content } = cv;

  return (
    <div className="mx-auto max-w-2xl px-8 py-10">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link href="/student/cv-builder" className="text-sm text-light-700 hover:underline">
          &larr; Back to editor
        </Link>
        <PrintButton scale="light" />
      </div>

      <div className="rounded-2xl border border-neutral-border bg-white p-10 print:border-0 print:p-0">
        <h1 className="font-display text-2xl text-neutral-text">{content.fullName || "Your name"}</h1>
        <p className="mt-1 text-sm text-neutral-muted">{[content.email, content.phone].filter(Boolean).join(" · ")}</p>

        {content.summary && <p className="mt-4 text-sm text-neutral-text">{content.summary}</p>}

        {CATEGORY_LABELS.map(({ key, label }) => {
          const text = content.categories[key];
          if (!text?.trim()) return null;
          return (
            <div key={key} className="mt-6">
              <h2 className="text-xs font-semibold tracking-wide text-neutral-muted uppercase">{label}</h2>
              <Bullets text={text} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
