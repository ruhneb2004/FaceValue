"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, Copy, LogOut, Wallet } from "lucide-react";
import { useState } from "react";
import { Button } from "./Button";
import { shortAddress, useWallet } from "@/lib/wallet";

const NAV = [
  { href: "/explore", label: "Explore" },
  { href: "/register", label: "Register" },
  { href: "/challenge", label: "Challenge" },
  { href: "/admin/review", label: "Resolve" },
];

/** Opaque chrome: never translucent, never blurred. */
export function SiteHeader() {
  const pathname = usePathname();
  const { status, address, connect, disconnect } = useWallet();
  const [copied, setCopied] = useState(false);

  const connecting = status === "connecting";

  async function copyAddress() {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard blocked; the address is still visible on screen.
    }
  }

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
          {NAV.map((n) => (
            <HeaderLink
              key={n.href}
              href={n.href}
              current={pathname === n.href || pathname.startsWith(n.href + "/")}
            >
              {n.label}
            </HeaderLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {/* Where the records live. Plain text, not a control: there is only
              one chain, so a bordered chip with a chevron promised a menu that
              does not and cannot exist. */}
          <p className="hidden items-center gap-1.5 md:flex">
            <span
              className="size-1.5 rounded-full bg-[var(--live)]"
              aria-hidden="true"
            />
            <span className="font-mono text-[11px] text-ink-3">
              Hedera testnet
            </span>
          </p>

          {status === "connected" && address ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={copyAddress}
                className="press inline-flex min-h-11 items-center gap-2 rounded-control border border-line bg-card px-3 font-mono text-xs text-ink-2 hover:bg-soft hover:text-ink"
                aria-label={`Copy wallet address ${address}`}
              >
                <span
                  className="size-1.5 rounded-full bg-[var(--live)]"
                  aria-hidden="true"
                />
                {shortAddress(address)}
                {copied ? (
                  <Check className="size-3.5 text-accent" aria-hidden="true" />
                ) : (
                  <Copy className="size-3.5" aria-hidden="true" />
                )}
              </button>
              <button
                type="button"
                onClick={disconnect}
                aria-label="Disconnect wallet"
                className="press grid size-11 place-items-center rounded-control text-ink-3 hover:bg-soft hover:text-ink"
              >
                <LogOut className="size-4" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <Button size="md" variant="secondary" onClick={connect} disabled={connecting}>
              <Wallet className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">
                {connecting ? "Connecting…" : "Connect wallet"}
              </span>
              <span className="sm:hidden">
                {connecting ? "…" : "Connect"}
              </span>
            </Button>
          )}
        </div>
      </div>

      {/* Mobile nav: a plain row, no hamburger overlay to get trapped in. */}
      <nav
        aria-label="Main"
        className="mx-auto flex w-full max-w-[1440px] items-center gap-0.5 overflow-x-auto px-4 pb-2 lg:hidden md:px-6"
      >
        {NAV.map((n) => (
          <HeaderLink
            key={n.href}
            href={n.href}
            current={pathname === n.href || pathname.startsWith(n.href + "/")}
          >
            {n.label}
          </HeaderLink>
        ))}
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
