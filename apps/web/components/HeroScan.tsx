/**
 * Hero illustration: a likeness being scanned and registered.
 *
 * Drawn in the same thin line-art language as the logo, using only palette
 * tokens so it recolours with the theme. Not a stock illustration: a face is
 * the product here, so the artwork has to be ours.
 */
export function HeroScan({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 340"
      role="img"
      aria-label="A likeness being scanned into the registry and issued a bond"
      className={className}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <linearGradient id="scanFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--gold-700)" stopOpacity="0" />
          <stop offset="50%" stopColor="var(--gold-700)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--gold-700)" stopOpacity="0" />
        </linearGradient>
        <clipPath id="faceClip">
          <circle cx="150" cy="150" r="92" />
        </clipPath>
      </defs>

      {/* soft ground */}
      <ellipse
        cx="150"
        cy="268"
        rx="112"
        ry="14"
        fill="var(--taupe-300)"
        opacity="0.45"
      />

      {/* outer registration ring, dashed */}
      <circle
        cx="150"
        cy="150"
        r="118"
        stroke="var(--taupe-400)"
        strokeWidth="1.5"
        strokeDasharray="2 7"
        opacity="0.9"
      />

      {/* primary ring */}
      <circle cx="150" cy="150" r="92" stroke="var(--neutral-800)" strokeWidth="1.5" />

      {/* corner ticks on the ring */}
      {[
        [150, 58, 150, 44],
        [150, 242, 150, 256],
        [58, 150, 44, 150],
        [242, 150, 256, 150],
      ].map(([x1, y1, x2, y2], i) => (
        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="var(--neutral-800)"
          strokeWidth="1.5"
        />
      ))}

      <g clipPath="url(#faceClip)">
        {/* head */}
        <path
          d="M150 96c26 0 44 20 44 47 0 12 3 20 6 26 3 7-2 12-8 13v10c0 6-5 10-11 10h-14"
          stroke="var(--neutral-900)"
          strokeWidth="2"
        />
        <path
          d="M150 96c-26 0-44 20-44 47 0 12-3 20-6 26-3 7 2 12 8 13v10c0 6 5 10 11 10h14"
          stroke="var(--neutral-900)"
          strokeWidth="2"
        />
        {/* eyes */}
        <path d="M132 142c3-3 8-3 11 0" stroke="var(--neutral-900)" strokeWidth="2" />
        <path d="M157 142c3-3 8-3 11 0" stroke="var(--neutral-900)" strokeWidth="2" />
        {/* nose + mouth */}
        <path d="M150 146v18l-5 4" stroke="var(--neutral-800)" strokeWidth="1.75" />
        <path d="M140 184c6 4 14 4 20 0" stroke="var(--neutral-800)" strokeWidth="1.75" />
        {/* scan line */}
        <rect x="58" y="146" width="184" height="26" fill="url(#scanFade)" />
        <line
          x1="58"
          y1="159"
          x2="242"
          y2="159"
          stroke="var(--gold-700)"
          strokeWidth="2"
        />
      </g>

      {/* node graph to the right: the bond */}
      <line
        x1="268"
        y1="150"
        x2="316"
        y2="150"
        stroke="var(--taupe-400)"
        strokeWidth="1.5"
        strokeDasharray="3 4"
      />
      <circle cx="336" cy="150" r="26" stroke="var(--gold-700)" strokeWidth="2" />
      <path
        d="M326 150l7 7 13-15"
        stroke="var(--gold-700)"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* bond label bars */}
      <rect x="310" y="196" width="72" height="6" rx="3" fill="var(--taupe-300)" />
      <rect x="310" y="210" width="52" height="6" rx="3" fill="var(--taupe-200)" />
      <rect x="310" y="224" width="60" height="6" rx="3" fill="var(--taupe-200)" />

      {/* small floating dots */}
      <circle cx="96" cy="66" r="3" fill="var(--gold-400)" />
      <circle cx="228" cy="80" r="2.5" fill="var(--taupe-400)" />
      <circle cx="72" cy="214" r="2.5" fill="var(--taupe-400)" />
    </svg>
  );
}
