import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/ssr";

/**
 * The shared opening block for an inner page: a back link, an eyebrow, an h1
 * and an intro. Every non-landing screen starts the same way so the site reads
 * as one place. The landing page keeps its own hero; this is the calmer sibling
 * of it, on the same max-width and padding rhythm.
 *
 * The intro is capped at a readable measure and the whole block sits inside the
 * page's container, so pages stop drifting to the 12px page edge the way the
 * grid screens used to.
 */
export function PageIntro({
  eyebrow,
  title,
  intro,
  backHref = "/explore",
  backLabel = "Back to the registry",
  aside,
}: {
  eyebrow?: string;
  title: string;
  intro?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  /** Optional right-hand content on wide screens, e.g. a set of facts. */
  aside?: React.ReactNode;
}) {
  return (
    <div className="border-b border-line bg-surface1">
      <div className="mx-auto w-full max-w-[1440px] px-6 pb-12 pt-10 md:px-12 md:pb-16 md:pt-14">
        <Link
          href={backHref}
          className="press inline-flex min-h-11 items-center gap-1.5 body-5 text-ink2 transition-[color] duration-200 hover:text-ink"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          {backLabel}
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-16">
          <div className="min-w-0">
            {eyebrow && (
              <p className="mb-4 flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink3">
                <span className="inline-block size-1.5 rounded-full bg-accent" aria-hidden="true" />
                {eyebrow}
              </p>
            )}
            <h1 className="max-w-[18ch] text-[2.25rem] leading-[1.04] font-medium tracking-[-0.025em] text-ink text-balance md:text-[3.25rem]">
              {title}
            </h1>
            {intro && (
              <p className="mt-5 max-w-[54ch] text-[1.0625rem] leading-relaxed text-ink2">
                {intro}
              </p>
            )}
          </div>

          {aside && <div className="shrink-0">{aside}</div>}
        </div>
      </div>
    </div>
  );
}
