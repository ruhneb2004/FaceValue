import type { Likeness } from "./types";

/**
 * Seed data for the demo marketplace.
 *
 * Every state is represented so the UI's state handling is visible without
 * needing to drive a real dispute first. These are fictional people and must
 * stay obviously fictional — no real names, no scraped faces.
 */
export const SEED_LIKENESSES: Likeness[] = [
  {
    id: "lc-001",
    name: "Studio portrait, 2024",
    pricePerUse: 40,
    state: "active",
    ensName: "ref-001.faceref.eth",
    controller: "0x4f2a9c1e7b3d",
    openChallenges: 0,
  },
  {
    id: "lc-002",
    name: "Editorial headshot",
    pricePerUse: 25,
    state: "active",
    ensName: "ref-002.faceref.eth",
    controller: "0x8b1c77d0a24e",
    openChallenges: 0,
  },
  {
    id: "lc-003",
    name: "Campaign still",
    pricePerUse: 60,
    state: "provisional",
    ensName: "ref-003.faceref.eth",
    controller: "0xc93e5b6f18a0",
    openChallenges: 0,
    settlementDeadline: "2026-11-07T12:30:00Z",
  },
  {
    id: "lc-004",
    name: "Candid, studio lighting",
    pricePerUse: 0,
    state: "disputed",
    ensName: "ref-004.faceref.eth",
    controller: "0x2d7fa4b9e561",
    openChallenges: 2,
  },
  {
    id: "lc-005",
    name: "Profile still",
    pricePerUse: 0,
    state: "review",
    ensName: "ref-005.faceref.eth",
    controller: "0xe5a2c8d47f13",
    openChallenges: 1,
  },
  {
    id: "lc-006",
    name: "Runway frame",
    pricePerUse: 18,
    state: "moved",
    ensName: "ref-006.faceref.eth",
    controller: "0x1b7e39f0c6d8",
    openChallenges: 0,
  },
  {
    id: "lc-007",
    name: "Companion headshot",
    pricePerUse: 30,
    state: "provisional",
    ensName: "ref-007.faceref.eth",
    controller: "0x9f4c2d81ba07",
    openChallenges: 0,
    settlementDeadline: "2026-11-07T09:00:00Z",
  },
  {
    id: "lc-008",
    name: "Withdrawn listing",
    pricePerUse: 0,
    state: "revoked",
    ensName: "ref-008.faceref.eth",
    controller: "0x63a8f1e5b294",
    openChallenges: 0,
  },
];
