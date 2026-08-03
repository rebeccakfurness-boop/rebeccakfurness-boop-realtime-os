"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { importBankCsv } from "@/lib/actions/finance";

export default function CsvUploadForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPending(true);
    setMessage(null);
    const formData = new FormData();
    formData.append("file", file);
    const result = await importBankCsv(formData);
    setPending(false);
    if (inputRef.current) inputRef.current.value = "";
    if (result?.error) setMessage(result.error);
    else {
      setMessage(`Imported ${result?.count} transaction(s).`);
      router.refresh();
    }
  }

  return (
    <div className="rounded-2xl border border-neutral-border bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-base text-neutral-text">Import bank statement</h2>
          <p className="text-xs text-neutral-muted">CSV columns: date, description, amount (negative = money out), category (optional).</p>
        </div>
        <label className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-neutral-card px-3 py-1.5 text-sm font-medium text-neutral-text">
          <Upload size={14} /> {pending ? "Importing…" : "Upload CSV"}
          <input ref={inputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} disabled={pending} />
        </label>
      </div>
      {message && <p className="mt-2 text-xs text-neutral-muted">{message}</p>}
    </div>
  );
}
