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

export interface LocusObjectManifestEntry {
  id: number;
  question: string;
  answer: string;
  locus: string;
  file: string;
  triangles: number;
}

export interface LocusObjectImportResult {
  cardIndex: number;
  file: string;
  ok: boolean;
  message: string;
}

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

export interface ShelfObjectSpec {
  id: number;
  cardIndex: number;
  question: string;
  answer: string;
  locusSlug: string;
  slotIndex: number;
  url: string;
}

export async function fetchLocusObjects(room: string): Promise<ShelfObjectSpec[]> {
  const { data, error } = await supabase
    .from("locus_objects")
    .select("id, card_index, question, answer, locus_slug, glb_path, slot_index")
    .eq("room", room)
    .not("slot_index", "is", null)
    .order("card_index", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    cardIndex: r.card_index,
    question: r.question,
    answer: r.answer,
    locusSlug: r.locus_slug,
    slotIndex: r.slot_index as number,
    url: supabase.storage.from("locus-objects").getPublicUrl(r.glb_path).data.publicUrl,
  }));
}

export async function getLocusImportAccess(): Promise<{
  signedIn: boolean;
  isAdmin: boolean;
  email: string | null;
}> {
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return { signedIn: false, isAdmin: false, email: null };

  const { data: role } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  return { signedIn: true, isAdmin: !!role, email: user.email ?? null };
}

export async function importLocusObjects(
  manifest: LocusObjectManifestEntry[],
  files: File[],
): Promise<LocusObjectImportResult[]> {
  const filesByName = new Map(files.map((file) => [file.name, file]));
  const results: LocusObjectImportResult[] = [];

  for (const entry of manifest) {
    const file = filesByName.get(entry.file);
    if (!file) {
      results.push({ cardIndex: entry.id, file: entry.file, ok: false, message: "GLB-Datei fehlt" });
      continue;
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `neuro/${entry.id}-${Date.now()}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from("locus-objects")
      .upload(path, file, { contentType: "model/gltf-binary", upsert: false });

    if (uploadError) {
      results.push({ cardIndex: entry.id, file: entry.file, ok: false, message: uploadError.message });
      continue;
    }

    const { error: insertError } = await supabase.from("locus_objects").insert({
      card_index: entry.id,
      question: entry.question,
      answer: entry.answer,
      locus_slug: entry.locus,
      glb_path: path,
      room: "neuro",
      slot_index: entry.id - 1,
    });

    if (insertError) {
      await supabase.storage.from("locus-objects").remove([path]);
      results.push({ cardIndex: entry.id, file: entry.file, ok: false, message: insertError.message });
      continue;
    }

    results.push({ cardIndex: entry.id, file: entry.file, ok: true, message: "Importiert" });
  }

  return results;
}
