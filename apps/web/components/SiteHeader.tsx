import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b-[2.5px] border-ink bg-canvas">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between gap-3 px-5 md:px-8">
        <Link
          href="/"
          aria-label="FaceValue home"
          className="press flex min-h-11 items-center rounded-[10px]"
        >
          {/* Textless mark only; the wordmark lives in the hero and footer. */}
          <Image
            src="/mark.png"
            alt="FaceValue"
            width={212}
            height={256}
            priority
            className="h-9 w-auto"
          />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1.5 md:flex">
          <HeaderLink href="/">Browse</HeaderLink>
          <HeaderLink href="/register">Register</HeaderLink>
          <HeaderLink href="/docs">Docs</HeaderLink>
        </nav>

        <button
          type="button"
          className="press cartoon-sm min-h-11 shrink-0 bg-lemon px-4 text-sm font-extrabold text-ink"
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
      className="press grid min-h-11 min-w-11 place-items-center rounded-[10px] px-3 text-sm font-bold text-ink-2 hover:bg-white hover:text-ink"
    >
      {children}
    </Link>
  );
}
