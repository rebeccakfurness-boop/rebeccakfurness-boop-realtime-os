import Mark from "./Mark";

type Scale = "deep" | "light";

interface LogoProps {
  scale?: Scale;
  lockup?: "script" | "tracked";
  showMark?: boolean;
  inverted?: boolean;
  className?: string;
}

/** Script "Realtime" lockup for hero/nav moments; tracked "REAL TIME" for small/utility contexts. */
export default function Logo({ scale = "deep", lockup = "script", showMark = true, inverted = false, className = "" }: LogoProps) {
  const realColor = inverted ? "text-white" : "text-deep-500";
  const timeColor = inverted ? "text-white/80" : "text-light-500";

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {showMark && <Mark scale={scale} inverted={inverted} size={26} />}
      {lockup === "script" ? (
        <span className="text-xl leading-none">
          <span className={`font-display font-bold italic ${realColor}`}>Real</span>
          <span className={`font-display italic ${timeColor}`}>time</span>
        </span>
      ) : (
        <span className={`font-sans text-sm font-semibold tracking-[0.2em] ${inverted ? "text-white" : "text-neutral-text"}`}>
          REAL TIME
        </span>
      )}
    </span>
  );
}
