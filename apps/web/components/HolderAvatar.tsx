"use client";

import { blo } from "blo";

/**
 * Address identicon, the way Scaffold-ETH renders one.
 *
 * Scaffold-ETH's BlockieAvatar is a RainbowKit avatar that does
 * `blo(address)` and renders it in an img. This is the same generator, without
 * the RainbowKit wrapper: `blo` returns a self-contained SVG data URI, so there
 * is no network request, no canvas, and nothing to hydrate.
 *
 * Why it suits this page better than the illustration it replaces. A blockie is
 * derived from the controller address, so the art a record shows *is* its
 * on-chain identity: the same address always draws the same picture, and two
 * different addresses never share one. On a marketplace about proving who an
 * entry belongs to, an avatar that encodes the owner is more honest than a
 * decorative cartoon, and it removes the arbitrary coat/accessory assignment.
 *
 * Because identicons are colourful by nature, the container controls the tone:
 * a fixed ground and border keep eight of them reading as one grid.
 */
export function HolderAvatar({
  address,
  size = 96,
  className = "",
}: {
  address: string;
  size?: number;
  className?: string;
}) {
  return (
    <img
      src={blo(address as `0x${string}`)}
      width={size}
      height={size}
      alt=""
      // Decorative: the card already names the record and its controller in
      // text, so an alt here would duplicate it for a screen reader.
      aria-hidden="true"
      className={className}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
        // blo emits an 8x8 block grid. Scaled up into a 300px card, bilinear
        // smoothing turns those blocks to mush and the identicon loses its
        // edges, so the blocks are kept crisp instead.
        imageRendering: "pixelated",
      }}
    />
  );
}
