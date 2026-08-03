import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export default async function BusinessOverviewPage() {
  const session = await auth();
  const orgId = session!.user.orgId;

  const org = orgId
    ? await prisma.organisation.findUnique({
        where: { id: orgId },
        include: {
          meetings: { orderBy: { startTime: "desc" }, take: 10 },
          invoices: { orderBy: { createdAt: "desc" }, take: 10 },
        },
      })
    : null;

  const now = new Date();
  const upcoming = org?.meetings.filter((m) => m.startTime >= now) ?? [];
  const past = org?.meetings.filter((m) => m.startTime < now) ?? [];

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <h1 className="font-display text-3xl text-neutral-text">{org?.name ?? "Your organisation"}</h1>
      <p className="mt-1 text-neutral-muted">Your relationship with Realtime, at a glance.</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-neutral-border bg-white p-6">
          <h2 className="font-display text-lg text-neutral-text">Upcoming sessions</h2>
          {upcoming.length === 0 ? (
            <p className="mt-3 text-sm text-neutral-muted">Nothing booked yet.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              {upcoming.map((m) => (
                <li key={m.id} className="flex justify-between text-neutral-text">
                  <span className="capitalize">{m.type.replace("_", " ")}</span>
                  <span className="text-neutral-muted">{format(m.startTime, "d MMM, h:mmaaa")}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-neutral-border bg-white p-6">
          <h2 className="font-display text-lg text-neutral-text">Past sessions</h2>
          {past.length === 0 ? (
            <p className="mt-3 text-sm text-neutral-muted">No past sessions yet.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              {past.map((m) => (
                <li key={m.id} className="flex justify-between text-neutral-text">
                  <span className="capitalize">{m.type.replace("_", " ")}</span>
                  <span className="text-neutral-muted">{format(m.startTime, "d MMM yyyy")}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {org && (
          <div className="rounded-2xl border border-neutral-border bg-white p-6 sm:col-span-2">
            <h2 className="font-display text-lg text-neutral-text">Invoices</h2>
            {org.invoices.length === 0 ? (
              <p className="mt-3 text-sm text-neutral-muted">No invoices on file.</p>
            ) : (
              <table className="mt-3 w-full text-sm">
                <tbody>
                  {org.invoices.map((inv) => (
                    <tr key={inv.id} className="border-t border-neutral-border">
                      <td className="py-2 text-neutral-text">${Number(inv.amountNzd).toFixed(2)} NZD</td>
                      <td className="py-2 capitalize text-neutral-muted">{inv.status}</td>
                      <td className="py-2 text-neutral-muted">Due {format(inv.dueDate, "d MMM yyyy")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
