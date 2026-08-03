import { LayoutDashboard, Search, FolderOpen, FileEdit, ScrollText, Mail } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import PortalShell from "@/components/PortalShell";
import NavLink from "@/components/NavLink";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "student") redirect("/login");

  return (
    <PortalShell
      scale="light"
      portalLabel="Student"
      userName={session.user.name}
      userEmail={session.user.email}
      nav={
        <>
          <NavLink scale="light" exact href="/student" label="Overview" icon={<LayoutDashboard size={18} strokeWidth={2} />} />
          <NavLink scale="light" href="/student/scholarships" label="Scholarship search" icon={<Search size={18} strokeWidth={2} />} />
          <NavLink scale="light" href="/student/resources" label="Resources" icon={<FolderOpen size={18} strokeWidth={2} />} />
          <NavLink scale="light" href="/student/cv-builder" label="CV builder" icon={<FileEdit size={18} strokeWidth={2} />} />
          <NavLink scale="light" href="/student/application-builder" label="Applications" icon={<ScrollText size={18} strokeWidth={2} />} />
          <NavLink scale="light" href="/student/cover-letter-builder" label="Cover letters" icon={<Mail size={18} strokeWidth={2} />} />
        </>
      }
    >
      {children}
    </PortalShell>
  );
}
