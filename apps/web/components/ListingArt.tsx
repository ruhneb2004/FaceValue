import { createAvatar } from "@dicebear/core";
import { adventurer, bigSmile, notionists, openPeeps } from "@dicebear/collection";
import type { LikenessState } from "@/lib/types";

/**
 * Listing artwork.
 *
 * Generated at build time from the listing id: deterministic, tiny, no runtime
 * fetch, and never a real person's face. We deliberately do not ship
 * photographs of people — inventing a face for a product that exists to stop
 * unlicensed use of faces would defeat the premise.
 */

const STYLES = [notionists, adventurer, bigSmile, openPeeps] as const;

/**
 * Ground is ONE neutral for every listing. State is already carried by the
 * badge, and six vivid backgrounds turned the grid into a rainbow, which
 * fights the single-accent rule.
 */
const GROUND = "var(--bg-deep)";

const OPTS = {
  // scale < 100 shrinks the artwork inside its viewBox, leaving headroom so a
  // square tile never crops the head on the taller body-drawing styles.
  backgroundColor: ["transparent"],
  scale: 88,
};

/**
 * Give the inline SVG an intrinsic size, and namespace its internal ids.
 *
 * DiceBear hardcodes `viewboxMask` (and similar ids) in every avatar. Inlining
 * eight of them on one page makes the ids collide, so every avatar resolves
 * its mask against the FIRST one in the document and gets clipped against the
 * wrong viewBox. Rewriting the ids per instance fixes that.
 */
function normalise(svg: string, uid: string): string {
  return svg
    .replace(/viewboxMask/g, `vbMask-${uid}`)
    .replace(/<svg /, '<svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet" ');
}

/**
 * Each style has its own options type, so dispatch per style rather than
 * widening to a union (which does not satisfy createAvatar's generic).
 */
function render(id: string, styleIndex: number): string {
  const uid = id.replace(/[^a-zA-Z0-9_-]/g, "");
  switch (styleIndex) {
    case 0:
      return normalise(createAvatar(notionists, { ...OPTS, seed: id }).toString(), uid);
    case 1:
      return normalise(createAvatar(adventurer, { ...OPTS, seed: id }).toString(), uid);
    case 2:
      return normalise(createAvatar(bigSmile, { ...OPTS, seed: id }).toString(), uid);
    default:
      return normalise(createAvatar(openPeeps, { ...OPTS, seed: id }).toString(), uid);
  }
}

export function ListingArt({
  id,
  state,
  className = "",
}: {
  id: string;
  state: LikenessState;
  className?: string;
}) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const svg = render(id, (h >>> 0) % STYLES.length);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ backgroundColor: GROUND }}
      aria-hidden="true"
    >
      {/* position:absolute + inset-0 gives the SVG a definite box to fill;
          the grid/place-items approach let it shrink to content size, which
          is what clipped the taller styles. */}
      <div
        className="absolute inset-0 [&>svg]:block [&>svg]:h-full [&>svg]:w-full"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}
