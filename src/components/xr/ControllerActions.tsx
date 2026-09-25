import { useXRControllerButtonEvent, useXRInputSourceState } from "@react-three/xr";

import { grab } from "@/lib/palace/grab";
import { usePalaceStore } from "@/state/palaceStore";

/** Controller shortcuts that do not replace the normal XR pointer interactions. */
export function ControllerActions() {
  const left = useXRInputSourceState("controller", "left");

  useXRControllerButtonEvent(left, "y-button", (state) => {
    if (state !== "pressed") return;
    const locus = grab.hoveredPortable;
    if (!locus) return;
    const store = usePalaceStore.getState();
    if (!store.stowDirect(locus)) return;
    if (grab.active?.ownerId === locus.id) grab.active = null;
  });

  return null;
}