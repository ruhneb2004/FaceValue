import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-line-subtle bg-page">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between gap-6 px-5 md:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-[4px] font-display text-lg tracking-[-0.01em] text-ink"
        >
          <span
            aria-hidden="true"
            className="grid size-6 place-items-center rounded-full bg-accent text-[11px] font-semibold text-white"
          >
            F
          </span>
          FaceValue
        </Link>

        <nav aria-label="Main" className="flex items-center gap-1">
          <HeaderLink href="/">Browse</HeaderLink>
          <HeaderLink href="/register">Register</HeaderLink>
          <HeaderLink href="/docs">Docs</HeaderLink>
        </nav>

        <button
          type="button"
          className="min-h-11 rounded-control bg-accent px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-hover"
        >
          Connect wallet
        </button>
      </div>
    </header>
  );
}

function HeaderLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="grid min-h-11 min-w-11 place-items-center rounded-control px-3 text-sm text-ink-2 transition-colors duration-150 hover:bg-surface hover:text-ink"
    >
      {children}
    </Link>
  );
}
