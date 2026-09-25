import { useEffect, useState } from "react";
import { useStore } from "zustand";

import { BAR_ID } from "@/lib/palace/grab";
import { INVENTORY_SLOTS, usePalaceStore } from "@/state/palaceStore";
import { xrStore } from "@/xr/xrStore";

/** Desktop inventory: HTML bar with slots (hidden in VR, where the 3D belt is used). */
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
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-10 flex flex-col items-center gap-3">
      {held && (
        <p className="rounded-full bg-card/90 px-4 py-1.5 text-xs font-medium text-card-foreground shadow-lg outline outline-1 outline-border backdrop-blur-md transition-all">
          Ziehen zum Verstauen
        </p>
      )}
      <div className="group pointer-events-auto flex max-w-[95vw] flex-col items-center">
        <div
          id={BAR_ID}
          className={`flex gap-1.5 overflow-x-auto overflow-y-hidden rounded-2xl border bg-card/40 p-1.5 backdrop-blur-sm transition-all duration-500 ease-in-out hover:bg-card/90 hover:p-2.5 hover:backdrop-blur-xl ${
            flash ? "border-destructive bg-destructive/30" : over ? "border-primary ring-2 ring-primary/20" : "border-border shadow-lg"
          }`}
          style={{ scrollbarWidth: 'none' }}
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
                className={`flex shrink-0 flex-col items-center justify-center gap-1 rounded-xl border transition-all duration-300 ease-out ${
                  target
                    ? "h-16 w-20 border-primary bg-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                    : spec
                    ? "h-10 w-10 border-border bg-card/50 hover:bg-accent group-hover:h-16 group-hover:w-20"
                    : "h-8 w-8 border-dashed border-border/30 bg-transparent opacity-40 group-hover:h-16 group-hover:w-20 group-hover:opacity-100"
                }`}
              >
                {spec && (
                  <>
                    <span
                      className="h-4 w-4 rounded-full transition-all duration-300 group-hover:h-6 group-hover:w-6"
                      style={{ background: spec.primitive.color }}
                    />
                    <span className="hidden max-w-full truncate px-1 text-[10px] leading-tight text-card-foreground group-hover:block">
                      {spec.label}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
