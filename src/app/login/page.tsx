"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Mark from "@/components/Mark";
import Button from "@/components/Button";

export default function LoginPage() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/";
  const [mode, setMode] = useState<"password" | "magic-link">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await signIn("credentials", { email, password, redirect: false, callbackUrl });
    setLoading(false);
    if (result?.error) {
      setError("That email and password combination doesn't match an account.");
      return;
    }
    window.location.href = result?.url ?? callbackUrl;
  }

  async function handleMagicLinkSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    await signIn("email", { email, redirect: false, callbackUrl });
    setLoading(false);
    setSent(true);
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-6 bg-neutral-bg px-6">
      <Mark size={44} />
      <div className="w-full max-w-sm rounded-2xl border border-neutral-border bg-white p-8">
        <h1 className="font-display text-2xl text-neutral-text">Sign in to Realtime OS</h1>
        <p className="mt-1 text-sm text-neutral-muted">Staff, students and business customers all sign in here.</p>

        <div className="mt-6 flex gap-1 rounded-lg bg-neutral-card p-1 text-sm font-medium">
          <button
            type="button"
            onClick={() => setMode("password")}
            className={`flex-1 rounded-md py-1.5 ${mode === "password" ? "bg-white text-deep-600 shadow-sm" : "text-neutral-muted"}`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => setMode("magic-link")}
            className={`flex-1 rounded-md py-1.5 ${mode === "magic-link" ? "bg-white text-deep-600 shadow-sm" : "text-neutral-muted"}`}
          >
            Email me a link
          </button>
        </div>

        {mode === "password" ? (
          <form className="mt-6 flex flex-col gap-4" onSubmit={handlePasswordSubmit}>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-text">
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg border border-neutral-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-deep-300"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-text">
              Password
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-lg border border-neutral-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-deep-300"
              />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        ) : sent ? (
          <p className="mt-6 text-sm text-neutral-text">
            If an account exists for <strong>{email}</strong>, a sign-in link is on its way. In dev, check the
            server console instead of your inbox.
          </p>
        ) : (
          <form className="mt-6 flex flex-col gap-4" onSubmit={handleMagicLinkSubmit}>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-text">
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg border border-neutral-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-deep-300"
              />
            </label>
            <Button type="submit" disabled={loading}>
              {loading ? "Sending…" : "Send sign-in link"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
