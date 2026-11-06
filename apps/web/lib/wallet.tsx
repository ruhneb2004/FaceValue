"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  WagmiProvider,
  type Connector,
} from "wagmi";
import {
  RainbowKitProvider,
  lightTheme,
  useConnectModal,
  type Theme,
} from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "./wagmi";
import "@rainbow-me/rainbowkit/styles.css";

/**
 * Wallet state, backed by RainbowKit + wagmi.
 *
 * This replaces the stand-in wallet that minted a random local address. The
 * public API is unchanged on purpose — `status`, `address`, `connect`,
 * `disconnect` — so every screen that already calls `useWallet()` keeps working
 * without a rewrite. What changed is underneath: `address` is now a real
 * connected account, and connecting opens the RainbowKit modal (Rainbow, the
 * Rainbow mobile app via WalletConnect, and any injected wallet).
 *
 * `connect()` has no arguments because the modal is the argument: the user
 * picks a wallet there. That keeps the call sites — which just say
 * `onClick={connect}` — honest, rather than passing a connector they never see.
 */
export type WalletStatus = "disconnected" | "connecting" | "connected";

type WalletState = {
  status: WalletStatus;
  address: `0x${string}` | null;
  connect: () => void;
  disconnect: () => void;
  /** Connectors available, for a custom picker if one is ever needed. */
  connectors: readonly Connector[];
};

const WalletContext = createContext<WalletState | null>(null);

const queryClient = new QueryClient();

/** The brand theme: lime accent on the app's dark surface, not RainbowKit's default. */
const rainbowTheme: Theme = {
  ...lightTheme({ accentColor: "#ccff00", borderRadius: "medium", overlayBlur: "small" }),
  colors: {
    ...lightTheme().colors,
    accentColor: "#ccff00",
    accentColorForeground: "#000000",
    actionButtonBorder: "rgba(255,255,255,0.16)",
    actionButtonBorderMobile: "rgba(255,255,255,0.16)",
    actionButtonSecondaryBackground: "#222616",
    closeButton: "#a8a8a8",
    closeButtonBackground: "#191c0e",
    generalBorder: "rgba(255,255,255,0.09)",
    generalBorderDim: "rgba(255,255,255,0.06)",
    menuItemBackground: "#222616",
    modalBackdrop: "rgba(0,0,0,0.6)",
    modalBackground: "#121408",
    modalBorder: "rgba(255,255,255,0.09)",
    modalText: "#ffffff",
    modalTextDim: "#a8a8a8",
    modalTextSecondary: "#7d7d7d",
    profileAction: "#222616",
    profileActionHover: "#2c3120",
    profileForeground: "#121408",
    selectedOptionBorder: "rgba(204,255,0,0.5)",
    standby: "#c9b47a",
  },
  fonts: { body: "inherit" },
  radii: { actionButton: "9999px", connectButton: "9999px", modal: "16px", modalMobile: "16px", menuButton: "8px" },
};

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={rainbowTheme} modalSize="compact">
          <WalletBridge>{children}</WalletBridge>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

/** Maps wagmi's account + connect state onto the app's existing wallet shape. */
function WalletBridge({ children }: { children: React.ReactNode }) {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const { connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();

  // The modal does not expose a "pending" flag, so a connect is only shown as
  // pending while wagmi is actually negotiating, which is the honest signal.
  const status: WalletStatus = isConnected
    ? "connected"
    : isConnecting || isReconnecting
      ? "connecting"
      : "disconnected";

  const connect = useCallback(() => {
    openConnectModal?.();
  }, [openConnectModal]);

  const value = useMemo<WalletState>(
    () => ({
      status,
      address: (address as `0x${string}` | undefined) ?? null,
      connect,
      disconnect: () => disconnect(),
      connectors,
    }),
    [status, address, connect, disconnect, connectors],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
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
