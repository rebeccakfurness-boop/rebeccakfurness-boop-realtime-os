import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import OrgDetailsEditor from "@/components/crm/OrgDetailsEditor";
import ContactsPanel from "@/components/crm/ContactsPanel";
import ActivityTimeline from "@/components/crm/ActivityTimeline";
import FilesPanel from "@/components/crm/FilesPanel";
import InvitePanel from "@/components/crm/InvitePanel";

export default async function CustomerCardPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;

  const org = await prisma.organisation.findUnique({
    where: { id: orgId },
    include: {
      contacts: { orderBy: { createdAt: "asc" } },
      emails: { orderBy: { timestamp: "desc" } },
      activities: { orderBy: { createdAt: "desc" } },
      documentLinks: { include: { document: true } },
      users: true,
    },
  });

  if (!org) notFound();

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <Link href="/staff/crm" className="text-sm font-semibold text-deep-600">
        ← All customers
      </Link>

      <div className="mt-4 flex items-start justify-between gap-6">
        <div>
          <h1 className="font-display text-3xl text-neutral-text">{org.name}</h1>
          <p className="mt-1 text-neutral-muted capitalize">
            {org.type.replace("_", " ")} {org.region && `· ${org.region}`}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <OrgDetailsEditor org={{ ...org, dealValueNzd: org.dealValueNzd ? Number(org.dealValueNzd) : null }} />
          <ContactsPanel orgId={org.id} contacts={org.contacts} />
          <ActivityTimeline orgId={org.id} activities={org.activities} emails={org.emails} contacts={org.contacts} />
        </div>

        <div className="flex flex-col gap-6">
          <FilesPanel orgId={org.id} links={org.documentLinks} />
          <InvitePanel orgId={org.id} existingUsers={org.users} />
        </div>
      </div>
    </div>
  );
}
