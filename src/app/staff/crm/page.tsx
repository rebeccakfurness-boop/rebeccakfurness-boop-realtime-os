import Link from "next/link";
import { prisma } from "@/lib/prisma";
import NewOrgForm from "@/components/crm/NewOrgForm";

const TYPE_LABEL: Record<string, string> = {
  school: "School",
  university: "University",
  training_institute: "Training institute",
  corporate: "Corporate",
  other: "Other",
};

export default async function CrmPage() {
  const orgs = await prisma.organisation.findMany({
    include: { contacts: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="font-display text-3xl text-neutral-text">Customer cards</h1>
          <p className="mt-1 text-neutral-muted">Every school, university, institute and corporate client, one card each.</p>
        </div>
        <NewOrgForm />
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-neutral-border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-border text-left text-xs font-semibold tracking-wide text-neutral-muted uppercase">
              <th className="px-5 py-3">Business</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Primary contact</th>
              <th className="px-5 py-3">Stage</th>
              <th className="px-5 py-3">Value (NZD)</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {orgs.map((org) => (
              <tr key={org.id} className="border-b border-neutral-border last:border-0 hover:bg-neutral-card/50">
                <td className="px-5 py-3">
                  <Link href={`/staff/crm/${org.id}`} className="font-medium text-deep-600 hover:underline">
                    {org.name}
                  </Link>
                  {org.region && <span className="ml-2 text-xs text-neutral-muted">{org.region}</span>}
                </td>
                <td className="px-5 py-3 text-neutral-muted">{TYPE_LABEL[org.type]}</td>
                <td className="px-5 py-3 text-neutral-muted">{org.contacts[0]?.name ?? "—"}</td>
                <td className="px-5 py-3">
                  <span className="rounded-full bg-deep-50 px-2 py-0.5 text-xs font-medium text-deep-700 capitalize">
                    {org.pipelineStage.replace("_", " ")}
                  </span>
                </td>
                <td className="px-5 py-3 text-neutral-text">{org.dealValueNzd ? `$${Number(org.dealValueNzd).toFixed(2)}` : "—"}</td>
                <td className="px-5 py-3">
                  <span className="flex items-center gap-1.5 text-xs text-neutral-muted">
                    {org.invoiced ? "Invoiced" : "Not invoiced"} · {org.paidStatus}
                  </span>
                </td>
              </tr>
            ))}
            {orgs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-neutral-muted">
                  No customer cards yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
