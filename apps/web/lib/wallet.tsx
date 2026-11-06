"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/**
 * Wallet state.
 *
 * This is a demo wallet: `connect()` mints a plausible address locally and
 * persists it. There is no provider, no signature and no real chain call yet.
 * Nothing here is security. Do not gate anything valuable behind it.
 *
 * The shape is deliberately the one a real wallet connector exposes
 * (`address`, `connect`, `disconnect`, `status`) so swapping in wagmi later is
 * a change to this file only.
 */
export type WalletStatus = "disconnected" | "connecting" | "connected";

type WalletState = {
  status: WalletStatus;
  address: `0x${string}` | null;
  connect: () => void;
  disconnect: () => void;
};

const WalletContext = createContext<WalletState | null>(null);
const STORAGE_KEY = "facevalue.wallet";

/** A stable, obviously-fake demo address. Deterministic per browser. */
function demoAddress(): `0x${string}` {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  return `0x${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}` as const;
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<WalletStatus>("disconnected");
  const [address, setAddress] = useState<`0x${string}` | null>(null);

  // Restore a previous session. Runs after mount so server and client markup
  // match on the first paint (no hydration mismatch).
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setAddress(saved as `0x${string}`);
        setStatus("connected");
      }
    } catch {
      // Private mode or blocked storage: stay disconnected.
    }
  }, []);

  const connect = useCallback(() => {
    setStatus("connecting");
    // A short delay so the button shows a real pending state rather than
    // snapping. 600ms is long enough to read, short enough not to annoy.
    window.setTimeout(() => {
      const addr = demoAddress();
      try {
        window.localStorage.setItem(STORAGE_KEY, addr);
      } catch {
        // Non-fatal: the session simply will not persist.
      }
      setAddress(addr);
      setStatus("connected");
    }, 600);
  }, []);

  const disconnect = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setAddress(null);
    setStatus("disconnected");
  }, []);

  const value = useMemo(
    () => ({ status, address, connect, disconnect }),
    [status, address, connect, disconnect],
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet(): WalletState {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside <WalletProvider>");
  return ctx;
}

/** Shorten for display: 0x4f2a…c1e7 */
export function shortAddress(a: string, lead = 6, tail = 4): string {
  return a.length <= lead + tail ? a : `${a.slice(0, lead)}…${a.slice(-tail)}`;
}
