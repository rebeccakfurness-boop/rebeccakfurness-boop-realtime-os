"use client";

import { useActionState } from "react";
import Link from "next/link";
import Mark from "@/components/Mark";
import Button from "@/components/Button";
import { registerStudent } from "@/lib/actions/auth";

const initialState = { error: undefined as string | undefined };

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(async (_: typeof initialState, formData: FormData) => {
    const result = await registerStudent(formData);
    return result ?? initialState;
  }, initialState);

  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-6 bg-light-50 px-6">
      <Mark scale="light" size={44} />
      <div className="w-full max-w-sm rounded-2xl border border-neutral-border bg-white p-8">
        <h1 className="font-display text-2xl text-neutral-text">Create your student account</h1>
        <p className="mt-1 text-sm text-neutral-muted">
          Track your goals, search scholarships, and build your CV and applications.
        </p>

        <form className="mt-6 flex flex-col gap-4" action={formAction}>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-text">
            Name
            <input
              name="name"
              required
              className="rounded-lg border border-neutral-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-light-300"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-text">
            Email
            <input
              name="email"
              type="email"
              required
              className="rounded-lg border border-neutral-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-light-300"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-text">
            Password
            <input
              name="password"
              type="password"
              required
              minLength={8}
              className="rounded-lg border border-neutral-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-light-300"
            />
          </label>
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          <Button scale="light" type="submit" disabled={pending}>
            {pending ? "Creating your account…" : "Create account"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-neutral-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-light-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
