import { RoundedBox } from "@react-three/drei";

import { LocusVisual } from "@/components/palace/LocusVisual";
import type { LocusSpec } from "@/lib/palace/types";

const C = { floor: "#66706d", seam: "#89918e", wall: "#dce1dc", ceiling: "#cfd6d2", cabinet: "#d6d0c2", edge: "#8b938f", top: "#4e5d5d", steel: "#9da8a6", dark: "#253238", glass: "#b7d9d4", teal: "#2e7772", brass: "#b69a62", light: "#effff6", specimen: "#d4956f", green: "#54765f" } as const;

export function NeuroLabFloor() { return <meshStandardMaterial color={C.floor} roughness={0.76} metalness={0.04} />; }
export function NeuroLabWallMaterial() { return <meshStandardMaterial color={C.wall} roughness={0.9} />; }
export function NeuroLabCeilingMaterial() { return <meshStandardMaterial color={C.ceiling} roughness={0.88} />; }

function Cabinet({ x }: { x: number }) {
  return <group position-x={x}>
    <RoundedBox args={[1.3, 0.82, 0.64]} radius={0.035} position-y={0.41} castShadow receiveShadow><meshStandardMaterial color={C.cabinet} roughness={0.72} /></RoundedBox>
    <mesh position={[0, 0.41, 0.326]}><boxGeometry args={[0.025, 0.68, 0.02]} /><meshStandardMaterial color={C.edge} /></mesh>
    {[-0.24, 0.24].map((h) => <mesh key={h} position={[h, 0.48, 0.345]} castShadow><boxGeometry args={[0.18, 0.025, 0.035]} /><meshStandardMaterial color={C.steel} metalness={0.72} roughness={0.28} /></mesh>)}
  </group>;
}

function TestTubes({ position }: { position: [number, number, number] }) {
  return <group position={position}>
    <mesh position-y={0.08} castShadow><boxGeometry args={[0.66, 0.07, 0.24]} /><meshStandardMaterial color={C.brass} metalness={0.42} roughness={0.44} /></mesh>
    {[-0.24, -0.08, 0.08, 0.24].map((x, i) => <group key={x} position-x={x}>
      <mesh position-y={0.26} castShadow><cylinderGeometry args={[0.045, 0.035, 0.38, 14]} /><meshPhysicalMaterial color={C.glass} transparent opacity={0.38} roughness={0.12} transmission={0.35} /></mesh>
      <mesh position-y={0.13}><cylinderGeometry args={[0.036, 0.032, 0.16 + (i % 2) * 0.06, 14]} /><meshStandardMaterial color={i % 2 ? C.specimen : C.teal} transparent opacity={0.72} /></mesh>
    </group>)}
  </group>;
}

function Microscope({ position }: { position: [number, number, number] }) {
  return <group position={position} rotation-y={-0.3}>
    <RoundedBox args={[0.58, 0.09, 0.5]} radius={0.035} position-y={0.05} castShadow><meshStandardMaterial color={C.dark} roughness={0.42} metalness={0.22} /></RoundedBox>
    <mesh position={[0, 0.36, -0.1]} rotation-z={-0.2} castShadow><cylinderGeometry args={[0.075, 0.11, 0.7, 20]} /><meshStandardMaterial color={C.cabinet} roughness={0.55} /></mesh>
    <mesh position={[0.08, 0.65, -0.15]} rotation-z={-0.2} castShadow><cylinderGeometry args={[0.07, 0.07, 0.35, 18]} /><meshStandardMaterial color={C.dark} /></mesh>
    <mesh position={[0.04, 0.34, 0.08]} castShadow><boxGeometry args={[0.46, 0.045, 0.38]} /><meshStandardMaterial color={C.dark} metalness={0.3} /></mesh>
    <mesh position={[-0.22, 0.28, -0.05]} rotation-x={Math.PI / 2}><torusGeometry args={[0.09, 0.025, 10, 24]} /><meshStandardMaterial color={C.brass} metalness={0.65} /></mesh>
  </group>;
}

