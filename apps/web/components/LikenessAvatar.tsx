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
}: {
  seed: string;
  className?: string;
}) {
  /**
   * DiceBear hardcodes `id="viewboxMask"` in every avatar it emits, and the
   * marquee renders the track twice, so sixteen copies of that id ended up on
   * one page. Duplicate ids are invalid HTML and make every `url(#...)`
   * reference ambiguous, which browsers resolve to the first match.
   *
   * The id is namespaced per seed instead. The seed is alphanumeric, so it is
   * safe inside an attribute value.
   */
  const uid = seed.replace(/[^a-zA-Z0-9_-]/g, "");

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
    .replace(/viewboxMask/g, `viewboxMask-${uid}`);

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
