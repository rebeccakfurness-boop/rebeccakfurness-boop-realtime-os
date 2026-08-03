import { notFound } from "next/navigation";
import Link from "next/link";
import { getApplication } from "@/lib/actions/student-builders";
import { EMPTY_APPLICATION, type ApplicationContent } from "@/lib/student-content-types";
import ApplicationBuilderForm from "@/components/student/ApplicationBuilderForm";

export default async function ApplicationDetailPage({ params }: { params: Promise<{ applicationId: string }> }) {
  const { applicationId } = await params;
  const application = await getApplication({ applicationId });
  if (!application) notFound();

  const content = { ...EMPTY_APPLICATION, ...(application.structuredContent as unknown as ApplicationContent) };

  return (
    <div className="mx-auto max-w-2xl px-8 py-10">
      <Link href="/student/application-builder" className="text-sm text-light-700 hover:underline">
        &larr; All applications
      </Link>
      <h1 className="mt-2 font-display text-3xl text-neutral-text">{content.scholarshipTitle || "Untitled application"}</h1>

      <div className="mt-8">
        <ApplicationBuilderForm applicationId={application.id} initialContent={content} />
      </div>
    </div>
  );
}
