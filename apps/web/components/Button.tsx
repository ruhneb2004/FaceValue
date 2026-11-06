"use client";

import { motion, useReducedMotion } from "motion/react";
import { twMerge } from "tailwind-merge";

/**
 * Button.
 * - Press scales to 0.96 over 150ms ease-out (better-ui).
 * - Disabled never scales.
 * - Motion gated behind prefers-reduced-motion.
 */
export function Button({
  children,
  variant = "primary",
  className,
  disabled,
  onClick,
  type = "button",
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  const reduce = useReducedMotion();

  const styles = {
    primary:
      "bg-accent text-white hover:bg-accent-hover shadow-[var(--shadow-border)]",
    secondary:
      "bg-surface text-ink hover:bg-sunken border border-line-subtle",
    ghost: "text-ink-2 hover:bg-surface hover:text-ink",
  }[variant];

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      whileTap={reduce || disabled ? undefined : { scale: 0.96 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={twMerge(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-control px-4 text-sm font-medium",
        "transition-colors duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-50",
        styles,
        className,
      )}
    >
      {children}
    </motion.button>
  );
}
