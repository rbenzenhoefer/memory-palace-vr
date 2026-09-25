import { useMemo } from "react";
import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from "three";

import { ShelfRack } from "@/components/palace/ShelfRack";

const WAREHOUSE = {
  concrete: "#727678",
  concreteDark: "#5d6264",
  wall: "#c7c9c8",
  wallLine: "#aeb2b2",
  ceiling: "#b8bcbb",
  frame: "#53595b",
  light: "#fff3d6",
  safety: "#d49b35",
} as const;

function useConcreteTexture() {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 256;
    const context = canvas.getContext("2d");
    if (!context) return null;

    context.fillStyle = WAREHOUSE.concrete;
    context.fillRect(0, 0, 256, 256);
    for (let index = 0; index < 900; index += 1) {
      const shade = 92 + ((index * 37) % 38);
      const alpha = 0.08 + ((index * 13) % 12) / 100;
      context.fillStyle = `rgba(${shade},${shade + 2},${shade + 3},${alpha})`;
      const x = (index * 83) % 256;
      const y = (index * 47) % 256;
      const size = 1 + (index % 3);
      context.fillRect(x, y, size, size);
    }
    context.strokeStyle = "rgba(50,54,55,0.22)";
    context.lineWidth = 2;
    context.strokeRect(1, 1, 254, 254);

    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.set(4, 6);
    return texture;
  }, []);
}

export function WarehouseFloor() {
  const map = useConcreteTexture();
  return (
    <meshStandardMaterial
      map={map}
      color={WAREHOUSE.concrete}
      roughness={0.88}
      metalness={0.06}
    />
  );
}

export function WarehouseWallMaterial() {
  return <meshStandardMaterial color={WAREHOUSE.wall} roughness={0.82} metalness={0.04} />;
}

function CeilingFixture({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 3.92, z]}>
      <mesh castShadow>
        <boxGeometry args={[1.8, 0.12, 0.55]} />
        <meshStandardMaterial color={WAREHOUSE.frame} roughness={0.48} metalness={0.55} />
      </mesh>
      <mesh position={[0, -0.071, 0]} rotation-x={Math.PI / 2}>
        <planeGeometry args={[1.58, 0.38]} />
        <meshStandardMaterial
          color={WAREHOUSE.light}
          emissive={WAREHOUSE.light}
          emissiveIntensity={2.3}
          roughness={0.28}
        />
      </mesh>
      <rectAreaLight
        position={[0, -0.12, 0]}
        rotation-x={-Math.PI / 2}
        width={2.2}
        height={1.2}
        intensity={5}
        color={WAREHOUSE.light}
      />
    </group>
  );
}

/** Fixed architectural details for the intentionally empty warehouse room. */
export function WarehouseRoom() {
  return (
    <group>
      {[-3.5, 0, 3.5].flatMap((z) =>
        [-2.15, 2.15].map((x) => <CeilingFixture key={`${x}-${z}`} x={x} z={z} />),
      )}

      <pointLight position={[0, 3.35, 0]} intensity={4.5} distance={14} color={WAREHOUSE.light} />
      <pointLight position={[-3, 2.2, -4.5]} intensity={2.4} distance={8} color="#d9e7ea" />
      <pointLight position={[3, 2.2, 4.5]} intensity={2.2} distance={8} color={WAREHOUSE.safety} />

      {/* Five rack fronts face -X, leaving the central aisle and return portal clear. */}
      {[-2.8, -1.4, 0, 1.4, 2.8].map((z, rackIndex) => (
        <ShelfRack
          key={rackIndex}
          rackIndex={rackIndex}
          position={[3.64, 0, z]}
          rotation={[0, -Math.PI / 2, 0]}
        />
      ))}

      {/* A low perimeter guard visually anchors the wall/floor junction without furnishing the room. */}
      {[
        { position: [0, 0.18, -5.96] as const, size: [8, 0.36, 0.08] as const },
        { position: [0, 0.18, 5.96] as const, size: [8, 0.36, 0.08] as const },
        { position: [-3.96, 0.18, 0] as const, size: [0.08, 0.36, 12] as const },
        { position: [3.96, 0.18, 0] as const, size: [0.08, 0.36, 12] as const },
      ].map(({ position, size }, index) => (
        <mesh key={index} position={position} receiveShadow>
          <boxGeometry args={size} />
          <meshStandardMaterial color={WAREHOUSE.concreteDark} roughness={0.76} />
        </mesh>
      ))}

      {/* Subtle structural seams keep the long empty walls readable at headset scale. */}
      {[-2, 0, 2].map((x) => (
        <mesh key={`back-${x}`} position={[x, 2, -5.975]}>
          <boxGeometry args={[0.035, 4, 0.035]} />
          <meshStandardMaterial color={WAREHOUSE.wallLine} roughness={0.9} />
        </mesh>
      ))}
      {[-3, 0, 3].map((z) => (
        <mesh key={`side-${z}`} position={[-3.975, 2, z]}>
          <boxGeometry args={[0.035, 4, 0.035]} />
          <meshStandardMaterial color={WAREHOUSE.wallLine} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

export function WarehouseCeilingMaterial() {
  return <meshStandardMaterial color={WAREHOUSE.ceiling} roughness={0.86} metalness={0.04} />;
}