"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { createContact } from "@/lib/actions/crm";
import type { Contact } from "@prisma/client";

export default function ContactsPanel({ orgId, contacts }: { orgId: string; contacts: Contact[] }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setPending(true);
    await createContact({ orgId, name: name.trim(), title: title.trim(), email: email.trim(), phone: phone.trim() });
    setPending(false);
    setAdding(false);
    setName("");
    setTitle("");
    setEmail("");
    setPhone("");
  }

  return (
    <div className="rounded-2xl border border-neutral-border bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg text-neutral-text">Contacts</h2>
        <button type="button" onClick={() => setAdding((v) => !v)} className="flex items-center gap-1 text-sm font-semibold text-deep-600">
          <Plus size={15} /> Add contact
        </button>
      </div>

      <ul className="mt-3 flex flex-col divide-y divide-neutral-border">
        {contacts.map((c) => (
          <li key={c.id} className="flex items-center justify-between py-2.5 text-sm">
            <div>
              <p className="font-medium text-neutral-text">{c.name}</p>
              <p className="text-neutral-muted">{c.title}</p>
            </div>
            <div className="text-right text-neutral-muted">
              <p>{c.email}</p>
              <p>{c.phone}</p>
            </div>
          </li>
        ))}
        {contacts.length === 0 && <li className="py-4 text-sm text-neutral-muted">No contacts yet.</li>}
      </ul>

      {adding && (
        <form onSubmit={submit} className="mt-3 grid gap-2 rounded-xl border border-neutral-border p-3 sm:grid-cols-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="rounded-lg border border-neutral-border px-2 py-1.5 text-sm" />
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="rounded-lg border border-neutral-border px-2 py-1.5 text-sm" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="rounded-lg border border-neutral-border px-2 py-1.5 text-sm" />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="rounded-lg border border-neutral-border px-2 py-1.5 text-sm" />
          <button type="submit" disabled={pending} className="sm:col-span-2 rounded-lg bg-deep-500 px-3 py-1.5 text-sm font-semibold text-white">
            {pending ? "Adding…" : "Add contact"}
          </button>
        </form>
      )}
    </div>
  );
}
