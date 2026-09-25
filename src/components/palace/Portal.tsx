import { Text } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { Vector3, type MeshBasicMaterial } from "three";

import { roomQueryOptions } from "@/hooks/useRoom";
import type { PortalSpec } from "@/lib/palace/types";
import { usePalaceStore } from "@/state/palaceStore";

const H = 2.2;
const W = 1.4;
const T = 0.12;
const FADE_MS = 300;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function Portal({ portal, accent }: { portal: PortalSpec; accent: string }) {
  const queryClient = useQueryClient();
  const matRef = useRef<MeshBasicMaterial>(null);
  const busy = useRef(false);

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.opacity = 0.45 + Math.sin(clock.elapsedTime * 2.2) * 0.15;
    }
  });

  const onClick = async (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (busy.current) return;
    busy.current = true;
    const { setFadeTarget, goToRoom, setPlayerPosition } = usePalaceStore.getState();
    const slug = portal.toRoom.slug;
    setFadeTarget(1);
    const [target] = await Promise.all([
      queryClient.fetchQuery(roomQueryOptions(slug)).catch(() => null),
      wait(FADE_MS),
    ]);
    goToRoom(slug);
    const spawn = target?.layout.spawn ?? [0, 0, 0];
    setPlayerPosition(new Vector3(...spawn));
    await wait(80);
    setFadeTarget(0);
    busy.current = false;
  };

  return (
    <group position={portal.position} rotation={portal.rotation}>
      <group onClick={onClick}>
        {/* posts + lintel */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[(s * (W + T)) / 2, H / 2, 0]} castShadow>
            <boxGeometry args={[T, H, T]} />
            <meshStandardMaterial color={accent} metalness={0.6} roughness={0.3} />
          </mesh>
        ))}
        <mesh position={[0, H + T / 2, 0]} castShadow>
          <boxGeometry args={[W + T * 2, T, T]} />
          <meshStandardMaterial color={accent} metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, H / 2, 0]}>
          <planeGeometry args={[W, H]} />
          <meshBasicMaterial ref={matRef} color={accent} transparent opacity={0.5} side={2} />
        </mesh>
      </group>
      <Text position={[0, H + 0.35, 0]} fontSize={0.18} color={accent} anchorY="bottom">
        {portal.label ?? portal.toRoom.title}
      </Text>
    </group>
  );
}
