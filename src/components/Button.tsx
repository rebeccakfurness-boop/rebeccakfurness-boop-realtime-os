import type { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type Scale = "deep" | "light";
type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  scale?: Scale;
  variant?: Variant;
}

const SCALE_PRIMARY: Record<Scale, string> = {
  deep: "bg-deep-500 text-white hover:bg-deep-600 active:bg-deep-700",
  light: "bg-light-500 text-white hover:bg-light-600 active:bg-light-700",
};

const SCALE_SECONDARY: Record<Scale, string> = {
  deep: "bg-deep-50 text-deep-600 hover:bg-deep-100",
  light: "bg-light-100 text-light-700 hover:bg-light-200",
};

/** Shared with Link/anchor call sites that need button styling without being a <button>. */
export function buttonClasses(scale: Scale = "deep", variant: Variant = "primary", className?: string) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50";
  const variantClass =
    variant === "primary"
      ? SCALE_PRIMARY[scale]
      : variant === "secondary"
        ? SCALE_SECONDARY[scale]
        : variant === "danger"
          ? "bg-red-50 text-red-600 hover:bg-red-100"
          : "text-neutral-muted hover:text-neutral-text hover:bg-neutral-card";

  return clsx(base, variantClass, className);
}

export default function Button({ scale = "deep", variant = "primary", className, ...props }: ButtonProps) {
  return <button className={buttonClasses(scale, variant, className)} {...props} />;
}
