import type { LikenessState } from "@/lib/types";

/**
 * State sticker. Bright fill + dark ink + thick outline, always with an icon
 * and a word. Ink on every state fill measures >= 6.2:1.
 */
const CONFIG: Record<
  LikenessState,
  { label: string; bg: string; icon: React.ReactNode }
> = {
  active: {
    label: "Licensable",
    bg: "var(--state-active-bg)",
    icon: (
      <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.6">
        <path d="M2.5 8.5 6 12l7.5-8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  provisional: {
    label: "Provisional",
    bg: "var(--state-provisional-bg)",
    icon: (
      <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.6">
        <circle cx="8" cy="8" r="6" />
        <path d="M8 4.5V8l2.5 1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  disputed: {
    label: "Challenge open",
    bg: "var(--state-disputed-bg)",
    icon: (
      <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.6">
        <path d="M8 2.5 14.5 13.5h-13L8 2.5Z" strokeLinejoin="round" />
        <path d="M8 6.5v3" strokeLinecap="round" />
        <circle cx="8" cy="11.5" r="0.8" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  review: {
    label: "Under review",
    bg: "var(--state-review-bg)",
    icon: (
      <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.6">
        <circle cx="4" cy="8" r="1.7" />
        <circle cx="12" cy="4" r="1.7" />
        <circle cx="12" cy="12" r="1.7" />
        <path d="M5.5 7 10.5 4.7M5.5 9 10.5 11.3" strokeLinecap="round" />
      </svg>
    ),
  },
  moved: {
    label: "Moved",
    bg: "var(--state-moved-bg)",
    icon: (
      <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.6">
        <path d="M2.5 8h11M9.5 4 13.5 8l-4 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  revoked: {
    label: "Revoked",
    bg: "var(--state-revoked-bg)",
    icon: (
      <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.6">
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
      className="sticker inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.04em]"
      style={{ color: "var(--state-text)", backgroundColor: c.bg }}
    >
      {c.icon}
      {label}
    </span>
  );
}
