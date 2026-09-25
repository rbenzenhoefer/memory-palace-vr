import { Billboard, Text } from "@react-three/drei";
import { useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Quaternion, Ray, Vector3, type Group } from "three";

import { InfoPanel } from "@/components/palace/InfoPanel";
import { LocusVisual, locusHeight } from "@/components/palace/LocusVisual";
import { beginGrab, grab, releaseHeld } from "@/lib/palace/grab";
import type { LocusSpec, Vec3 } from "@/lib/palace/types";
import { usePalaceStore } from "@/state/palaceStore";

export const PEDESTAL_H = 1;
const CLICK_MS = 200;

/** Stone pedestal; its top is a drop surface for carried objects. */
export function Pedestal({ position, rotation }: { position: Vec3; rotation: Vec3 }) {
  return (
    <mesh
      position={[position[0], position[1] + PEDESTAL_H / 2, position[2]]}
      rotation={rotation}
      castShadow
      receiveShadow
      userData={{ dropSurface: true }}
    >
      <cylinderGeometry args={[0.28, 0.34, PEDESTAL_H, 32]} />
      <meshStandardMaterial color="#e8e2d6" roughness={0.7} />
    </mesh>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPointerEvent = ThreeEvent<PointerEvent> & {
  ray?: Ray;
  target: any;
  nativeEvent: any;
  pointerType?: string;
  pointerPosition?: Vector3;
  pointerQuaternion?: Quaternion;
};

/**
 * A memory object. With `withPedestal`, `position` is the floor point and a pedestal is drawn;
 * otherwise `position` is where the object's base rests.
 */
export function Locus({
  locus,
  accent,
  position,
  rotation,
  withPedestal = false,
  hidden = false,
}: {
  locus: LocusSpec;
  accent: string;
  position: Vec3;
  rotation: Vec3;
  withPedestal?: boolean;
  hidden?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const objRef = useRef<Group>(null);
  const press = useRef<{ t: number; ray: Ray; point: Vector3; timer: number } | null>(null);
  const camera = useThree((s) => s.camera);
  const scene = useThree((s) => s.scene);
  const portable = locus.isPortable;

  // If this object unmounts while it owns the active grab (e.g. room change), drop the ray link.
  useEffect(
    () => () => {
      if (grab.active?.ownerId === locus.id) grab.active = null;
    },
    [locus.id],
  );

  // Safety net for desktop: if the capture is lost, a window pointerup still releases the object.
  useEffect(() => {
    if (!hidden) return;
    const onUp = (e: PointerEvent) => {
      if (grab.active?.ownerId !== locus.id) return;
      releaseHeld(scene, { x: e.clientX, y: e.clientY });
    };
    window.addEventListener("pointerup", onUp);
    return () => window.removeEventListener("pointerup", onUp);
  }, [hidden, locus.id, scene]);

  const baseY = withPedestal ? PEDESTAL_H : 0;
  const top = baseY + Math.max(locusHeight(locus), withPedestal ? 1 : 0.3);

  const rayOf = (e: AnyPointerEvent) =>
    e.ray ?? new Ray(camera.position.clone(), e.point.clone().sub(camera.position).normalize());

  const startGrab = (pointerId: number, ray: Ray, point: Vector3, e?: AnyPointerEvent) => {
    if (!objRef.current) return;
    const quat = objRef.current.getWorldQuaternion(new Quaternion());
    if (!usePalaceStore.getState().pickUp(locus)) return;
    const isXR = e?.pointerType !== undefined && e.pointerType !== "mouse";
    beginGrab({
      pointerId,
      ray,
      distance: ray.origin.distanceTo(point),
      objectQuat: quat,
      ownerId: locus.id,
      handPosition: isXR ? e.pointerPosition : undefined,
      handQuaternion: isXR ? e.pointerQuaternion : undefined,
    });
    setOpen(false);
    setHovered(false);
  };

  const onPointerDown = (e: AnyPointerEvent) => {
    e.stopPropagation();
    e.target?.setPointerCapture?.(e.pointerId);
    const ray = rayOf(e).clone();
    const point = e.point.clone();
    const pointerId = e.pointerId;
    const timer = window.setTimeout(() => {
      if (press.current) startGrab(pointerId, press.current.ray, press.current.point, e);
    }, CLICK_MS);
    press.current = { t: performance.now(), ray, point, timer };
  };

  const onPointerMove = (e: AnyPointerEvent) => {
    const active = grab.active;
    if (active && active.ownerId === locus.id && active.pointerId === e.pointerId) {
      active.ray.copy(rayOf(e));
      if (e.pointerPosition) active.handPosition?.copy(e.pointerPosition);
      if (e.pointerQuaternion) active.handQuaternion?.copy(e.pointerQuaternion);
      return;
    }
    const p = press.current;
    if (p && !active) {
      const moved = rayOf(e).direction.angleTo(p.ray.direction) > 0.03;
      if (moved) {
        window.clearTimeout(p.timer);
        startGrab(e.pointerId, p.ray, p.point, e);
        if (grab.active) grab.active.ray.copy(rayOf(e));
      }
    }
  };

  const onPointerUp = (e: AnyPointerEvent) => {
    e.stopPropagation();
    e.target?.releasePointerCapture?.(e.pointerId);
    const p = press.current;
    press.current = null;
    if (p) window.clearTimeout(p.timer);
    if (grab.active?.ownerId === locus.id) {
      const ne = e.nativeEvent;
      releaseHeld(scene, ne && "clientX" in ne ? { x: ne.clientX, y: ne.clientY } : undefined);
      return;
    }
    if (p && performance.now() - p.t < CLICK_MS) setOpen((o) => !o);
  };

  const onClickStatic = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setOpen((o) => !o);
  };

  const handlers = portable
    ? {
        onPointerDown,
        onPointerMove,
        onPointerUp,
        onPointerOver: (e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          setHovered(true);
          grab.hoveredPortable = locus;
        },
        onPointerOut: () => {
          setHovered(false);
          if (grab.hoveredPortable?.id === locus.id) grab.hoveredPortable = null;
        },
      }
    : { onClick: onClickStatic };

  return (
    <group position={position} rotation={rotation}>
      {/* Kept mounted while held so pointer capture keeps delivering move/up events. */}
      <group ref={objRef} {...handlers}>
        {withPedestal && !portable && <Pedestal position={[0, 0, 0]} rotation={[0, 0, 0]} />}
        <group position-y={baseY} scale={hovered ? 1.06 : 1} visible={!hidden}>
          <LocusVisual locus={locus} glow={hovered} />
        </group>
      </group>
      {!hidden && (
        <Billboard position-y={top + 0.2}>
          <Text fontSize={0.12} color={accent} outlineWidth={0.004} outlineColor="#000">
            {locus.label}
          </Text>
        </Billboard>
      )}
      {open && !hidden && (
        <InfoPanel cards={locus.cards} accent={accent} position={[0, top + 0.8, 0]} />
      )}
    </group>
  );
}
