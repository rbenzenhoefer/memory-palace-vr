import { Vector3 } from "three";
import { create } from "zustand";

export interface PalaceState {
  currentRoomSlug: string;
  goToRoom: (slug: string) => void;
  playerPosition: Vector3;
  setPlayerPosition: (position: Vector3) => void;
  /** Target opacity (0..1) of the in-scene black fade sphere. */
  fadeTarget: number;
  setFadeTarget: (v: number) => void;
}

export const usePalaceStore = create<PalaceState>((set) => ({
  currentRoomSlug: "home",
  goToRoom: (slug) => set({ currentRoomSlug: slug }),
  playerPosition: new Vector3(0, 0, 0),
  setPlayerPosition: (position) => set({ playerPosition: position.clone() }),
  fadeTarget: 0,
  setFadeTarget: (v) => set({ fadeTarget: v }),
}));
