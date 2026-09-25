import { Vector3 } from "three";
import { create } from "zustand";

export interface PalaceState {
  currentRoomSlug: string;
  goToRoom: (slug: string) => void;
  playerPosition: Vector3;
  setPlayerPosition: (position: Vector3) => void;
}

export const usePalaceStore = create<PalaceState>((set) => ({
  currentRoomSlug: "home",
  goToRoom: (slug) => set({ currentRoomSlug: slug }),
  playerPosition: new Vector3(0, 0, 0),
  setPlayerPosition: (position) => set({ playerPosition: position.clone() }),
}));
