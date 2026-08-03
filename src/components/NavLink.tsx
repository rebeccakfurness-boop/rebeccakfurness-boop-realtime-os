"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

interface NavLinkProps {
  href: string;
  label: string;
  icon: ReactNode;
  exact?: boolean;
  scale: "deep" | "light";
}

/**
 * A single portal-nav row. Isolated as its own client component so the parent
 * layout (a Server Component) can pass a pre-rendered icon element without ever
 * sending a raw component reference across the server/client boundary.
 */
export default function NavLink({ href, label, icon, exact, scale }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);
  const activeBg = scale === "deep" ? "bg-deep-50 text-deep-700" : "bg-light-100 text-light-700";

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        isActive ? activeBg : "text-neutral-muted hover:bg-neutral-card hover:text-neutral-text"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
