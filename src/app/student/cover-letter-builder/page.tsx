import { listCoverLetters, createCoverLetter, deleteCoverLetter } from "@/lib/actions/student-builders";
import DocumentListPanel from "@/components/student/DocumentListPanel";
import type { CoverLetterContent } from "@/lib/student-content-types";

export default async function CoverLetterListPage() {
  const coverLetters = await listCoverLetters();

  async function onCreate() {
    "use server";
    return createCoverLetter();
  }

  async function onDelete(id: string) {
    "use server";
    await deleteCoverLetter({ coverLetterId: id });
  }

  return (
    <div className="mx-auto max-w-2xl px-8 py-10">
      <h1 className="font-display text-3xl text-neutral-text">Cover letter builder</h1>
      <p className="mt-1 text-neutral-muted">Map your experience to a role, and let it write itself around your five panel categories.</p>

      <div className="mt-8">
        <DocumentListPanel
          basePath="/student/cover-letter-builder"
          items={coverLetters.map((c) => {
            const content = c.structuredContent as unknown as CoverLetterContent;
            const title = [content.roleTitle, content.companyName].filter(Boolean).join(" · ") || "Untitled cover letter";
            return { id: c.id, title, updatedAt: c.updatedAt.toISOString() };
          })}
          emptyLabel="No cover letters started yet."
          newLabel="New cover letter"
          onCreate={onCreate}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}
