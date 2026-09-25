import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Quaternion, Raycaster, Vector3, type Group } from "three";
import { useStore } from "zustand";

import { LocusVisual } from "@/components/palace/LocusVisual";
import { grab, rayQuaternion } from "@/lib/palace/grab";
import { usePalaceStore } from "@/state/palaceStore";
import { xrStore } from "@/xr/xrStore";

const tmpQ = new Quaternion();
const tmpV = new Vector3();
const HAND_FORWARD = new Vector3(0, 0, -1);
const raycaster = new Raycaster();
const noop = () => {};

/** Renders the object currently in hand, following the grabbing ray (or the view when free). */
export function HeldObject() {
  const heldId = usePalaceStore((s) => s.heldLocusId);
  const spec = usePalaceStore((s) => (s.heldLocusId ? s.carriedSpecs[s.heldLocusId] : undefined));
  const inSession = useStore(xrStore, (s) => s.session != null);
  const ref = useRef<Group>(null);

  useEffect(() => {
    grab.held = ref.current;
    return () => {
      grab.held = null;
    };
  }, [heldId]);

  useFrame(({ camera, pointer }) => {
    const g = ref.current;
    if (!g) return;
    g.traverse((o) => {
      o.raycast = noop;
    });
    const a = grab.active;
    if (a) {
      if (a.handPosition && a.handQuaternion) {
        tmpV.copy(HAND_FORWARD).applyQuaternion(a.handQuaternion);
        g.position.copy(a.handPosition).addScaledVector(tmpV, 0.16);
        g.quaternion.copy(a.handQuaternion).multiply(a.rotOffset);
      } else {
        g.position.copy(a.ray.origin).addScaledVector(a.ray.direction, a.distance);
        g.quaternion.copy(rayQuaternion(a.ray, tmpQ)).multiply(a.rotOffset);
      }
    } else if (!inSession) {
      // Desktop "in hand": follow the mouse ray; next click on the floor places it.
      raycaster.setFromCamera(pointer, camera);
      g.position.copy(raycaster.ray.origin).addScaledVector(raycaster.ray.direction, 1.1);
      g.quaternion.identity();
    } else {
      // VR without an active ray (e.g. after a portal): float 0.5 m in front of the view.
      camera.getWorldDirection(tmpV);
      g.position.copy(camera.getWorldPosition(new Vector3())).addScaledVector(tmpV, 0.5);
      g.position.y -= 0.15;
      g.quaternion.identity();
    }
  });

  if (!heldId || !spec) return null;
  return (
    <group ref={ref}>
      <group position-y={-0.15}>
        <LocusVisual locus={spec} glow />
      </group>
    </group>
  );
}
