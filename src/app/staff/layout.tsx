import { LayoutDashboard, Building2, Kanban, CalendarDays, Clock, Wallet, FileText } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PortalShell from "@/components/PortalShell";
import NavLink from "@/components/NavLink";
import FloatingTimer from "@/components/time/FloatingTimer";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "staff") redirect("/login");

  const [activeEntry, orgs, tasks] = await Promise.all([
    prisma.timeEntry.findFirst({ where: { userId: session.user.id, endTime: null }, include: { org: true, task: true } }),
    prisma.organisation.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.task.findMany({
      where: { assigneeId: session.user.id, status: { not: "done" } },
      select: { id: true, title: true },
    }),
  ]);

  return (
    <PortalShell
      scale="deep"
      portalLabel="Staff Admin"
      userName={session.user.name}
      userEmail={session.user.email}
      nav={
        <>
          <NavLink scale="deep" exact href="/staff" label="Overview" icon={<LayoutDashboard size={18} strokeWidth={2} />} />
          <NavLink scale="deep" href="/staff/crm" label="CRM" icon={<Building2 size={18} strokeWidth={2} />} />
          <NavLink scale="deep" href="/staff/pipeline" label="Pipeline" icon={<Kanban size={18} strokeWidth={2} />} />
          <NavLink scale="deep" href="/staff/calendar" label="Calendar" icon={<CalendarDays size={18} strokeWidth={2} />} />
          <NavLink scale="deep" href="/staff/time" label="Time" icon={<Clock size={18} strokeWidth={2} />} />
          <NavLink scale="deep" href="/staff/finance" label="Finance" icon={<Wallet size={18} strokeWidth={2} />} />
          <NavLink scale="deep" href="/staff/documents" label="Documents" icon={<FileText size={18} strokeWidth={2} />} />
        </>
      }
    >
      {children}
      <FloatingTimer
        activeEntry={
          activeEntry
            ? {
                id: activeEntry.id,
                startTime: activeEntry.startTime.toISOString(),
                orgName: activeEntry.org?.name ?? null,
                taskTitle: activeEntry.task?.title ?? null,
              }
            : null
        }
        orgs={orgs}
        tasks={tasks}
      />
    </PortalShell>
  );
}
