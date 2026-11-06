import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/ssr";
import { SiteHeader } from "./SiteHeader";
import { Footer } from "./Footer";

/**
 * Shared shell for the legal pages, so both read the same.
 *
 * Rebuilt to the site's page rhythm rather than the old 3px-inset column: the
 * heading block sits in a bordered intro band like every other inner page, and
 * the sections run in a readable measure beside a sticky contents list. The
 * previous version used `space-y-space-y`, a class that compiles to nothing, so
 * the sections sat flush against each other with no gap at all.
 */
export function LegalPage({
  title,
  updated,
  sections,
}: {
  title: string;
  updated: string;
  sections: { h: string; p: string }[];
}) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <div className="border-b border-line bg-surface1">
          <div className="mx-auto w-full max-w-[1440px] px-6 pb-12 pt-10 md:px-12 md:pb-16 md:pt-14">
            <Link
              href="/"
              className="press inline-flex min-h-11 items-center gap-1.5 body-5 text-ink2 transition-[color] duration-200 hover:text-ink"
            >
              <ArrowLeft size={14} aria-hidden="true" />
              Back to overview
            </Link>
            <div className="mt-6">
              <p className="mb-4 flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink3">
                <span className="inline-block size-1.5 rounded-full bg-accent" aria-hidden="true" />
                Legal
              </p>
              <h1 className="text-[2.25rem] leading-[1.04] font-medium tracking-[-0.025em] text-ink md:text-[3.25rem]">
                {title}
              </h1>
              <p className="mt-4 font-mono text-[0.75rem] uppercase tracking-[0.08em] text-ink3">
                Last updated {updated}
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[1440px] px-6 py-12 md:px-12 md:py-16">
          <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
            {/* Contents. On wide screens it holds the left column and stays in
                view; on narrow screens it collapses to a plain list above the
                text. Anchors only — every entry points at a real heading. */}
            <nav aria-label="On this page" className="lg:sticky lg:top-28 lg:self-start">
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink3">
                On this page
              </p>
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 lg:flex-col lg:gap-y-0">
                {sections.map((s, i) => (
                  <li key={s.h}>
                    <a
                      href={`#section-${i}`}
                      className="press flex min-h-9 items-center body-6 text-ink2 transition-[color] duration-200 hover:text-ink"
                    >
                      {s.h}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="max-w-[68ch]">
              <div className="flex flex-col gap-10">
                {sections.map((s, i) => (
                  <section key={s.h} id={`section-${i}`} className="scroll-mt-28">
                    <h2 className="title-2 text-ink">{s.h}</h2>
                    <p className="mt-3 text-[1.0625rem] leading-[1.7] text-ink2">
                      {s.p}
                    </p>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
