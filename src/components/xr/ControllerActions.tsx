import { useXRControllerButtonEvent, useXRInputSourceState } from "@react-three/xr";

import { grab } from "@/lib/palace/grab";
import { usePalaceStore } from "@/state/palaceStore";

/** Controller shortcuts that do not replace the normal XR pointer interactions. */
export function ControllerActions() {
  const left = useXRInputSourceState("controller", "left");

  useXRControllerButtonEvent(left, "y-button", (state) => {
    if (state !== "pressed") return;
    const id = grab.hoveredPortable;
    if (!id) return;
    const store = usePalaceStore.getState();
    const locus = store.carriedSpecs[id];
    if (!locus) return;
    if (store.heldLocusId === id) {
      store.stow(id);
      grab.active = null;
      return;
    }
    if (!store.pickUp(locus)) return;
    store.stow(id);
    grab.active = null;
  });

  return null;
}