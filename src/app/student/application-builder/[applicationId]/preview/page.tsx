import { notFound } from "next/navigation";
import Link from "next/link";
import { getApplication } from "@/lib/actions/student-builders";
import { APPLICATION_SECTIONS, EMPTY_APPLICATION, type ApplicationContent } from "@/lib/student-content-types";
import PrintButton from "@/components/finance/PrintButton";

export default async function ApplicationPreviewPage({ params }: { params: Promise<{ applicationId: string }> }) {
  const { applicationId } = await params;
  const application = await getApplication({ applicationId });
  if (!application) notFound();

  const content = { ...EMPTY_APPLICATION, ...(application.structuredContent as unknown as ApplicationContent) };

  return (
    <div className="mx-auto max-w-2xl px-8 py-10">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link href={`/student/application-builder/${applicationId}`} className="text-sm text-light-700 hover:underline">
          &larr; Back to editor
        </Link>
        <PrintButton scale="light" />
      </div>

      <div className="rounded-2xl border border-neutral-border bg-white p-10 print:border-0 print:p-0">
        <h1 className="font-display text-2xl text-neutral-text">{content.scholarshipTitle || "Scholarship application"}</h1>

        {APPLICATION_SECTIONS.map(({ key, label }) => {
          const text = content[key];
          if (!text?.trim()) return null;
          return (
            <div key={key} className="mt-6">
              <h2 className="text-xs font-semibold tracking-wide text-neutral-muted uppercase">{label}</h2>
              <p className="mt-1 text-sm whitespace-pre-wrap text-neutral-text">{text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
