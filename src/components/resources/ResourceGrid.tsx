import { FileText, Download } from "lucide-react";

export interface ResourceCardData {
  id: string;
  title: string;
  content: string;
}

function isUploadedFile(content: string) {
  return content.startsWith("/uploads/");
}

export default function ResourceGrid({ resources, emptyLabel }: { resources: ResourceCardData[]; emptyLabel: string }) {
  if (resources.length === 0) {
    return <p className="text-sm text-neutral-muted">{emptyLabel}</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {resources.map((doc) => (
        <a
          key={doc.id}
          href={isUploadedFile(doc.content) ? doc.content : undefined}
          target={isUploadedFile(doc.content) ? "_blank" : undefined}
          rel={isUploadedFile(doc.content) ? "noopener noreferrer" : undefined}
          className="flex items-start gap-3 rounded-2xl border border-neutral-border bg-white p-5 hover:bg-neutral-card/50"
        >
          <FileText size={20} className="mt-0.5 flex-shrink-0 text-neutral-muted" />
          <div className="flex-1">
            <p className="font-medium text-neutral-text">{doc.title}</p>
            {!isUploadedFile(doc.content) && <p className="mt-1 line-clamp-2 text-xs text-neutral-muted">{doc.content}</p>}
          </div>
          {isUploadedFile(doc.content) && <Download size={16} className="mt-1 flex-shrink-0 text-neutral-muted" />}
        </a>
      ))}
    </div>
  );
}
