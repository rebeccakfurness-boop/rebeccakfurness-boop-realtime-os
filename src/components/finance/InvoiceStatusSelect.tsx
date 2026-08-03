"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateInvoiceStatus } from "@/lib/actions/finance";
import type { InvoiceStatus } from "@prisma/client";

const STATUSES: InvoiceStatus[] = ["draft", "sent", "paid", "overdue"];

export default function InvoiceStatusSelect({ invoiceId, status }: { invoiceId: string; status: InvoiceStatus }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={pending}
      onChange={(e) =>
        startTransition(async () => {
          await updateInvoiceStatus({ invoiceId, status: e.target.value as InvoiceStatus });
          router.refresh();
        })
      }
      className="rounded-lg border border-neutral-border px-3 py-1.5 text-sm capitalize print:hidden"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
