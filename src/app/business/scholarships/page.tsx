import { prisma } from "@/lib/prisma";
import ScholarshipSearchPanel from "@/components/scholarships/ScholarshipSearchPanel";

export default async function BusinessScholarshipsPage() {
  const scholarships = await prisma.scholarship.findMany({ orderBy: { deadline: "asc" } });

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <h1 className="font-display text-3xl text-neutral-text">Scholarship search</h1>
      <p className="mt-1 text-neutral-muted">
        The same scholarship database your students can search, in one bulk-relevant view for careers advisors.
      </p>

      <div className="mt-8">
        <ScholarshipSearchPanel
          scholarships={scholarships.map((s) => ({ ...s, deadline: s.deadline ? s.deadline.toISOString() : null }))}
          canBookmark={false}
          scale="deep"
        />
      </div>
    </div>
  );
}
