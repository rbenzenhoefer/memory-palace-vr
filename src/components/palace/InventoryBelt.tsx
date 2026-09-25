import { Text } from "@react-three/drei";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Quaternion, Ray, type Group, type MeshBasicMaterial } from "three";

import { LocusVisual } from "@/components/palace/LocusVisual";
import { beginGrab, grab, heldOverBelt, releaseHeld } from "@/lib/palace/grab";
import { INVENTORY_SLOTS, selectedIndex, usePalaceStore } from "@/state/palaceStore";

const RADIUS = 0.52;
const SPREAD = 1.18; // radians across the arc
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
    const selected = index === selectedIndex(s);
    m.color.set(flashing ? "#e0473c" : target ? "#ffd27a" : selected ? "#7fe0ff" : locusId ? "#c9a227" : "#f3e7d3");
    m.opacity = flashing || target || selected ? 0.95 : locusId ? 0.7 : 0.3;
    const root = m.userData["root"] as Group | undefined;
    root?.scale.setScalar(selected ? 1.18 : 1);
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
      <mesh scale={[1.45, 1, 1]}>
        <planeGeometry args={[0.092, 0.092]} />
        <meshBasicMaterial transparent opacity={0.42} color="#17191f" depthWrite={false} />
      </mesh>
      <mesh position-z={0.001}>
        <planeGeometry args={[0.125, 0.094]} />
        <meshBasicMaterial ref={matRef} transparent color="#f3e7d3" depthWrite={false} />
      </mesh>
      {spec && (
        <>
          <group ref={spin} position={[0, 0.004, 0.03]} rotation-x={Math.PI / 2}>
            <LocusVisual locus={spec} size={0.06} />
          </group>
          <Text position={[0, -0.067, 0.004]} fontSize={0.012} color="#f3e7d3" maxWidth={0.112} textAlign="center">
            {spec.label}
          </Text>
        </>
      )}
    </group>
  );
}

/** VR inventory: slots in an arc at hip height, attached to the XROrigin. */
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
    <group ref={ref} position={[0.08, 0.48, -0.42]} rotation-x={-0.38}>
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
