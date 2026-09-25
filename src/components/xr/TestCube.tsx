import { useState } from "react";

const COLORS = ["#2f6fed", "#e0b341", "#3ec98a", "#e0577c"] as const;

/** Floating cube that cycles color on click (mouse or XR pointer). */
export function TestCube() {
  const [index, setIndex] = useState(0);

  return (
    <mesh
      position={[0, 1.5, -2]}
      castShadow
      onClick={(event) => {
        event.stopPropagation();
        setIndex((i) => (i + 1) % COLORS.length);
      }}
    >
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial
        color={COLORS[index % COLORS.length]!}
        roughness={0.35}
        metalness={0.15}
      />
    </mesh>
  );
}
