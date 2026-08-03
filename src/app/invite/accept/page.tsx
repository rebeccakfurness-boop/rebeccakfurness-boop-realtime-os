"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Mark from "@/components/Mark";
import Button from "@/components/Button";
import { acceptInvite } from "@/lib/actions/auth";

const initialState = { error: undefined as string | undefined };

export default function AcceptInvitePage() {
  const token = useSearchParams().get("token") ?? "";
  const [state, formAction, pending] = useActionState(async (_: typeof initialState, formData: FormData) => {
    const result = await acceptInvite(formData);
    return result ?? initialState;
  }, initialState);

  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-6 bg-neutral-bg px-6">
      <Mark size={44} />
      <div className="w-full max-w-sm rounded-2xl border border-neutral-border bg-white p-8">
        <h1 className="font-display text-2xl text-neutral-text">Set up your account</h1>
        <p className="mt-1 text-sm text-neutral-muted">You've been invited to the Realtime business customer portal.</p>

        <form className="mt-6 flex flex-col gap-4" action={formAction}>
          <input type="hidden" name="token" value={token} />
          <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-text">
            Your name
            <input name="name" required className="rounded-lg border border-neutral-border px-3 py-2 text-sm" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-text">
            Choose a password
            <input name="password" type="password" required minLength={8} className="rounded-lg border border-neutral-border px-3 py-2 text-sm" />
          </label>
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          <Button type="submit" disabled={pending}>
            {pending ? "Setting up…" : "Create account"}
          </Button>
        </form>
      </div>
    </div>
  );
}
