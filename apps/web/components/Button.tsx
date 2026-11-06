"use client";

import { motion, useReducedMotion } from "motion/react";
import { twMerge } from "tailwind-merge";

/**
 * The single button in the system.
 * - Press scales to 0.96 over 150ms ease-out, disabled never scales (better-ui).
 * - Motion gated behind prefers-reduced-motion.
 * - Shadow ring sits on a transparent border so forced-colors still draws an edge.
 * - One filled variant per view: only `primary` carries the accent.
 */
type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-accent text-white border border-transparent shadow-[var(--shadow-border)] hover:bg-accent-hover",
  // Inputs and outlined controls keep a real border for 3:1 non-text contrast.
  secondary: "bg-card text-ink border border-line-strong hover:bg-page",
  ghost: "text-ink-2 hover:bg-strong hover:text-ink border border-transparent",
};

const SIZES: Record<Size, string> = {
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-12 px-5 text-sm",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  disabled,
  onClick,
  type = "button",
  href,
  "aria-label": ariaLabel,
}: {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  /** Renders an anchor instead of a button, keeping identical geometry. */
  href?: string;
  "aria-label"?: string;
}) {
  const reduce = useReducedMotion();

  const cls = twMerge(
    "press inline-flex shrink-0 items-center justify-center gap-2 rounded-control font-semibold",
    "disabled:cursor-not-allowed disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    className,
  );

  const tap = reduce || disabled ? undefined : { scale: 0.96 };

  if (href) {
    return (
      <motion.a
        href={href}
        aria-label={ariaLabel}
        whileTap={tap}
        transition={{ type: "spring", duration: 0.15, bounce: 0 }}
        className={cls}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      whileTap={tap}
      transition={{ type: "spring", duration: 0.15, bounce: 0 }}
      className={cls}
    >
      {children}
    </motion.button>
  );
}
