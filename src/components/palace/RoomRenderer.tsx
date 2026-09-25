import { Text } from "@react-three/drei";
import { TeleportTarget } from "@react-three/xr";
import { useCallback } from "react";
import type { Vector3 } from "three";

import { Locus } from "@/components/palace/Locus";
import { Portal } from "@/components/palace/Portal";
import { QuizStationPlaceholder } from "@/components/palace/QuizStationPlaceholder";
import type { RoomSpec } from "@/lib/palace/types";
import { usePalaceStore } from "@/state/palaceStore";

export function RoomRenderer({ room }: { room: RoomSpec }) {
  const setPlayerPosition = usePalaceStore((s) => s.setPlayerPosition);
  const onTeleport = useCallback((p: Vector3) => setPlayerPosition(p), [setPlayerPosition]);

  const width = room.layout.width ?? 10;
  const depth = room.layout.depth ?? 10;
  const height = room.layout.height ?? 4;
  const floor = room.theme.floorColor ?? "#8a8578";
  const wall = room.theme.wallColor ?? "#cfc8b8";
  const accent = room.theme.accentColor ?? "#c9a227";
  const sky = room.theme.skyColor ?? "#12141a";

  const walls: { pos: [number, number, number]; rotY: number; w: number }[] = [
    { pos: [0, height / 2, -depth / 2], rotY: 0, w: width },
    { pos: [0, height / 2, depth / 2], rotY: Math.PI, w: width },
    { pos: [-width / 2, height / 2, 0], rotY: Math.PI / 2, w: depth },
    { pos: [width / 2, height / 2, 0], rotY: -Math.PI / 2, w: depth },
  ];

  return (
    <group>
      <color attach="background" args={[sky]} />
      <fog attach="fog" args={[sky, 15, 45]} />
      <ambientLight intensity={0.35} />
      <hemisphereLight args={[wall, floor, 0.6]} />
      <pointLight position={[0, height - 0.5, 0]} intensity={12} distance={20} color={accent} />

      <TeleportTarget onTeleport={onTeleport}>
        <mesh rotation-x={-Math.PI / 2} receiveShadow>
          <planeGeometry args={[width, depth]} />
          <meshStandardMaterial color={floor} roughness={0.85} />
        </mesh>
      </TeleportTarget>

      {walls.map((w, i) => (
        <mesh key={i} position={w.pos} rotation-y={w.rotY} receiveShadow>
          <planeGeometry args={[w.w, height]} />
          <meshStandardMaterial color={wall} roughness={0.9} />
        </mesh>
      ))}
      <mesh position-y={height} rotation-x={Math.PI / 2}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color={wall} roughness={0.95} />
      </mesh>

      <Text
        position={[0, height * 0.72, -depth / 2 + 0.02]}
        fontSize={Math.min(0.7, width / 12)}
        color={accent}
        maxWidth={width - 1}
        textAlign="center"
      >
        {room.title}
      </Text>

      {room.loci.map((l) => (
        <Locus key={l.id} locus={l} accent={accent} />
      ))}
      {room.portals.map((p) => (
        <Portal key={p.id} portal={p} accent={accent} />
      ))}
      {room.isHome && <QuizStationPlaceholder accent={accent} />}
    </group>
  );
}
