import { Environment, Lightformer, OrbitControls, Text } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { XR, XROrigin } from "@react-three/xr";
import { useEffect, useRef } from "react";
import { Vector3 } from "three";
import { useStore } from "zustand";

import { RoomRenderer } from "@/components/palace/RoomRenderer";
import { HeldObject } from "@/components/palace/HeldObject";
import { InventoryBelt } from "@/components/palace/InventoryBelt";
import { ScreenFade } from "@/components/palace/ScreenFade";
import { useRoom } from "@/hooks/useRoom";
import { usePalaceStore } from "@/state/palaceStore";
import { xrStore } from "@/xr/xrStore";

function CurrentRoom() {
  const slug = usePalaceStore((s) => s.currentRoomSlug);
  const { data: room, isLoading, error } = useRoom(slug);
  const spawned = useRef(false);

  // Place the player at the spawn point of the first room once.
  useEffect(() => {
    if (room && !spawned.current) {
      spawned.current = true;
      usePalaceStore.getState().setPlayerPosition(new Vector3(...(room.layout.spawn ?? [0, 0, 0])));
    }
  }, [room]);

  if (room) return <RoomRenderer room={room} />;
  return (
    <>
      <color attach="background" args={["#12141a"]} />
      <ambientLight intensity={0.5} />
      <Text position={[0, 1.6, -2]} fontSize={0.15} color="#f3efe6">
        {isLoading ? "Raum wird geladen…" : `Fehler: ${error?.message ?? "unbekannt"}`}
      </Text>
    </>
  );
}

function SceneContent() {
  const playerPosition = usePalaceStore((s) => s.playerPosition);
  const inSession = useStore(xrStore, (s) => s.session != null);
  return (
    <>
      <Environment>
        <Lightformer intensity={1.2} position={[0, 5, 0]} scale={[10, 10, 1]} />
        <Lightformer intensity={0.6} color="#8bb" position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[20, 1, 1]} />
      </Environment>
      <XROrigin position={playerPosition}>{inSession && <InventoryBelt />}</XROrigin>
      <CurrentRoom />
      <HeldObject />
      <ScreenFade />
    </>
  );
}

function DesktopControls() {
  const inSession = useStore(xrStore, (s) => s.session != null);
  const holding = usePalaceStore((s) => s.heldLocusId != null);
  if (inSession) return null;
  return <OrbitControls target={[0, 1.6, 0]} makeDefault enabled={!holding} />;
}

/** Single, always-mounted XR canvas for the whole app. */
export function XRScene() {
  return (
    <Canvas shadows camera={{ position: [0, 1.6, 5], fov: 65 }}>
      <XR store={xrStore}>
        <SceneContent />
      </XR>
      <DesktopControls />
    </Canvas>
  );
}
