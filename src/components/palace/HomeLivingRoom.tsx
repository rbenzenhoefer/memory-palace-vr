import { RoundedBox } from "@react-three/drei";
import { useMemo } from "react";
import {
  CanvasTexture,
  ClampToEdgeWrapping,
  DoubleSide,
  RepeatWrapping,
  SRGBColorSpace,
} from "three";

const PALETTE = {
  ivory: "#f3e7d3",
  terracotta: "#b85c3b",
  olive: "#657153",
  oliveDark: "#394a36",
  wood: "#8b5e3c",
  woodDark: "#4c3026",
  brass: "#c79b45",
  rugRed: "#7b302c",
  screen: "#182124",
  sky: "#bfe0e8",
  field: "#78a65a",
  fieldLight: "#a8c46c",
} as const;

export function HomeFloor() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext("2d");
    if (!context) return null;

    context.fillStyle = "#8b5e3c";
    context.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 256; y += 32) {
      context.fillStyle = y % 64 === 0 ? "#9a6844" : "#7d5036";
      context.fillRect(0, y, 256, 30);
      context.fillStyle = "#58392c";
      context.fillRect(0, y + 30, 256, 2);
      for (let x = (y / 32) % 2 === 0 ? 0 : 64; x < 256; x += 128) {
        context.fillRect(x, y, 2, 30);
      }
    }
    const map = new CanvasTexture(canvas);
    map.colorSpace = SRGBColorSpace;
    map.wrapS = map.wrapT = RepeatWrapping;
    map.repeat.set(3.5, 3.5);
    return map;
  }, []);

  return <meshStandardMaterial map={texture ?? undefined} color={PALETTE.wood} roughness={0.72} />;
}

function Sofa() {
  return (
    <group position={[2.3, 0, -4.35]}>
      <RoundedBox args={[3.7, 0.55, 1.15]} radius={0.16} smoothness={3} position={[0, 0.52, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={PALETTE.olive} roughness={0.92} />
      </RoundedBox>
      <RoundedBox args={[3.5, 1.05, 0.3]} radius={0.14} smoothness={3} position={[0, 1.15, -0.48]} castShadow>
        <meshStandardMaterial color={PALETTE.oliveDark} roughness={0.94} />
      </RoundedBox>
      {[-1.47, 1.47].map((x) => (
        <RoundedBox key={x} args={[0.38, 0.88, 1.1]} radius={0.14} smoothness={3} position={[x, 0.72, 0]} castShadow>
          <meshStandardMaterial color={PALETTE.oliveDark} roughness={0.94} />
        </RoundedBox>
      ))}
      {[-0.82, 0, 0.82].map((x) => (
        <RoundedBox key={x} args={[0.73, 0.66, 0.22]} radius={0.1} smoothness={3} position={[x, 1.12, -0.24]} rotation-x={-0.12} castShadow>
          <meshStandardMaterial color={PALETTE.olive} roughness={0.96} />
        </RoundedBox>
      ))}
      <RoundedBox args={[0.55, 0.42, 0.18]} radius={0.09} smoothness={3} position={[-0.9, 1.22, 0.02]} rotation={[0, 0.15, -0.08]} castShadow>
        <meshStandardMaterial color={PALETTE.terracotta} roughness={0.95} />
      </RoundedBox>
    </group>
  );
}

function PersianRug() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const context = canvas.getContext("2d");
    if (!context) return null;
    context.fillStyle = PALETTE.rugRed;
    context.fillRect(0, 0, 512, 256);
    context.strokeStyle = PALETTE.ivory;
    context.lineWidth = 12;
    context.strokeRect(18, 18, 476, 220);
    context.strokeStyle = PALETTE.brass;
    context.lineWidth = 5;
    context.strokeRect(34, 34, 444, 188);
    context.translate(256, 128);
    context.rotate(Math.PI / 4);
    context.fillStyle = PALETTE.oliveDark;
    context.fillRect(-55, -55, 110, 110);
    context.strokeStyle = PALETTE.brass;
    context.lineWidth = 9;
    context.strokeRect(-42, -42, 84, 84);
    context.setTransform(1, 0, 0, 1, 0, 0);
    for (const x of [95, 417]) {
      for (const y of [70, 186]) {
        context.beginPath();
        context.fillStyle = PALETTE.ivory;
        context.arc(x, y, 18, 0, Math.PI * 2);
        context.fill();
      }
    }
    const map = new CanvasTexture(canvas);
    map.colorSpace = SRGBColorSpace;
    map.wrapS = map.wrapT = ClampToEdgeWrapping;
    return map;
  }, []);

  return (
    <mesh position={[2.2, 0.035, -1.35]} rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[5.2, 3.3]} />
      <meshStandardMaterial map={texture ?? undefined} color={PALETTE.rugRed} roughness={1} />
    </mesh>
  );
}

