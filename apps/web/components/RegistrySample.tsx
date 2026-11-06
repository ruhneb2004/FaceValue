import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SEED_LIKENESSES } from "@/lib/seed";
import { isLicensable, refusalReason } from "@/lib/types";
import { StateBadge } from "./StateBadge";

/**
 * A real record from the registry, shown on the landing page.
 *
 * The landing page was all assertion. This section replaces one of the
 * feature grids with actual data: four entries in four different states, so a
 * visitor can see what a licence costs and what a refusal says before they
 * have connected anything.
 */
export function RegistrySample() {
  const rows = [
    SEED_LIKENESSES.find((l) => l.state === "active"),
    SEED_LIKENESSES.find((l) => l.state === "disputed"),
    SEED_LIKENESSES.find((l) => l.state === "provisional"),
    SEED_LIKENESSES.find((l) => l.state === "review"),
  ].filter((l): l is NonNullable<typeof l> => Boolean(l));

  return (
    <div className="overflow-hidden rounded-card border border-line bg-card">
      {/* Table on desktop, stacked rows on mobile. Same data either way. */}
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">
          Four sample registry entries showing price and refusal reason
        </caption>
        <thead className="hidden md:table-header-group">
          <tr className="border-b border-line">
            {["Likeness", "State", "Per use", "Licence"].map((h) => (
              <th
                key={h}
                scope="col"
                className={`px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-3 ${
                  h === "Licence" ? "w-[46%]" : h === "Likeness" ? "w-[24%]" : h === "State" ? "w-[16%]" : "w-[14%]"
                }`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((l) => {
            const ok = isLicensable(l.state);
            return (
              <tr
                key={l.id}
                className="block border-b border-line last:border-0 md:table-row"
              >
                <td className="block px-4 pb-0 pt-3.5 md:table-cell md:py-3.5">
                  <Link
                    href={`/likeness/${l.id}`}
                    className="text-sm font-medium text-ink underline-offset-2 hover:underline"
                  >
                    {l.name}
                  </Link>
                  <span className="mt-0.5 block font-mono text-[11px] text-ink-3 md:hidden">
                    {l.ensName}
                  </span>
                </td>
                <td className="block px-4 py-1.5 md:table-cell md:py-3.5">
                  <StateBadge state={l.state} />
                </td>
                <td className="tabular block px-4 py-1.5 font-mono text-xs text-ink-2 md:table-cell md:py-3.5">
                  {/* An unlicensable entry has no price yet. "0 HBAR" reads as
                      free, which is the opposite of true. */}
                  {l.pricePerUse > 0 ? (
                    `${l.pricePerUse} HBAR`
                  ) : (
                    <span className="text-ink-3">—</span>
                  )}
                </td>
                <td className="block max-w-[52ch] px-4 pb-3.5 pt-1.5 text-xs leading-relaxed md:table-cell md:py-3.5">
                  {ok ? (
                    <span className="text-accent">Available</span>
                  ) : (
                    // The refusal in words, never a dead button.
                    <span className="text-ink-3">{refusalReason(l.state)}</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
        <p className="text-xs text-ink-3">
          {SEED_LIKENESSES.length} entries in the demo registry
        </p>
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
        >
          See all
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
