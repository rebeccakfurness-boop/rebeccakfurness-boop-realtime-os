import { notFound } from "next/navigation";
import Link from "next/link";
import { getCoverLetter } from "@/lib/actions/student-builders";
import { EMPTY_COVER_LETTER, type CoverLetterContent } from "@/lib/student-content-types";
import CoverLetterBuilderForm from "@/components/student/CoverLetterBuilderForm";

export default async function CoverLetterDetailPage({ params }: { params: Promise<{ coverLetterId: string }> }) {
  const { coverLetterId } = await params;
  const coverLetter = await getCoverLetter({ coverLetterId });
  if (!coverLetter) notFound();

  const content = { ...EMPTY_COVER_LETTER, ...(coverLetter.structuredContent as unknown as CoverLetterContent) };

  return (
    <div className="mx-auto max-w-2xl px-8 py-10">
      <Link href="/student/cover-letter-builder" className="text-sm text-light-700 hover:underline">
        &larr; All cover letters
      </Link>
      <h1 className="mt-2 font-display text-3xl text-neutral-text">{content.roleTitle || "Untitled cover letter"}</h1>

      <div className="mt-8">
        <CoverLetterBuilderForm coverLetterId={coverLetter.id} initialContent={content} />
      </div>
    </div>
  );
}
