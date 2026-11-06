"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  rainbowWallet,
  metaMaskWallet,
  walletConnectWallet,
  injectedWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { hederaTestnet } from "wagmi/chains";
import { http } from "wagmi";

/**
 * wagmi + RainbowKit configuration.
 *
 * One chain: Hedera EVM testnet (296), the same network the bond contract
 * deploys to, so the demo never asks the user to switch networks mid-flow.
 *
 * The WalletConnect `projectId` comes from the environment. Without it,
 * WalletConnect-family wallets (including the Rainbow mobile app) cannot pair,
 * but injected wallets — including the Rainbow browser extension — still work.
 * The app therefore renders and connects either way, and the env var is only
 * needed to reach the QR flow. See `.env.example`.
 *
 * `ssr: true` because this is a Next.js app router build: the config is
 * evaluated on the server during the render, and RainbowKit needs to know that
 * so it does not read `window` at module scope.
 *
 * The wallet list is explicit rather than RainbowKit's default. The default set
 * includes the Coinbase / Base Account wallet, whose connector pulls in
 * `@coinbase/cdp-sdk` and, transitively, the optional `@x402/*` and
 * `@solana/kit` trees — none of which are installed and none of which this app
 * uses. Naming the four wallets we actually support keeps the bundle resolvable
 * and the picker short: Rainbow (the ask), MetaMask, WalletConnect for the
 * Rainbow mobile app, and any injected extension.
 */
const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "facevalue-local-demo";

export const wagmiConfig = getDefaultConfig({
  appName: "FaceValue",
  projectId,
  chains: [hederaTestnet],
  wallets: [
    {
      groupName: "Recommended",
      wallets: [rainbowWallet, metaMaskWallet, walletConnectWallet, injectedWallet],
    },
  ],
  transports: {
    // The public Hedera testnet endpoint. Good enough for a demo; a production
    // build would put a dedicated provider here.
    [hederaTestnet.id]: http(
      process.env.NEXT_PUBLIC_HEDERA_TESTNET_RPC ?? "https://296.rpc.thirdweb.com",
    ),
  },
  ssr: true,
});
