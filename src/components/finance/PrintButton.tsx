"use client";

export default function PrintButton({ scale = "deep" }: { scale?: "deep" | "light" }) {
  const bg = scale === "deep" ? "bg-deep-500" : "bg-light-500";
  return (
    <button type="button" onClick={() => window.print()} className={`rounded-lg ${bg} px-4 py-1.5 text-sm font-semibold text-white print:hidden`}>
      Download / print
    </button>
  );
}
