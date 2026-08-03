import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ResourceGrid from "@/components/resources/ResourceGrid";

export default async function BusinessResourcesPage() {
  const session = await auth();
  const orgId = session!.user.orgId;

  const [publicResources, sharedLinks] = await Promise.all([
    prisma.document.findMany({ where: { isPublicResource: true }, orderBy: { title: "asc" } }),
    orgId
      ? prisma.documentLink.findMany({
          where: { orgId, document: { isPublicResource: false } },
          include: { document: true },
          orderBy: { document: { title: "asc" } },
        })
      : Promise.resolve([]),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <h1 className="font-display text-3xl text-neutral-text">Resources</h1>
      <p className="mt-1 text-neutral-muted">The shared resource suite, plus anything Rebecca's team has sent specifically to you.</p>

      {sharedLinks.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-lg text-neutral-text">Shared with you</h2>
          <div className="mt-3">
            <ResourceGrid resources={sharedLinks.map((l) => l.document)} emptyLabel="Nothing shared with you yet." />
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="font-display text-lg text-neutral-text">Resource library</h2>
        <div className="mt-3">
          <ResourceGrid resources={publicResources} emptyLabel="No resources published yet." />
        </div>
      </div>
    </div>
  );
}
