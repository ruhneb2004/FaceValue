import type { LikenessState } from "@/lib/types";

/**
 * State chip: tinted fill, coloured text, an icon and a word. Never colour
 * alone (B9). Colours come from CSS variables so there are no hex values here,
 * and sizes come from named text styles rather than arbitrary pixels (B1).
 */
const CONFIG: Record<
  LikenessState,
  { label: string; tint: string; fg: string; path: React.ReactNode }
> = {
  active: {
    label: "Licensable",
    tint: "var(--state-active)",
    fg: "var(--state-active)",
    path: <path d="M2.5 8.5 6 12l7.5-8" strokeLinecap="round" strokeLinejoin="round" />,
  },
  provisional: {
    label: "Provisional",
    tint: "var(--state-provisional)",
    fg: "var(--state-provisional)",
    path: (
      <>
        <circle cx="8" cy="8" r="6" />
        <path d="M8 4.5V8l2.5 1.5" strokeLinecap="round" />
      </>
    ),
  },
  disputed: {
    label: "Challenge open",
    tint: "var(--state-disputed)",
    fg: "var(--state-disputed)",
    path: (
      <>
        <path d="M8 2.5 14.5 13.5h-13L8 2.5Z" strokeLinejoin="round" />
        <path d="M8 6.5v3" strokeLinecap="round" />
      </>
    ),
  },
  review: {
    label: "Under review",
    tint: "var(--state-review)",
    fg: "var(--state-review)",
    path: (
      <>
        <circle cx="4" cy="8" r="1.7" />
        <circle cx="12" cy="4" r="1.7" />
        <circle cx="12" cy="12" r="1.7" />
        <path d="M5.5 7 10.5 4.7M5.5 9 10.5 11.3" strokeLinecap="round" />
      </>
    ),
  },
  moved: {
    label: "Moved",
    tint: "var(--state-moved)",
    fg: "var(--state-moved)",
    path: <path d="M2.5 8h11M9.5 4 13.5 8l-4 4" strokeLinecap="round" strokeLinejoin="round" />,
  },
  revoked: {
    label: "Revoked",
    tint: "var(--state-revoked)",
    fg: "var(--state-revoked)",
    path: (
      <>
        <circle cx="8" cy="8" r="6" />
        <path d="M4.5 4.5 11.5 11.5" strokeLinecap="round" />
      </>
    ),
  },
};

export function StateBadge({
  state,
  count,
  compact = false,
}: {
  state: LikenessState;
  count?: number;
  /**
   * Denser chip for card footers. The default `px-3 py-3` measured 42px tall
   * around 12px text, which is a button's bulk applied to a label; inside a
   * 300px card it forced the row to wrap and cost vertical space the artwork
   * needed. The compact variant keeps the same type and colour, and drops the
   * padding to a label's.
   */
  compact?: boolean;
}) {
  const c = CONFIG[state];
  const label = state === "disputed" && count && count > 1 ? `${c.label} ${count}` : c.label;

  return (
    <span
      className={`caption-4 inline-flex shrink-0 items-center rounded-sm border font-mono uppercase tracking-[0.06em] ${
        compact ? "gap-1.5 px-2 py-1" : "gap-2 px-3 py-3"
      }`}
      style={{
        color: c.fg,
        backgroundColor: `color-mix(in srgb, ${c.tint} 12%, transparent)`,
        borderColor: `color-mix(in srgb, ${c.tint} 22%, transparent)`,
      }}
    >
      <svg
        viewBox="0 0 16 16"
        aria-hidden="true"
        className={compact ? "size-2 shrink-0" : "size-2.5 shrink-0"}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      >
        {c.path}
      </svg>
      {label}
    </span>
  );
}