function Television() {
  return (
    <group position={[2.25, 0, 2.95]} rotation-y={Math.PI}>
      <RoundedBox args={[3.35, 0.58, 0.62]} radius={0.08} smoothness={2} position={[0, 0.35, 0]} castShadow>
        <meshStandardMaterial color={PALETTE.woodDark} roughness={0.62} />
      </RoundedBox>
      {[-1.15, 1.15].map((x) => (
        <mesh key={x} position={[x, 0.15, 0]} castShadow>
          <boxGeometry args={[0.11, 0.3, 0.42]} />
          <meshStandardMaterial color={PALETTE.brass} metalness={0.72} roughness={0.28} />
        </mesh>
      ))}
      <RoundedBox args={[2.65, 1.48, 0.12]} radius={0.06} smoothness={2} position={[0, 1.35, -0.03]} castShadow>
        <meshStandardMaterial color={PALETTE.screen} metalness={0.25} roughness={0.16} />
      </RoundedBox>
      <mesh position={[0, 1.35, -0.101]} rotation-y={Math.PI}>
        <planeGeometry args={[2.42, 1.26]} />
        <meshStandardMaterial color="#243c3e" emissive="#182728" emissiveIntensity={0.45} roughness={0.22} />
      </mesh>
      <mesh position={[0, 0.74, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.45, 16]} />
        <meshStandardMaterial color={PALETTE.screen} metalness={0.65} roughness={0.25} />
      </mesh>
    </group>
  );
}

