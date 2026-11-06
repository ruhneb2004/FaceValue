import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/lib/wallet";

/**
 * B1: one typeface. Geist everywhere, Geist Mono only where a monospace is
 * required (addresses, hashes, prices). No second display face.
 */
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

/** Mono for chain data, ENS names, hashes and bond amounts. */

export const metadata: Metadata = {
  title: "FaceValue — likeness rights, cleared",
  description:
    "A registry and clearance API for likeness rights. Find a face, licence it for one use, and see the bond behind every claim.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable} h-full antialiased`}
    >
      <WalletProvider>
      <body className="flex min-h-full flex-col bg-page text-ink">
        <a
          href="#main"
          className="sr-only rounded-md bg-accent px-3 py-3 font-semibold text-[var(--accent-ink)] focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
        >
          Skip to content
        </a>
        {children}
      </body>
      </WalletProvider>
    </html>
  );
}
