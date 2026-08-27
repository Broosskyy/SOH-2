# V20.2.3 Critical Visual Runtime Fix

## P0 Fixes

### Island vertical stripes
- **Root cause:** `THREE.Sprite` with **negative X scale** (`seed%2 ? -baseWidth : baseWidth`) caused GPU billboard mirroring artifacts (vertical geometry smearing on mobile WebGL).
- **Fix:** Replaced island billboard `Sprite` with `PlaneGeometry` mesh; horizontal flip via `scale.x = -1` when needed (positive scale only).

### Player status L-shaped UI
- **Root cause:** `createHullWaterInteraction(..., subtle=true)` still added large **stern tube meshes** (cyan additive foam) that read as broken L-shaped brackets under the Kraken from the oblique camera.
- **Fix:** Subtle/imported-ship mode now uses only a small flat waterline ring. Player marker sprite redesigned (compact name + HP, bottom-anchored `center.set(0.5, 1)`).

### Kraken readability
- `tuneKrakenPlayerMaterial()` — higher emissive on dark/red surfaces without global exposure boost.
- Player-local fill lights (warm + cool rim).
- Scale **63** (moderate, within 60–66 target band).

## Geometry safety
- `app/game/visuals/geometrySafety.ts` — finite vertex checks, bounding sphere/box after procedural hull generation.

## Water / world
- Reduced coast cyan wash in ocean shader.
- Slightly increased open-ocean prop count.
- Serpent monster material toned down (less neon turquoise).

## Preserved from V20.2.2
- Navigation (`shipMovement.ts`), pinch zoom, camera settings, recenter, combat cluster HUD.

## Verify on device
```bash
npm run preview:web
```
Stop Wrangler before `npm run build`.
