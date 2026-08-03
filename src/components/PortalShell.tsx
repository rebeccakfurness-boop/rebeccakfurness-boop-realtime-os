import type { ReactNode } from "react";
import Logo from "./Logo";
import SignOutButton from "./SignOutButton";

type Scale = "deep" | "light";

interface PortalShellProps {
  scale: Scale;
  portalLabel: string;
  nav: ReactNode;
  userName?: string | null;
  userEmail?: string | null;
  children: ReactNode;
}

export default function PortalShell({ scale, portalLabel, nav, userName, userEmail, children }: PortalShellProps) {
  const badgeBg = scale === "deep" ? "bg-deep-100 text-deep-700" : "bg-light-200 text-light-800";

  return (
    <div className="flex min-h-screen w-full bg-neutral-bg">
      <aside className="flex w-64 flex-shrink-0 flex-col border-r border-neutral-border bg-white">
        <div className="flex items-center gap-2 border-b border-neutral-border px-5 py-5">
          <Logo scale={scale} />
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${badgeBg}`}>
            {portalLabel}
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">{nav}</nav>

        <div className="border-t border-neutral-border px-4 py-4">
          <p className="truncate text-sm font-medium text-neutral-text">{userName ?? "—"}</p>
          <p className="truncate text-xs text-neutral-muted">{userEmail}</p>
          <SignOutButton className="mt-2" />
        </div>
      </aside>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
