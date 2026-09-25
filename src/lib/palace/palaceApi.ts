// The ONLY module that talks to the database. Maps snake_case rows to camelCase specs.
import { supabase } from "@/integrations/supabase/client";
import type {
  AssetStatus,
  CardSource,
  LocusSpec,
  PortalSpec,
  PrimitiveSpec,
  RoomLayout,
  RoomSpec,
  RoomSummary,
  RoomTheme,
  Vec3,
} from "./types";

const toVec3 = (v: unknown): Vec3 =>
  Array.isArray(v) && v.length === 3 ? [Number(v[0]), Number(v[1]), Number(v[2])] : [0, 0, 0];

const ROOM_SELECT = `
  id, slug, title, description, is_home, theme, layout,
  loci (
    id, order_index, label, position, rotation, scale, primitive, is_portable,
    asset:assets ( id, name, url, status, default_scale ),
    cards ( id, front, back, extra, source, external_id )
  ),
  portals!portals_from_room_id_fkey (
    id, position, rotation, label,
    to_room:rooms!portals_to_room_id_fkey ( slug, title )
  )
`;

export async function fetchRoom(slug: string): Promise<RoomSpec> {
  const { data, error } = await supabase
    .from("rooms")
    .select(ROOM_SELECT)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error(`Room "${slug}" not found`);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = data as any;

  const loci: LocusSpec[] = (row.loci ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((l: any): LocusSpec => ({
      id: l.id,
      orderIndex: l.order_index,
      label: l.label,
      position: toVec3(l.position),
      rotation: toVec3(l.rotation),
      scale: l.scale,
      primitive: l.primitive as PrimitiveSpec,
      isPortable: !!l.is_portable,
      asset: l.asset
        ? {
            id: l.asset.id,
            name: l.asset.name,
            url: l.asset.url,
            status: l.asset.status as AssetStatus,
            defaultScale: l.asset.default_scale,
          }
        : null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cards: (l.cards ?? []).map((c: any) => ({
        id: c.id,
        front: c.front,
        back: c.back,
        extra: c.extra,
        source: c.source as CardSource,
        externalId: c.external_id,
      })),
    }))
    .sort((a: LocusSpec, b: LocusSpec) => a.orderIndex - b.orderIndex);

  const portals: PortalSpec[] = (row.portals ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((p: any) => p.to_room)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((p: any) => ({
      id: p.id,
      position: toVec3(p.position),
      rotation: toVec3(p.rotation),
      label: p.label,
      toRoom: { slug: p.to_room.slug, title: p.to_room.title },
    }));

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    isHome: row.is_home,
    theme: (row.theme ?? {}) as RoomTheme,
    layout: (row.layout ?? {}) as RoomLayout,
    loci,
    portals,
  };
}

export async function fetchRooms(): Promise<RoomSummary[]> {
  const { data, error } = await supabase
    .from("rooms")
    .select("id, slug, title, description, is_home")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    description: r.description,
    isHome: r.is_home,
  }));
}
