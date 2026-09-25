import { Billboard, Text } from "@react-three/drei";

export function QuizStationPlaceholder({ accent }: { accent: string }) {
  return (
    <group position={[0, 0, 0]}>
      <mesh position-y={0.45} castShadow receiveShadow>
        <cylinderGeometry args={[0.6, 0.7, 0.9, 48]} />
        <meshStandardMaterial color="#e8e2d6" roughness={0.6} />
      </mesh>
      <mesh position-y={0.91}>
        <cylinderGeometry args={[0.62, 0.62, 0.02, 48]} />
        <meshStandardMaterial color={accent} metalness={0.7} roughness={0.3} />
      </mesh>
      <Billboard position-y={1.4}>
        <Text fontSize={0.14} color={accent} outlineWidth={0.004} outlineColor="#000">
          Abfrage - bald verfügbar
        </Text>
      </Billboard>
    </group>
  );
}
