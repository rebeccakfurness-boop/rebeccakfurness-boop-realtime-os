"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createBill } from "@/lib/actions/finance";

export default function NewBillForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await createBill(formData);
    setPending(false);
    if (result?.error) setError(result.error);
    else {
      formRef.current?.reset();
      router.refresh();
    }
  }

  return (
    <form ref={formRef} action={submit} className="flex flex-wrap items-end gap-2 rounded-2xl border border-neutral-border bg-white p-4">
      <input name="supplier" placeholder="Supplier" required className="rounded-lg border border-neutral-border px-2 py-1.5 text-sm" />
      <input name="amountNzd" type="number" step="0.01" placeholder="Amount NZD" required className="w-32 rounded-lg border border-neutral-border px-2 py-1.5 text-sm" />
      <input name="dueDate" type="date" required className="rounded-lg border border-neutral-border px-2 py-1.5 text-sm" />
      <input name="file" type="file" accept="application/pdf,image/*" className="text-xs text-neutral-muted" />
      <button type="submit" disabled={pending} className="rounded-lg bg-deep-500 px-4 py-1.5 text-sm font-semibold text-white">
        {pending ? "Saving…" : "Add bill"}
      </button>
      {error && <p className="w-full text-xs text-red-600">{error}</p>}
    </form>
  );
}
