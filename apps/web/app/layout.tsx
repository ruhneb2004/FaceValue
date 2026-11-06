import type { Metadata } from "next";
import { Geist, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/lib/wallet";

/** Geist: the grotesque OpenSea uses for UI text. */
const geist = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

/** Inter tight for display: close to GT America / Grotzec in feel. */
const inter = Inter({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

/** Mono for chain data, ENS names, hashes and bond amounts. */
const mono = JetBrains_Mono({
  variable: "--font-mono-src",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FaceValue — likeness rights, cleared",
  description:
    "A registry and clearance API for likeness rights. Find a face, licence it for one use, and see the bond behind every claim.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${inter.variable} ${mono.variable} h-full antialiased`}
    >
      <WalletProvider>
      <body className="flex min-h-full flex-col bg-page text-ink">
        <a
          href="#main"
          className="sr-only rounded-control bg-accent px-4 py-2 font-semibold text-[var(--accent-ink)] focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
        >
          Skip to content
        </a>
        {children}
      </body>
      </WalletProvider>
    </html>
  );
}
