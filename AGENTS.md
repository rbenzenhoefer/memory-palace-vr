<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Palace destinations are data-driven rooms inside the single persistent XR Canvas, because browser-route changes would interrupt active VR sessions.
- Import writes require an authenticated `admin` row in `user_roles`, because public clients may only read learning objects and models.

- Keep the Golden Hour home interior's architectural furnishings, window landscape, and material textures scoped to `HomeLivingRoom`; the shared room renderer and single XR canvas must preserve all other rooms and interactions.
- Keep the biology-labor architecture, furnishings, and lighting scoped to `NeuroLabRoom`; this preserves the shared renderer and every other palace room.
- Tutorial progress is session-only and centrally managed; real Locus click/drop events advance it so 3D interactions remain the source of truth.
