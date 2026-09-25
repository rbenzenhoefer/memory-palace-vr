import { useFrame } from "@react-three/fiber";
import { useXRInputSourceState } from "@react-three/xr";
import { useEffect, useRef, type RefObject } from "react";
import { MathUtils, Quaternion, Vector3, type Group } from "three";

import { useRoom } from "@/hooks/useRoom";
import { usePalaceStore } from "@/state/palaceStore";

const MOVE_SPEED = 2; // m/s
const MOVE_DEADZONE = 0.15;
const LOOK_DEADZONE = 0.15;
const TURN_SPEED = MathUtils.degToRad(95);
const PITCH_SPEED = MathUtils.degToRad(70);
const MAX_PITCH = MathUtils.degToRad(42);
const LOOK_DAMPING = 14;
const WALL_MARGIN = 0.3;

const head = new Vector3();
const fwd = new Vector3();
const right = new Vector3();
const next = new Vector3();
const pivotOffset = new Vector3();
const rotationAxis = new Vector3();
const rotationDelta = new Quaternion();
const UP = new Vector3(0, 1, 0);

function deadzoned(value: number, zone: number) {
  const magnitude = Math.abs(value);
  if (magnitude <= zone) return 0;
  return Math.sign(value) * ((magnitude - zone) / (1 - zone));
}

function rotateAround(origin: Group, pivot: Vector3, axis: Vector3, angle: number) {
  if (Math.abs(angle) < 1e-5) return;
  rotationDelta.setFromAxisAngle(axis, angle);
  pivotOffset.copy(origin.position).sub(pivot).applyQuaternion(rotationDelta);
  origin.position.copy(pivot).add(pivotOffset);
  origin.quaternion.premultiply(rotationDelta);
}

/** Head-relative movement and smooth two-axis look. Only mounted inside an XR session. */
export function ThumbstickLocomotion({ originRef }: { originRef: RefObject<Group | null> }) {
  const left = useXRInputSourceState("controller", "left");
  const rightCtrl = useXRInputSourceState("controller", "right");
  const slug = usePalaceStore((s) => s.currentRoomSlug);
  const { data: room } = useRoom(slug);
  const pitch = useRef(0);
  const motion = useRef({ yawSpeed: 0, pitchSpeed: 0, dirty: false });

  useEffect(() => {
    pitch.current = 0;
    motion.current = { yawSpeed: 0, pitchSpeed: 0, dirty: false };
  }, [slug]);

  useFrame((state, rawDelta) => {
    const origin = originRef.current;
    if (!origin) return;
    const dt = Math.min(rawDelta, 0.05);
    const halfW = (room?.layout.width ?? 10) / 2 - WALL_MARGIN;
    const halfD = (room?.layout.depth ?? 10) / 2 - WALL_MARGIN;
    next.copy(origin.position);

    // Head position/direction in world space (XR camera).
    state.camera.getWorldPosition(head);

    const rightStick = rightCtrl?.gamepad?.["xr-standard-thumbstick"];
    const rx = deadzoned(rightStick?.xAxis ?? 0, LOOK_DEADZONE);
    const ry = deadzoned(rightStick?.yAxis ?? 0, LOOK_DEADZONE);
    const m = motion.current;
    m.yawSpeed = MathUtils.damp(m.yawSpeed, -rx * TURN_SPEED, LOOK_DAMPING, dt);
    m.pitchSpeed = MathUtils.damp(m.pitchSpeed, -ry * PITCH_SPEED, LOOK_DAMPING, dt);

    // Rotate the whole XR origin around the center of the head, never either eye camera.
    const yawChange = m.yawSpeed * dt;
    rotateAround(origin, head, UP, yawChange);
    const nextPitch = MathUtils.clamp(pitch.current + m.pitchSpeed * dt, -MAX_PITCH, MAX_PITCH);
    const pitchChange = nextPitch - pitch.current;
    if (Math.abs(pitchChange) > 1e-5) {
      state.camera.getWorldDirection(fwd);
      fwd.y = 0;
      rotationAxis.crossVectors(fwd.normalize(), UP);
      if (rotationAxis.lengthSq() > 1e-6) {
        rotationAxis.normalize();
        rotateAround(origin, head, rotationAxis, pitchChange);
        pitch.current = nextPitch;
      }
    }
    if (Math.abs(yawChange) > 1e-5 || Math.abs(pitchChange) > 1e-5) m.dirty = true;

    // Smooth move relative to the head's horizontal facing.
    // Read raw axes from the live XR session (most reliable across devices).
    const stick = left?.gamepad?.["xr-standard-thumbstick"];
    let lx = stick?.xAxis;
    let ly = stick?.yAxis;
    if (lx === undefined || ly === undefined) {
      const raw = left?.inputSource.gamepad?.axes;
      lx = raw?.[2] ?? raw?.[0] ?? 0;
      ly = raw?.[3] ?? raw?.[1] ?? 0;
    }
    lx = deadzoned(lx, MOVE_DEADZONE);
    ly = deadzoned(ly, MOVE_DEADZONE);
    const isMoving = Math.hypot(lx, ly) > 0;
    if (isMoving) {
      state.camera.getWorldDirection(fwd);
      fwd.y = 0;
      if (fwd.lengthSq() > 1e-6) {
        fwd.normalize();
        right.crossVectors(fwd, UP).normalize();
        next.addScaledVector(fwd, -ly * MOVE_SPEED * dt).addScaledVector(right, lx * MOVE_SPEED * dt);
      }
    }

    if (!isMoving) {
      const lookSettled = Math.abs(m.yawSpeed) < 0.001 && Math.abs(m.pitchSpeed) < 0.001;
      if (m.dirty && lookSettled) {
        usePalaceStore.getState().setPlayerPosition(origin.position);
        m.dirty = false;
      }
      return;
    }
    // Clamp so the HEAD stays inside the floor bounds (origin offset = head offset).
    const offX = head.x - origin.position.x;
    const offZ = head.z - origin.position.z;
    next.x = Math.min(halfW, Math.max(-halfW, next.x + offX)) - offX;
    next.z = Math.min(halfD, Math.max(-halfD, next.z + offZ)) - offZ;
    origin.position.copy(next);
    m.dirty = true;
  });

  return null;
}
