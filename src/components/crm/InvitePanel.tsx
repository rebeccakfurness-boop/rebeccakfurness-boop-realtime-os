"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { inviteBusinessCustomer } from "@/lib/actions/crm";
import type { User } from "@prisma/client";

export default function InvitePanel({ orgId, existingUsers }: { orgId: string; existingUsers: User[] }) {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [link, setLink] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setPending(true);
    const result = await inviteBusinessCustomer({ orgId, email: email.trim() });
    setPending(false);
    setEmail("");
    setLink(`/invite/accept?token=${result.token}`);
  }

  return (
    <div className="rounded-2xl border border-neutral-border bg-white p-6">
      <h2 className="font-display text-lg text-neutral-text">Portal access</h2>

      {existingUsers.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1 text-sm text-neutral-text">
          {existingUsers.map((u) => (
            <li key={u.id}>{u.email}</li>
          ))}
        </ul>
      )}

      <form onSubmit={submit} className="mt-3 flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="contact@school.nz"
          className="flex-1 rounded-lg border border-neutral-border px-3 py-1.5 text-sm"
        />
        <button type="submit" disabled={pending} className="flex items-center gap-1 rounded-lg bg-deep-500 px-3 py-1.5 text-sm font-semibold text-white">
          <UserPlus size={14} /> Invite
        </button>
      </form>

      {link && (
        <p className="mt-3 text-xs text-neutral-muted">
          Invite created. In dev, no email is sent, share this link directly:{" "}
          <a href={link} className="font-medium text-deep-600">
            {link}
          </a>
        </p>
      )}
    </div>
  );
}
