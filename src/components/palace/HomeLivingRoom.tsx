import { RoundedBox, useTexture } from "@react-three/drei";
import { Suspense, useMemo } from "react";
import { CanvasTexture, DoubleSide, RepeatWrapping, SRGBColorSpace, TextureLoader } from "three";

import landscape from "@/assets/golden-hour-landscape.jpg";
import walnutFloor from "@/assets/walnut-floor.jpg";
import linenWeave from "@/assets/linen-weave.jpg";

// Interior materials are kept together so the sunlit room has one consistent palette.
const C = {
  plaster: "#e9e3d8", chalk: "#f3ede2", linen: "#beb5a6", linenLight: "#d9d0c1",
  walnut: "#614533", walnutLight: "#88634a", walnutDark: "#342922",
  brass: "#ae9060", stone: "#bdb6a9", charcoal: "#292c2b",
  olive: "#656d54", moss: "#3f5540", clay: "#a97960", book: "#8a7a64",
  flame: "#db9c54", glass: "#c7d0c9", wool: "#b6aaa0",
};

function makeTexture(draw: (ctx: CanvasRenderingContext2D, size: number) => void, size = 512) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  draw(ctx, size);
  const map = new CanvasTexture(canvas);
  map.colorSpace = SRGBColorSpace;
  map.anisotropy = 8;
  return map;
}

function loadTiled(url: string, repeatX: number, repeatY: number) {
  const map = new TextureLoader().load(url);
  map.colorSpace = SRGBColorSpace;
  map.wrapS = map.wrapT = RepeatWrapping;
  map.repeat.set(repeatX, repeatY);
  map.anisotropy = 8;
  return map;
}

export function HomeFloor() {
  const map = useMemo(() => loadTiled(walnutFloor, 2, 2), []);
  return <meshStandardMaterial map={map} color={C.chalk} roughness={0.72} metalness={0.02} />;
}

function Textile({ light = false }: { light?: boolean }) {
  const map = useMemo(() => loadTiled(linenWeave, 1.2, 1.2), []);
  return <meshStandardMaterial map={map} color={light ? C.chalk : C.linenLight} roughness={0.98} />;
}

function WoolRug() {
  const map = useMemo(() => makeTexture((ctx, size) => {
    ctx.fillStyle = "#b6aaa0"; ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 16000; i++) {
      const x = (i * 73.19) % size, y = (i * 193.37) % size;
      ctx.fillStyle = i % 7 === 0 ? "#ddcfc0" : i % 5 === 0 ? "#8d857c" : "#c4b8aa";
      ctx.globalAlpha = 0.27; ctx.fillRect(x, y, 2, 2);
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "#e3d7c8"; ctx.lineWidth = 8; ctx.strokeRect(18, 18, size - 36, size - 36);
    ctx.strokeStyle = "#7f796d"; ctx.lineWidth = 1; ctx.strokeRect(33, 33, size - 66, size - 66);
  }), []);
  return <mesh position={[1.5, 0.024, -1.6]} rotation-x={-Math.PI / 2} receiveShadow>
    <planeGeometry args={[5.7, 4.4]} /><meshStandardMaterial map={map} color={C.chalk} roughness={1} />
  </mesh>;
}

function ModularSofa() {
  return <group position={[1.35, 0, -4.1]}>
    <RoundedBox args={[4.15, 0.26, 1.48]} radius={0.08} position={[0, 0.27, 0]} castShadow><meshStandardMaterial color={C.walnutDark} roughness={0.72} /></RoundedBox>
    {[-1.36, 0, 1.36].map((x) => <group key={x} position-x={x}>
      <RoundedBox args={[1.34, 0.47, 1.48]} radius={0.14} position={[0, 0.63, 0]} castShadow receiveShadow><Textile /></RoundedBox>
      <RoundedBox args={[1.28, 0.84, 0.32]} radius={0.12} position={[0, 1.04, -0.62]} rotation-x={-0.09} castShadow><Textile light /></RoundedBox>
    </group>)}
    {[-2.03, 2.03].map((x) => <RoundedBox key={x} args={[0.34, 0.82, 1.5]} radius={0.12} position={[x, 0.72, 0]} castShadow><Textile light /></RoundedBox>)}
    <RoundedBox args={[0.55, 0.39, 0.14]} radius={0.06} position={[-1.54, 1.05, -0.16]} rotation={[0.08, 0.3, -0.13]} castShadow><meshStandardMaterial color={C.clay} roughness={0.92} /></RoundedBox>
    <RoundedBox args={[0.63, 0.42, 0.14]} radius={0.06} position={[1.22, 1.07, -0.12]} rotation={[0.05, -0.24, 0.08]} castShadow><meshStandardMaterial color={C.olive} roughness={0.94} /></RoundedBox>
  </group>;
}

