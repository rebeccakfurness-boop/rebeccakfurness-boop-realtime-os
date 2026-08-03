import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ScholarshipSearchPanel from "@/components/scholarships/ScholarshipSearchPanel";

export default async function StudentScholarshipsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [scholarships, bookmarks] = await Promise.all([
    prisma.scholarship.findMany({ orderBy: { deadline: "asc" } }),
    prisma.studentBookmark.findMany({ where: { studentId: userId }, select: { scholarshipId: true } }),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <h1 className="font-display text-3xl text-neutral-text">Scholarship search</h1>
      <p className="mt-1 text-neutral-muted">Find scholarships that fit you, and bookmark the ones worth coming back to.</p>

      <div className="mt-8">
        <ScholarshipSearchPanel
          scholarships={scholarships.map((s) => ({
            ...s,
            deadline: s.deadline ? s.deadline.toISOString() : null,
          }))}
          bookmarkedIds={bookmarks.map((b) => b.scholarshipId)}
          canBookmark
          scale="light"
        />
      </div>
    </div>
  );
}
