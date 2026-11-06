import type { Likeness } from "@/lib/types";

/**
 * The price, stated as terms rather than as a number in a corner.
 *
 * "One licence is one use" is the product's central claim, so the row shows the
 * unit, the amount and what the buyer receives. It is a `<dl>` because these are
 * label/value pairs and reading them without the labels would be meaningless.
 */
export function PriceRow({ likeness }: { likeness: Likeness }) {
  return (
    <dl className="divide-y divide-line rounded-lg border border-line bg-surface3">
      <div className="flex items-baseline justify-between gap-4 px-4 py-3">
        <dt className="body-6 text-ink2">One use</dt>
        <dd className="tnum title-3 font-mono text-ink">
          {likeness.pricePerUse}
          <span className="caption-5 ml-2 text-ink3">HBAR</span>
        </dd>
      </div>

      <div className="flex items-baseline justify-between gap-4 px-4 py-3">
        <dt className="body-6 text-ink2">Duration</dt>
        {/* A use is a single placement. This is the sentence that stops the
            reader assuming a subscription. */}
        <dd className="body-6 text-right text-ink">
          One placement, one campaign window
        </dd>
      </div>

      <div className="flex items-baseline justify-between gap-4 px-4 py-3">
        <dt className="body-6 text-ink2">What changes hands</dt>
        <dd className="body-6 text-right text-ink">
          A signed licence naming the use, the price and the likeness hash
        </dd>
      </div>

      <div className="flex items-baseline justify-between gap-4 px-4 py-3">
        <dt className="body-6 text-ink2">What leaves this device</dt>
        {/* The privacy claim, stated where the buyer makes the decision. */}
        <dd className="body-6 text-right text-ink">
          Nothing. The image stays local; only its hash is written
        </dd>
      </div>
    </dl>
  );
}
