import { Billboard, Line, RoundedBox, Text } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { DoubleSide, Vector3, type Group, type MeshStandardMaterial } from "three";

import type { RoomSpec, Vec3 } from "@/lib/palace/types";
import { usePalaceStore } from "@/state/palaceStore";
import { activeTutorialLocusId, TUTORIAL_TARGETS, useTutorialStore } from "@/state/tutorialStore";

const INK = "#eef7ff";
const PANEL = "#101a24";
const CYAN = "#55d6d0";
const GOLD = "#f1c96b";
const COMPLETE = "#83d483";

function GuideCard() {
  const phase = useTutorialStore((state) => state.phase);
  const placed = useTutorialStore((state) => state.placedIds.length);
  const route = useTutorialStore((state) => state.route.length);
  const follow = useTutorialStore((state) => state.followIndex);
  const feedback = useTutorialStore((state) => state.feedback);
  const next = useTutorialStore((state) => state.next);
  const restart = useTutorialStore((state) => state.restart);
  const copy: Record<typeof phase, [string, string]> = {
    idle: ["TUTORIAL WIRD VORBEREITET", "Einen Moment …"],
    welcome: ["WILLKOMMEN", "Hier bindest du Informationen an Objekte und baust daraus eine mentale Route."],
    "explain-locus": ["DEIN ERSTER LOCUS", "Ein Locus ist ein Objekt, das für eine Information steht. Gleich probierst du es selbst aus."],
    "interact-locus": ["AKTIVIERE DAS NEURON", "Wähle das leuchtende Neuron aus und öffne seine Lerninformation."],
    "place-loci": ["BAUE DEINEN PALAST", `Greife den leuchtenden Locus und lege ihn in den Zielkreis. ${placed}/4 platziert.`],
    "create-route": ["VERBINDE DIE LOCI", `Wähle die Objekte in der gezeigten Reihenfolge. ${route}/4 verbunden.`],
    "follow-route": ["FOLGE DEINER ROUTE", `Gehe entlang der Linie und aktiviere den nächsten Locus. ${follow}/4 besucht.`],
    complete: ["GESCHAFFT", "Du hast deinen ersten Gedächtnispalast aufgebaut und die Erinnerungsroute durchlaufen."],
  };
  const showButton = phase === "welcome" || phase === "explain-locus" || phase === "complete";
  const onAction = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (phase === "complete") {
      const ids = useTutorialStore.getState().loci.map((item) => item.id);
      const palace = usePalaceStore.getState();
      const placements = { ...palace.placements };
      ids.forEach((id) => delete placements[id]);
      usePalaceStore.setState({
        placements,
        inventory: palace.inventory.filter((id) => !ids.includes(id)),
        heldLocusId: palace.heldLocusId && ids.includes(palace.heldLocusId) ? null : palace.heldLocusId,
      });
      restart();
    } else next();
  };

  return (
    <Billboard position={[0, 1.75, 2.15]}>
      <group>
        <RoundedBox args={[2.35, 1.14, 0.035]} radius={0.08} smoothness={5}>
          <meshStandardMaterial color={PANEL} roughness={0.42} metalness={0.2} transparent opacity={0.96} />
        </RoundedBox>
        <mesh position={[0, 0.535, 0.025]}>
          <planeGeometry args={[2.18, 0.018]} />
          <meshBasicMaterial color={phase === "complete" ? COMPLETE : CYAN} />
        </mesh>
        <Text position={[-1.02, 0.38, 0.03]} anchorX="left" anchorY="top" fontSize={0.105} color={GOLD} maxWidth={2.04}>
          {copy[phase][0]}
        </Text>
        <Text position={[-1.02, 0.17, 0.03]} anchorX="left" anchorY="top" fontSize={0.07} lineHeight={1.35} color={INK} maxWidth={2.04}>
          {copy[phase][1]}
        </Text>
        {feedback && <Text position={[-1.02, -0.27, 0.03]} anchorX="left" anchorY="top" fontSize={0.052} color={CYAN} maxWidth={2.04}>{feedback}</Text>}
        {showButton && (
          <group position={[0, -0.42, 0.065]} onClick={onAction}>
            <RoundedBox args={[0.84, 0.24, 0.04]} radius={0.055} smoothness={4}>
              <meshStandardMaterial color={phase === "complete" ? COMPLETE : CYAN} emissive={phase === "complete" ? COMPLETE : CYAN} emissiveIntensity={0.25} />
            </RoundedBox>
            <Text position={[0, 0, 0.026]} fontSize={0.07} color={PANEL}>{phase === "complete" ? "NOCH EINMAL" : "WEITER"}</Text>
          </group>
        )}
      </group>
    </Billboard>
  );
}

