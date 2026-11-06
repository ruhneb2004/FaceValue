import type { LikenessState } from "@/lib/types";

/**
 * State chip. Tinted fill + saturated text + icon + word, never colour alone.
 *
 * Loud solid fills turned the grid into a rainbow on a dark canvas. This is the
 * quiet version: a low-saturation tint of the state hue, with the hue carried by
 * the text and icon. Every pair measures >= 5.6:1 against its own fill.
 */
const CONFIG: Record<
  LikenessState,
  { label: string; bg: string; fg: string; icon: React.ReactNode }
> = {
  active: {
    label: "Licensable",
    bg: "#1a2320",
    fg: "#7fb89a",
    icon: (
      <svg viewBox="0 0 16 16" aria-hidden="true" className="size-2.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M2.5 8.5 6 12l7.5-8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  provisional: {
    label: "Provisional",
    bg: "#262219",
    fg: "#bfa87c",
    icon: (
      <svg viewBox="0 0 16 16" aria-hidden="true" className="size-2.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7">
        <circle cx="8" cy="8" r="6" />
        <path d="M8 4.5V8l2.5 1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  disputed: {
    label: "Challenge open",
    bg: "#2a1e20",
    fg: "#c98d92",
    icon: (
      <svg viewBox="0 0 16 16" aria-hidden="true" className="size-2.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M8 2.5 14.5 13.5h-13L8 2.5Z" strokeLinejoin="round" />
        <path d="M8 6.5v3" strokeLinecap="round" />
        <circle cx="8" cy="11.5" r="0.8" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  review: {
    label: "Under review",
    bg: "#231d2b",
    fg: "#a894c4",
    icon: (
      <svg viewBox="0 0 16 16" aria-hidden="true" className="size-2.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7">
        <circle cx="4" cy="8" r="1.7" />
        <circle cx="12" cy="4" r="1.7" />
        <circle cx="12" cy="12" r="1.7" />
        <path d="M5.5 7 10.5 4.7M5.5 9 10.5 11.3" strokeLinecap="round" />
      </svg>
    ),
  },
  moved: {
    label: "Moved",
    bg: "#1a222a",
    fg: "#8aabc7",
    icon: (
      <svg viewBox="0 0 16 16" aria-hidden="true" className="size-2.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M2.5 8h11M9.5 4 13.5 8l-4 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  revoked: {
    label: "Revoked",
    bg: "#232427",
    fg: "#9a9b9d",
    icon: (
      <svg viewBox="0 0 16 16" aria-hidden="true" className="size-2.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7">
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
      className="inline-flex items-center gap-1 rounded-chip border py-0.5 pl-1.5 pr-2 font-mono text-[10px] font-medium uppercase tracking-[0.06em]"
      style={{
        color: c.fg,
        backgroundColor: c.bg,
        borderColor: "color-mix(in srgb, " + c.fg + " 18%, transparent)",
      }}
    >
      {c.icon}
      {label}
    </span>
  );
}
