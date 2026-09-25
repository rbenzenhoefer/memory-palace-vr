import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import { Box3, Vector3, type Mesh, type MeshStandardMaterial } from "three";

import { ErrorBoundary } from "@/components/palace/ErrorBoundary";
import type { LocusSpec, PrimitiveSpec } from "@/lib/palace/types";

export const OBJECT_SIZE = 0.5; // primitive fallback size (m)

export function GltfModel({ url, size }: { url: string; size: number }) {
  const { scene } = useGLTF(url);
  const { object, factor } = useMemo(() => {
    const clone = scene.clone(true);
    const box = new Box3().setFromObject(clone);
    const s = box.getSize(new Vector3());
    const maxSide = Math.max(s.x, s.y, s.z) || 1;
    const center = box.getCenter(new Vector3());
    clone.position.set(-center.x, -box.min.y, -center.z);
    return { object: clone, factor: size / maxSide };
  }, [scene, size]);
  return (
    <group scale={factor}>
      <primitive object={object} />
    </group>
  );
}

function PrimitiveModel({
  primitive,
  size,
  pulse,
  glow,
}: {
  primitive: PrimitiveSpec;
  size: number;
  pulse: boolean;
  glow: boolean;
}) {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const mat = ref.current.material as MeshStandardMaterial;
    if (pulse) {
      const t = (Math.sin(clock.elapsedTime * 2) + 1) / 2;
      mat.emissiveIntensity = 0.1 + t * 0.6;
    } else {
      mat.emissiveIntensity = glow ? 0.45 : 0.05;
    }
  });
  const s = size;
  const geometry = (() => {
    switch (primitive.shape) {
      case "sphere":
        return <sphereGeometry args={[s / 2, 32, 16]} />;
      case "cylinder":
        return <cylinderGeometry args={[s / 2, s / 2, s, 32]} />;
      case "torus":
        return <torusGeometry args={[s * 0.35, s * 0.13, 16, 48]} />;
      default:
        return <boxGeometry args={[s, s, s]} />;
    }
  })();
  return (
    <mesh ref={ref} position-y={s / 2} castShadow>
      {geometry}
      <meshStandardMaterial
        color={primitive.color}
        emissive={primitive.color}
        emissiveIntensity={0.05}
        roughness={0.4}
        metalness={0.1}
      />
    </mesh>
  );
}

/** Model (GLB or primitive fallback) resting on y=0. `size` = largest side in metres. */
export function LocusVisual({
  locus,
  size,
  glow = false,
}: {
  locus: LocusSpec;
  size?: number;
  glow?: boolean;
}) {
  const asset = locus.asset;
  const primSize = size ?? OBJECT_SIZE * locus.scale;
  const fallback = (
    <PrimitiveModel
      primitive={locus.primitive}
      size={primSize}
      pulse={asset?.status === "pending"}
      glow={glow}
    />
  );
  if (asset?.status === "ready" && asset.url) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Suspense fallback={fallback}>
          <GltfModel url={asset.url} size={size ?? locus.scale} />
        </Suspense>
      </ErrorBoundary>
    );
  }
  return fallback;
}

/** Visual height of a locus object (used for label placement). */
export function locusHeight(locus: LocusSpec) {
  return locus.asset?.status === "ready" && locus.asset.url ? locus.scale : OBJECT_SIZE * locus.scale;
}
