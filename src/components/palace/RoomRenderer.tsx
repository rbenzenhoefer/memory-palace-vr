import { Text } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { TeleportTarget } from "@react-three/xr";
import { useCallback } from "react";
import type { Vector3 } from "three";

import { Locus, PEDESTAL_H, Pedestal } from "@/components/palace/Locus";
import { HomeFloor, HomeLivingRoom } from "@/components/palace/HomeLivingRoom";
import { NeuroLabCeilingMaterial, NeuroLabFloor, NeuroLabRoom, NeuroLabWallMaterial } from "@/components/palace/NeuroLabRoom";
import { Portal } from "@/components/palace/Portal";
import { QuizStationPlaceholder } from "@/components/palace/QuizStationPlaceholder";
import { ScannedRoom } from "@/components/palace/ScannedRoom";
import { TutorialRoom } from "@/components/palace/TutorialRoom";
import {
  WarehouseCeilingMaterial,
  WarehouseFloor,
  WarehouseRoom,
  WarehouseWallMaterial,
} from "@/components/palace/WarehouseRoom";
import { grab } from "@/lib/palace/grab";
import type { LocusSpec, RoomSpec, Vec3 } from "@/lib/palace/types";
import { usePalaceStore } from "@/state/palaceStore";

interface PlacedObject {
  locus: LocusSpec;
  position: Vec3;
  rotation: Vec3;
  hidden: boolean;
}

function usePortableObjects(room: RoomSpec): PlacedObject[] {
  const placements = usePalaceStore((s) => s.placements);
  const carried = usePalaceStore((s) => s.carriedSpecs);
  const inventory = usePalaceStore((s) => s.inventory);
  const held = usePalaceStore((s) => s.heldLocusId);

  const out: PlacedObject[] = [];
  const own = new Set(room.loci.map((l) => l.id));
  const add = (l: LocusSpec) => {
    if (inventory.includes(l.id)) return;
    const p = placements[l.id];
    if ((p?.roomSlug ?? room.slug) !== room.slug) return;
    out.push({
      locus: l,
      position: p ? p.position : [l.position[0], l.position[1] + PEDESTAL_H, l.position[2]],
      rotation: p ? p.rotation : l.rotation,
      hidden: held === l.id,
    });
  };
  room.loci.filter((l) => l.isPortable).forEach(add);
  Object.values(carried)
    .filter((l) => !own.has(l.id) && placements[l.id]?.roomSlug === room.slug)
    .forEach(add);
  return out;
}