function LoungeChair({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return <group position={position} rotation-y={rotation}>
    <RoundedBox args={[1.15, 0.22, 1.06]} radius={0.09} position-y={0.39} castShadow><meshStandardMaterial color={C.walnutDark} roughness={0.6} /></RoundedBox>
    <RoundedBox args={[1.04, 0.26, 0.88]} radius={0.12} position-y={0.65} castShadow><meshStandardMaterial color={C.clay} roughness={0.91} /></RoundedBox>
    <RoundedBox args={[1.04, 0.84, 0.25]} radius={0.11} position={[0, 0.99, -0.42]} rotation-x={-0.24} castShadow><meshStandardMaterial color={C.clay} roughness={0.91} /></RoundedBox>
    {[-0.5, 0.5].map((x) => <group key={x} position-x={x}>
      <mesh position={[0, 0.38, 0.34]} castShadow><boxGeometry args={[0.065, 0.74, 0.065]} /><meshStandardMaterial color={C.walnut} roughness={0.6} /></mesh>
      <mesh position={[0, 0.38, -0.35]} castShadow><boxGeometry args={[0.065, 0.74, 0.065]} /><meshStandardMaterial color={C.walnut} roughness={0.6} /></mesh>
      <RoundedBox args={[0.12, 0.12, 0.96]} radius={0.04} position={[0, 0.77, 0]} castShadow><meshStandardMaterial color={C.walnutLight} roughness={0.58} /></RoundedBox>
    </group>)}
  </group>;
}

function CoffeeTable() {
  return <group position={[1.55, 0, -1.22]}>
    <RoundedBox args={[2.3, 0.09, 1.04]} radius={0.045} position-y={0.46} castShadow receiveShadow><meshStandardMaterial color={C.stone} roughness={0.38} metalness={0.08} /></RoundedBox>
    {[-0.82, 0.82].map((x) => <mesh key={x} position={[x, 0.22, 0]} castShadow><boxGeometry args={[0.07, 0.44, 0.74]} /><meshStandardMaterial color={C.walnutDark} roughness={0.56} /></mesh>)}
    <mesh position={[-0.46, 0.54, 0.05]} castShadow><cylinderGeometry args={[0.13, 0.15, 0.13, 32]} /><meshStandardMaterial color={C.chalk} roughness={0.65} /></mesh>
    <mesh position={[0.14, 0.523, -0.13]} castShadow><boxGeometry args={[0.54, 0.035, 0.37]} /><meshStandardMaterial color={C.olive} roughness={0.88} /></mesh>
    <mesh position={[0.21, 0.555, -0.11]} castShadow><boxGeometry args={[0.51, 0.025, 0.35]} /><meshStandardMaterial color={C.book} roughness={0.85} /></mesh>
    <mesh position={[0.68, 0.565, 0.1]} castShadow><sphereGeometry args={[0.12, 24, 16]} /><meshStandardMaterial color={C.brass} metalness={0.68} roughness={0.35} /></mesh>
  </group>;
}

function WindowLandscape() {
  const map = useTexture(landscape);
  return <mesh position={[6.84, 2.48, 0]} rotation-y={-Math.PI / 2}>
    <planeGeometry args={[8.35, 4.25]} /><meshBasicMaterial map={map} toneMapped={false} />
  </mesh>;
}

function Windows() {
  return <group>
    <Suspense fallback={null}><WindowLandscape /></Suspense>
    {/* The window image sits in front of the existing wall; slender mullions give it believable scale. */}
    {[-4.2, -1.4, 1.4, 4.2].map((z) => <mesh key={z} position={[6.72, 2.5, z]} castShadow>
      <boxGeometry args={[0.16, 4.4, 0.105]} /><meshStandardMaterial color={C.walnutDark} roughness={0.47} />
    </mesh>)}
    {[0.28, 4.72].map((y) => <mesh key={y} position={[6.72, y, 0]} castShadow>
      <boxGeometry args={[0.19, 0.13, 8.55]} /><meshStandardMaterial color={C.walnutDark} roughness={0.47} />
    </mesh>)}
    <mesh position={[6.7, 2.55, 0]}><boxGeometry args={[0.025, 0.05, 8.4]} /><meshStandardMaterial color={C.brass} metalness={0.65} roughness={0.44} /></mesh>
    <mesh position={[6.59, 0.18, 0]} receiveShadow><boxGeometry args={[0.32, 0.12, 8.8]} /><meshStandardMaterial color={C.stone} roughness={0.57} /></mesh>
  </group>;
}

function Fireplace() {
  return <group position={[-2.3, 0, -6.73]}>
    <mesh position={[0, 1.25, 0.06]} receiveShadow><boxGeometry args={[2.85, 2.5, 0.22]} /><meshStandardMaterial color={C.stone} roughness={0.85} /></mesh>
    <mesh position={[0, 0.79, 0.19]}><boxGeometry args={[1.85, 1.18, 0.12]} /><meshStandardMaterial color={C.charcoal} roughness={0.94} /></mesh>
    <mesh position={[0, 0.24, 0.34]} castShadow receiveShadow><boxGeometry args={[2.45, 0.14, 0.74]} /><meshStandardMaterial color={C.stone} roughness={0.56} /></mesh>
    <mesh position={[0, 1.73, 0.31]} castShadow><boxGeometry args={[3.18, 0.17, 0.5]} /><meshStandardMaterial color={C.walnut} roughness={0.55} /></mesh>
    {[-0.25, 0.25].map((x) => <mesh key={x} position={[x, 0.39, 0.36]} rotation-z={x} castShadow><cylinderGeometry args={[0.095, 0.11, 0.83, 12]} /><meshStandardMaterial color={C.walnutDark} roughness={0.88} /></mesh>)}
    <mesh position={[0, 0.69, 0.37]}><sphereGeometry args={[0.2, 16, 12]} /><meshStandardMaterial color={C.flame} emissive={C.flame} emissiveIntensity={0.35} transparent opacity={0.65} /></mesh>
    <pointLight position={[0, 0.85, 0.55]} color={C.flame} intensity={1.6} distance={3.8} />
    <mesh position={[0, 2.75, 0.19]}><boxGeometry args={[1.5, 1.4, 0.08]} /><meshStandardMaterial color={C.walnutDark} roughness={0.62} /></mesh>
    <mesh position={[0, 2.75, 0.24]}><planeGeometry args={[1.35, 1.25]} /><meshStandardMaterial color={C.olive} roughness={0.9} /></mesh>
    <mesh position={[0, 2.75, 0.255]} rotation-z={-0.34}><torusGeometry args={[0.28, 0.015, 8, 40]} /><meshStandardMaterial color={C.brass} metalness={0.65} roughness={0.35} /></mesh>
  </group>;
}

function Bookshelf() {
  return <group position={[-5.1, 0, -6.65]}>
    <mesh position={[0, 2.14, 0]} castShadow><boxGeometry args={[2.65, 4.28, 0.46]} /><meshStandardMaterial color={C.walnutDark} roughness={0.62} /></mesh>
    <mesh position={[0, 2.14, 0.25]}><boxGeometry args={[2.48, 4.06, 0.015]} /><meshStandardMaterial color={C.walnut} roughness={0.72} /></mesh>
    {[0.42, 1.23, 2.04, 2.85, 3.66].map((y, shelf) => <group key={y}>
      <mesh position={[0, y, 0.35]} castShadow><boxGeometry args={[2.6, 0.065, 0.52]} /><meshStandardMaterial color={C.walnutLight} roughness={0.62} /></mesh>
      {Array.from({ length: 12 }, (_, i) => {
        const h = 0.36 + ((i * 7 + shelf * 3) % 6) * 0.035;
        return <mesh key={i} position={[-1.09 + i * 0.185, y + 0.034 + h / 2, 0.35]} rotation-z={i === 10 ? -0.1 : 0} castShadow>
          <boxGeometry args={[0.11 + (i % 3) * 0.018, h, 0.23]} />
          <meshStandardMaterial color={([C.book, C.olive, C.clay, C.linen, C.walnutLight][(i * 3 + shelf) % 5] ?? C.book)} roughness={0.89} />
        </mesh>;
      })}
    </group>)}
    <mesh position={[0.75, 4.36, 0.15]} castShadow><sphereGeometry args={[0.18, 24, 16]} /><meshStandardMaterial color={C.stone} roughness={0.78} /></mesh>
  </group>;
}

function Desk() {
  return <group position={[-4.8, 0, -4]} rotation-y={0.1}>
    <RoundedBox args={[2.75, 0.13, 1.06]} radius={0.035} position-y={0.96} castShadow receiveShadow><meshStandardMaterial color={C.walnutLight} roughness={0.48} /></RoundedBox>
    {[-1.16, 1.16].map((x) => <mesh key={x} position={[x, 0.47, 0]} castShadow><boxGeometry args={[0.075, 0.94, 0.82]} /><meshStandardMaterial color={C.walnutDark} roughness={0.63} /></mesh>)}
    <mesh position={[0.2, 1.55, -0.27]} castShadow><boxGeometry args={[1.14, 0.72, 0.055]} /><meshStandardMaterial color={C.charcoal} roughness={0.4} /></mesh>
    <mesh position={[0.2, 1.55, -0.235]}><planeGeometry args={[1.02, 0.6]} /><meshStandardMaterial color={C.olive} emissive={C.olive} emissiveIntensity={0.1} roughness={0.35} /></mesh>
    <mesh position={[0.2, 1.12, -0.24]}><cylinderGeometry args={[0.025, 0.025, 0.2, 12]} /><meshStandardMaterial color={C.charcoal} metalness={0.5} /></mesh>
    <mesh position={[0.17, 1.05, 0.22]} castShadow><boxGeometry args={[0.83, 0.025, 0.22]} /><meshStandardMaterial color={C.charcoal} roughness={0.6} /></mesh>
    <mesh position={[-0.9, 1.04, -0.17]} castShadow><cylinderGeometry args={[0.13, 0.17, 0.24, 24]} /><meshStandardMaterial color={C.brass} metalness={0.7} roughness={0.36} /></mesh>
    <mesh position={[-0.9, 1.34, -0.17]} castShadow><cylinderGeometry args={[0.025, 0.025, 0.42, 12]} /><meshStandardMaterial color={C.brass} metalness={0.7} roughness={0.36} /></mesh>
    <mesh position={[-0.9, 1.54, -0.17]} rotation-z={Math.PI} castShadow><coneGeometry args={[0.26, 0.28, 32, 1, true]} /><meshStandardMaterial color={C.chalk} side={DoubleSide} roughness={0.8} /></mesh>
    <pointLight position={[-0.9, 1.42, -0.17]} color={C.flame} intensity={0.9} distance={2.8} />
  </group>;
}

function Plant({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return <group position={position} scale={scale}>
    <mesh position-y={0.31} castShadow><cylinderGeometry args={[0.27, 0.2, 0.62, 24]} /><meshStandardMaterial color={C.stone} roughness={0.86} /></mesh>
    <mesh position-y={1.2}><cylinderGeometry args={[0.035, 0.05, 1.32, 10]} /><meshStandardMaterial color={C.moss} roughness={0.9} /></mesh>
    {Array.from({ length: 9 }, (_, i) => {
      const a = i * 2.399, y = 0.86 + i * 0.12, r = 0.26 + (i % 3) * 0.09;
      return <mesh key={i} position={[Math.cos(a) * r, y, Math.sin(a) * r]} rotation={[0.22, a, -0.4]} castShadow>
        <sphereGeometry args={[0.18, 0.035, 0.43, 12, 8]} /><meshStandardMaterial color={i % 3 === 0 ? C.olive : C.moss} side={DoubleSide} roughness={0.95} />
      </mesh>;
    })}
  </group>;
}

function FloorLamp() {
  return <group position={[4.67, 0, -4.65]}>
    <mesh position-y={0.035} castShadow><cylinderGeometry args={[0.25, 0.27, 0.07, 32]} /><meshStandardMaterial color={C.brass} metalness={0.8} roughness={0.4} /></mesh>
    <mesh position-y={1.02} castShadow><cylinderGeometry args={[0.018, 0.024, 2, 16]} /><meshStandardMaterial color={C.brass} metalness={0.8} roughness={0.4} /></mesh>
    <mesh position-y={2.02} castShadow><cylinderGeometry args={[0.28, 0.4, 0.5, 32, 1, true]} /><meshStandardMaterial color={C.linenLight} side={DoubleSide} roughness={0.9} /></mesh>
    <pointLight position-y={1.9} color={C.flame} intensity={1.35} distance={3.5} />
  </group>;
}

function Details() {
  return <group>
    {/* Quiet architectural trim gives the room a built interior rather than a bare box. */}
    {[-6.86, 6.86].map((x) => <group key={x}>
      {[0.17, 4.82].map((y) => <mesh key={y} position={[x, y, 0]}><boxGeometry args={[0.09, 0.13, 13.7]} /><meshStandardMaterial color={C.chalk} roughness={0.84} /></mesh>)}
    </group>)}
    {[-6.86, 6.86].map((z) => <group key={z}>
      {[0.17, 4.82].map((y) => <mesh key={y} position={[0, y, z]}><boxGeometry args={[13.7, 0.13, 0.09]} /><meshStandardMaterial color={C.chalk} roughness={0.84} /></mesh>)}
    </group>)}
    <mesh position={[3.7, 2.43, -6.73]} castShadow><boxGeometry args={[1.75, 1.4, 0.1]} /><meshStandardMaterial color={C.walnutDark} roughness={0.58} /></mesh>
    <mesh position={[3.7, 2.43, -6.65]}><planeGeometry args={[1.57, 1.22]} /><meshStandardMaterial color={C.olive} roughness={0.91} /></mesh>
    <mesh position={[3.7, 2.43, -6.63]} rotation-z={0.5}><torusGeometry args={[0.37, 0.025, 10, 48]} /><meshStandardMaterial color={C.brass} metalness={0.65} roughness={0.47} /></mesh>
    <mesh position={[4.9, 0.58, -5.6]} castShadow><cylinderGeometry args={[0.38, 0.4, 0.1, 32]} /><meshStandardMaterial color={C.walnut} roughness={0.53} /></mesh>
    <mesh position={[4.9, 0.3, -5.6]} castShadow><cylinderGeometry args={[0.035, 0.04, 0.5, 16]} /><meshStandardMaterial color={C.brass} metalness={0.63} roughness={0.4} /></mesh>
    <mesh position={[-2, 4.1, 6.7]}><boxGeometry args={[1.8, 0.055, 0.09]} /><meshStandardMaterial color={C.walnutLight} roughness={0.5} /></mesh>
    <group position={[2.2, 0, 6.64]} rotation-y={Math.PI}>
      <RoundedBox args={[2.65, 0.42, 0.48]} radius={0.035} position-y={0.42} castShadow><meshStandardMaterial color={C.walnut} roughness={0.52} /></RoundedBox>
      <mesh position={[0, 1.42, 0.07]} castShadow><boxGeometry args={[2.3, 1.32, 0.085]} /><meshStandardMaterial color={C.charcoal} metalness={0.15} roughness={0.19} /></mesh>
      <mesh position={[0, 1.42, 0.117]}><planeGeometry args={[2.18, 1.19]} /><meshStandardMaterial color={C.charcoal} metalness={0.32} roughness={0.22} /></mesh>
    </group>
  </group>;
}

export function HomeLivingRoom() {
  return <group>
    <directionalLight position={[10, 7, -2]} target-position={[0, 0, -2]} color={C.flame} intensity={3.1} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={10} shadow-camera-bottom={-10} shadow-bias={-0.0005} />
    <hemisphereLight args={[C.chalk, C.walnut, 0.42]} />
    <WoolRug /><ModularSofa /><LoungeChair position={[-0.9, 0, 0.25]} rotation={-0.35} />
    <CoffeeTable /><Windows /><Fireplace /><Bookshelf /><Desk /><FloorLamp /><Details />
    <Plant position={[5.62, 0, -5.8]} scale={1.23} />
    <Plant position={[-5.83, 0, 5.6]} scale={0.94} />
    <Plant position={[5.68, 0, 4.8]} scale={0.77} />
  </group>;
}
