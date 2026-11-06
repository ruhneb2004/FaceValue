import { Check, Minus } from "lucide-react";

/**
 * One resolved dispute, shown as a record rather than described.
 *
 * The landing page claimed "the face decides, the count does not" and left it
 * as a slogan. This shows a single case with the cosine score, the three
 * resolver answers and the payout, so the claim is checkable on the page.
 */
export function DisputeRecord() {
  const resolvers = [
    { name: "resolver-1", cos: 0.91, vote: "match" },
    { name: "resolver-2", cos: 0.88, vote: "match" },
    { name: "resolver-3", cos: 0.31, vote: "no-match" },
  ];

  return (
    <div className="bg-surface3 border border-line bg-surface3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3 py-3">
        <p className="font-mono caption-4 text-ink3">dispute #d-0417</p>
        <p className="font-mono caption-4 text-[var(--state-active)]">resolved</p>
      </div>

      <dl className="grid grid-cols-2 divide-x divide-line border-b border-line md:grid-cols-4">
        {[
          { k: "Stake", v: "120 HBAR" },
          { k: "Threshold", v: "0.65" },
          { k: "Quorum", v: "2 of 3" },
          { k: "Payout", v: "Registered" },
        ].map((s) => (
          <div key={s.k} className="px-3 py-3">
            <dt className="caption-4 uppercase tracking-[0.06em] text-ink3">
              {s.k}
            </dt>
            <dd className="tnum mt-2 font-mono title-4 text-ink">{s.v}</dd>
          </div>
        ))}
      </dl>

      <ul className="divide-y divide-line">
        {resolvers.map((r) => {
          const matched = r.vote === "match";
          return (
            <li
              key={r.name}
              className="flex items-center gap-2 px-3 py-3"
            >
              <span className="font-mono caption-5 text-ink2">{r.name}</span>
              <span className="tnum ml-auto font-mono caption-5 text-ink3">
                cos {r.cos.toFixed(2)}
              </span>
              <span
                className={`inline-flex items-center gap-2 caption-5 ${
                  matched ? "text-accent" : "text-ink3"
                }`}
              >
                {matched ? (
                  <Check className="size-3.5" aria-hidden="true" />
                ) : (
                  <Minus className="size-3.5" aria-hidden="true" />
                )}
                {matched ? "match" : "no match"}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="border-t border-line px-3 py-3 caption-5 leading-relaxed text-ink3">
        Two resolvers read the same face at 0.91 and 0.88. The third did not.
        The challenged entries still resolved on the face, so the registered
        party took the 120 HBAR stake.
      </p>
    </div>
  );
}
