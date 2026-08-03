"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import Button from "@/components/Button";
import { createOrganisation } from "@/lib/actions/crm";
import type { OrgType } from "@prisma/client";

const TYPES: OrgType[] = ["school", "university", "training_institute", "corporate", "other"];

export default function NewOrgForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<OrgType>("school");
  const [region, setRegion] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setPending(true);
    const org = await createOrganisation({ name: name.trim(), type, region: region.trim() || undefined });
    setPending(false);
    setOpen(false);
    setName("");
    setRegion("");
    router.push(`/staff/crm/${org.id}`);
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus size={16} /> New customer
      </Button>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 rounded-xl border border-neutral-border bg-white p-4">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Business name"
        className="rounded-lg border border-neutral-border px-3 py-1.5 text-sm"
      />
      <div className="flex gap-2">
        <select value={type} onChange={(e) => setType(e.target.value as OrgType)} className="rounded-lg border border-neutral-border px-2 py-1.5 text-sm capitalize">
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t.replace("_", " ")}
            </option>
          ))}
        </select>
        <input
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          placeholder="Region"
          className="w-28 rounded-lg border border-neutral-border px-2 py-1.5 text-sm"
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={pending} className="flex-1">
          {pending ? "Creating…" : "Create"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
