import { createFileRoute } from "@tanstack/react-router";

import { EnterVRButton } from "@/components/xr/EnterVRButton";
import { XRScene } from "@/components/xr/XRScene";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Memory Palace VR — Walk Through Your Memories" },
      {
        name: "description",
        content:
          "Memory Palace VR is a WebXR space where you build rooms of memories and explore them in virtual reality.",
      },
      { property: "og:title", content: "Memory Palace VR — Walk Through Your Memories" },
      {
        property: "og:description",
        content:
          "Step into a virtual memory palace: teleport between rooms and place the things you want to remember.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="fixed inset-0 bg-background">
      <XRScene />
      <EnterVRButton />
      <div className="pointer-events-none fixed left-6 top-6 z-10">
        <h1 className="text-lg font-semibold text-foreground">Memory Palace VR</h1>
        <p className="text-xs text-muted-foreground">
          Drag to look around, click the cube, or enter VR.
        </p>
      </div>
    </main>
  );
}