function BackBench() {
  return <group position={[0, 0, -6.62]}>
    {[-4.35, -2.9, -1.45, 0, 1.45, 2.9, 4.35].map((x) => <Cabinet key={x} x={x} />)}
    <RoundedBox args={[10.7, 0.12, 0.82]} radius={0.035} position-y={0.9} castShadow receiveShadow><meshStandardMaterial color={C.top} roughness={0.34} metalness={0.18} /></RoundedBox>
    <mesh position={[0, 1.87, -0.28]} receiveShadow><boxGeometry args={[10.7, 1.76, 0.08]} /><meshStandardMaterial color={C.cabinet} roughness={0.8} /></mesh>
    {[-4.25, -2.55, 2.55, 4.25].map((x) => <RoundedBox key={x} args={[1.5, 0.56, 0.44]} radius={0.04} position={[x, 2.06, -0.16]} castShadow><meshStandardMaterial color={C.cabinet} roughness={0.68} /></RoundedBox>)}
    <Microscope position={[-3.2, 0.98, 0.04]} /><TestTubes position={[-1.55, 0.96, 0.02]} />
    <group position={[0.7, 0.95, 0]}><mesh><boxGeometry args={[1.15, 0.04, 0.64]} /><meshStandardMaterial color={C.steel} metalness={0.72} /></mesh><mesh position={[0, 0.31, -0.22]} rotation-x={Math.PI / 2}><torusGeometry args={[0.22, 0.025, 10, 30, Math.PI]} /><meshStandardMaterial color={C.steel} metalness={0.8} /></mesh></group>
    {[2.05, 2.55, 3.05].map((x, i) => <group key={x} position={[x, 1.03, 0.02]}><mesh position-y={0.18 + i * 0.03} castShadow><cylinderGeometry args={[0.12, 0.15, 0.36 + i * 0.06, 20]} /><meshPhysicalMaterial color={C.glass} transparent opacity={0.42} transmission={0.32} /></mesh><mesh position-y={0.08}><cylinderGeometry args={[0.11, 0.13, 0.12, 20]} /><meshStandardMaterial color={i === 1 ? C.specimen : C.teal} transparent opacity={0.68} /></mesh></group>)}
  </group>;
}

function Island() {
  return <group position={[0, 0, 0.9]}>
    <RoundedBox args={[3.7, 0.82, 1.2]} radius={0.05} position-y={0.43} castShadow receiveShadow><meshStandardMaterial color={C.cabinet} roughness={0.72} /></RoundedBox>
    <RoundedBox args={[4, 0.12, 1.42]} radius={0.045} position-y={0.9} castShadow receiveShadow><meshStandardMaterial color={C.top} roughness={0.34} metalness={0.16} /></RoundedBox>
    <TestTubes position={[-1.1, 0.97, 0]} /><mesh position={[0.15, 0.98, 0]}><cylinderGeometry args={[0.25, 0.2, 0.08, 32]} /><meshPhysicalMaterial color={C.glass} transparent opacity={0.5} /></mesh><mesh position={[1.2, 1.12, 0]} castShadow><sphereGeometry args={[0.22, 24, 16]} /><meshStandardMaterial color={C.specimen} transparent opacity={0.78} /></mesh>
  </group>;
}

function AnatomyBoard({ pyramidalNeuron }: { pyramidalNeuron: LocusSpec | undefined }) {
  return <group position={[-5.92, 2.35, -1.1]} rotation-y={Math.PI / 2}>
    <mesh castShadow><boxGeometry args={[3.5, 2.2, 0.1]} /><meshStandardMaterial color={C.dark} /></mesh><mesh position-z={0.058}><planeGeometry args={[3.28, 1.98]} /><meshStandardMaterial color="#e5ddd0" /></mesh>
    {pyramidalNeuron && (
      <group position={[-0.28, -0.88, 0.11]} rotation-y={Math.PI}>
        <LocusVisual locus={pyramidalNeuron} size={1.72} />
      </group>
    )}
    {[-1.42, 0.66, 1, 1.34].map((x, i) => <mesh key={x} position={[x, 0.68 - i * 0.42, 0.075]}><boxGeometry args={[0.48 + i * 0.12, 0.035, 0.02]} /><meshStandardMaterial color={C.teal} /></mesh>)}
  </group>;
}

