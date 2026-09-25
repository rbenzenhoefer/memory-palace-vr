import { useFrame } from "@react-three/fiber";
import { Suspense, useRef, useState } from "react";
import type { Mesh, MeshStandardMaterial } from "three";

import { ErrorBoundary } from "@/components/palace/ErrorBoundary";
import { InfoPanel } from "@/components/palace/InfoPanel";
import { GltfModel } from "@/components/palace/LocusVisual";
import type { ShelfObjectSpec } from "@/lib/palace/palaceApi";
import type { CardSpec, Vec3 } from "@/lib/palace/types";

const RACK_WIDTH = 1.2;
const RACK_DEPTH = 0.6;
const RACK_HEIGHT = 2.4;
const POST = 0.065;
const SHELF_THICKNESS = 0.055;
const LEVEL_HEIGHTS = [2.08, 1.52, 0.96, 0.4] as const;

export interface ShelfSlotAnchor {
  name: string;
  position: Vec3;
  rotation: Vec3;
}

/** Generic local mounting points, ordered top to bottom. */
export const SHELF_SLOT_ANCHORS: readonly ShelfSlotAnchor[] = LEVEL_HEIGHTS.map(
  (height, level) => ({
    name: `level-${level}`,
    position: [0, height + SHELF_THICKNESS / 2 + 0.13, 0.02],
    rotation: [0, 0, 0],
  }),
);

interface ShelfRackProps {
  rackIndex: number;
  position: Vec3;
  rotation?: Vec3;
  objects?: ShelfObjectSpec[];
}

function Placeholder({ pulse = false }: { pulse?: boolean }) {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!pulse || !ref.current) return;
    (ref.current.material as MeshStandardMaterial).emissiveIntensity =
      0.2 + ((Math.sin(clock.elapsedTime * 3) + 1) / 2) * 0.8;
  });
  return (
    <mesh ref={ref} castShadow>
      <boxGeometry args={[0.2, 0.2, 0.2]} />
      <meshStandardMaterial color="#52a9c7" emissive="#27687d" emissiveIntensity={0.42} roughness={0.36} />
    </mesh>
  );
}

function ShelfItem({ item }: { item: ShelfObjectSpec }) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const cards: CardSpec[] = [
    { id: String(item.id), front: item.question, back: item.answer, extra: null, source: "manual", externalId: null },
  ];
  return (
    <group>
      <group
        position-y={-0.12}
        scale={hover ? 1.06 : 1}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
        }}
        onPointerOut={() => setHover(false)}
      >
        <ErrorBoundary fallback={<Placeholder />}>
          <Suspense fallback={<Placeholder pulse />}>
            <GltfModel url={item.url} size={0.35} />
          </Suspense>
        </ErrorBoundary>
      </group>
      {open && <InfoPanel cards={cards} accent="#d49b35" position={[0, 0.45, 0.45]} />}
    </group>
  );
}

/** 1.2 × 0.6 × 2.4 m warehouse rack with four object anchors. */
export function ShelfRack({ rackIndex, position, rotation = [0, 0, 0], objects = [] }: ShelfRackProps) {
  return (
    <group position={position} rotation={rotation} userData={{ rackIndex }}>
      {[-1, 1].flatMap((side) =>
        [-1, 1].map((depth) => (
          <mesh
            key={`${side}-${depth}`}
            position={[
              (side * (RACK_WIDTH - POST)) / 2,
              RACK_HEIGHT / 2,
              (depth * (RACK_DEPTH - POST)) / 2,
            ]}
            castShadow
          >
            <boxGeometry args={[POST, RACK_HEIGHT, POST]} />
            <meshStandardMaterial color="#3f474a" metalness={0.76} roughness={0.34} />
          </mesh>
        )),
      )}

      {LEVEL_HEIGHTS.map((height) => (
        <group key={height}>
          <mesh position={[0, height, 0]} castShadow receiveShadow>
            <boxGeometry args={[RACK_WIDTH, SHELF_THICKNESS, RACK_DEPTH]} />
            <meshStandardMaterial color="#778084" metalness={0.68} roughness={0.4} />
          </mesh>
          <mesh position={[0, height + 0.035, -RACK_DEPTH / 2 + 0.025]} castShadow>
            <boxGeometry args={[RACK_WIDTH, 0.11, 0.05]} />
            <meshStandardMaterial color="#d49b35" metalness={0.42} roughness={0.45} />
          </mesh>
        </group>
      ))}

      {SHELF_SLOT_ANCHORS.map((slot, level) => {
        const slotIndex = rackIndex * SHELF_SLOT_ANCHORS.length + level;
        const item = objects.find((o) => o.slotIndex === slotIndex);
        return (
          <group
            key={slot.name}
            name={`warehouse-slot-${slotIndex}`}
            position={slot.position}
            rotation={slot.rotation}
            userData={{ slotIndex, rackIndex, level, slotName: slot.name }}
          >
            {item ? <ShelfItem item={item} /> : <Placeholder />}
            <mesh position={[0, -0.12, RACK_DEPTH / 2 + 0.075]} rotation-x={-Math.PI / 3.25}>
              <planeGeometry args={[0.42, 0.12]} />
              <meshStandardMaterial color="#e8e9e6" metalness={0.18} roughness={0.55} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}