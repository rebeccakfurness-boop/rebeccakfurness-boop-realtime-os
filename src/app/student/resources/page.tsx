import { prisma } from "@/lib/prisma";
import ResourceGrid from "@/components/resources/ResourceGrid";

export default async function StudentResourcesPage() {
  const resources = await prisma.document.findMany({
    where: { isPublicResource: true },
    orderBy: { title: "asc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <h1 className="font-display text-3xl text-neutral-text">Resources</h1>
      <p className="mt-1 text-neutral-muted">The Master Resource Guide, worksheets and templates from your session, all in one place.</p>

      <div className="mt-8">
        <ResourceGrid resources={resources} emptyLabel="No resources published yet, check back after your session." />
      </div>
    </div>
  );
}
