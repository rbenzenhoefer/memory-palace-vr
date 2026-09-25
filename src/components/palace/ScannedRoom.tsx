import { Text, useGLTF } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { TeleportTarget } from "@react-three/xr";
import { Suspense, useMemo } from "react";
import { Box3, Mesh, MeshBasicMaterial, type Material, type MeshStandardMaterial, Vector3 } from "three";

import { ErrorBoundary } from "@/components/palace/ErrorBoundary";

/** Real-scale photogrammetry scan: floor moved to y=0, unlit baked textures. */
function ScanModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const { object, offset } = useMemo(() => {
    const obj = scene.clone(true);
    obj.traverse((o) => {
      if (!(o instanceof Mesh)) return;
      const toBasic = (m: Material) => {
        const src = m as MeshStandardMaterial;
        const basic = new MeshBasicMaterial({ map: src.map ?? null, color: src.map ? 0xffffff : src.color, side: 2 });
        basic.toneMapped = false;
        return basic;
      };
      o.material = Array.isArray(o.material) ? o.material.map(toBasic) : toBasic(o.material);
      o.raycast = () => {}; // teleport/drops use the clean floor plane, not noisy scan geometry
    });
    const box = new Box3().setFromObject(obj);
    const c = box.getCenter(new Vector3());
    return { object: obj, offset: [-c.x, -box.min.y, -c.z] as [number, number, number] };
  }, [scene]);
  return <primitive object={object} position={offset} />;
}

export function ScannedRoom({
  url,
  width,
  depth,
  onTeleport,
  onSurfaceClick,
}: {
  url: string;
  width: number;
  depth: number;
  onTeleport: (p: Vector3) => void;
  onSurfaceClick: (e: ThreeEvent<MouseEvent>) => void;
}) {
  return (
    <group>
      <ErrorBoundary fallback={<Text position={[0, 1.6, -1.5]} fontSize={0.12} color="#ff8a8a">Scan konnte nicht geladen werden</Text>}>
        <Suspense fallback={<Text position={[0, 1.6, -1.5]} fontSize={0.14} color="#7fd1ff">Raumscan wird geladen…</Text>}>
          <ScanModel url={url} />
        </Suspense>
      </ErrorBoundary>
      <TeleportTarget onTeleport={onTeleport}>
        <mesh rotation-x={-Math.PI / 2} position-y={0.005} userData={{ dropSurface: true }} onClick={onSurfaceClick}>
          <planeGeometry args={[width, depth]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </TeleportTarget>
    </group>
  );
}
