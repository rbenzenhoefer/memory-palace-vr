import { create } from "zustand";

import type { LocusSpec, Vec3 } from "@/lib/palace/types";

export type TutorialPhase =
  | "idle"
  | "welcome"
  | "explain-locus"
  | "interact-locus"
  | "place-loci"
  | "create-route"
  | "follow-route"
  | "complete";

export const TUTORIAL_ROOM = "tutorial";
export const TUTORIAL_LABELS = ["Neuron", "Synapse", "Hippocampus", "Kortex"] as const;
export const TUTORIAL_TARGETS: Vec3[] = [
  [-3.4, 0, 0.4],
  [-1.15, 0, -2.5],
  [1.45, 0, -1.3],
  [3.45, 0, 1.35],
];

interface TutorialLocus {
  id: string;
  label: string;
}

interface TutorialState {
  phase: TutorialPhase;
  loci: TutorialLocus[];
  placedIds: string[];
  route: string[];
  followIndex: number;
  feedback: string | null;
  configure: (loci: LocusSpec[]) => void;
  next: () => void;
  interact: (locus: LocusSpec) => void;
  registerDrop: (locusId: string, roomSlug: string, position: Vec3) => void;
  restart: () => void;
}

const orderedTutorialLoci = (loci: LocusSpec[]): TutorialLocus[] =>
  TUTORIAL_LABELS.flatMap((label) => {
    const locus = loci.find((item) => item.label === label);
    return locus ? [{ id: locus.id, label: locus.label }] : [];
  });

const initialRun = {
  phase: "welcome" as const,
  placedIds: [] as string[],
  route: [] as string[],
  followIndex: 0,
  feedback: null as string | null,
};

export const useTutorialStore = create<TutorialState>((set, get) => ({
  phase: "idle",
  loci: [],
  placedIds: [],
  route: [],
  followIndex: 0,
  feedback: null,
  configure: (loci) => {
    const ordered = orderedTutorialLoci(loci);
    if (ordered.length !== TUTORIAL_LABELS.length) return;
    const existing = get().loci.map((item) => item.id).join();
    const incoming = ordered.map((item) => item.id).join();
    if (existing === incoming && get().phase !== "idle") return;
    set({ ...initialRun, loci: ordered });
  },
  next: () => {
    const phase = get().phase;
    if (phase === "welcome") set({ phase: "explain-locus", feedback: null });
    if (phase === "explain-locus") set({ phase: "interact-locus", feedback: null });
  },
  interact: (locus) => {
    const state = get();
    if (state.phase === "interact-locus") {
      if (locus.id !== state.loci[0]?.id) {
        set({ feedback: "Finde zuerst das leuchtende Neuron." });
        return;
      }
      set({ phase: "place-loci", feedback: null });
      return;
    }
    if (state.phase === "create-route") {
      const expected = state.loci[state.route.length];
      if (!expected) return;
      if (locus.id !== expected.id) {
        set({ feedback: `Als Nächstes kommt ${expected.label}.` });
        return;
      }
      const route = [...state.route, locus.id];
      set(route.length === state.loci.length ? { route, phase: "follow-route", followIndex: 0, feedback: null } : { route, feedback: null });
      return;
    }
    if (state.phase === "follow-route") {
      const expectedId = state.route[state.followIndex];
      if (locus.id !== expectedId) {
        const expected = state.loci.find((item) => item.id === expectedId);
        set({ feedback: expected ? `Folge der Linie zu ${expected.label}.` : null });
        return;
      }
      const nextIndex = state.followIndex + 1;
      set(nextIndex >= state.route.length
        ? { phase: "complete", followIndex: nextIndex, feedback: null }
        : { followIndex: nextIndex, feedback: "Sehr gut. Folge dem nächsten leuchtenden Abschnitt." });
    }
  },
  registerDrop: (locusId, roomSlug, position) => {
    const state = get();
    if (roomSlug !== TUTORIAL_ROOM || state.phase !== "place-loci") return;
    const expected = state.loci[state.placedIds.length];
    const target = TUTORIAL_TARGETS[state.placedIds.length];
    if (!expected || !target) return;
    if (locusId !== expected.id) {
      set({ feedback: `Platziere zuerst ${expected.label} im leuchtenden Kreis.` });
      return;
    }
    if (Math.hypot(position[0] - target[0], position[2] - target[2]) > 1.35) {
      set({ feedback: "Lege das Objekt in den leuchtenden Zielkreis." });
      return;
    }
    const placedIds = [...state.placedIds, locusId];
    set(placedIds.length === state.loci.length
      ? { placedIds, phase: "create-route", feedback: null }
      : { placedIds, feedback: `${expected.label} ist platziert.` });
  },
  restart: () => set({ ...initialRun }),
}));

export function activeTutorialLocusId(state: TutorialState): string | null {
  if (state.phase === "interact-locus") return state.loci[0]?.id ?? null;
  if (state.phase === "place-loci") return state.loci[state.placedIds.length]?.id ?? null;
  if (state.phase === "create-route") return state.loci[state.route.length]?.id ?? null;
  if (state.phase === "follow-route") return state.route[state.followIndex] ?? null;
  return null;
}

if (import.meta.env.DEV && typeof window !== "undefined") {
  (window as unknown as { __tutorial: typeof useTutorialStore }).__tutorial = useTutorialStore;
}