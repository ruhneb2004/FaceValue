/**
 * Hero illustration: a likeness being matched into the registry.
 *
 * Flat fills, hairline strokes, no gradients and no outline-as-decoration.
 * One accent (the scan line and the bond tick) to match the interface.
 */
export function HeroScan({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 300"
      role="img"
      aria-label="A captured likeness being matched against a registered reference"
      className={className}
      fill="none"
    >
      {/* two frames: reference and capture, comparing */}
      <rect x="18" y="34" width="150" height="196" rx="14" fill="var(--bg-deep)" />
      <rect x="232" y="34" width="150" height="196" rx="14" fill="var(--bg-deep)" />
      <rect x="18" y="34" width="150" height="196" rx="14" stroke="var(--border-strong)" />
      <rect x="232" y="34" width="150" height="196" rx="14" stroke="var(--border-strong)" />

      {/* left head */}
      <circle cx="93" cy="118" r="34" fill="var(--bg-strong)" />
      <path
        d="M93 92c13 0 22 9 22 22 0 4 1 7 2 10 1 3-1 5-3 5v4c0 2-2 4-4 4H76c-2 0-4-2-4-4v-4c-2 0-4-2-3-5 1-3 2-6 2-10 0-13 9-22 22-22Z"
        fill="var(--text-body)"
      />
      <rect x="59" y="168" width="68" height="62" rx="22" fill="var(--border-strong)" />

      {/* right head, mirrored silhouette */}
      <circle cx="307" cy="118" r="34" fill="var(--bg-strong)" />
      <path
        d="M307 92c13 0 22 9 22 22 0 4 1 7 2 10 1 3-1 5-3 5v4c0 2-2 4-4 4h-34c-2 0-4-2-4-4v-4c-2 0-4-2-3-5 1-3 2-6 2-10 0-13 9-22 22-22Z"
        fill="var(--text-body)"
      />
      <rect x="273" y="168" width="68" height="62" rx="22" fill="var(--border-strong)" />

      {/* scan line across the capture frame */}
      <rect x="232" y="150" width="150" height="18" fill="var(--brand-soft)" />
      <line x1="232" y1="159" x2="382" y2="159" stroke="var(--brand)" strokeWidth="2" />

      {/* comparison link */}
      <line
        x1="176"
        y1="132"
        x2="224"
        y2="132"
        stroke="var(--border-strong)"
        strokeDasharray="3 5"
        strokeLinecap="round"
      />
      <circle cx="200" cy="132" r="13" fill="var(--card)" stroke="var(--border-strong)" />
      <path
        d="M195 132l4 4 7-8"
        stroke="var(--brand)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* result rows */}
      <rect x="18" y="252" width="120" height="8" rx="4" fill="var(--border-strong)" />
      <rect x="232" y="252" width="86" height="8" rx="4" fill="var(--border)" />
      <text
        x="18"
        y="284"
        fill="var(--text-muted)"
        fontSize="11"
        fontFamily="var(--font-sans)"
      >
        registered reference
      </text>
      <text
        x="232"
        y="284"
        fill="var(--text-muted)"
        fontSize="11"
        fontFamily="var(--font-sans)"
      >
        live capture
      </text>
    </svg>
  );
}
