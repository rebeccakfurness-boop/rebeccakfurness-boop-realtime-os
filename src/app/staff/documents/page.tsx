import Link from "next/link";
import { format } from "date-fns";
import { FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import NewDocumentForm from "@/components/documents/NewDocumentForm";

const TYPE_LABEL: Record<string, string> = {
  script: "Script",
  presentation: "Presentation",
  proposal: "Proposal",
  resource: "Resource",
};

export default async function DocumentsPage() {
  const documents = await prisma.document.findMany({
    where: { isTemplate: true },
    include: { _count: { select: { links: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="font-display text-3xl text-neutral-text">Documents</h1>
          <p className="mt-1 text-neutral-muted">Templates for scripts, presentations and proposals, with version history and AI customisation.</p>
        </div>
        <NewDocumentForm />
      </div>

      <ul className="mt-8 flex flex-col gap-2">
        {documents.map((doc) => (
          <li key={doc.id}>
            <Link
              href={`/staff/documents/${doc.id}`}
              className="flex items-center justify-between rounded-xl border border-neutral-border bg-white px-5 py-4 hover:bg-neutral-card/50"
            >
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-neutral-muted" />
                <div>
                  <p className="font-medium text-neutral-text">{doc.title}</p>
                  <p className="text-xs text-neutral-muted">
                    {TYPE_LABEL[doc.type]} · v{doc.version} · updated {format(doc.updatedAt, "d MMM yyyy")}
                  </p>
                </div>
              </div>
              <span className="text-xs text-neutral-muted">
                {doc._count.links} customer{doc._count.links === 1 ? "" : "s"} linked
              </span>
            </Link>
          </li>
        ))}
        {documents.length === 0 && (
          <li className="rounded-xl border border-dashed border-neutral-border px-5 py-10 text-center text-neutral-muted">
            No document templates yet.
          </li>
        )}
      </ul>
    </div>
  );
}
