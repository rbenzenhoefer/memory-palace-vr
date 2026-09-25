// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [
      {
        // The dev source-inspector tags JSX with data-tsd-source; on 3D (R3F) elements that attribute
        // is parsed as a nested property path and crashes hot updates. Strip it from 3D components.
        name: "strip-tsd-source-from-3d",
        enforce: "post",
        transform(code: string, id: string) {
          if (!/src\/components\/(palace|xr)\//.test(id) || !code.includes("data-tsd-source")) return;
          return {
            code: code
              .replace(/"data-tsd-source":\s*"[^"]*",?/g, "")
              .replace(/\sdata-tsd-source="[^"]*"/g, ""),
            map: null,
          };
        },
      },
    ],
    // Keep a single copy of react/three across r3f, drei and xr — duplicates crash the Canvas
    // with "resolveDispatcher().useMemo of null".
    resolve: {
      dedupe: [
        "react",
        "react-dom",
        "three",
        "@react-three/fiber",
        "@react-three/drei",
        "@react-three/xr",
      ],
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "three",
        "@react-three/fiber",
        "@react-three/drei",
        "@react-three/xr",
      ],
    },
  },
});
