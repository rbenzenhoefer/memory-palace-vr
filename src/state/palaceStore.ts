import { Vector3 } from "three";
import { create } from "zustand";

import type { LocusSpec, Vec3 } from "@/lib/palace/types";

export const INVENTORY_SLOTS = 6;

export interface Placement {
  roomSlug: string;
  position: Vec3;
  rotation: Vec3;
}

export interface PalaceState {
  currentRoomSlug: string;
  goToRoom: (slug: string) => void;
  playerPosition: Vector3;
  setPlayerPosition: (position: Vector3) => void;
  /** Target opacity (0..1) of the in-scene black fade sphere. */
  fadeTarget: number;
  setFadeTarget: (v: number) => void;

  /** Invariant: a locus is either in a room, in hand (heldLocusId) or in inventory — never two at once. */
  heldLocusId: string | null;
  inventory: string[];
  placements: Record<string, Placement>;
  carriedSpecs: Record<string, LocusSpec>;
  /** Timestamp of the last "inventory full" rejection (belt flashes red). */
  beltFlashAt: number;
  /** Returns false if the pick-up was rejected (inventory full). */
  pickUp: (locus: LocusSpec) => boolean;
  drop: (roomSlug: string, position: Vec3, rotation: Vec3) => void;
  /** Releases the held object back to its last valid location. */
  cancelHold: () => void;
  stow: (locusId: string) => boolean;
  retrieve: (locusId: string) => void;
}

export const usePalaceStore = create<PalaceState>((set, get) => ({
  currentRoomSlug: "home",
  goToRoom: (slug) => set({ currentRoomSlug: slug }),
  playerPosition: new Vector3(0, 0, 0),
  setPlayerPosition: (position) => set({ playerPosition: position.clone() }),
  fadeTarget: 0,
  setFadeTarget: (v) => set({ fadeTarget: v }),

  heldLocusId: null,
  inventory: [],
  placements: {},
  carriedSpecs: {},
  beltFlashAt: 0,

  pickUp: (locus) => {
    const s = get();
    if (s.heldLocusId === locus.id) return true;
    let inventory = s.inventory.filter((id) => id !== locus.id);
    if (s.heldLocusId) {
      if (inventory.length >= INVENTORY_SLOTS) {
        set({ beltFlashAt: performance.now() });
        return false;
      }
      inventory = [...inventory, s.heldLocusId];
    }
    set({
      heldLocusId: locus.id,
      inventory,
      carriedSpecs: { ...s.carriedSpecs, [locus.id]: locus },
    });
    return true;
  },

  drop: (roomSlug, position, rotation) => {
    const id = get().heldLocusId;
    if (!id) return;
    set((s) => ({
      heldLocusId: null,
      placements: { ...s.placements, [id]: { roomSlug, position, rotation } },
    }));
  },

  cancelHold: () => set({ heldLocusId: null }),

  stow: (locusId) => {
    const s = get();
    if (s.inventory.includes(locusId)) return true;
    if (s.inventory.length >= INVENTORY_SLOTS) {
      set({ beltFlashAt: performance.now() });
      return false;
    }
    set({
      inventory: [...s.inventory, locusId],
      heldLocusId: s.heldLocusId === locusId ? null : s.heldLocusId,
    });
    return true;
  },

  retrieve: (locusId) => {
    const s = get();
    if (!s.inventory.includes(locusId)) return;
    let inventory = s.inventory.filter((id) => id !== locusId);
    if (s.heldLocusId) inventory = [...inventory, s.heldLocusId]; // swap: slot just freed
    set({ inventory, heldLocusId: locusId });
  },
}));

// Dev-only handle for automated browser checks.
if (import.meta.env.DEV && typeof window !== "undefined") {
  (window as unknown as { __palace: typeof usePalaceStore }).__palace = usePalaceStore;
}
