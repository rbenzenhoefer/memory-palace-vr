export type Vec3 = [number, number, number];

export type RoomSource = "manual" | "ai" | "anki";
export type AssetSource = "meshy" | "primitive" | "upload";
export type AssetStatus = "pending" | "ready" | "failed";
export type CardSource = "manual" | "anki" | "ai";

export interface RoomTheme {
  floorColor?: string;
  wallColor?: string;
  accentColor?: string;
  skyColor?: string;
}

export interface RoomLayout {
  width?: number;
  depth?: number;
  height?: number;
  spawn?: Vec3;
}

export interface PrimitiveSpec {
  shape: string;
  color: string;
}

export interface AssetSpec {
  id: string;
  name: string;
  url: string | null;
  status: AssetStatus;
  defaultScale: number;
}

export interface CardSpec {
  id: string;
  front: string;
  back: string;
  extra: string | null;
  source: CardSource;
  externalId: string | null;
}

export interface LocusSpec {
  id: string;
  orderIndex: number;
  label: string;
  position: Vec3;
  rotation: Vec3;
  scale: number;
  primitive: PrimitiveSpec;
  isPortable: boolean;
  asset: AssetSpec | null;
  cards: CardSpec[];
}

export interface PortalSpec {
  id: string;
  position: Vec3;
  rotation: Vec3;
  label: string | null;
  toRoom: { slug: string; title: string };
}

export interface RoomSpec {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  isHome: boolean;
  theme: RoomTheme;
  layout: RoomLayout;
  loci: LocusSpec[];
  portals: PortalSpec[];
}

export interface RoomSummary {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  isHome: boolean;
}
