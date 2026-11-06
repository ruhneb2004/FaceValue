/**
 * Match preview: two frames being compared.
 *
 * Dark surface, hairline strokes, one accent for the scan line. Kept dense so
 * the panel reads as instrumentation rather than empty space.
 */
export function HeroScan({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 260"
      role="img"
      aria-label="A captured likeness being matched against a registered reference"
      className={className}
      fill="none"
    >
      {/* panel grid — reads as instrumentation, not decoration */}
      <defs>
        <pattern id="fv-grid" width="16" height="16" patternUnits="userSpaceOnUse">
          <path
            d="M16 0H0v16"
            stroke="rgba(255,255,255,0.045)"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect x="0" y="0" width="400" height="260" fill="url(#fv-grid)" />

      {/* two capture frames */}
      {[
        [24, "Reference"],
        [232, "Live capture"],
      ].map(([x, label]) => (
        <g key={label as string}>
          <rect
            x={x as number}
            y="34"
            width="144"
            height="150"
            rx="8"
            fill="var(--bg-quiet)"
            stroke="var(--line-strong)"
          />
          {/* corner ticks */}
          {[
            [3, 3, 1, 1],
            [141, 3, -1, 1],
            [3, 147, 1, -1],
            [141, 147, -1, -1],
          ].map(([dx, dy, sx, sy], i) => (
            <path
              key={i}
              d={`M${(x as number) + dx} ${34 + dy}h${8 * (sx as number)}M${(x as number) + dx} ${34 + dy}v${8 * (sy as number)}`}
              stroke="var(--line-strong)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          ))}
          <text
            x={(x as number) + 12}
            y="200"
            fill="var(--text-dim)"
            fontSize="10"
            fontFamily="var(--font-mono)"
            letterSpacing="0.06em"
          >
            {(label as string).toUpperCase()}
          </text>
        </g>
      ))}

      {/* head silhouettes */}
      {[96, 304].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="92" r="30" fill="var(--card-hover)" />
          <path
            d={`M${cx} 68c11 0 19 8 19 19 0 3 .5 6 1.5 8.5 1 2.5-1 4.5-2.5 4.5v3c0 1.5-1.5 3-3 3h-30c-1.5 0-3-1.5-3-3v-3c-1.5 0-3.5-2-2.5-4.5 1-2.5 1.5-5.5 1.5-8.5 0-11 8-19 19-19Z`}
            fill="var(--text-dim)"
            opacity="0.5"
          />
          <path
            d={`M${cx - 30} 158a30 26 0 0 1 60 0Z`}
            fill="var(--card-hover)"
          />
        </g>
      ))}
      {/* facial scan ticks on the capture */}
      <path
        d="M290 84h8M310 84h8M290 100h8M310 100h8"
        stroke="var(--line-strong)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* scan line */}
      <rect x="232" y="104" width="144" height="14" fill="var(--accent)" opacity="0.1" />
      <line
        x1="232"
        y1="111"
        x2="376"
        y2="111"
        stroke="var(--accent)"
        strokeWidth="1.5"
      />

      {/* link + verdict tick */}
      <line
        x1="176"
        y1="109"
        x2="224"
        y2="109"
        stroke="var(--line-strong)"
        strokeDasharray="2 4"
      />
      <circle cx="200" cy="109" r="12" fill="var(--card)" stroke="var(--line-strong)" />
      <path
        d="M195 109l3.5 3.5L205 104"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* score bars */}
      <rect x="24" y="222" width="144" height="6" rx="3" fill="var(--card-hover)" />
      <rect x="24" y="222" width="128" height="6" rx="3" fill="var(--live)" />
      <rect x="232" y="222" width="144" height="6" rx="3" fill="var(--card-hover)" />
      <rect x="232" y="222" width="131" height="6" rx="3" fill="var(--text-dim)" opacity="0.6" />
      <text
        x="24"
        y="246"
        fill="var(--text-dim)"
        fontSize="10"
        fontFamily="var(--font-mono)"
      >
        1.0000
      </text>
      <text
        x="232"
        y="246"
        fill="var(--text-dim)"
        fontSize="10"
        fontFamily="var(--font-mono)"
      >
        0.9124
      </text>
    </svg>
  );
}
