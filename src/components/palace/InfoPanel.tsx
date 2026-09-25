import { Billboard, RoundedBox, Text } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { useState } from "react";

import type { CardSpec } from "@/lib/palace/types";

const W = 1.2;
const H = 0.8;

export function InfoPanel({
  cards,
  accent,
  position,
}: {
  cards: CardSpec[];
  accent: string;
  position: [number, number, number];
}) {
  const [index, setIndex] = useState(0);
  const card = cards[index % Math.max(cards.length, 1)];

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (cards.length > 1) setIndex((i) => (i + 1) % cards.length);
  };

  return (
    <Billboard position={position}>
      <group onClick={onClick}>
        <RoundedBox args={[W, H, 0.02]} radius={0.04} smoothness={4}>
          <meshStandardMaterial color="#14161d" roughness={0.6} transparent opacity={0.92} />
        </RoundedBox>
        <mesh position={[0, H / 2 - 0.01, 0.012]}>
          <planeGeometry args={[W - 0.08, 0.008]} />
          <meshBasicMaterial color={accent} />
        </mesh>
        {card ? (
          <>
            <Text
              position={[-W / 2 + 0.06, H / 2 - 0.07, 0.015]}
              anchorX="left"
              anchorY="top"
              fontSize={0.07}
              maxWidth={W - 0.12}
              color={accent}
            >
              {card.front}
            </Text>
            <Text
              position={[-W / 2 + 0.06, H / 2 - 0.22, 0.015]}
              anchorX="left"
              anchorY="top"
              fontSize={0.045}
              lineHeight={1.3}
              maxWidth={W - 0.12}
              color="#f3efe6"
            >
              {card.back}
            </Text>
            {card.extra && (
              <Text
                position={[-W / 2 + 0.06, -H / 2 + 0.06, 0.015]}
                anchorX="left"
                anchorY="bottom"
                fontSize={0.03}
                maxWidth={W - 0.3}
                color="#9aa3b5"
              >
                {card.extra}
              </Text>
            )}
          </>
        ) : (
          <Text position={[0, 0, 0.015]} fontSize={0.05} color="#9aa3b5">
            Noch keine Karten
          </Text>
        )}
        {cards.length > 1 && (
          <Text
            position={[W / 2 - 0.06, -H / 2 + 0.06, 0.015]}
            anchorX="right"
            anchorY="bottom"
            fontSize={0.035}
            color={accent}
          >
            {`${(index % cards.length) + 1}/${cards.length}`}
          </Text>
        )}
      </group>
    </Billboard>
  );
}
