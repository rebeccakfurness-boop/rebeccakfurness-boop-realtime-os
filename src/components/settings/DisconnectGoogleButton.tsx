"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buttonClasses } from "@/components/Button";
import { disconnectGoogle } from "@/lib/actions/settings";

export default function DisconnectGoogleButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function disconnect() {
    if (!window.confirm("Disconnect this Google account? Calendar and Gmail features will fall back to mock data.")) return;
    setPending(true);
    await disconnectGoogle();
    setPending(false);
    router.refresh();
  }

  return (
    <button onClick={disconnect} disabled={pending} className={buttonClasses("deep", "danger", "text-sm")}>
      {pending ? "Disconnecting…" : "Disconnect"}
    </button>
  );
}
