"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Bookmark, BookmarkCheck, ExternalLink } from "lucide-react";
import { toggleBookmark } from "@/lib/actions/scholarships";

export interface ScholarshipCardData {
  id: string;
  title: string;
  field: string | null;
  region: string | null;
  educationLevel: string | null;
  amount: string | null;
  deadline: string | null;
  description: string | null;
  url: string | null;
}

export default function ScholarshipSearchPanel({
  scholarships,
  bookmarkedIds = [],
  canBookmark = false,
  scale = "light",
}: {
  scholarships: ScholarshipCardData[];
  bookmarkedIds?: string[];
  canBookmark?: boolean;
  scale?: "deep" | "light";
}) {
  const [query, setQuery] = useState("");
  const [field, setField] = useState("");
  const [region, setRegion] = useState("");
  const [level, setLevel] = useState("");
  const [bookmarked, setBookmarked] = useState(new Set(bookmarkedIds));
  const [pendingId, setPendingId] = useState<string | null>(null);

  const fields = useMemo(() => Array.from(new Set(scholarships.map((s) => s.field).filter(Boolean))) as string[], [scholarships]);
  const regions = useMemo(() => Array.from(new Set(scholarships.map((s) => s.region).filter(Boolean))) as string[], [scholarships]);
  const levels = useMemo(() => Array.from(new Set(scholarships.map((s) => s.educationLevel).filter(Boolean))) as string[], [scholarships]);

  const filtered = scholarships.filter((s) => {
    if (field && s.field !== field) return false;
    if (region && s.region !== region) return false;
    if (level && s.educationLevel !== level) return false;
    if (query && !`${s.title} ${s.description ?? ""}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const accent = scale === "deep" ? "text-deep-600" : "text-light-700";
  const chip = scale === "deep" ? "bg-deep-50 text-deep-700" : "bg-light-100 text-light-700";

  async function handleBookmark(scholarshipId: string) {
    setPendingId(scholarshipId);
    setBookmarked((prev) => {
      const next = new Set(prev);
      if (next.has(scholarshipId)) next.delete(scholarshipId);
      else next.add(scholarshipId);
      return next;
    });
    await toggleBookmark({ scholarshipId });
    setPendingId(null);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search scholarships…"
          className="min-w-48 flex-1 rounded-lg border border-neutral-border px-3 py-2 text-sm"
        />
        <select value={field} onChange={(e) => setField(e.target.value)} className="rounded-lg border border-neutral-border px-2 py-2 text-sm">
          <option value="">All fields</option>
          {fields.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        <select value={region} onChange={(e) => setRegion(e.target.value)} className="rounded-lg border border-neutral-border px-2 py-2 text-sm">
          <option value="">All regions</option>
          {regions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select value={level} onChange={(e) => setLevel(e.target.value)} className="rounded-lg border border-neutral-border px-2 py-2 text-sm">
          <option value="">All levels</option>
          {levels.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => (
          <div key={s.id} className="flex flex-col rounded-2xl border border-neutral-border bg-white p-5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display text-lg text-neutral-text">{s.title}</h3>
              {canBookmark && (
                <button
                  onClick={() => handleBookmark(s.id)}
                  disabled={pendingId === s.id}
                  className={accent}
                  aria-label="Bookmark this scholarship"
                >
                  {bookmarked.has(s.id) ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                </button>
              )}
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {s.field && <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${chip}`}>{s.field}</span>}
              {s.region && <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${chip}`}>{s.region}</span>}
              {s.educationLevel && <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${chip}`}>{s.educationLevel}</span>}
            </div>

            {s.description && <p className="mt-3 text-sm text-neutral-muted">{s.description}</p>}

            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="font-semibold text-neutral-text">{s.amount ?? "Amount varies"}</span>
              {s.deadline && <span className="text-neutral-muted">Closes {format(new Date(s.deadline), "d MMM yyyy")}</span>}
            </div>

            {s.url && (
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-3 flex items-center gap-1 text-sm font-semibold ${accent} hover:underline`}
              >
                View details <ExternalLink size={13} />
              </a>
            )}
          </div>
        ))}
        {filtered.length === 0 && <p className="col-span-full text-sm text-neutral-muted">No scholarships match those filters.</p>}
      </div>
    </div>
  );
}
