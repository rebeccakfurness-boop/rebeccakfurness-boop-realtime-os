"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import Button from "@/components/Button";
import { createInvoice, type LineItem } from "@/lib/actions/finance";
import type { InvoiceStatus } from "@prisma/client";

export default function NewInvoiceForm({ orgs }: { orgs: { id: string; name: string }[] }) {
  const router = useRouter();
  const [orgId, setOrgId] = useState(orgs[0]?.id ?? "");
  const [items, setItems] = useState<LineItem[]>([{ description: "Session fee", amount: 0 }]);
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<InvoiceStatus>("draft");
  const [pending, setPending] = useState(false);

  const total = items.reduce((s, i) => s + (Number(i.amount) || 0), 0);

  function updateItem(index: number, patch: Partial<LineItem>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId || !dueDate) return;
    setPending(true);
    const invoice = await createInvoice({ orgId, lineItems: items, dueDate, status });
    setPending(false);
    router.push(`/staff/finance/invoices/${invoice.id}`);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 rounded-2xl border border-neutral-border bg-white p-6">
      <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-text">
        Customer
        <select value={orgId} onChange={(e) => setOrgId(e.target.value)} className="rounded-lg border border-neutral-border px-3 py-2 text-sm">
          {orgs.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
      </label>

      <div>
        <p className="text-sm font-medium text-neutral-text">Line items</p>
        <div className="mt-2 flex flex-col gap-2">
          {items.map((item, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={item.description}
                onChange={(e) => updateItem(i, { description: e.target.value })}
                placeholder="Description"
                className="flex-1 rounded-lg border border-neutral-border px-3 py-2 text-sm"
              />
              <input
                type="number"
                step="0.01"
                value={item.amount}
                onChange={(e) => updateItem(i, { amount: Number(e.target.value) })}
                placeholder="Amount"
                className="w-32 rounded-lg border border-neutral-border px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}
                className="text-neutral-border hover:text-red-500"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setItems((prev) => [...prev, { description: "", amount: 0 }])}
          className="mt-2 flex items-center gap-1 text-sm font-medium text-deep-600"
        >
          <Plus size={14} /> Add line item
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-text">
          Due date
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required className="rounded-lg border border-neutral-border px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-text">
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value as InvoiceStatus)} className="rounded-lg border border-neutral-border px-3 py-2 text-sm capitalize">
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
          </select>
        </label>
      </div>

      <div className="flex items-center justify-between border-t border-neutral-border pt-4">
        <span className="font-display text-lg text-neutral-text">Total ${total.toFixed(2)} NZD</span>
        <Button type="submit" disabled={pending || !orgId || !dueDate}>
          {pending ? "Creating…" : "Create invoice"}
        </Button>
      </div>
    </form>
  );
}
