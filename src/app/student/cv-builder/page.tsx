import { getOrCreateCv } from "@/lib/actions/student-builders";
import CvBuilderForm from "@/components/student/CvBuilderForm";

export default async function CvBuilderPage() {
  const cv = await getOrCreateCv();

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <h1 className="font-display text-3xl text-neutral-text">CV builder</h1>
      <p className="mt-1 text-neutral-muted">
        Build your CV one panel at a time: leadership, community, cultural, academic, and sport, music &amp; arts.
      </p>

      <div className="mt-8">
        <CvBuilderForm cvId={cv.id} initialContent={cv.content} />
      </div>
    </div>
  );
}
