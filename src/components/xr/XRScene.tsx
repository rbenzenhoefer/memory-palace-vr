import { Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { XR, XROrigin, useXRStore } from "@react-three/xr";
import { useStore } from "zustand";

import { Floor } from "@/components/xr/Floor";
import { TestCube } from "@/components/xr/TestCube";
import { usePalaceStore } from "@/state/palaceStore";
import { xrStore } from "@/xr/xrStore";

function SceneContent() {
  const playerPosition = usePalaceStore((s) => s.playerPosition);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[4, 8, 5]}
        intensity={1.6}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <Environment>
        <Lightformer intensity={1.6} position={[0, 5, 0]} scale={[10, 10, 1]} />
        <Lightformer
          intensity={0.8}
          color="#8bb"
          position={[-5, 1, -1]}
          rotation-y={Math.PI / 2}
          scale={[20, 1, 1]}
        />
      </Environment>

      <XROrigin position={playerPosition} />
      <Floor />
      <TestCube />
    </>
  );
}

function DesktopControls() {
  const inSession = useStore(xrStore, (s) => s.session != null);
  if (inSession) return null;
  return <OrbitControls target={[0, 1.6, 0]} makeDefault />;
}

/** Single, always-mounted XR canvas for the whole app. */
export function XRScene() {
  return (
    <Canvas shadows camera={{ position: [0, 1.6, 3], fov: 65 }}>
      <color attach="background" args={["#12141a"]} />
      <fog attach="fog" args={["#12141a", 12, 40]} />
      <XR store={xrStore}>
        <SceneContent />
      </XR>
      <DesktopControls />
    </Canvas>
  );
}

export { useXRStore };
