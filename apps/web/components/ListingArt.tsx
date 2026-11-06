import { createAvatar } from "@dicebear/core";
import { notionists } from "@dicebear/collection";

/**
 * Listing artwork.
 *
 * Generated at build time from the listing id, so it is deterministic, tiny,
 * and never a real person's face. We deliberately do not ship photographs of
 * people: inventing a face for a product that exists to stop unlicensed use of
 * faces would be self-defeating.
 *
 * Style: flat 2D line art (DiceBear "notionists"), the register used by most
 * crypto infrastructure sites. Rendered with our palette as the background.
 */
export function ListingArt({
  id,
  className = "",
}: {
  id: string;
  className?: string;
}) {
  const svg = createAvatar(notionists, {
    seed: id,
    size: 400,
    radius: 0,
    backgroundColor: ["transparent"],
    // Dark ink on the warm surface, matching the logo line weight.
    scale: 105,
  }).toString();

  return (
    <div
      className={`relative ${className}`}
      aria-hidden="true"
      // Build-time deterministic output from a trusted generator.
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
