# Memory Palace VR

Build a WebXR VR app called "Memory Palace VR" with React, Vite and TypeScript.

Tech stack (use exactly these):
- three, @react-three/fiber, @react-three/drei
- @react-three/xr (latest, v6 API: createXRStore, , , )
- zustand for global state

Architecture rules (important, we will extend this later):
- ONE 

 for the whole app that is always mounted. Never unmount it and never use route changes for navigation inside VR, otherwise the XR session ends.
- Create src/xr/xrStore.ts: const xrStore = createXRStore({ controller: { teleportPointer: true }, hand: { teleportPointer: true } })
- Create src/state/palaceStore.ts (zustand) with: currentRoomSlug (default "home"), goToRoom(slug), playerPosition (Vector3), setPlayerPosition.
- src/components/xr/XRScene.tsx: 

 ->  ->  + scene content.
- An HTML overlay button "Enter VR" (calls xrStore.enterVR()), bottom center, only visible when not in VR.
- Desktop fallback: when not in VR, use drei OrbitControls with target at eye height (1.6 m) so we can test with mouse.

For now render only a test scene:
- a 10x10 m floor wrapped in 
- ambient light + one directional light
- a floating blue cube at (0, 1.5, -2) that changes color when clicked (use onClick, which must also work with VR controller pointers)

Keep components small and typed. No backend yet.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/539bac8f-162c-4f5e-aa99-639b66dfc4b3).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
