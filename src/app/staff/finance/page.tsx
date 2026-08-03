import Link from "next/link";
import { format, subMonths, startOfMonth, endOfMonth, addMonths } from "date-fns";
import { prisma } from "@/lib/prisma";
import CashflowChart, { type MonthlyCashflow } from "@/components/finance/CashflowChart";
import CsvUploadForm from "@/components/finance/CsvUploadForm";
import SyncBankFeedButton from "@/components/finance/SyncBankFeedButton";
import NewBillForm from "@/components/finance/NewBillForm";
import BillStatusToggle from "@/components/finance/BillStatusToggle";

export default async function FinancePage() {
  const [transactions, upcomingInvoices, upcomingBills] = await Promise.all([
    prisma.bankTransaction.findMany({ orderBy: { date: "asc" } }),
    prisma.invoice.findMany({
      where: { status: { not: "paid" } },
      include: { org: true },
      orderBy: { dueDate: "asc" },
    }),
    prisma.bill.findMany({ orderBy: { dueDate: "asc" }, take: 20 }),
  ]);

  const balance = transactions.reduce((sum, t) => sum + (t.direction === "in" ? Number(t.amountNzd) : -Number(t.amountNzd)), 0);

  const months: MonthlyCashflow[] = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = startOfMonth(subMonths(new Date(), i));
    const monthEnd = endOfMonth(monthStart);
    const inMonth = transactions.filter((t) => t.date >= monthStart && t.date <= monthEnd);
    months.push({
      month: format(monthStart, "MMM"),
      income: inMonth.filter((t) => t.direction === "in").reduce((s, t) => s + Number(t.amountNzd), 0),
      expenses: inMonth.filter((t) => t.direction === "out").reduce((s, t) => s + Number(t.amountNzd), 0),
    });
  }

  const forecast = [0, 1, 2].map((i) => {
    const monthStart = startOfMonth(addMonths(new Date(), i));
    const monthEnd = endOfMonth(monthStart);
    const expectedIncome = upcomingInvoices
      .filter((inv) => inv.dueDate >= monthStart && inv.dueDate <= monthEnd)
      .reduce((s, inv) => s + Number(inv.amountNzd), 0);
    const expectedExpense = upcomingBills
      .filter((b) => b.status === "scheduled" && b.dueDate >= monthStart && b.dueDate <= monthEnd)
      .reduce((s, b) => s + Number(b.amountNzd), 0);
    return { month: format(monthStart, "MMM yyyy"), expectedIncome, expectedExpense, net: expectedIncome - expectedExpense };
  });

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="font-display text-3xl text-neutral-text">Finance</h1>
          <p className="mt-1 text-neutral-muted">Cashflow, invoices and bills, all in NZD.</p>
        </div>
        <Link href="/staff/finance/invoices/new" className="rounded-lg bg-deep-500 px-4 py-2 text-sm font-semibold text-white">
          New invoice
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Current balance" value={balance} />
        <StatCard label="Owed to you (unpaid invoices)" value={upcomingInvoices.reduce((s, i) => s + Number(i.amountNzd), 0)} />
        <StatCard label="Bills scheduled" value={upcomingBills.filter((b) => b.status === "scheduled").reduce((s, b) => s + Number(b.amountNzd), 0)} accent="warn" />
      </div>

      <div className="mt-6 rounded-2xl border border-neutral-border bg-white p-5">
        <h2 className="font-display text-base text-neutral-text">Cashflow, last 6 months</h2>
        <div className="mt-3">
          <CashflowChart data={months} />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-neutral-border bg-white p-5">
        <h2 className="font-display text-base text-neutral-text">Forecast, next 3 months</h2>
        <p className="text-xs text-neutral-muted">Based on unpaid invoices due and bills scheduled in that month.</p>
        <div className="mt-3 grid grid-cols-3 gap-4">
          {forecast.map((f) => (
            <div key={f.month} className="rounded-xl bg-neutral-card/60 p-3 text-sm">
              <p className="font-medium text-neutral-text">{f.month}</p>
              <p className="mt-1 text-teal-700">+${f.expectedIncome.toLocaleString()}</p>
              <p className="text-amber-700">-${f.expectedExpense.toLocaleString()}</p>
              <p className="mt-1 font-semibold text-neutral-text">Net ${f.net.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-start justify-between gap-4">
        <div className="flex-1">
          <CsvUploadForm />
        </div>
        <SyncBankFeedButton />
      </div>

      <div className="mt-6 rounded-2xl border border-neutral-border bg-white p-5">
        <h2 className="font-display text-base text-neutral-text">Invoices due</h2>
        <ul className="mt-3 flex flex-col divide-y divide-neutral-border text-sm">
          {upcomingInvoices.map((inv) => (
            <li key={inv.id} className="flex items-center justify-between py-2">
              <Link href={`/staff/finance/invoices/${inv.id}`} className="font-medium text-deep-600 hover:underline">
                {inv.org.name}
              </Link>
              <span className="text-neutral-text">${Number(inv.amountNzd).toFixed(2)}</span>
              <span className="text-neutral-muted">Due {format(inv.dueDate, "d MMM yyyy")}</span>
              <span className="rounded-full bg-neutral-card px-2 py-0.5 text-xs font-medium capitalize text-neutral-muted">{inv.status}</span>
            </li>
          ))}
          {upcomingInvoices.length === 0 && <li className="py-4 text-neutral-muted">Nothing outstanding.</li>}
        </ul>
      </div>

      <div className="mt-6 rounded-2xl border border-neutral-border bg-white p-5">
        <h2 className="font-display text-base text-neutral-text">Bills to pay</h2>
        <div className="mt-3">
          <NewBillForm />
        </div>
        <ul className="mt-3 flex flex-col divide-y divide-neutral-border text-sm">
          {upcomingBills.map((bill) => (
            <li key={bill.id} className="flex items-center justify-between py-2">
              <span className="font-medium text-neutral-text">{bill.supplier}</span>
              <span className="text-neutral-text">${Number(bill.amountNzd).toFixed(2)}</span>
              <span className="text-neutral-muted">Due {format(bill.dueDate, "d MMM yyyy")}</span>
              <BillStatusToggle billId={bill.id} status={bill.status} />
            </li>
          ))}
          {upcomingBills.length === 0 && <li className="py-4 text-neutral-muted">No bills on file.</li>}
        </ul>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: "warn" }) {
  return (
    <div className="rounded-2xl border border-neutral-border bg-white p-4">
      <p className="text-xs font-medium text-neutral-muted">{label}</p>
      <p className={`mt-1 font-display text-2xl ${accent === "warn" ? "text-amber-700" : "text-neutral-text"}`}>
        ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} NZD
      </p>
    </div>
  );
}
