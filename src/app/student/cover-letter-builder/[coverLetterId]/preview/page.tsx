import { notFound } from "next/navigation";
import Link from "next/link";
import { getCoverLetter } from "@/lib/actions/student-builders";
import { CATEGORY_LABELS, EMPTY_COVER_LETTER, type CoverLetterContent } from "@/lib/student-content-types";
import PrintButton from "@/components/finance/PrintButton";

export default async function CoverLetterPreviewPage({ params }: { params: Promise<{ coverLetterId: string }> }) {
  const { coverLetterId } = await params;
  const coverLetter = await getCoverLetter({ coverLetterId });
  if (!coverLetter) notFound();

  const content = { ...EMPTY_COVER_LETTER, ...(coverLetter.structuredContent as unknown as CoverLetterContent) };
  const paragraphs = [
    ...CATEGORY_LABELS.map(({ key }) => content.categories[key]).filter((t) => t?.trim()),
    content.closing,
  ].filter((t) => t?.trim());

  return (
    <div className="mx-auto max-w-2xl px-8 py-10">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link href={`/student/cover-letter-builder/${coverLetterId}`} className="text-sm text-light-700 hover:underline">
          &larr; Back to editor
        </Link>
        <PrintButton scale="light" />
      </div>

      <div className="rounded-2xl border border-neutral-border bg-white p-10 print:border-0 print:p-0">
        <p className="text-sm text-neutral-muted">
          {content.roleTitle && `Re: ${content.roleTitle}`}
          {content.companyName && ` at ${content.companyName}`}
        </p>
        <div className="mt-6 flex flex-col gap-4">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-sm whitespace-pre-wrap text-neutral-text">
              {p}
            </p>
          ))}
          {paragraphs.length === 0 && <p className="text-sm text-neutral-muted">Nothing written yet.</p>}
        </div>
      </div>
    </div>
  );
}
