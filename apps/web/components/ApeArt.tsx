/**
 * Web3-style 2D character art for registry listings.
 *
 * Replaces the DiceBear avatars, which were muted line-art portraits: quiet, but
 * they read as a design system's neutral placeholder rather than as an NFT
 * collection. This is the opposite treatment, and the one the product actually
 * calls for: flat saturated fills, heavy dark linework, chunky silhouette, one
 * unmistakably collectible character per record.
 *
 * The subjects are apes, which raises a point worth being explicit about. These
 * are drawn from primitives in code, not sampled from any collection, and they
 * are not portraits of people. For a product that exists to stop unlicensed use
 * of real likenesses, invented cartoon characters are the only safe subject:
 * shipping photographs or lookalikes of real people would undercut the premise
 * the page is arguing for.
 *
 * Everything is deterministic from the listing id, so a given record always
 * draws the same character and the server and client agree.
 */

type Palette = { fur: string; skin: string; inner: string };

/** Flat, saturated coats. Distinct at a glance, all dark enough for the outline. */
const FUR: Palette[] = [
  { fur: "#b6c25a", skin: "#c99a72", inner: "#e0b78d" }, // olive
  { fur: "#8f7a5c", skin: "#c99a72", inner: "#e0b78d" }, // brown
  { fur: "#6d6a7a", skin: "#a8968a", inner: "#c9b9ad" }, // slate
  { fur: "#c98f5a", skin: "#e8c39a", inner: "#f2dcc0" }, // ginger
  { fur: "#5f7a8a", skin: "#9db4b8", inner: "#c4d6d8" }, // blue-grey
  { fur: "#8a6a8f", skin: "#c3a8c9", inner: "#ddcbdf" }, // plum
  { fur: "#a8a05a", skin: "#cfc79a", inner: "#e4dfc0" }, // khaki
  { fur: "#7a5f5a", skin: "#b89a90", inner: "#d0b8ae" }, // ash brown
];

const INK = "#0d0f08";

/** One accessory per record. Absent on some, so the set is not uniform. */
const ACCESSORY = ["none", "cap", "horns", "headset", "none", "glasses", "cap", "none"] as const;

function hash(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

export function ApeArt({ id, className = "" }: { id: string; className?: string }) {
  const h = hash(id);
  // A second, offset hash so coat and accessory do not advance together. Using
  // one hash for both made record n take fur n and accessory n, which looked
  // generated rather than varied.
  const h2 = hash(id + "#acc");
  const pal = FUR[h % FUR.length];
  const acc = ACCESSORY[h2 % ACCESSORY.length];
  // Two moods, so eight cards are not eight identical smiles.
  const smirk = h % 3 === 0;

  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      role="presentation"
      // Decorative: the card already names the record in text, so an SVG title
      // here would make a screen reader announce it twice.
      aria-hidden="true"
    >
      {/* Backdrop: a flat disc of colour, the collectible card convention. */}
      <rect width="120" height="120" fill="var(--ape-ground, #191c0e)" />
      <circle cx="60" cy="62" r="46" fill={pal.fur} opacity="0.16" />

      <g
        stroke={INK}
        strokeWidth="3.4"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      >
        {/* Ears, drawn before the skull so they tuck behind it. */}
        <circle cx="20" cy="54" r="17" fill={pal.fur} />
        <circle cx="100" cy="54" r="17" fill={pal.fur} />
        <circle cx="20" cy="54" r="8" fill={pal.skin} strokeWidth="2.6" />
        <circle cx="100" cy="54" r="8" fill={pal.skin} strokeWidth="2.6" />

        {/* Skull: narrow crown, heavy jowls. The jaw is what stops it reading
            as a human head, so it is deliberately wide at the bottom. */}
        <path
          d="M30 40 Q34 16 60 16 Q86 16 90 40 Q96 70 84 90 Q72 100 60 100 Q48 100 36 90 Q24 70 30 40 Z"
          fill={pal.fur}
        />

        {/* Brow: an arc above the eyes, not a band. A straight band reads as a
            visor or headband rather than anatomy. */}
        <path d="M38 46 Q60 37 82 46" fill="none" />

        {/* Muzzle: wide and low, merging into the jowls. */}
        <path
          d="M34 62 Q60 52 86 62 Q92 78 84 88 Q72 97 60 97 Q48 97 36 88 Q28 78 34 62 Z"
          fill={pal.skin}
        />

        {/* Nostrils. Their absence was the single thing that made the face read
            as a mask, so they are always drawn. */}
        <ellipse cx="52" cy="72" rx="2.4" ry="3.4" fill={INK} stroke="none" />
        <ellipse cx="68" cy="72" rx="2.4" ry="3.4" fill={INK} stroke="none" />

        {/* Eyes, set under the brow. */}
        <ellipse cx="47" cy="52" rx="6" ry="6.6" fill="#f4efe4" strokeWidth="2.4" />
        <ellipse cx="73" cy="52" rx="6" ry="6.6" fill="#f4efe4" strokeWidth="2.4" />
        <circle cx="48" cy="53" r="2.9" fill={INK} stroke="none" />
        <circle cx="74" cy="53" r="2.9" fill={INK} stroke="none" />
        {/* A single accent-coloured catchlight, so the eye reads as alive. */}
        <circle cx="49" cy="51.5" r="0.9" fill="#ccff00" stroke="none" />
        <circle cx="75" cy="51.5" r="0.9" fill="#ccff00" stroke="none" />

        {/* Mouth. One shape, curved either way. */}
        <path
          d={smirk ? "M46 84 Q60 92 74 83" : "M50 85 Q60 90 70 85"}
          fill="none"
          strokeWidth="2.8"
        />

        {acc === "cap" && (
          <>
            <path d="M32 30 Q34 12 60 12 Q88 12 90 30 Z" fill="#ccff00" />
            <path d="M32 30 Q18 31 14 36 L30 37 Z" fill="#ccff00" />
          </>
        )}

        {acc === "horns" && (
          <>
            <path d="M38 22 C34 6 24 2 20 6 C28 8 30 18 34 24 Z" fill="#e8e2d0" />
            <path d="M82 22 C86 6 96 2 100 6 C92 8 90 18 86 24 Z" fill="#e8e2d0" />
          </>
        )}

        {acc === "headset" && (
          <>
            <path d="M20 48 Q20 14 60 14 Q100 14 100 48" fill="none" strokeWidth="3.2" />
            <rect x="10" y="44" width="14" height="20" rx="5" fill="#ccff00" />
            <rect x="96" y="44" width="14" height="20" rx="5" fill="#ccff00" />
          </>
        )}

        {acc === "glasses" && (
          <>
            <rect x="38" y="45" width="18" height="14" rx="3" fill="#12140b" />
            <rect x="64" y="45" width="18" height="14" rx="3" fill="#12140b" />
            <path d="M56 52 L64 52" strokeWidth="2.6" />
          </>
        )}
      </g>
    </svg>
  );
}
