type Scale = "deep" | "light";

interface MarkProps {
  scale?: Scale;
  inverted?: boolean;
  size?: number;
  className?: string;
}

/**
 * The Realtime icon mark: an hourglass-style "X" (two triangles meeting at a point)
 * inside a circle ring. Deep = sharper blade points (staff/corporate surfaces).
 * Light = softer/rounded blades (student surfaces). Never recolour/stretch/shadow
 * the mark outside these two treatments.
 */
export default function Mark({ scale = "deep", inverted = false, size = 32, className = "" }: MarkProps) {
  const ring = inverted ? "#FFFFFF" : scale === "deep" ? "#4C5BD4" : "#7A8BFF";
  const bladeTop = inverted ? "#FFFFFF" : scale === "deep" ? "#7E89E0" : "#9FACFF";
  const bladeBottom = inverted ? "#FFFFFF" : scale === "deep" ? "#4C5BD4" : "#7A8BFF";
  const rx = scale === "deep" ? 1 : 3;

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} role="img" aria-label="Realtime">
      <circle cx="32" cy="32" r="27" stroke={ring} strokeWidth="4" />
      <path d="M19 19h26l-11.5 11 -1.5 1.3 -1.5 -1.3L19 19Z" fill={bladeTop} rx={rx} />
      <path d="M19 45h26L33.5 34l-1.5 -1.3 -1.5 1.3L19 45Z" fill={bladeBottom} />
    </svg>
  );
}