function TargetMarker({ position, active, done, index }: { position: Vec3; active: boolean; done: boolean; index: number }) {
  const ref = useRef<Group>(null);
  const material = useRef<MeshStandardMaterial>(null);
  useFrame(({ clock }, rawDelta) => {
    if (!ref.current || !material.current) return;
    ref.current.rotation.y += Math.min(rawDelta, 0.05) * (active ? 0.8 : 0.18);
    material.current.emissiveIntensity = active ? 0.8 + Math.sin(clock.elapsedTime * 3.2) * 0.25 : done ? 0.28 : 0.08;
  });
  const color = done ? COMPLETE : active ? CYAN : "#6c7f8b";
  return (
    <group ref={ref} position={[position[0], 0.018, position[2]]}>
      <mesh rotation-x={-Math.PI / 2} raycast={() => null}>
        <ringGeometry args={[0.48, 0.58, 40]} />
        <meshStandardMaterial ref={material} color={color} emissive={color} transparent opacity={active ? 0.95 : 0.4} side={DoubleSide} />
      </mesh>
      <Text position={[0, 0.025, 0]} rotation-x={-Math.PI / 2} fontSize={0.22} color={color} raycast={() => null}>{index + 1}</Text>
    </group>
  );
}

function RoutePath({ room }: { room: RoomSpec }) {
  const placements = usePalaceStore((state) => state.placements);
  const phase = useTutorialStore((state) => state.phase);
  const route = useTutorialStore((state) => state.route);
  const followIndex = useTutorialStore((state) => state.followIndex);
  const points = useMemo(() => route.flatMap((id) => {
    const locus = room.loci.find((item) => item.id === id);
    if (!locus) return [];
    const source = placements[id]?.position ?? locus.position;
    return [new Vector3(source[0], 0.035, source[2])];
  }), [placements, room.loci, route]);
  if (points.length < 2) return null;
  return (
    <group>
      {points.slice(0, -1).map((point, index) => {
        const end = points[index + 1];
        if (!end) return null;
        const activeSegment = phase === "follow-route" && index === Math.min(followIndex, points.length - 2);
        const midpoint = point.clone().lerp(end, 0.5);
        const angle = Math.atan2(end.z - point.z, end.x - point.x);
        return (
          <group key={`segment-${index}`}>
            <Line points={[point, end]} color={activeSegment ? GOLD : CYAN} lineWidth={activeSegment ? 8 : 5} transparent opacity={activeSegment ? 0.95 : 0.36} raycast={() => null} />
            <Text position={[midpoint.x, 0.055, midpoint.z]} rotation={[-Math.PI / 2, 0, angle]} fontSize={0.34} color={activeSegment ? GOLD : CYAN} raycast={() => null}>›</Text>
          </group>
        );
      })}
      {points.map((point, index) => (
        <group key={route[index] ?? `route-${index}`} position={point}>
          <mesh position-y={0.02} rotation-x={-Math.PI / 2} raycast={() => null}>
            <circleGeometry args={[0.28, 32]} />
            <meshBasicMaterial color={index < followIndex || phase === "complete" ? COMPLETE : GOLD} transparent opacity={0.9} />
          </mesh>
          <Text position={[0, 0.045, 0]} rotation-x={-Math.PI / 2} fontSize={0.18} color={PANEL} raycast={() => null}>{index + 1}</Text>
        </group>
      ))}
    </group>
  );
}

export function TutorialRoom({ room }: { room: RoomSpec }) {
  const configure = useTutorialStore((state) => state.configure);
  const phase = useTutorialStore((state) => state.phase);
  const placedCount = useTutorialStore((state) => state.placedIds.length);
  const activeId = useTutorialStore(activeTutorialLocusId);
  useEffect(() => configure(room.loci), [configure, room.loci]);
  return (
    <group>
      <GuideCard />
      <RoutePath room={room} />
      {TUTORIAL_TARGETS.map((position, index) => <TargetMarker key={index} position={position} index={index} done={index < placedCount} active={phase === "place-loci" && index === placedCount} />)}
      <pointLight position={[0, 2.6, 1]} intensity={5} distance={11} color={CYAN} />
      <pointLight position={[0, 3.4, -3.8]} intensity={4} distance={10} color={GOLD} />
      {activeId && <Text position={[0, 0.025, -4.9]} rotation-x={-Math.PI / 2} fontSize={0.16} color={CYAN} raycast={() => null}>AKTIVES ZIEL</Text>}
    </group>
  );
}