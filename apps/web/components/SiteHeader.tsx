import Image from "next/image";
import Link from "next/link";
import { Button } from "./Button";

/** Opaque chrome: never translucent, never blurred. */
export function SiteHeader() {
  return (
    <header className="chrome sticky top-0 z-40">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between gap-3 px-5 md:px-8">
        <Link
          href="/"
          aria-label="FaceValue home"
          className="press flex min-h-11 items-center rounded-[8px]"
        >
          <Image
            src="/mark.png"
            alt=""
            width={212}
            height={256}
            priority
            className="h-8 w-auto"
          />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          <HeaderLink href="/">Browse</HeaderLink>
          <HeaderLink href="/register">Register</HeaderLink>
          <HeaderLink href="/docs">Docs</HeaderLink>
        </nav>

        <Button>Connect wallet</Button>
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
      className="press grid min-h-11 min-w-11 place-items-center rounded-[8px] px-3 text-sm font-medium text-ink-2 hover:bg-strong hover:text-ink"
    >
      {children}
    </Link>
  );
}
