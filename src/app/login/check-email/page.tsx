import Mark from "@/components/Mark";

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-6 bg-neutral-bg px-6 text-center">
      <Mark size={44} />
      <h1 className="font-display text-2xl text-neutral-text">Check your email</h1>
      <p className="max-w-sm text-sm text-neutral-muted">
        A sign-in link is on its way. In dev, it's printed to the server console instead of sent.
      </p>
    </div>
  );
}
