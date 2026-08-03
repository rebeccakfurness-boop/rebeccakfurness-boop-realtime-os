import { LayoutDashboard, Search, FolderOpen, CalendarPlus } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import PortalShell from "@/components/PortalShell";
import NavLink from "@/components/NavLink";

export default async function BusinessLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "business_customer") redirect("/login");

  return (
    <PortalShell
      scale="deep"
      portalLabel="Business Customer"
      userName={session.user.name}
      userEmail={session.user.email}
      nav={
        <>
          <NavLink scale="deep" exact href="/business" label="Overview" icon={<LayoutDashboard size={18} strokeWidth={2} />} />
          <NavLink scale="deep" href="/business/scholarships" label="Scholarship search" icon={<Search size={18} strokeWidth={2} />} />
          <NavLink scale="deep" href="/business/resources" label="Resources" icon={<FolderOpen size={18} strokeWidth={2} />} />
          <NavLink scale="deep" href="/business/book" label="Book a meeting" icon={<CalendarPlus size={18} strokeWidth={2} />} />
        </>
      }
    >
      {children}
    </PortalShell>
  );
}
