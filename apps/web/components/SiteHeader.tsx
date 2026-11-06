import Image from "next/image";
import Link from "next/link";

/**
 * Header. Uses the square mark, not the lockup: at 28px the raster wordmark
 * would be illegible, so the wordmark is live text in Fraunces and stays crisp
 * at any size. Source art: logo/*.png (keyed to alpha).
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line-subtle bg-page/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between gap-4 px-5 md:px-8">
        <Link
          href="/"
          aria-label="FaceValue home"
          className="press flex min-h-11 items-center gap-2 rounded-[4px]"
        >
          <Image
            src="/mark.png"
            alt=""
            width={212}
            height={256}
            priority
            className="h-7 w-auto"
          />
          <span className="font-display text-lg tracking-[-0.01em] text-ink">
            facevalue
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 sm:flex">
          <HeaderLink href="/">Browse</HeaderLink>
          <HeaderLink href="/register">Register</HeaderLink>
          <HeaderLink href="/docs">Docs</HeaderLink>
        </nav>

        <button
          type="button"
          className="press min-h-11 shrink-0 rounded-control bg-accent px-4 text-sm font-medium text-white hover:bg-accent-hover"
        >
          Connect wallet
        </button>
      </div>
    </header>
  );
}

function HeaderLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="grid min-h-11 min-w-11 place-items-center rounded-control px-3 text-sm text-ink-2 transition-colors duration-150 hover:bg-surface hover:text-ink"
    >
      {children}
    </Link>
  );
}
