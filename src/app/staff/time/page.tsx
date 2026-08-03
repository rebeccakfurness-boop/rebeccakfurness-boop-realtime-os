import { startOfWeek, startOfMonth } from "date-fns";
import { prisma } from "@/lib/prisma";
import ManualEntryForm from "@/components/time/ManualEntryForm";

function formatHours(seconds: number) {
  return (seconds / 3600).toFixed(1);
}

function summarise<T extends { durationSeconds: number | null }>(entries: T[], keyFn: (e: T) => string) {
  const totals = new Map<string, number>();
  for (const e of entries) {
    const key = keyFn(e);
    totals.set(key, (totals.get(key) ?? 0) + (e.durationSeconds ?? 0));
  }
  return [...totals.entries()].sort((a, b) => b[1] - a[1]);
}

export default async function TimePage() {
  const [orgs, tasks, entriesThisWeek, entriesThisMonth] = await Promise.all([
    prisma.organisation.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.task.findMany({ where: { status: { not: "done" } }, select: { id: true, title: true } }),
    prisma.timeEntry.findMany({
      where: { startTime: { gte: startOfWeek(new Date(), { weekStartsOn: 1 }) } },
      include: { org: true, task: { include: { goal: true } }, user: true },
    }),
    prisma.timeEntry.findMany({
      where: { startTime: { gte: startOfMonth(new Date()) } },
      include: { org: true, task: { include: { goal: true } }, user: true },
    }),
  ]);

  const byCustomerWeek = summarise(entriesThisWeek, (e) => e.org?.name ?? "Admin / general");
  const byGoalMonth = summarise(entriesThisMonth, (e) => e.task?.goal.title ?? "No goal");
  const byStaffMonth = summarise(entriesThisMonth, (e) => e.user.name ?? e.user.email);

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <h1 className="font-display text-3xl text-neutral-text">Time</h1>
      <p className="mt-1 text-neutral-muted">Track time against customers and goals, or log it after the fact.</p>

      <div className="mt-6">
        <ManualEntryForm orgs={orgs} tasks={tasks} />
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        <SummaryCard title="This week, by customer" rows={byCustomerWeek} />
        <SummaryCard title="This month, by goal" rows={byGoalMonth} />
        <SummaryCard title="This month, by staff" rows={byStaffMonth} />
      </div>
    </div>
  );
}

function SummaryCard({ title, rows }: { title: string; rows: [string, number][] }) {
  return (
    <div className="rounded-2xl border border-neutral-border bg-white p-5">
      <h2 className="font-display text-base text-neutral-text">{title}</h2>
      <ul className="mt-3 flex flex-col gap-2 text-sm">
        {rows.map(([label, seconds]) => (
          <li key={label} className="flex items-center justify-between">
            <span className="truncate text-neutral-text">{label}</span>
            <span className="text-neutral-muted">{formatHours(seconds)}h</span>
          </li>
        ))}
        {rows.length === 0 && <li className="text-neutral-muted">No time logged yet.</li>}
      </ul>
    </div>
  );
}
