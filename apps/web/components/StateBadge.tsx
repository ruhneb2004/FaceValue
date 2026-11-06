import type { LikenessState } from "@/lib/types";

/**
 * State badge. State is carried by icon + word + colour, never colour alone.
 * Colours: docs/design-tokens.md §4. Each state has its own hue >=15deg apart.
 */
const CONFIG: Record<
  LikenessState,
  { label: string; text: string; bg: string; icon: React.ReactNode }
> = {
  active: {
    label: "Licensable",
    text: "var(--state-active-text)",
    bg: "var(--state-active-bg)",
    icon: (
      <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2.5 8.5 6 12l7.5-8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  provisional: {
    label: "Provisional",
    text: "var(--state-provisional-text)",
    bg: "var(--state-provisional-bg)",
    icon: (
      <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="8" cy="8" r="6" />
        <path d="M8 4.5V8l2.5 1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  disputed: {
    label: "Challenge open",
    text: "var(--state-disputed-text)",
    bg: "var(--state-disputed-bg)",
    icon: (
      <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8 2.5 14.5 13.5h-13L8 2.5Z" strokeLinejoin="round" />
        <path d="M8 6.5v3" strokeLinecap="round" />
        <circle cx="8" cy="11.5" r="0.75" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  review: {
    label: "Under review",
    text: "var(--state-review-text)",
    bg: "var(--state-review-bg)",
    icon: (
      <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="4" cy="8" r="1.6" />
        <circle cx="12" cy="4" r="1.6" />
        <circle cx="12" cy="12" r="1.6" />
        <path d="M5.5 7 10.5 4.7M5.5 9 10.5 11.3" strokeLinecap="round" />
      </svg>
    ),
  },
  moved: {
    label: "Moved",
    text: "var(--state-moved-text)",
    bg: "var(--state-moved-bg)",
    icon: (
      <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2.5 8h11M9.5 4 13.5 8l-4 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  revoked: {
    label: "Revoked",
    text: "var(--color-text-secondary)",
    bg: "var(--color-bg-sunken)",
    icon: (
      <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="8" cy="8" r="6" />
        <path d="M4.5 4.5 11.5 11.5" strokeLinecap="round" />
      </svg>
    ),
  },
};

export function StateBadge({
  state,
  count,
}: {
  state: LikenessState;
  count?: number;
}) {
  const c = CONFIG[state];
  const label =
    state === "disputed" && count && count > 1
      ? `${c.label} · ${count}`
      : c.label;

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-[0.06em]"
      style={{ color: c.text, backgroundColor: c.bg }}
    >
      {c.icon}
      {label}
    </span>
  );
}
