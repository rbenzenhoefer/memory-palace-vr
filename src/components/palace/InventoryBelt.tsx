import { Text } from "@react-three/drei";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Quaternion, Ray, type Group, type MeshBasicMaterial } from "three";

import { LocusVisual } from "@/components/palace/LocusVisual";
import { beginGrab, grab, heldOverBelt, releaseHeld } from "@/lib/palace/grab";
import { INVENTORY_SLOTS, usePalaceStore } from "@/state/palaceStore";

const RADIUS = 0.42;
const SPREAD = 0.95; // radians across the arc
const OWNER = "belt";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPointerEvent = ThreeEvent<PointerEvent> & { ray?: Ray; target: any };

function Slot({ index, locusId }: { index: number; locusId: string | undefined }) {
  const spec = usePalaceStore((s) => (locusId ? s.carriedSpecs[locusId] : undefined));
  const matRef = useRef<MeshBasicMaterial>(null);
  const spin = useRef<Group>(null);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);

  useFrame((_, dt) => {
    if (spin.current) spin.current.rotation.y += dt * 0.8;
    const m = matRef.current;
    if (!m) return;
    const s = usePalaceStore.getState();
    const flashing = performance.now() - s.beltFlashAt < 600;
    const target = s.heldLocusId && heldOverBelt() && index === s.inventory.length;
    m.color.set(flashing ? "#e0473c" : target ? "#ffd27a" : locusId ? "#c9a227" : "#f3e7d3");
    m.opacity = flashing || target ? 0.95 : locusId ? 0.7 : 0.3;
  });

  const rayOf = (e: AnyPointerEvent) =>
    e.ray ?? new Ray(camera.position.clone(), e.point.clone().sub(camera.position).normalize());

  const onPointerDown = (e: AnyPointerEvent) => {
    e.stopPropagation();
    if (!locusId) return;
    e.target?.setPointerCapture?.(e.pointerId);
    usePalaceStore.getState().retrieve(locusId);
    beginGrab({ pointerId: e.pointerId, ray: rayOf(e), distance: 0.5, objectQuat: new Quaternion(), ownerId: OWNER });
  };
  const onPointerMove = (e: AnyPointerEvent) => {
    const a = grab.active;
    if (a?.ownerId === OWNER && a.pointerId === e.pointerId) a.ray.copy(rayOf(e));
  };
  const onPointerUp = (e: AnyPointerEvent) => {
    e.stopPropagation();
    e.target?.releasePointerCapture?.(e.pointerId);
    if (grab.active?.ownerId === OWNER && grab.active.pointerId === e.pointerId) releaseHeld(scene);
  };

  return (
    <group onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
      <mesh>
        <circleGeometry args={[0.05, 32]} />
        <meshBasicMaterial transparent opacity={0.08} color="#000" depthWrite={false} />
      </mesh>
      <mesh position-z={0.001}>
        <ringGeometry args={[0.044, 0.05, 40]} />
        <meshBasicMaterial ref={matRef} transparent color="#f3e7d3" depthWrite={false} />
      </mesh>
      {spec && (
        <>
          <group ref={spin} position={[0, -0.03, 0.03]} rotation-x={Math.PI / 2}>
            <LocusVisual locus={spec} size={0.06} />
          </group>
          <Text position={[0, -0.065, 0.002]} fontSize={0.012} color="#f3e7d3" maxWidth={0.1} textAlign="center">
            {spec.label}
          </Text>
        </>
      )}
    </group>
  );
}

/** VR inventory: 6 slots in an arc at hip height, attached to the XROrigin. */
export function InventoryBelt() {
  const inventory = usePalaceStore((s) => s.inventory);
  const ref = useRef<Group>(null);
  useEffect(() => {
    grab.belt = ref.current;
    return () => {
      grab.belt = null;
    };
  }, []);

  return (
    <group ref={ref} position={[0.12, 0.9, -0.35]} rotation-x={-0.9}>
      {Array.from({ length: INVENTORY_SLOTS }, (_, i) => {
        const a = -SPREAD / 2 + (SPREAD * i) / (INVENTORY_SLOTS - 1);
        return (
          <group
            key={i}
            position={[Math.sin(a) * RADIUS, 0, RADIUS - Math.cos(a) * RADIUS]}
            rotation-y={-a}
          >
            <Slot index={i} locusId={inventory[i]} />
          </group>
        );
      })}
    </group>
  );
}
