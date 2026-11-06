/**
 * Card artwork.
 *
 * We do not ship invented photographs of people in a product about likeness
 * rights: that would be exactly the thing FaceValue exists to prevent. Instead
 * each listing gets a deterministic geometric signature derived from its id, so
 * the grid reads as varied artwork rather than eight grey blocks.
 */

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function CardArt({ id }: { id: string }) {
  const h = hash(id);
  const variant = h % 4;
  // stay within the palette: gold / taupe / neutral bands
  const tints = [
    ["var(--gold-100)", "var(--gold-300)", "var(--gold-500)"],
    ["var(--taupe-100)", "var(--taupe-300)", "var(--taupe-500)"],
    ["var(--neutral-100)", "var(--neutral-300)", "var(--neutral-500)"],
    ["var(--gold-50)", "var(--taupe-200)", "var(--gold-400)"],
  ][variant];
  const a = 40 + (h % 60);
  const b = 30 + ((h >> 8) % 50);
  const rot = (h >> 16) % 90;

  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 size-full"
    >
      <rect width="100" height="100" fill={tints[0]} />
      <g transform={`rotate(${rot} 50 50)`}>
        <circle cx={a} cy={b} r="34" fill={tints[1]} opacity="0.85" />
        <circle cx={100 - b} cy={100 - a} r="21" fill={tints[2]} opacity="0.5" />
        <path
          d={`M-10 ${70 + (h % 20)} Q 50 ${20 + (h % 30)} 110 ${64 + (h % 14)}`}
          stroke={tints[2]}
          strokeWidth="1"
          fill="none"
          opacity="0.6"
        />
      </g>
      {/* registration ring, matches the hero language */}
      <circle
        cx="50"
        cy="50"
        r="15"
        stroke="var(--neutral-800)"
        strokeWidth="0.8"
        fill="none"
        opacity="0.35"
        strokeDasharray="1 3"
      />
    </svg>
  );
}
