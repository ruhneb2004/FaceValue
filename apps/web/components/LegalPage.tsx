import Link from "next/link";

/** Shared shell for the legal pages, so both read the same. */
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
    <main id="main" className="mx-auto w-full max-w-[1440px] px-3 pb-2 pt-2 md:px-3">
      <div className="max-w-[680px]">
        <Link href="/" className="press caption-5 text-ink3 hover:text-ink">
          &larr; Back to overview
        </Link>
        <h1 className="heading-4 mt-2 text-ink">{title}</h1>
        <p className="caption-4 mt-2 font-mono text-ink3">
          Last updated {updated}
        </p>

        <div className="mt-2 space-y-space-y">
          {sections.map((s) => (
            <section key={s.h}>
              <h2 className="title-3 text-ink">{s.h}</h2>
              <p className="body-6 mt-2 text-ink2">{s.p}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
