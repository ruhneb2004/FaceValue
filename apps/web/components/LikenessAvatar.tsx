import { createAvatar } from "@dicebear/core";
import * as pixelArt from "@dicebear/pixel-art";

/**
 * Pixel-art avatar for a registry entry.
 *
 * DiceBear's "pixel art" style (CC0), generated at build time from the listing
 * id. Deterministic: the same record always draws the same character, so the
 * server and client agree and nothing is fetched at runtime.
 *
 * Chosen over the address blockies this replaces because a blockie is an
 * abstract pattern while this is a recognisable character with hair, clothing
 * and a face. On a marketplace grid the second reads as a collectible and the
 * first reads as a hash. It also brings back the point that matters: these are
 * invented avatars, never photographs or lookalikes of real people.
 *
 * The palette is muted on purpose. DiceBear's defaults are saturated, and eight
 * bright characters turned the grid into a rainbow that out-shouted the lime
 * accent and the state badges. These skin, hair and clothing ramps are all low
 * saturation, so the row reads as one quiet grid and the accent stays the only
 * loud thing on the card.
 */

/**
 * Warm, saturated skin. The first attempt used near-neutral greys ("c9c3b8" and
 * friends) to keep the grid quiet, and the result read as corpses: a grey face
 * with pale eyes and no warmth anywhere is the colour of a cadaver, not a
 * person. These span a real range of tones, warm enough to look alive.
 */
const SKIN = [
  "e8b89b", "d9a184", "c88a6a", "a86a4f",
  "8a5238", "f0c9ae", "e5a882", "b8794f",
];

/** Real hair colours: black, brown, auburn, blonde, ginger. */
const HAIR = [
  "2b1d14", "4a2d1a", "1c1c1e", "6b3a22",
  "8a5a2b", "d9c8a0", "3d2b1f", "8a2f2f",
];

/** Clothing carries the colour on a small sprite, so these are its boldest values. */
const CLOTHING = [
  "2f6f8f", "7a3b6b", "3f7a5a", "b5651d",
  "4a4a9f", "8f3a3a", "2d6b6b", "6b5a2f",
];

/** Iris colours. DiceBear's default is close to white, which reads as blank. */
const EYES = ["2b3f6b", "3a5a3a", "5a3a2b", "4a2b5a"];

/**
 * Frames in real colours. The default greys rendered as a broad grey band across
 * the eyes, which read as a blindfold rather than eyewear.
 */
const GLASSES = ["2b1d14", "4a2d1a", "2f6f8f", "7a3b6b"];

export function LikenessAvatar({
  seed,
  className = "",
  instanceId,
}: {
  seed: string;
  className?: string;
  /**
   * Distinguishes two renders of the SAME avatar. The marquee shows every
   * record twice (the seam trick), so seed alone is not unique on the page and
   * the internal ids collided. Defaults to the seed, which is unique whenever
   * an avatar appears once.
   */
  instanceId?: string;
}) {
  /**
   * DiceBear hardcodes ids inside every avatar it emits — `viewboxMask`, plus a
   * per-hair-style `<mask>` such as `beardVariant01-a`. The marquee renders the
   * track twice, so those ids landed on one page two or more times. Duplicate
   * ids are invalid HTML and make every `url(#...)` reference ambiguous, which
   * browsers resolve to the first match.
   *
   * The first fix namespaced `viewboxMask` only, on the assumption it was the
   * sole id DiceBear emitted. It was not: rendering every seed and collecting
   * the ids showed the hair masks collide too. Every id and every `#ref`
   * pointing at one is now rewritten in a single pass.
   *
   * The seed is alphanumeric, so it is safe inside an attribute value.
   */
  const uid = (instanceId ?? seed).replace(/[^a-zA-Z0-9_-]/g, "");

  const svg = createAvatar(pixelArt, {
    seed,
    size: 128,
    skinColor: SKIN,
    hairColor: HAIR,
    clothingColor: CLOTHING,
    eyesColor: EYES,
    glassesColor: GLASSES,
    // Pixel art should stay pixel art: a little background makes the sprite sit
    // in its tile instead of floating, and the cap keeps the head from touching
    // the top edge on the taller variants.
    scale: 90,
    backgroundColor: ["transparent"],
  })
    .toString()
    // Namespace every id first, so no id survives untouched to collide with
    // another instance of the same avatar.
    .replace(/\bid="([^"]+)"/g, (_m, id) => `id="${id}-${uid}"`)
    // Then point every reference at the namespaced form. Both `#x` (masks,
    // filters, clip paths in `url(#x)`) and bare ids in `href`/`xlink:href`
    // are covered by matching the id inside the parens or quotes.
    .replace(/url\(#([^\)]+)\)/g, (_m, id) => `url(#${id}-${uid})`)
    // Strip the RDF metadata block. Its text is part of the SVG, so inline it
    // joins the parent link's accessible name and a screen reader reads
    // "Pixel ArtDiceBearhttps://dicebear.com" before it reads the record.
    // The style is CC0, so no attribution is required in the document.
    .replace(/<metadata[\s\S]*?<\/metadata>/g, "")
    // Also drop any <title>, which would be announced a second time.
    .replace(/<title>[\s\S]*?<\/title>/g, "");

  return (
    <div
      className={className}
      // The card already names the record in text, so the avatar is decorative
      // and must not add a second announcement.
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
