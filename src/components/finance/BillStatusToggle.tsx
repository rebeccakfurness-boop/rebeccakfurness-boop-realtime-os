"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateBillStatus } from "@/lib/actions/finance";
import type { BillStatus } from "@prisma/client";

export default function BillStatusToggle({ billId, status }: { billId: string; status: BillStatus }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await updateBillStatus({ billId, status: status === "paid" ? "scheduled" : "paid" });
          router.refresh();
        })
      }
      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${status === "paid" ? "bg-deep-100 text-deep-700" : "bg-neutral-card text-neutral-muted"}`}
    >
      {status === "paid" ? "Paid" : "Mark paid"}
    </button>
  );
}
