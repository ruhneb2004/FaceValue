import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-line-subtle bg-page">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between gap-4 px-5 md:px-8">
        <Link
          href="/"
          aria-label="FaceValue home"
          className="flex min-h-11 items-center gap-2 rounded-[4px]"
        >
          {/* Mark only — the wordmark is rendered as text so it stays crisp
              and scales with the type, rather than being an unreadable raster
              at 24px. Source art: logo/Gemini_Generated_Image_pbndu5pbndu5pbnd.png */}
          <Image
            src="/mark.png"
            alt=""
            width={28}
            height={28}
            priority
            className="size-7"
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
          className="min-h-11 shrink-0 rounded-control bg-accent px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-hover"
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
