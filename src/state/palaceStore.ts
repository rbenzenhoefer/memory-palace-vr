import { Vector3 } from "three";
import { create } from "zustand";

import type { LocusSpec, Vec3 } from "@/lib/palace/types";
import { useTutorialStore } from "@/state/tutorialStore";

export const INVENTORY_SLOTS = 10;

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
  /** Stores a visible portable locus directly without disturbing another held object. */
  stowDirect: (locus: LocusSpec) => boolean;
  retrieve: (locusId: string) => void;
  /** Inventory slot chosen for "drop in front" (X / G). */
  selectedSlot: number;
  selectNext: (dir: 1 | -1) => void;
  /** Takes the selected inventory item and places it; returns false if the inventory is empty. */
  dropSelectedAt: (roomSlug: string, position: Vec3, rotation: Vec3) => boolean;
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
    useTutorialStore.getState().registerDrop(id, roomSlug, position);
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

  stowDirect: (locus) => {
    const s = get();
    if (s.inventory.includes(locus.id)) return true;
    if (s.inventory.length >= INVENTORY_SLOTS) {
      set({ beltFlashAt: performance.now() });
      return false;
    }
    set({
      inventory: [...s.inventory, locus.id],
      heldLocusId: s.heldLocusId === locus.id ? null : s.heldLocusId,
      carriedSpecs: { ...s.carriedSpecs, [locus.id]: locus },
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

  selectedSlot: 0,
  selectNext: (dir) => {
    const n = get().inventory.length;
    if (!n) return set({ selectedSlot: 0 });
    const cur = Math.min(get().selectedSlot, n - 1);
    set({ selectedSlot: (cur + dir + n) % n });
  },

  dropSelectedAt: (roomSlug, position, rotation) => {
    const s = get();
    if (!s.inventory.length) return false;
    const idx = Math.min(s.selectedSlot, s.inventory.length - 1);
    const id = s.inventory[idx]!;
    const inventory = s.inventory.filter((x) => x !== id);
    set({
      inventory,
      selectedSlot: Math.max(0, Math.min(idx, inventory.length - 1)),
      placements: { ...s.placements, [id]: { roomSlug, position, rotation } },
    });
    useTutorialStore.getState().registerDrop(id, roomSlug, position);
    return true;
  },
}));

/** Selected slot clamped to the current inventory. */
export function selectedIndex(s: Pick<PalaceState, "inventory" | "selectedSlot">) {
  return s.inventory.length ? Math.min(s.selectedSlot, s.inventory.length - 1) : -1;
}

// Dev-only handle for automated browser checks.
if (import.meta.env.DEV && typeof window !== "undefined") {
  (window as unknown as { __palace: typeof usePalaceStore }).__palace = usePalaceStore;
}
