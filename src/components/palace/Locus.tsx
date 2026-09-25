import { Billboard, Text, useGLTF } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Suspense, useMemo, useRef, useState } from "react";
import { Box3, Vector3, type Mesh, type MeshStandardMaterial } from "three";

import { ErrorBoundary } from "@/components/palace/ErrorBoundary";
import { InfoPanel } from "@/components/palace/InfoPanel";
import type { LocusSpec, PrimitiveSpec } from "@/lib/palace/types";

const PEDESTAL_H = 1;
const OBJECT_SIZE = 0.5; // primitive fallback size (m)

function GltfModel({ url, scale }: { url: string; scale: number }) {
  const { scene } = useGLTF(url);
  const { object, factor, offsetY } = useMemo(() => {
    const clone = scene.clone(true);
    const box = new Box3().setFromObject(clone);
    const size = box.getSize(new Vector3());
    const maxSide = Math.max(size.x, size.y, size.z) || 1;
    const f = (1 / maxSide) * scale;
    const center = box.getCenter(new Vector3());
    clone.position.set(-center.x, -box.min.y, -center.z);
    return { object: clone, factor: f, offsetY: 0 };
  }, [scene, scale]);
  return (
    <group scale={factor} position-y={offsetY}>
      <primitive object={object} />
    </group>
  );
}

function PrimitiveModel({
  primitive,
  scale,
  pulse,
}: {
  primitive: PrimitiveSpec;
  scale: number;
  pulse: boolean;
}) {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!pulse || !ref.current) return;
    const t = (Math.sin(clock.elapsedTime * 2) + 1) / 2;
    (ref.current.material as MeshStandardMaterial).emissiveIntensity = 0.1 + t * 0.6;
    ref.current.scale.setScalar(scale * (0.95 + t * 0.08));
  });
  const s = OBJECT_SIZE;
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
    <mesh ref={ref} position-y={s / 2} scale={scale} castShadow>
      {geometry}
      <meshStandardMaterial
        color={primitive.color}
        emissive={primitive.color}
        emissiveIntensity={pulse ? 0.3 : 0.05}
        roughness={0.4}
        metalness={0.1}
      />
    </mesh>
  );
}

export function Locus({ locus, accent }: { locus: LocusSpec; accent: string }) {
  const [open, setOpen] = useState(false);
  const asset = locus.asset;
  const pending = asset?.status === "pending";
  const fallback = (
    <PrimitiveModel primitive={locus.primitive} scale={locus.scale} pulse={pending} />
  );

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setOpen((o) => !o);
  };

  const objectTop = PEDESTAL_H + Math.max(OBJECT_SIZE, 1) * locus.scale;

  return (
    <group position={locus.position} rotation={locus.rotation}>
      <group onClick={onClick}>
        <mesh position-y={PEDESTAL_H / 2} castShadow receiveShadow>
          <cylinderGeometry args={[0.28, 0.34, PEDESTAL_H, 32]} />
          <meshStandardMaterial color="#e8e2d6" roughness={0.7} />
        </mesh>
        <group position-y={PEDESTAL_H}>
          {asset?.status === "ready" && asset.url ? (
            <ErrorBoundary fallback={fallback}>
              <Suspense fallback={fallback}>
                <GltfModel url={asset.url} scale={locus.scale} />
              </Suspense>
            </ErrorBoundary>
          ) : (
            fallback
          )}
        </group>
      </group>
      <Billboard position-y={objectTop + 0.2}>
        <Text fontSize={0.12} color={accent} outlineWidth={0.004} outlineColor="#000">
          {locus.label}
        </Text>
      </Billboard>
      {open && (
        <InfoPanel cards={locus.cards} accent={accent} position={[0, objectTop + 0.3 + 0.5, 0]} />
      )}
    </group>
  );
}
