import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DocumentEditor from "@/components/documents/DocumentEditor";
import VersionHistory from "@/components/documents/VersionHistory";
import AiCustomiseForm from "@/components/documents/AiCustomiseForm";
import LinkedOrgsPanel from "@/components/documents/LinkedOrgsPanel";
import DeleteDocumentButton from "@/components/documents/DeleteDocumentButton";
import PublicResourceToggle from "@/components/documents/PublicResourceToggle";

const TYPE_LABEL: Record<string, string> = {
  script: "Script",
  presentation: "Presentation",
  proposal: "Proposal",
  resource: "Resource",
};

export default async function DocumentDetailPage({ params }: { params: Promise<{ documentId: string }> }) {
  const { documentId } = await params;

  const [document, versions, links, allOrgs] = await Promise.all([
    prisma.document.findUnique({ where: { id: documentId } }),
    prisma.documentVersion.findMany({ where: { documentId }, orderBy: { version: "desc" } }),
    prisma.documentLink.findMany({ where: { documentId }, include: { org: { select: { id: true, name: true } } } }),
    prisma.organisation.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  if (!document) notFound();

  const variables = (document.variables as string[] | null) ?? [];

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <Link href="/staff/documents" className="text-sm text-deep-600 hover:underline">
        &larr; All documents
      </Link>

      <div className="mt-2 flex items-start justify-between gap-6">
        <div>
          <h1 className="font-display text-3xl text-neutral-text">{document.title}</h1>
          <p className="mt-1 text-neutral-muted">
            {TYPE_LABEL[document.type]} &middot; version {document.version}
            {document.isTemplate && " · template"}
          </p>
        </div>
        <DeleteDocumentButton documentId={document.id} />
      </div>

      <div className="mt-8 flex flex-col gap-6">
        {document.type === "resource" && (
          <PublicResourceToggle documentId={document.id} initialValue={document.isPublicResource} />
        )}

        <DocumentEditor documentId={document.id} initialContent={document.content} initialVariables={variables} />

        {document.isTemplate && <AiCustomiseForm documentId={document.id} originalContent={document.content} />}

        <LinkedOrgsPanel
          documentId={document.id}
          linkedOrgs={links.map((l) => l.org)}
          allOrgs={allOrgs}
        />

        <VersionHistory
          documentId={document.id}
          versions={versions.map((v) => ({ id: v.id, version: v.version, content: v.content, createdAt: v.createdAt.toISOString() }))}
        />
      </div>
    </div>
  );
}
