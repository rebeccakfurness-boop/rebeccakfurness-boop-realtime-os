import { notFound } from "next/navigation";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import InvoiceStatusSelect from "@/components/finance/InvoiceStatusSelect";
import PrintButton from "@/components/finance/PrintButton";
import type { LineItem } from "@/lib/actions/finance";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ invoiceId: string }> }) {
  const { invoiceId } = await params;
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId }, include: { org: true } });
  if (!invoice) notFound();

  const lineItems = invoice.lineItems as unknown as LineItem[];

  return (
    <div className="mx-auto max-w-2xl px-8 py-10">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <InvoiceStatusSelect invoiceId={invoice.id} status={invoice.status} />
        <PrintButton />
      </div>

      <div className="rounded-2xl border border-neutral-border bg-white p-10 print:border-0 print:p-0">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-2xl text-neutral-text">Realtime</h1>
            <p className="text-sm text-neutral-muted">Invoice</p>
          </div>
          <div className="text-right text-sm text-neutral-muted">
            <p>Invoice #{invoice.id.slice(-8).toUpperCase()}</p>
            <p>Issued {format(invoice.createdAt, "d MMM yyyy")}</p>
            <p>Due {format(invoice.dueDate, "d MMM yyyy")}</p>
          </div>
        </div>

        <div className="mt-8">
          <p className="text-xs font-semibold tracking-wide text-neutral-muted uppercase">Bill to</p>
          <p className="mt-1 text-neutral-text">{invoice.org.name}</p>
        </div>

        <table className="mt-8 w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-border text-left text-xs font-semibold tracking-wide text-neutral-muted uppercase">
              <th className="pb-2">Description</th>
              <th className="pb-2 text-right">Amount (NZD)</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, i) => (
              <tr key={i} className="border-b border-neutral-border">
                <td className="py-2 text-neutral-text">{item.description}</td>
                <td className="py-2 text-right text-neutral-text">${item.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex justify-end">
          <div className="w-48">
            <div className="flex justify-between font-display text-lg text-neutral-text">
              <span>Total</span>
              <span>${Number(invoice.amountNzd).toFixed(2)}</span>
            </div>
            <p className="mt-1 text-right text-xs font-medium capitalize text-neutral-muted">{invoice.status}</p>
          </div>
        </div>

        <p className="mt-10 text-xs text-neutral-muted">All amounts in New Zealand dollars (NZD).</p>
      </div>
    </div>
  );
}
