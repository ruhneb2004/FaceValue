import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Wallet } from "lucide-react";
import { Button } from "./Button";

/** Opaque chrome: never translucent, never blurred. */
export function SiteHeader() {
  return (
    <header className="chrome sticky top-0 z-40">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center gap-3 px-4 md:px-6">
        <Link
          href="/"
          aria-label="FaceValue home"
          className="press flex min-h-11 shrink-0 items-center gap-2.5 rounded-chip pr-2"
        >
          <Image
            src="/mark-inverse.png"
            alt=""
            width={212}
            height={256}
            priority
            className="h-7 w-auto"
          />
          <span className="hidden font-display text-[17px] font-semibold tracking-[-0.02em] text-ink sm:block">
            FaceValue
          </span>
        </Link>

        <nav aria-label="Main" className="ml-2 hidden items-center gap-0.5 lg:flex">
          <HeaderLink href="/" current>
            Explore
          </HeaderLink>
          <HeaderLink href="/register">Register</HeaderLink>
          <HeaderLink href="/challenge">Challenge</HeaderLink>
          <HeaderLink href="/admin/review">Resolve</HeaderLink>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {/* Chain indicator: the network this registry is anchored on. */}
          <div
            className="hidden items-center gap-2 rounded-chip border border-line px-2.5 py-1.5 md:flex"
            aria-label="Network: Hedera testnet"
          >
            <span
              className="size-1.5 rounded-full bg-[var(--state-active-bg)]"
              aria-hidden="true"
            />
            <span className="font-mono text-[11px] font-medium text-ink-2">
              Hedera · 296
            </span>
            <ChevronDown
              className="size-3 text-ink-3"
              aria-hidden="true"
            />
          </div>

          <Button size="md">
            <Wallet className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Connect wallet</span>
            <span className="sm:hidden">Connect</span>
          </Button>
        </div>
      </div>

      {/* Mobile nav: a plain row, no hamburger overlay to get trapped in. */}
      <nav
        aria-label="Main"
        className="mx-auto flex w-full max-w-[1440px] items-center gap-0.5 overflow-x-auto px-4 pb-2 lg:hidden md:px-6"
      >
        <HeaderLink href="/" current>
          Explore
        </HeaderLink>
        <HeaderLink href="/register">Register</HeaderLink>
        <HeaderLink href="/challenge">Challenge</HeaderLink>
        <HeaderLink href="/admin/review">Resolve</HeaderLink>
      </nav>
    </header>
  );
}

function HeaderLink({
  href,
  current,
  children,
}: {
  href: string;
  current?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className="press grid min-h-11 min-w-11 shrink-0 place-items-center rounded-chip px-3 text-sm font-medium text-ink-2 hover:bg-soft hover:text-ink data-[current]:text-ink"
      {...(current ? { "data-current": "" } : {})}
    >
      {children}
    </Link>
  );
}
