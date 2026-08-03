"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, X } from "lucide-react";
import Button from "@/components/Button";
import { linkDocumentToOrg, unlinkDocumentFromOrg } from "@/lib/actions/documents";

interface OrgOption {
  id: string;
  name: string;
}

export default function LinkedOrgsPanel({
  documentId,
  linkedOrgs,
  allOrgs,
}: {
  documentId: string;
  linkedOrgs: OrgOption[];
  allOrgs: OrgOption[];
}) {
  const router = useRouter();
  const linkedIds = new Set(linkedOrgs.map((o) => o.id));
  const available = allOrgs.filter((o) => !linkedIds.has(o.id));
  const [selected, setSelected] = useState(available[0]?.id ?? "");
  const [pending, setPending] = useState(false);

  async function link() {
    if (!selected) return;
    setPending(true);
    await linkDocumentToOrg({ documentId, orgId: selected });
    setPending(false);
    router.refresh();
  }

  async function unlink(orgId: string) {
    setPending(true);
    await unlinkDocumentFromOrg({ documentId, orgId });
    setPending(false);
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-neutral-border bg-white p-6">
      <h2 className="flex items-center gap-2 font-display text-lg text-neutral-text">
        <Building2 size={17} /> Linked customers
      </h2>

      <ul className="mt-3 flex flex-col gap-2">
        {linkedOrgs.map((org) => (
          <li key={org.id} className="flex items-center justify-between rounded-lg border border-neutral-border px-3 py-2">
            <Link href={`/staff/crm/${org.id}`} className="text-sm font-medium text-deep-600 hover:underline">
              {org.name}
            </Link>
            <button onClick={() => unlink(org.id)} disabled={pending} className="text-neutral-muted hover:text-red-600">
              <X size={15} />
            </button>
          </li>
        ))}
        {linkedOrgs.length === 0 && <li className="text-sm text-neutral-muted">Not linked to a customer card yet.</li>}
      </ul>

      {available.length > 0 && (
        <div className="mt-3 flex gap-2">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="flex-1 rounded-lg border border-neutral-border px-2 py-1.5 text-sm"
          >
            {available.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
          <Button onClick={link} disabled={pending} variant="secondary">
            Link
          </Button>
        </div>
      )}
    </div>
  );
}
