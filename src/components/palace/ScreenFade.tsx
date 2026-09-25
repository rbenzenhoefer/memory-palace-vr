import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { BackSide, type Mesh, type MeshBasicMaterial } from "three";

import { usePalaceStore } from "@/state/palaceStore";

/** Black sphere around the camera; works in VR because it lives in the 3D scene. */
export function ScreenFade() {
  const ref = useRef<Mesh>(null);
  useFrame(({ camera }, delta) => {
    const mesh = ref.current;
    if (!mesh) return;
    const mat = mesh.material as MeshBasicMaterial;
    const target = usePalaceStore.getState().fadeTarget;
    const step = delta / 0.3;
    mat.opacity += Math.sign(target - mat.opacity) * Math.min(step, Math.abs(target - mat.opacity));
    mesh.visible = mat.opacity > 0.001;
    camera.getWorldPosition(mesh.position);
  });
  return (
    <mesh ref={ref} renderOrder={9999} visible={false}>
      <sphereGeometry args={[0.3, 16, 12]} />
      <meshBasicMaterial color="#000" side={BackSide} transparent opacity={0} depthTest={false} depthWrite={false} />
    </mesh>
  );
}