export function RoomRenderer({ room }: { room: RoomSpec }) {
  const setPlayerPosition = usePalaceStore((s) => s.setPlayerPosition);
  const onTeleport = useCallback((p: Vector3) => setPlayerPosition(p), [setPlayerPosition]);
  const objects = usePortableObjects(room);

  const width = room.layout.width ?? 10;
  const depth = room.layout.depth ?? 10;
  const height = room.layout.height ?? 4;
  const floor = room.theme.floorColor ?? "#8a8578";
  const wall = room.theme.wallColor ?? "#cfc8b8";
  const accent = room.theme.accentColor ?? "#c9a227";
  const sky = room.theme.skyColor ?? "#12141a";
  const isWarehouse = room.slug === "warehouse";
  const isNeuroLab = room.slug === "neuro";
  const isTutorial = room.slug === "tutorial";
  const scanUrl = (room.theme as Record<string, unknown>)["scanUrl"] as string | undefined;
  const isScan = !!scanUrl;

  // Click-to-place when an object is in hand without an active drag (desktop inventory, after portals).
  const onSurfaceClick = (e: ThreeEvent<MouseEvent>) => {
    const s = usePalaceStore.getState();
    if (!s.heldLocusId || grab.active) return;
    e.stopPropagation();
    s.drop(room.slug, [e.point.x, e.point.y, e.point.z], [0, 0, 0]);
  };

  const walls: { pos: [number, number, number]; rotY: number; w: number }[] = [
    { pos: [0, height / 2, -depth / 2], rotY: 0, w: width },
    { pos: [0, height / 2, depth / 2], rotY: Math.PI, w: width },
    { pos: [-width / 2, height / 2, 0], rotY: Math.PI / 2, w: depth },
    { pos: [width / 2, height / 2, 0], rotY: -Math.PI / 2, w: depth },
  ];

  return (
    <group>
      <color attach="background" args={[sky]} />
      <fog attach="fog" args={[sky, 15, 45]} />
      <ambientLight intensity={room.isHome ? 0.2 : isWarehouse ? 0.48 : isNeuroLab ? 0.28 : 0.35} />
      <hemisphereLight args={[wall, floor, room.isHome ? 0.25 : isWarehouse ? 0.85 : isNeuroLab ? 0.42 : 0.6]} />
      {!isWarehouse && !isNeuroLab && !room.isHome && !isScan && (
        <pointLight position={[0, height - 0.5, 0]} intensity={12} distance={20} color={accent} />
      )}

      {isScan ? (
        <ScannedRoom url={scanUrl} width={width} depth={depth} onTeleport={onTeleport} onSurfaceClick={onSurfaceClick} />
      ) : (<>
      <TeleportTarget onTeleport={onTeleport}>
        <mesh
          rotation-x={-Math.PI / 2}
          receiveShadow
          userData={{ dropSurface: true }}
          onClick={onSurfaceClick}
        >
          <planeGeometry args={[width, depth]} />
          {room.isHome ? (
            <HomeFloor />
          ) : isNeuroLab ? (
            <NeuroLabFloor />
          ) : isWarehouse ? (
            <WarehouseFloor />
          ) : (
            <meshStandardMaterial color={floor} roughness={0.85} />
          )}
        </mesh>
      </TeleportTarget>

      {walls.map((w, i) => (
        <mesh key={i} position={w.pos} rotation-y={w.rotY} receiveShadow>
          <planeGeometry args={[w.w, height]} />
          {isWarehouse ? <WarehouseWallMaterial /> : isNeuroLab ? <NeuroLabWallMaterial /> : <meshStandardMaterial color={wall} roughness={0.9} />}
        </mesh>
      ))}
      <mesh position-y={height} rotation-x={Math.PI / 2}>
        <planeGeometry args={[width, depth]} />
        {isWarehouse ? <WarehouseCeilingMaterial /> : isNeuroLab ? <NeuroLabCeilingMaterial /> : <meshStandardMaterial color={wall} roughness={0.95} />}
      </mesh>

      {!room.isHome && <Text
        position={[0, height * 0.72, -depth / 2 + 0.02]}
        fontSize={Math.min(0.7, width / 12)}
        color={accent}
        maxWidth={width - 1}
        textAlign="center"
      >
        {room.title}
      </Text>}
      </>)}

      {room.loci.map((l) =>
        l.isPortable ? (
          <group key={`ped-${l.id}`} onClick={onSurfaceClick}>
            <Pedestal position={l.position} rotation={l.rotation} />
          </group>
        ) : (
          <Locus key={l.id} locus={l} accent={accent} position={l.position} rotation={l.rotation} withPedestal />
        ),
      )}
      {objects.map((o) => (
        <Locus
          key={o.locus.id}
          locus={o.locus}
          accent={accent}
          position={o.position}
          rotation={o.rotation}
          hidden={o.hidden}
        />
      ))}
      {room.portals.map((p) => (
        <Portal key={p.id} portal={p} accent={accent} />
      ))}
      {room.isHome && (
        <>
          <HomeLivingRoom />
          <group position={[4.9, 0, 3.8]}>
            <QuizStationPlaceholder accent={accent} />
          </group>
        </>
      )}
      {isWarehouse && <WarehouseRoom />}
      {isNeuroLab && <NeuroLabRoom pyramidalNeuron={room.loci.find((l) => l.label === "Pyramidenneuron")} />}
      {isTutorial && <TutorialRoom room={room} />}
    </group>
  );
}
