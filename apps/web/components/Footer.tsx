import Image from "next/image";
import Link from "next/link";

/**
 * Shared footer: legal links and a way back from every page (B10).
 *
 * Rebuilt as a real page foot rather than two crumbs in opposite corners. The
 * previous version set its links at 12px in a 8px-gapped nav, so the two columns
 * collided into a block at the extreme right while the identity sat alone at the
 * far left. The disclaimer was ink3 at 4.20:1, under the floor for body text.
 *
 * The structure is now a wide identity column, two link columns on a shared
 * baseline, and a rule above a bottom strip that carries the legal line and the
 * build state. Every link is a 44px row so the whole foot is tappable, which was
 * the other reason the old links were hard to use.
 */

const LINKS: { title: string; items: { href: string; label: string }[] }[] = [
  {
    title: "Registry",
    items: [
      { href: "/explore", label: "Explore" },
      { href: "/register", label: "Register" },
      { href: "/admin/review", label: "Resolve" },
    ],
  },
  {
    title: "Terms",
    items: [
      { href: "/legal/privacy", label: "Privacy" },
      { href: "/legal/terms", label: "Licence terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface1">
      <div className="mx-auto w-full max-w-[1440px] px-6 md:px-12">
        {/* Identity, then navigation. The columns sit on one grid so the tops
            align; the old version used a flex row that let each block drift. */}
        <div className="grid gap-12 py-16 md:py-20 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,0.8fr)_minmax(0,0.8fr)] lg:gap-16">
          <div className="max-w-[42ch]">
            <Image
              src="/logo-footer.png"
              alt="facevalue"
              width={800}
              height={195}
              className="h-7 w-auto"
            />
            <p className="mt-5 text-[0.9375rem] leading-relaxed text-ink2">
              A registry of likeness rights, cleared one use at a time. The face
              stays off chain; only a hash, the terms and the bond are written.
            </p>
            <p className="mt-4 flex items-center gap-2 font-mono text-[0.75rem] uppercase tracking-[0.08em] text-ink3">
              <span
                className="inline-block size-1.5 rounded-full bg-accent"
                aria-hidden="true"
              />
              Testnet build
            </p>
          </div>

          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-10 lg:col-span-2 lg:grid-cols-2"
          >
            {LINKS.map((col) => (
              <div key={col.title}>
                <p
                  id={`footer-${col.title.toLowerCase()}`}
                  className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink3"
                >
                  {col.title}
                </p>
                <ul
                  aria-labelledby={`footer-${col.title.toLowerCase()}`}
                  className="mt-3"
                >
                  {col.items.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="press -mx-2 flex min-h-11 items-center rounded-md px-2 text-[0.9375rem] text-ink2 transition-[color,background-color] duration-200 hover:text-ink focus-visible:text-ink"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* The disclaimer, set apart by a rule rather than floated at 4.2:1. */}
        <div className="flex flex-col gap-3 border-t border-line py-8 md:flex-row md:items-center md:justify-between">
          <p className="max-w-[70ch] text-[0.8125rem] leading-relaxed text-ink2">
            FaceValue is not a party to any licence. Every record and price on
            this build is seeded sample data, and the wallet is a local stand in
            that asks for no signature.
          </p>
          <p className="shrink-0 font-mono text-[0.75rem] uppercase tracking-[0.08em] text-ink3">
            Hedera &middot; ENS &middot; World ID
          </p>
        </div>
      </div>
    </footer>
  );
}
