"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { useState } from "react";
import { ArrowRight, ArrowUpRight, Copy, Check, SignOut, Wallet } from "@phosphor-icons/react/ssr";
import { Button } from "./Button";
import { Sheet, SheetContent, SheetTrigger } from "./Sheet";
import { shortAddress, useWallet } from "@/lib/wallet";

const NAV = [
  { href: "/explore", label: "Explore" },
  { href: "/register", label: "Register" },
  { href: "/challenge", label: "Challenge" },
  { href: "/admin/review", label: "Resolve" },
];

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * B7 navigation: a compact bar floating off the top edge, centred, translucent
 * over a blur so content stays faintly visible behind it.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const { status, address, connect, disconnect } = useWallet();
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const connecting = status === "connecting";

  async function copyAddress() {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard blocked; the address is still visible.
    }
  }

  return (
    <>
      <header className="pointer-events-none sticky top-4 z-50 flex justify-center px-3">
        <div className="pointer-events-auto flex w-full max-w-[1312px] items-center gap-2 rounded-xl border border-linestrong bg-surface2/55 px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
          <Link
            href="/"
            aria-label="FaceValue home"
            className="press flex min-h-11 items-center gap-2 rounded-md pl-2 pr-2"
          >
            <Image
              src="/mark-inverse.png"
              alt=""
              width={212}
              height={256}
              priority
              className="h-6 w-auto"
            />
            <span className="hidden font-mono text-[0.8125rem] font-medium uppercase tracking-[0.14em] text-ink sm:block">
              Face<span className="text-accent">Value</span>
            </span>
          </Link>

          <nav aria-label="Main" className="ml-2 hidden items-center lg:flex">
            {NAV.map((n) => (
              <NavLink
                key={n.href}
                href={n.href}
                current={pathname === n.href || pathname.startsWith(n.href + "/")}
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {status === "connected" && address ? (
              <>
                <button
                  type="button"
                  onClick={copyAddress}
                  className="press caption-4 inline-flex min-h-11 items-center gap-2 rounded-md border border-line bg-surface3 px-3 font-mono text-ink2 hover:bg-surface4 hover:text-ink"
                  aria-label={`Copy wallet address ${address}`}
                >
                  <span
                    className="size-1.5 rounded-full bg-[var(--state-active)]"
                    aria-hidden="true"
                  />
                  {shortAddress(address)}
                  {copied ? <Check size={12} aria-hidden="true" /> : <Copy size={12} aria-hidden="true" />}
                </button>
                <button
                  type="button"
                  onClick={disconnect}
                  aria-label="Disconnect wallet"
                  className="press grid size-11 place-items-center rounded-md text-ink3 hover:bg-surface4 hover:text-ink"
                >
                  <SignOut size={16} aria-hidden="true" />
                </button>
              </>
            ) : (
              /* Not the shared Button: this is the one control in the bar that
                 has to read as the primary action, and a bordered rectangle on a
                 translucent bar reads as chrome. A filled accent pill with a
                 trailing arrow states it as the way in. Size stays within the
                 bar's own metrics so the container is untouched. */
              <button
                type="button"
                onClick={connect}
                disabled={connecting}
                className="press group relative inline-flex min-h-11 items-center gap-1.5 rounded-full border border-accentink/85 bg-accent py-1 pl-4 pr-1 text-accentink shadow-[0_1px_2px_rgba(0,0,0,0.4),0_2px_0_0_#7a9900] transition-[box-shadow,transform,background-color] duration-200 hover:shadow-[0_1px_3px_rgba(0,0,0,0.45),0_2px_0_0_#7a9900] hover:brightness-[1.04] active:translate-y-px active:shadow-[0_1px_1px_rgba(0,0,0,0.35),0_1px_0_0_#7a9900] disabled:opacity-45 motion-reduce:transition-none"
              >
                {/* A capsule, not a rectangle. The radius is fully round so the
                    control has no corners to read as a box, and the arrow sits
                    in a circular ink well inset from the right edge by the same
                    4px as the vertical padding, so it is concentric with the
                    outer capsule rather than pasted on the end. */}
                <span className="flex items-center gap-2 font-mono text-[0.8125rem] font-semibold uppercase tracking-[0.06em]">
                  <Wallet size={15} weight="fill" aria-hidden="true" />
                  {connecting ? "Connecting" : "Connect wallet"}
                </span>
                <span
                  aria-hidden="true"
                  className="grid size-8 shrink-0 place-items-center rounded-full bg-accentink text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-accentink motion-reduce:transition-none"
                >
                  <ArrowRight
                    size={14}
                    weight="bold"
                    className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
                  />
                </span>
              </button>
            )}

            {/*
              Mobile navigation is a Sheet rather than a full screen takeover:
              the page stays visible behind a blurred backdrop, the panel slides
              in from the right, and only its body scrolls. Radix provides the
              focus trap, Escape, scroll lock and focus return.
            */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label="Open menu"
                  className="press grid size-11 place-items-center rounded-md text-ink lg:hidden"
                >
                  <MenuGlyph open={open} />
                </button>
              </SheetTrigger>
              <SheetContent side="right" title="Menu" description="Where to go next">
                <nav aria-label="Main" className="flex flex-col">
                  {NAV.map((n) => (
                    <Link
                      key={n.href}
                      href={n.href}
                      onClick={() => setOpen(false)}
                      aria-current={
                        pathname === n.href || pathname.startsWith(n.href + "/")
                          ? "page"
                          : undefined
                      }
                      className="press title-2 flex min-h-14 items-center justify-between gap-4 rounded-md border-b border-line py-3 text-ink hover:text-accent"
                    >
                      {n.label}
                      <ArrowUpRight size={18} aria-hidden="true" className="text-ink3" />
                    </Link>
                  ))}
                </nav>

                <p className="caption-4 mt-8 max-w-[38ch] text-ink3">
                  Registers a likeness, clears a single use, or reviews a dispute. Each route needs a
                  connected wallet.
                </p>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

    </>
  );
}

/** Two bars that rotate into a cross. Animated between states, not swapped. */
function MenuGlyph({ open }: { open: boolean }) {
  return (
    <span className="relative block h-4 w-4" aria-hidden="true">
      <motion.span
        className="absolute left-0 top-1/2 block h-0.5 w-4 -translate-y-1/2 rounded-full bg-current"
        animate={{ rotate: open ? 45 : 0 }}
        transition={{ duration: 0.3, ease: EASE }}
      />
      <motion.span
        className="absolute left-0 top-1/2 block h-0.5 w-4 -translate-y-1/2 rounded-full bg-current"
        animate={{ rotate: open ? -45 : 0, y: open ? 0 : -5 }}
        transition={{ duration: 0.3, ease: EASE }}
      />
      <motion.span
        className="absolute bottom-0 left-0 block h-0.5 w-4 rounded-full bg-current"
        animate={{ opacity: open ? 0 : 1, y: open ? -7 : 0 }}
        transition={{ duration: 0.3, ease: EASE }}
      />
    </span>
  );
}

/**
 * A nav link.
 *
 * The active one used to differ only in colour, which is both the weakest
 * possible signal and a state carried by colour alone. It now changes four
 * things at once: a filled surface, a ring, a weight increase, and a small
 * accent dot beneath the label. Any one of them survives greyscale, and the dot
 * survives a colour-blind viewer who cannot tell lime from white.
 *
 * The dot is a pseudo-element rather than a node, so it cannot be read out or
 * focused, and the label keeps its exact position as the state changes. It
 * scales in on the shared easing curve and is removed entirely under
 * prefers-reduced-motion, where the fill and weight still carry the state.
 */
function NavLink({ href, current, children }: { href: string; current?: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={`press relative grid min-h-11 place-items-center rounded-md px-3 font-mono text-[0.8125rem] uppercase tracking-[0.08em] transition-colors ${
        current
          ? "text-accent"
          : "text-ink2 hover:bg-surface3/60 hover:text-ink"
      }`}
    >
      {children}
      {/* A short rule under the active label. It is the block element that
          carries state in greyscale; the accent colour is the second signal,
          not the only one. */}
      <span
        aria-hidden="true"
        className={`absolute inset-x-3 bottom-0 h-px origin-left bg-accent transition-transform duration-300 ${
          current ? "scale-x-100" : "scale-x-0"
        } motion-reduce:transition-none`}
      />
    </Link>
  );
}
