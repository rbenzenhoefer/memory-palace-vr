// Shared, non-reactive grab state (mutated every frame — kept out of zustand on purpose).
import { Euler, Object3D, Quaternion, Ray, Raycaster, Vector3, type Scene } from "three";

import { usePalaceStore } from "@/state/palaceStore";
import type { LocusSpec } from "@/lib/palace/types";

export interface ActiveGrab {
  pointerId: number;
  ray: Ray;
  distance: number;
  /** Object rotation relative to the ray orientation at grab time. */
  rotOffset: Quaternion;
  ownerId: string;
  /** Live controller/hand pose. Desktop pointers leave this unset. */
  handPosition: Vector3 | undefined;
  handQuaternion: Quaternion | undefined;
}

export const grab: {
  active: ActiveGrab | null;
  held: Object3D | null;
  belt: Object3D | null;
  hoveredPortable: LocusSpec | null;
} = { active: null, held: null, belt: null, hoveredPortable: null };

const FORWARD = new Vector3(0, 0, -1);
const tmpQ = new Quaternion();

export function rayQuaternion(ray: Ray, out = new Quaternion()) {
  return out.setFromUnitVectors(FORWARD, ray.direction.clone().normalize());
}

export function beginGrab(opts: {
  pointerId: number;
  ray: Ray;
  distance: number;
  objectQuat: Quaternion;
  ownerId: string;
  handPosition?: Vector3 | undefined;
  handQuaternion?: Quaternion | undefined;
}) {
  const rq = opts.handQuaternion ?? rayQuaternion(opts.ray, tmpQ);
  grab.active = {
    pointerId: opts.pointerId,
    ray: opts.ray.clone(),
    distance: Math.min(1.5, Math.max(0.4, opts.distance)),
    rotOffset: rq.clone().invert().multiply(opts.objectQuat),
    ownerId: opts.ownerId,
    handPosition: opts.handPosition?.clone(),
    handQuaternion: opts.handQuaternion?.clone(),
  };
}

export const BAR_ID = "inventory-bar";

function overDesktopBar(client?: { x: number; y: number }) {
  if (!client) return false;
  const el = document.getElementById(BAR_ID);
  if (!el) return false;
  const r = el.getBoundingClientRect();
  return client.x >= r.left && client.x <= r.right && client.y >= r.top && client.y <= r.bottom;
}

export function heldOverBelt() {
  if (!grab.held || !grab.belt) return false;
  const a = grab.held.getWorldPosition(new Vector3());
  const b = grab.belt.getWorldPosition(new Vector3());
  return a.distanceTo(b) < 0.4;
}

const raycaster = new Raycaster();
const DOWN = new Vector3(0, -1, 0);

function excluded(o: Object3D | null): boolean {
  for (let p = o; p; p = p.parent) {
    if (!p.visible || p.userData['noDrop'] || p === grab.held || p === grab.belt) return true;
  }
  return false;
}

/** Highest upward-facing solid surface below `origin` (floor, furniture, shelves, other objects). */
export function findSurfaceBelow(scene: Scene, origin: Vector3): Vector3 | null {
  raycaster.set(origin, DOWN);
  raycaster.far = 6;
  for (const hit of raycaster.intersectObjects(scene.children, true)) {
    const o = hit.object;
    if (excluded(o)) continue;
    const isSurface = !!o.userData['dropSurface'];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mat = (o as any).material;
    if (!isSurface && mat && !Array.isArray(mat) && mat.transparent && mat.opacity < 0.1) continue;
    if (hit.face) {
      const n = hit.face.normal.clone().transformDirection(o.matrixWorld);
      if (Math.abs(n.y) < 0.5) continue; // walls, panels, signs
    }
    return hit.point.clone();
  }
  return null;
}

/** Release the held object: stow on belt, drop on the surface below, or return it. */
export function releaseHeld(scene: Scene, client?: { x: number; y: number }) {
  grab.active = null;
  const store = usePalaceStore.getState();
  const id = store.heldLocusId;
  if (!id) return;
  if (heldOverBelt() || overDesktopBar(client)) {
    if (store.stow(id)) return;
  }
  if (!grab.held) return store.cancelHold();
  const origin = grab.held.getWorldPosition(new Vector3()).add(new Vector3(0, 0.05, 0));
  const hit = findSurfaceBelow(scene, origin);
  if (!hit) return store.cancelHold();
  const yaw = new Euler().setFromQuaternion(grab.held.getWorldQuaternion(new Quaternion()), "YXZ").y;
  store.drop(store.currentRoomSlug, [hit.x, hit.y, hit.z], [0, yaw, 0]);
}

/** Minecraft-"Q": put the selected inventory item ~45 cm in front of the viewer. */
export function dropSelectedInFront(scene: Scene, camera: Object3D) {
  const head = camera.getWorldPosition(new Vector3());
  const fwd = camera.getWorldDirection(new Vector3()).setY(0);
  if (fwd.lengthSq() < 1e-6) fwd.set(0, 0, -1);
  fwd.normalize();
  const origin = head.clone().addScaledVector(fwd, 0.45);
  const hit = findSurfaceBelow(scene, origin) ?? new Vector3(origin.x, 0, origin.z);
  const yaw = Math.atan2(-fwd.x, -fwd.z) + Math.PI; // face the viewer
  const s = usePalaceStore.getState();
  return s.dropSelectedAt(s.currentRoomSlug, [hit.x, hit.y, hit.z], [0, yaw, 0]);
}
