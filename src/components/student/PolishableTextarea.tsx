"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { buttonClasses } from "@/components/Button";
import { polishDraft } from "@/lib/actions/student-builders";

export default function PolishableTextarea({
  label,
  hint,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [usedRealAi, setUsedRealAi] = useState(false);
  const [generating, setGenerating] = useState(false);

  async function polish() {
    if (!value.trim()) return;
    setGenerating(true);
    const result = await polishDraft({ content: value });
    setSuggestion(result.content);
    setUsedRealAi(result.usedRealAi);
    setGenerating(false);
  }

  function useSuggestion() {
    if (!suggestion) return;
    onChange(suggestion);
    setSuggestion(null);
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-neutral-text">{label}</label>
      {hint && <p className="text-xs text-neutral-muted">{hint}</p>}
      <textarea
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setSuggestion(null);
        }}
        rows={rows}
        className="mt-2 w-full rounded-lg border border-neutral-border p-3 text-sm text-neutral-text"
      />
      <button
        type="button"
        onClick={polish}
        disabled={generating || !value.trim()}
        className={buttonClasses("light", "secondary", "mt-2 text-xs")}
      >
        <Sparkles size={13} /> {generating ? "Polishing…" : "Polish with AI"}
      </button>

      {suggestion && (
        <div className="mt-3 rounded-lg border border-light-200 bg-light-50 p-3">
          <p className="text-xs font-semibold tracking-wide text-neutral-muted uppercase">
            Suggestion {!usedRealAi && "(mock, no API key set)"}
          </p>
          <p className="mt-1 text-sm whitespace-pre-wrap text-neutral-text">{suggestion}</p>
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={useSuggestion} className={buttonClasses("light", "primary", "text-xs")}>
              Use this
            </button>
            <button type="button" onClick={() => setSuggestion(null)} className={buttonClasses("light", "ghost", "text-xs")}>
              Keep mine
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
