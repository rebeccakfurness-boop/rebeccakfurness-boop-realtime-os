import { LayoutDashboard, Building2, Kanban, CalendarDays, Clock, Wallet, FileText } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import PortalShell from "@/components/PortalShell";
import NavLink from "@/components/NavLink";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "staff") redirect("/login");

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
    </PortalShell>
  );
}
