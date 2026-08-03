interface ProgressRingProps {
  percent: number;
  scale: "deep" | "light";
  size?: number;
  label?: string;
  sublabel?: string;
}

export default function ProgressRing({ percent, scale, size = 96, label, sublabel }: ProgressRingProps) {
  const stroke = 9;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, percent)) / 100) * circumference;
  const color = scale === "deep" ? "#4C5BD4" : "#7A8BFF";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#EBEDF3" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(.2,.7,.3,1)" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-display text-xl text-neutral-text">{Math.round(percent)}%</span>
        {label && <span className="text-[11px] text-neutral-muted">{label}</span>}
      </div>
      {sublabel && <span className="sr-only">{sublabel}</span>}
    </div>
  );
}
