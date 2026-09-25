import { TeleportTarget } from "@react-three/xr";
import { useCallback } from "react";
import type { Vector3 } from "three";

import { usePalaceStore } from "@/state/palaceStore";

/** 10x10 m teleportable floor. */
export function Floor() {
  const setPlayerPosition = usePalaceStore((s) => s.setPlayerPosition);

  const onTeleport = useCallback(
    (position: Vector3) => setPlayerPosition(position),
    [setPlayerPosition],
  );

  return (
    <TeleportTarget onTeleport={onTeleport}>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#3b3f4a" roughness={0.9} metalness={0.05} />
      </mesh>
    </TeleportTarget>
  );
}