function DeskCorner() {
  return (
    <group position={[-4.35, 0, -4.25]} rotation-y={0.08}>
      <mesh position={[0, 1.02, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.1, 0.16, 1.15]} />
        <meshStandardMaterial color={PALETTE.wood} roughness={0.58} />
      </mesh>
      {[[-1.3, 0.5, -0.42], [1.3, 0.5, -0.42], [-1.3, 0.5, 0.42], [1.3, 0.5, 0.42]].map((position, index) => (
        <mesh key={index} position={position as [number, number, number]} castShadow>
          <boxGeometry args={[0.11, 1, 0.11]} />
          <meshStandardMaterial color={PALETTE.woodDark} roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[0.35, 1.86, -0.24]} castShadow>
        <boxGeometry args={[1.25, 0.75, 0.09]} />
        <meshStandardMaterial color={PALETTE.screen} roughness={0.2} />
      </mesh>
      <mesh position={[0.35, 1.86, -0.292]}>
        <planeGeometry args={[1.08, 0.59]} />
        <meshStandardMaterial color="#6d8d81" emissive="#405b55" emissiveIntensity={0.45} />
      </mesh>
      <mesh position={[0.35, 1.38, -0.21]} castShadow>
        <cylinderGeometry args={[0.045, 0.06, 0.5, 12]} />
        <meshStandardMaterial color={PALETTE.screen} metalness={0.5} />
      </mesh>
      <mesh position={[0.25, 1.14, 0.17]} castShadow>
        <boxGeometry args={[0.95, 0.035, 0.3]} />
        <meshStandardMaterial color={PALETTE.ivory} roughness={0.7} />
      </mesh>
      <group position={[-1.02, 1.1, -0.15]}>
        <mesh position-y={0.4} rotation-z={-0.26} castShadow>
          <cylinderGeometry args={[0.035, 0.045, 0.8, 12]} />
          <meshStandardMaterial color={PALETTE.brass} metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh position={[-0.1, 0.82, 0]} rotation-z={0.25} castShadow>
          <coneGeometry args={[0.25, 0.36, 24, 1, true]} />
          <meshStandardMaterial color={PALETTE.terracotta} side={DoubleSide} roughness={0.58} />
        </mesh>
        <pointLight position={[-0.18, 0.67, 0.05]} color="#ffd39a" intensity={1.6} distance={4} />
      </group>
      <group position={[0.2, 0, 1.12]}>
        <mesh position-y={0.48} castShadow>
          <boxGeometry args={[1.15, 0.16, 1.05]} />
          <meshStandardMaterial color={PALETTE.oliveDark} roughness={0.88} />
        </mesh>
        <mesh position={[0, 1.04, 0.43]} rotation-x={-0.12} castShadow>
          <boxGeometry args={[1.15, 1.05, 0.16]} />
          <meshStandardMaterial color={PALETTE.olive} roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

function Plant({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const leaves = [
    [-0.22, 1.02, 0, -0.42], [0.24, 1.18, 0.04, 0.48], [-0.3, 1.38, -0.02, -0.55],
    [0.2, 1.55, 0.02, 0.42], [0, 1.7, 0, 0],
  ] as const;
  return (
    <group position={position} scale={scale}>
      <mesh position-y={0.32} castShadow>
        <cylinderGeometry args={[0.34, 0.25, 0.64, 16]} />
        <meshStandardMaterial color={PALETTE.terracotta} roughness={0.86} />
      </mesh>
      <mesh position-y={1.08} castShadow>
        <cylinderGeometry args={[0.035, 0.055, 1.15, 10]} />
        <meshStandardMaterial color={PALETTE.oliveDark} roughness={1} />
      </mesh>
      {leaves.map(([x, y, z, rotation], index) => (
        <mesh key={index} position={[x, y, z]} rotation-z={rotation} castShadow>
          <sphereGeometry args={[0.3, 12, 8]} />
          <meshStandardMaterial color={index % 2 ? PALETTE.olive : PALETTE.oliveDark} roughness={0.96} />
        </mesh>
      ))}
    </group>
  );
}

function WindowView() {
  return (
    <group position={[6.91, 2.55, 0.6]} rotation-y={-Math.PI / 2}>
      <mesh position-z={0.045}>
        <planeGeometry args={[4.9, 2.75]} />
        <meshBasicMaterial color={PALETTE.sky} />
      </mesh>
      <mesh position={[0, -0.72, 0.035]}>
        <planeGeometry args={[4.75, 1.18]} />
        <meshBasicMaterial color={PALETTE.fieldLight} />
      </mesh>
      <mesh position={[0.3, -1.03, 0.025]} rotation-z={-0.05}>
        <planeGeometry args={[5.1, 0.48]} />
        <meshBasicMaterial color={PALETTE.field} />
      </mesh>
      {[-2.55, 2.55].map((x) => (
        <mesh key={x} position={[x, 0, 0]} castShadow>
          <boxGeometry args={[0.18, 3.05, 0.16]} />
          <meshStandardMaterial color={PALETTE.woodDark} roughness={0.63} />
        </mesh>
      ))}
      {[-1.48, 1.48].map((y) => (
        <mesh key={y} position={[0, y, 0]} castShadow>
          <boxGeometry args={[5.25, 0.18, 0.16]} />
          <meshStandardMaterial color={PALETTE.woodDark} roughness={0.63} />
        </mesh>
      ))}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.11, 2.88, 0.17]} />
        <meshStandardMaterial color={PALETTE.woodDark} roughness={0.63} />
      </mesh>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[5.08, 0.11, 0.17]} />
        <meshStandardMaterial color={PALETTE.woodDark} roughness={0.63} />
      </mesh>
      <pointLight position={[0, 0, 1.6]} color="#dff5d4" intensity={2.2} distance={9} />
    </group>
  );
}

function CeilingLamp() {
  return (
    <group position={[2, 4.98, -0.8]}>
      <mesh position-y={-0.45} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 0.9, 12]} />
        <meshStandardMaterial color={PALETTE.brass} metalness={0.78} roughness={0.25} />
      </mesh>
      <mesh position-y={-0.98} castShadow>
        <coneGeometry args={[0.65, 0.55, 32, 1, true]} />
        <meshStandardMaterial color={PALETTE.terracotta} side={DoubleSide} roughness={0.72} />
      </mesh>
      <mesh position-y={-1.14}>
        <sphereGeometry args={[0.12, 16, 12]} />
        <meshStandardMaterial color="#ffd39a" emissive="#ffd39a" emissiveIntensity={2} />
      </mesh>
      <pointLight position-y={-1.2} color="#ffd39a" intensity={8} distance={10} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
    </group>
  );
}

export function HomeLivingRoom() {
  return (
    <group>
      <PersianRug />
      <Sofa />
      <Television />
      <DeskCorner />
      <WindowView />
      <Plant position={[5.65, 0, -4.8]} scale={0.92} />
      <Plant position={[5.7, 0, 4.9]} scale={0.72} />
      <Plant position={[-5.35, 0, 4.7]} scale={0.64} />
      <CeilingLamp />
    </group>
  );
}