function SpecimenCase() {
  return <group position={[-5.62, 0, -4.85]} rotation-y={Math.PI / 2}>
    <RoundedBox args={[2.7, 0.48, 0.72]} radius={0.04} position-y={0.24} castShadow><meshStandardMaterial color={C.edge} /></RoundedBox>
    <mesh position-y={1.68}><boxGeometry args={[2.7, 2.85, 0.68]} /><meshPhysicalMaterial color={C.glass} transparent opacity={0.2} transmission={0.22} /></mesh>
    {[0.82, 1.58, 2.34].map((y) => <mesh key={y} position={[0, y, 0]}><boxGeometry args={[2.5, 0.045, 0.6]} /><meshStandardMaterial color={C.steel} metalness={0.55} /></mesh>)}
    {[-0.82, 0, 0.82].flatMap((x, col) => [1.05, 1.82, 2.58].map((y, row) => <group key={`${x}-${y}`} position={[x, y, 0]}><mesh><cylinderGeometry args={[0.14, 0.16, 0.38, 18]} /><meshPhysicalMaterial color={C.glass} transparent opacity={0.42} transmission={0.28} /></mesh><mesh position-y={-0.09}><sphereGeometry args={[0.1, 16, 10]} /><meshStandardMaterial color={(row + col) % 2 ? C.teal : C.specimen} /></mesh></group>))}
    <pointLight position={[0, 2.85, 0.25]} color={C.light} intensity={1.4} distance={3.2} />
  </group>;
}

function MonitorStation() {
  return <group position={[5.47, 0, -2.25]} rotation-y={-Math.PI / 2}><Cabinet x={0} /><RoundedBox args={[2.25, 0.1, 0.82]} radius={0.035} position-y={0.89}><meshStandardMaterial color={C.top} /></RoundedBox><mesh position={[0, 1.52, -0.16]}><boxGeometry args={[1.2, 0.76, 0.08]} /><meshStandardMaterial color={C.dark} /></mesh><mesh position={[0, 1.52, -0.112]}><planeGeometry args={[1.08, 0.64]} /><meshStandardMaterial color={C.teal} emissive={C.teal} emissiveIntensity={0.24} /></mesh></group>;
}

function CeilingLight({ x, z }: { x: number; z: number }) {
  return <group position={[x, 4.38, z]}><mesh><boxGeometry args={[2.25, 0.11, 0.62]} /><meshStandardMaterial color={C.steel} metalness={0.42} /></mesh><mesh position-y={-0.061} rotation-x={Math.PI / 2}><planeGeometry args={[2.03, 0.45]} /><meshStandardMaterial color={C.light} emissive={C.light} emissiveIntensity={1.8} /></mesh><rectAreaLight position={[0, -0.14, 0]} rotation-x={-Math.PI / 2} width={2.5} height={1.2} intensity={4.2} color={C.light} /></group>;
}

export function NeuroLabRoom({ pyramidalNeuron }: { pyramidalNeuron: LocusSpec | undefined }) {
  return <group>
    <directionalLight position={[5, 6, 3]} color={C.light} intensity={1.4} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-camera-left={-9} shadow-camera-right={9} shadow-camera-top={9} shadow-camera-bottom={-9} />
    {[[-2.6, -4], [2.6, -4], [-2.6, 2.5], [2.6, 2.5]].map(([x = 0, z = 0]) => <CeilingLight key={`${x}-${z}`} x={x} z={z} />)}
    <BackBench /><MonitorStation /><Island /><AnatomyBoard pyramidalNeuron={pyramidalNeuron} /><SpecimenCase />
    <group position={[5.4, 0, -5.75]}><mesh position-y={0.3}><cylinderGeometry args={[0.28, 0.22, 0.6, 20]} /><meshStandardMaterial color={C.cabinet} /></mesh>{[0, 1.25, 2.5, 3.75, 5].map((a, i) => <mesh key={a} position={[Math.cos(a) * 0.14, 0.78 + i * 0.13, Math.sin(a) * 0.14]} rotation={[0.25, a, -0.45]}><sphereGeometry args={[0.15, 0.035, 0.42, 12, 8]} /><meshStandardMaterial color={C.green} /></mesh>)}</group>
    {[-4, -2, 0, 2, 4].map((x) => <mesh key={x} position={[x, 0.006, 0]} rotation-x={-Math.PI / 2}><planeGeometry args={[0.012, 13.7]} /><meshBasicMaterial color={C.seam} /></mesh>)}
    {[-6, -4, -2, 0, 2, 4, 6].map((z) => <mesh key={z} position={[0, 0.007, z]} rotation-x={-Math.PI / 2}><planeGeometry args={[11.7, 0.012]} /><meshBasicMaterial color={C.seam} /></mesh>)}
  </group>;
}