import { useStore } from "zustand";

import { xrStore } from "@/xr/xrStore";

/** HTML overlay button, hidden while an XR session is active. */
export function EnterVRButton() {
  const inSession = useStore(xrStore, (s) => s.session != null);
  if (inSession) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-8 z-10 flex justify-center">
      <button
        type="button"
        onClick={() => void xrStore.enterVR()}
        className="pointer-events-auto rounded-full bg-primary px-8 py-3 text-sm font-semibold tracking-wide text-primary-foreground shadow-lg transition-transform hover:scale-105"
      >
        Enter VR
      </button>
    </div>
  );
}
