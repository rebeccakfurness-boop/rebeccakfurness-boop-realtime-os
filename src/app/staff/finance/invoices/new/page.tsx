import { prisma } from "@/lib/prisma";
import NewInvoiceForm from "@/components/finance/NewInvoiceForm";

export default async function NewInvoicePage() {
  const orgs = await prisma.organisation.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-2xl px-8 py-10">
      <h1 className="font-display text-3xl text-neutral-text">New invoice</h1>
      <p className="mt-1 text-neutral-muted">All amounts in NZD.</p>
      <div className="mt-6">
        <NewInvoiceForm orgs={orgs} />
      </div>
    </div>
  );
}
