import { CheckCircle2, CircleAlert, Mail, CalendarDays } from "lucide-react";
import { buttonClasses } from "@/components/Button";
import { getConnectedGoogleAccount, isGoogleConfigured } from "@/lib/integrations/google-auth";
import DisconnectGoogleButton from "@/components/settings/DisconnectGoogleButton";

export default async function StaffSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ google?: string }>;
}) {
  const { google } = await searchParams;
  const configured = isGoogleConfigured();
  const account = configured ? await getConnectedGoogleAccount() : null;

  return (
    <div className="mx-auto max-w-2xl px-8 py-10">
      <h1 className="font-display text-3xl text-neutral-text">Settings</h1>
      <p className="mt-1 text-neutral-muted">Connect real accounts so Calendar and Gmail features use live data.</p>

      {google === "connected" && (
        <p className="mt-4 rounded-lg bg-teal-100 px-4 py-2 text-sm text-teal-700">Google account connected.</p>
      )}
      {google === "error" && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
          Something went wrong connecting your Google account. Try again.
        </p>
      )}

      <div className="mt-6 rounded-2xl border border-neutral-border bg-white p-6">
        <div className="flex items-center gap-2">
          <CalendarDays size={18} className="text-neutral-muted" />
          <Mail size={18} className="text-neutral-muted" />
          <h2 className="font-display text-lg text-neutral-text">Google account (Calendar &amp; Gmail)</h2>
        </div>
        <p className="mt-1 text-sm text-neutral-muted">
          Powers real meeting availability/booking on the Calendar page, and real threaded email on Customer Cards.
        </p>

        {!configured && (
          <p className="mt-4 flex items-center gap-2 text-sm text-neutral-muted">
            <CircleAlert size={15} /> GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are not set yet, running on mock data.
          </p>
        )}

        {configured && !account && (
          <div className="mt-4">
            <p className="flex items-center gap-2 text-sm text-neutral-muted">
              <CircleAlert size={15} /> No Google account connected yet, running on mock data.
            </p>
            <a href="/api/google/connect" className={`${buttonClasses("deep", "primary")} mt-3 inline-flex`}>
              Connect Google account
            </a>
          </div>
        )}

        {configured && account && (
          <div className="mt-4 flex items-center justify-between rounded-lg border border-neutral-border px-4 py-3">
            <p className="flex items-center gap-2 text-sm text-neutral-text">
              <CheckCircle2 size={15} className="text-teal-700" /> Connected as {account.user.email}
            </p>
            <DisconnectGoogleButton />
          </div>
        )}
      </div>
    </div>
  );
}
