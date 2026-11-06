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
    holder: "0xf4e2b7a2d9d7dc9eb7ff142c1943a7781db89227",
    openChallenges: 0,
  },
  {
    id: "lc-002",
    name: "Editorial headshot",
    pricePerUse: 25,
    state: "active",
    ensName: "ref-002.faceref.eth",
    controller: "0x8b1c77d0a24e",
    holder: "0xf3e2b60f5064f2a84319355b47fae73020f7897a",
    openChallenges: 0,
  },
  {
    id: "lc-003",
    name: "Campaign still",
    pricePerUse: 60,
    state: "provisional",
    ensName: "ref-003.faceref.eth",
    controller: "0xc93e5b6f18a0",
    holder: "0xf2e2b47cd934a376a7b1c4d6085aee7064cf4e51",
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
    holder: "0xf1e2b2e9141e56d4212ce735aba194d873d5a924",
    openChallenges: 2,
  },
  {
    id: "lc-005",
    name: "Profile still",
    pricePerUse: 0,
    state: "review",
    ensName: "ref-005.faceref.eth",
    controller: "0xe5a2c8d47f13",
    holder: "0xf0e2b1567514eece44380248bb52cb28eee5f90b",
    openChallenges: 1,
  },
  {
    id: "lc-006",
    name: "Runway frame",
    pricePerUse: 18,
    state: "moved",
    ensName: "ref-006.faceref.eth",
    controller: "0x1b7e39f0c6d8",
    holder: "0xefe2afc376269e784673847f57a90cd8b4c08056",
    openChallenges: 0,
  },
  {
    id: "lc-007",
    name: "Companion headshot",
    pricePerUse: 30,
    state: "provisional",
    ensName: "ref-007.faceref.eth",
    controller: "0x9f4c2d81ba07",
    holder: "0xeee2ae303ba1831607332332e8cf9cb0cddb62a5",
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
    holder: "0xfde2c5cd58d618dc9c336929c793af6080821390",
    openChallenges: 0,
  },
];
