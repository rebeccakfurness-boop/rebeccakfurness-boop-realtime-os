"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import Button from "@/components/Button";
import { previewAiRewrite, applyAiRewrite } from "@/lib/actions/documents";

export default function AiCustomiseForm({ documentId, originalContent }: { documentId: string; originalContent: string }) {
  const router = useRouter();
  const [customerContext, setCustomerContext] = useState("");
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [usedRealAi, setUsedRealAi] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [applying, setApplying] = useState(false);

  async function generate() {
    setGenerating(true);
    const result = await previewAiRewrite({ documentId, customerContext });
    setSuggestion(result.content);
    setUsedRealAi(result.usedRealAi);
    setGenerating(false);
  }

  async function useSuggestion() {
    if (!suggestion) return;
    setApplying(true);
    await applyAiRewrite({ documentId, content: suggestion });
    setApplying(false);
    setSuggestion(null);
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-neutral-border bg-white p-6">
      <h2 className="flex items-center gap-2 font-display text-lg text-neutral-text">
        <Sparkles size={17} /> Customise with AI
      </h2>
      <p className="mt-1 text-sm text-neutral-muted">
        Describe this customer and Claude will rewrite the variable sections in Rebecca&apos;s brand voice.
      </p>

      <textarea
        value={customerContext}
        onChange={(e) => setCustomerContext(e.target.value)}
        rows={3}
        placeholder="e.g. Northfield Girls' High School, Year 12 and 13 assembly on scholarship applications, Term 3."
        className="mt-3 w-full rounded-lg border border-neutral-border p-3 text-sm"
      />
      <Button onClick={generate} disabled={generating} className="mt-3">
        {generating ? "Generating…" : "Generate suggestion"}
      </Button>

      {suggestion && (
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold tracking-wide text-neutral-muted uppercase">Original</p>
            <pre className="mt-2 max-h-80 overflow-auto rounded-lg bg-neutral-card p-3 text-xs whitespace-pre-wrap text-neutral-text">
              {originalContent}
            </pre>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wide text-neutral-muted uppercase">
              AI suggestion {!usedRealAi && "(mock, no API key set)"}
            </p>
            <pre className="mt-2 max-h-80 overflow-auto rounded-lg bg-deep-50 p-3 text-xs whitespace-pre-wrap text-neutral-text">
              {suggestion}
            </pre>
            <Button onClick={useSuggestion} disabled={applying} className="mt-2">
              {applying ? "Saving…" : "Use this version"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
