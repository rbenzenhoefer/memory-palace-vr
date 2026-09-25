import { useEffect, useState } from "react";
import { useStore } from "zustand";

import { BAR_ID } from "@/lib/palace/grab";
import { INVENTORY_SLOTS, usePalaceStore } from "@/state/palaceStore";
import { xrStore } from "@/xr/xrStore";

/** Desktop inventory: HTML bar with 6 slots (hidden in VR, where the 3D belt is used). */
export function InventoryBar() {
  const inSession = useStore(xrStore, (s) => s.session != null);
  const inventory = usePalaceStore((s) => s.inventory);
  const specs = usePalaceStore((s) => s.carriedSpecs);
  const held = usePalaceStore((s) => s.heldLocusId);
  const flashAt = usePalaceStore((s) => s.beltFlashAt);
  const retrieve = usePalaceStore((s) => s.retrieve);
  const [flash, setFlash] = useState(false);
  const [over, setOver] = useState(false);

  useEffect(() => {
    if (!flashAt) return;
    setFlash(true);
    const t = window.setTimeout(() => setFlash(false), 600);
    return () => window.clearTimeout(t);
  }, [flashAt]);

  useEffect(() => {
    if (!held) return setOver(false);
    const onMove = (e: PointerEvent) => {
      const el = document.getElementById(BAR_ID);
      if (!el) return;
      const r = el.getBoundingClientRect();
      setOver(e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [held]);

  if (inSession) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-10 flex flex-col items-center gap-2">
      {held && (
        <p className="rounded-full bg-card/80 px-3 py-1 text-xs text-card-foreground backdrop-blur">
          Klicke auf den Boden oder einen Sockel zum Ablegen – oder hierher ziehen zum Verstauen
        </p>
      )}
      <div
        id={BAR_ID}
        className={`pointer-events-auto flex gap-2 rounded-2xl border bg-card/80 p-2 backdrop-blur transition-colors ${
          flash ? "border-destructive bg-destructive/30" : over ? "border-primary" : "border-border"
        }`}
      >
        {Array.from({ length: INVENTORY_SLOTS }, (_, i) => {
          const id = inventory[i];
          const spec = id ? specs[id] : undefined;
          const target = over && i === inventory.length;
          return (
            <button
              key={i}
              type="button"
              disabled={!spec}
              onClick={() => id && retrieve(id)}
              title={spec?.label}
              className={`flex h-14 w-16 flex-col items-center justify-center gap-1 rounded-xl border text-[10px] leading-tight transition-colors ${
                target ? "border-primary bg-primary/20" : spec ? "border-border hover:bg-accent" : "border-dashed border-border/60"
              }`}
            >
              {spec && (
                <>
                  <span className="h-5 w-5 rounded-full" style={{ background: spec.primitive.color }} />
                  <span className="max-w-full truncate px-1 text-card-foreground">{spec.label}</span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
