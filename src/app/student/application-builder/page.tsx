import { listApplications, createApplication, deleteApplication } from "@/lib/actions/student-builders";
import DocumentListPanel from "@/components/student/DocumentListPanel";
import type { ApplicationContent } from "@/lib/student-content-types";

export default async function ApplicationBuilderListPage() {
  const applications = await listApplications();

  async function onCreate() {
    "use server";
    return createApplication();
  }

  async function onDelete(id: string) {
    "use server";
    await deleteApplication({ applicationId: id });
  }

  return (
    <div className="mx-auto max-w-2xl px-8 py-10">
      <h1 className="font-display text-3xl text-neutral-text">Scholarship application builder</h1>
      <p className="mt-1 text-neutral-muted">
        Values and fit, leadership, community, academic, an honest moment, and closing: merit and future impact.
      </p>

      <div className="mt-8">
        <DocumentListPanel
          basePath="/student/application-builder"
          items={applications.map((a) => ({
            id: a.id,
            title: (a.structuredContent as unknown as ApplicationContent).scholarshipTitle || "Untitled application",
            updatedAt: a.updatedAt.toISOString(),
          }))}
          emptyLabel="No applications started yet."
          newLabel="New application"
          onCreate={onCreate}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}
