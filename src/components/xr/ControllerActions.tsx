import { useThree } from "@react-three/fiber";
import { useXRControllerButtonEvent, useXRInputSourceState } from "@react-three/xr";
import { useEffect } from "react";

import { dropSelectedInFront, grab } from "@/lib/palace/grab";
import { usePalaceStore } from "@/state/palaceStore";

/** Controller shortcuts that do not replace the normal XR pointer interactions. */
export function ControllerActions() {
  const left = useXRInputSourceState("controller", "left");
  const right = useXRInputSourceState("controller", "right");
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);

  useXRControllerButtonEvent(left, "y-button", (state) => {
    if (state !== "pressed") return;
    const locus = grab.hoveredPortable;
    if (!locus) return;
    const store = usePalaceStore.getState();
    if (!store.stowDirect(locus)) return;
    if (grab.active?.ownerId === locus.id) grab.active = null;
  });
  useXRControllerButtonEvent(left, "xr-standard-squeeze", (state) => {
    if (state === "pressed") usePalaceStore.getState().selectNext(-1);
  });
  useXRControllerButtonEvent(right, "xr-standard-squeeze", (state) => {
    if (state === "pressed") usePalaceStore.getState().selectNext(1);
  });
  useXRControllerButtonEvent(left, "x-button", (state) => {
    if (state === "pressed") dropSelectedInFront(scene, camera);
  });

  return null;
}

/** Desktop test keys: Q/E select, G drops in front of the camera. */
export function DesktopInventoryKeys() {
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const k = e.key.toLowerCase();
      if (k === "q") usePalaceStore.getState().selectNext(-1);
      else if (k === "e") usePalaceStore.getState().selectNext(1);
      else if (k === "g") dropSelectedInFront(scene, camera);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [scene, camera]);
  return null;
}
