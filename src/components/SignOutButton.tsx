"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function SignOutButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className={`inline-flex items-center gap-1.5 text-sm font-medium text-neutral-muted hover:text-neutral-text ${className}`}
    >
      <LogOut size={15} />
      Sign out
    </button>
  );
}
