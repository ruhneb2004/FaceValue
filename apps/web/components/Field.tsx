"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

/**
 * One labelled form control: label, control, optional hint, optional error.
 *
 * The hint and the error are wired through `aria-describedby` together, so a
 * screen reader announces both the guidance and the failure when the field is
 * focused. The error also sets `aria-invalid`, which is what a form actually
 * needs to be readable as broken — a red border alone is a state carried by
 * colour, and it is invisible to anyone who cannot see it.
 *
 * The id comes from `useId`, so two forms on one page cannot collide.
 */
export function Field({
  label,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  /** Receives the wiring it must apply. Written this way so the caller cannot
   * forget the ARIA and leave the error unannounced. */
  children: (props: {
    id: string;
    describedBy?: string;
    invalid: boolean;
  }) => React.ReactNode;
  className?: string;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="body-5 font-medium text-ink">
        {label}
      </label>

      {children({ id, describedBy, invalid: Boolean(error) })}

      {hint && (
        <p id={hintId} className="body-6 text-ink2">
          {hint}
        </p>
      )}

      {error && (
        // The message is the signal, not the colour. It also names what to do.
        <p id={errorId} className="body-6 flex items-start gap-1.5 text-[var(--state-disputed)]">
          <svg
            viewBox="0 0 16 16"
            aria-hidden="true"
            className="mt-0.5 size-3.5 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
          >
            <circle cx="8" cy="8" r="6" />
            <path d="M8 4.8v3.4" strokeLinecap="round" />
            <circle cx="8" cy="11" r="0.9" fill="currentColor" stroke="none" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

/** The input those props are meant to land on, so the wiring stays in one place. */
export function TextInput({
  id,
  describedBy,
  invalid,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & {
  describedBy?: string;
  invalid?: boolean;
}) {
  return (
    <input
      id={id}
      aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
      className={cn(
        "press min-h-11 w-full rounded-md border bg-surface2 px-3 body-4 text-ink",
        "placeholder:text-ink3",
        "transition-[border-color,background-color] duration-200 motion-reduce:transition-none",
        invalid
          ? "border-[var(--state-disputed)]"
          : "border-line hover:border-linestrong focus:border-accent",
      )}
      {...rest}
    />
  );
}
