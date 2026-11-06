"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const BENEFITS = [
  {
    t: "One use at a time",
    d: "A licence names the use and the date. It never hands over the face, so a brief cannot quietly widen into a campaign.",
    meta: ["Named use", "Dated", "Non-transferable"],
  },
  {
    t: "Refusals in words",
    d: "An entry that cannot be licensed says why, on the page. No greyed out button and no guessing.",
    meta: ["Stated reason", "No dead ends"],
  },
  {
    t: "Bonded claims",
    d: "A challenge costs money to file. That keeps the dispute queue short and the claims worth reading.",
    meta: ["Bond required", "Spam resistant"],
  },
  {
    t: "Hashes on chain, images off it",
    d: "The reference face never leaves the device. Only a hash, the terms and the bond reach the ledger.",
    meta: ["Hash only", "No image on chain"],
  },
];

/**
 * What a licence actually does, as a classic accordion.
 *
 * This is the shadcn accordion pattern: a stacked list of headers with a
 * rotating chevron, one panel open at a time, the first open by default so the
 * section never renders as four closed rows with nothing to read.
 *
 * It is genuinely collapsible now, which is a real trade against the previous
 * version that kept all four descriptions visible. The trade is accepted because
 * the accordion is what was asked for, and because the row that is open by
 * default means no reader arrives at an empty section. The cost is that three
 * of the four descriptions need a click to read.
 *
 * Built on Radix via the project's own accordion primitives rather than
 * hand-rolled, so arrow-key navigation between headers, Home and End, and the
 * aria-expanded/aria-controls wiring come from the library.
 */
export function Benefits() {
  return (
    <div>
      <div className="mx-auto mb-14 max-w-[760px] text-center">
        <h2 id="benefits" className="heading-3 text-ink">
          What the licence actually does
        </h2>
        <p className="body-2 mt-4 mx-auto max-w-[46ch] text-ink2">
          Four things a buyer can rely on before paying, and four a registrant
          can rely on after.
        </p>
      </div>

      <Accordion
        type="single"
        collapsible
        defaultValue="benefit-0"
        className="mx-auto max-w-[760px] text-left"
      >
        {BENEFITS.map((b, i) => (
          <AccordionItem key={b.t} value={`benefit-${i}`}>
            <AccordionTrigger>
              <span className="block text-[1.25rem] leading-7 font-medium">
                {b.t}
              </span>
            </AccordionTrigger>

            <AccordionContent>
              <p className="body-2 max-w-[58ch] text-ink2">{b.d}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {b.meta.map((m) => (
                  <span
                    key={m}
                    className="caption-4 rounded-sm border border-line bg-surface2 px-2.5 py-1 text-ink2"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
