import { createAvatar } from "@dicebear/core";
import { adventurer, bigSmile, notionists, openPeeps } from "@dicebear/collection";

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
const GROUND = "var(--bg-soft)";

/**
 * Muted, desaturated skin/hair/garment palette.
 *
 * DiceBear picks randomly from its full palette, which produced neon greens and
 * pinks that out-shouted every other element on the page. These are all low
 * saturation, so eight tiles read as one quiet grid.
 */
const MUTED = [
  "c9c3b8", "b9b3a8", "d6d0c4", "a9a49a", "cdbda9",
  "b3a693", "9f9d97", "c2bdb4", "8f9a9c", "a8b0ad",
  "c7b8bd", "b0a8b5",
];

const OPTS = {
  // scale < 100 shrinks the artwork inside its viewBox, leaving headroom so a
  // square tile never crops the head on the taller body-drawing styles.
  backgroundColor: ["transparent"],
  scale: 88,
  // Supported by every style used below; unknown keys are ignored per style.
  skinColor: MUTED,
  hairColor: MUTED,
  clothingColor: MUTED,
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
  return (
    svg
      // DiceBear embeds an RDF <metadata> block with creator names and two raw
      // licence URLs. It is invisible but sits in the DOM, so assistive tech
      // reads the whole attribution blob inside every card link.
      .replace(/<metadata[\s\S]*?<\/metadata>/g, "")
      // Also drop any other decorative accessibility nodes; the card link
      // supplies the accessible name.
      .replace(/<title[\s\S]*?<\/title>/g, "")
      .replace(/<desc[\s\S]*?<\/desc>/g, "")
      .replace(/viewboxMask/g, `vbMask-${uid}`)
      .replace(
        /<svg /,
        '<svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet" ',
      )
  );
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
  className = "",
}: {
  id: string;
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
