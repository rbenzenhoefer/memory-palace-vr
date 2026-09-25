import { useFrame } from "@react-three/fiber";
import { useXRInputSourceState } from "@react-three/xr";
import { useRef, type RefObject } from "react";
import { Vector3, type Group } from "three";

import { useRoom } from "@/hooks/useRoom";
import { usePalaceStore } from "@/state/palaceStore";

const MOVE_SPEED = 2; // m/s
const MOVE_DEADZONE = 0.15;
const SNAP_ANGLE = Math.PI / 6; // 30°
const SNAP_THRESHOLD = 0.6;
const SNAP_RELEASE = 0.3;
const SNAP_COOLDOWN_MS = 250;
const WALL_MARGIN = 0.3;

const head = new Vector3();
const fwd = new Vector3();
const right = new Vector3();
const next = new Vector3();
const UP = new Vector3(0, 1, 0);

/** Thumbstick smooth movement (left) + snap turn (right). Only mounted inside an XR session. */
export function ThumbstickLocomotion({ originRef }: { originRef: RefObject<Group | null> }) {
  const left = useXRInputSourceState("controller", "left");
  const rightCtrl = useXRInputSourceState("controller", "right");
  const slug = usePalaceStore((s) => s.currentRoomSlug);
  const { data: room } = useRoom(slug);
  const snap = useRef({ armed: true, last: 0 });

  useFrame((state, rawDelta) => {
    const origin = originRef.current;
    if (!origin) return;
    const dt = Math.min(rawDelta, 0.05);
    const halfW = (room?.layout.width ?? 10) / 2 - WALL_MARGIN;
    const halfD = (room?.layout.depth ?? 10) / 2 - WALL_MARGIN;
    next.copy(origin.position);
    let changed = false;

    // Head position/direction in world space (XR camera).
    state.camera.getWorldPosition(head);

    // Snap turn: rotate the origin around the head so the player turns in place.
    const rx = rightCtrl?.gamepad?.["xr-standard-thumbstick"]?.xAxis ?? 0;
    const s = snap.current;
    if (Math.abs(rx) < SNAP_RELEASE) s.armed = true;
    const now = performance.now();
    if (s.armed && Math.abs(rx) > SNAP_THRESHOLD && now - s.last > SNAP_COOLDOWN_MS) {
      const angle = rx > 0 ? -SNAP_ANGLE : SNAP_ANGLE;
      next.sub(head).applyAxisAngle(UP, angle).add(head);
      origin.rotation.y += angle;
      s.armed = false;
      s.last = now;
      changed = true;
    }

    // Smooth move relative to the head's horizontal facing.
    const stick = left?.gamepad?.["xr-standard-thumbstick"];
    const lx = stick?.xAxis ?? 0;
    const ly = stick?.yAxis ?? 0;
    if (Math.hypot(lx, ly) > MOVE_DEADZONE) {
      state.camera.getWorldDirection(fwd);
      fwd.y = 0;
      if (fwd.lengthSq() > 1e-6) {
        fwd.normalize();
        right.crossVectors(fwd, UP).normalize();
        next.addScaledVector(fwd, -ly * MOVE_SPEED * dt).addScaledVector(right, lx * MOVE_SPEED * dt);
        changed = true;
      }
    }

    if (!changed) return;
    // Clamp so the HEAD stays inside the floor bounds (origin offset = head offset).
    const offX = head.x - origin.position.x;
    const offZ = head.z - origin.position.z;
    next.x = Math.min(halfW, Math.max(-halfW, next.x + offX)) - offX;
    next.z = Math.min(halfD, Math.max(-halfD, next.z + offZ)) - offZ;
    origin.position.copy(next);
    usePalaceStore.getState().setPlayerPosition(next);
  });

  return null;
}
