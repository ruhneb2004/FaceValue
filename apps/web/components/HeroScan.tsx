/**
 * Hero illustration: a likeness being scanned into the registry.
 *
 * Cartoon-futurist: bold fills, thick ink outlines, flat colour. Same visual
 * language as the listing artwork and the logo, so the page has one voice.
 */
export function HeroScan({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 320"
      role="img"
      aria-label="A likeness being scanned into the registry and issued a bond"
      className={className}
      fill="none"
    >
      <defs>
        <clipPath id="faceClip">
          <circle cx="150" cy="150" r="88" />
        </clipPath>
      </defs>

      {/* burst behind the head */}
      <g opacity="0.95">
        <circle cx="150" cy="150" r="112" fill="var(--lemon)" />
        <circle cx="150" cy="150" r="88" fill="var(--bubblegum)" />
      </g>

      <g clipPath="url(#faceClip)">
        {/* head + shoulders, flat blocks */}
        <path d="M150 74c30 0 50 22 50 52 0 30-20 52-50 52s-50-22-50-52c0-30 20-52 50-52Z" fill="#ffd7b0" />
        <path d="M100 106c0-24 22-38 50-38s50 14 50 38c-10-10-28-16-50-16s-40 6-50 16Z" fill="var(--ink)" />
        <path d="M96 210c8-26 28-38 54-38s46 12 54 38v20H96v-20Z" fill="var(--cyan)" />
        {/* eyes */}
        <circle cx="132" cy="140" r="5.5" fill="var(--ink)" />
        <circle cx="170" cy="140" r="5.5" fill="var(--ink)" />
        {/* smile */}
        <path d="M136 166c6 7 22 7 28 0" stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" />
        {/* scan band */}
        <rect x="58" y="146" width="184" height="22" fill="var(--violet)" opacity="0.28" />
        <line x1="58" y1="157" x2="242" y2="157" stroke="var(--violet)" strokeWidth="4" />
      </g>

      {/* thick rings, drawn after so they sit on top */}
      <circle cx="150" cy="150" r="88" stroke="var(--ink)" strokeWidth="4" />
      <circle
        cx="150"
        cy="150"
        r="112"
        stroke="var(--ink)"
        strokeWidth="3"
        strokeDasharray="3 9"
      />

      {/* corner ticks */}
      {[
        [150, 38, 150, 22],
        [150, 262, 150, 278],
        [38, 150, 22, 150],
        [262, 150, 278, 150],
      ].map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" />
      ))}

      {/* bond token */}
      <path d="M272 150h44" stroke="var(--ink)" strokeWidth="4" strokeDasharray="2 8" strokeLinecap="round" />
      <circle cx="336" cy="150" r="28" fill="var(--lime)" stroke="var(--ink)" strokeWidth="4" />
      <path d="M326 150l7.5 8 13-16" stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

      {/* sticker chips */}
      <rect x="298" y="196" width="78" height="12" rx="6" fill="var(--lemon)" stroke="var(--ink)" strokeWidth="3" />
      <rect x="298" y="218" width="56" height="12" rx="6" fill="var(--paper)" stroke="var(--ink)" strokeWidth="3" />

      {/* sparks */}
      <path d="M84 58l6 12 12 6-12 6-6 12-6-12-12-6 12-6 6-12Z" fill="var(--lemon)" stroke="var(--ink)" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="232" cy="72" r="7" fill="var(--cyan)" stroke="var(--ink)" strokeWidth="3" />
      <circle cx="70" cy="228" r="6" fill="var(--bubblegum)" stroke="var(--ink)" strokeWidth="3" />
    </svg>
  );
}
