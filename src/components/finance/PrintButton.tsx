"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-lg bg-deep-500 px-4 py-1.5 text-sm font-semibold text-white print:hidden"
    >
      Download / print
    </button>
  );
}
