import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Mark from "@/components/Mark";
import { buttonClasses } from "@/components/Button";

const ROLE_HOME: Record<string, string> = {
  staff: "/staff",
  student: "/student",
  business_customer: "/business",
};

export default async function Home() {
  const session = await auth();
  if (session?.user) redirect(ROLE_HOME[session.user.role] ?? "/login");

  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-6 bg-neutral-bg px-6 text-center">
      <Mark size={52} />
      <h1 className="font-display text-4xl text-neutral-text">Realtime OS</h1>
      <p className="max-w-md text-neutral-muted">
        The internal operating platform for Realtime: CRM, pipeline, finance, documents, and the
        student and business customer portals, all in one place.
      </p>
      <div className="flex gap-3">
        <Link href="/login" className={buttonClasses("deep", "primary")}>
          Sign in
        </Link>
        <Link href="/register" className={buttonClasses("deep", "secondary")}>
          Create a student account
        </Link>
      </div>
    </div>
  );
}
