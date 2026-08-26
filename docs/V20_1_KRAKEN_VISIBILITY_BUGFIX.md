# Abyssal Dominion V20.1 - Kraken Visibility Bugfix

## Reported Failure

On a real device the gameplay map continued to render the brown procedural/V20 player ship. The supplied `Kraken_ship_player_30k.glb` was present in the package but was not the active player visual.

## Root Cause

### Active-ship routing bug found during the second real-device retest

The GLB loader and stable scene graph worked, but the Kraken template was only
registered for the internal `sovereign` ShipId. Existing saves can have
`tempest`, `ironclad` or `arcanum` selected. In that case the runtime correctly
loaded and cached the Kraken, then `ensurePlayerShip()` selected the procedural
visual belonging to the active saved ShipId. This exactly explains a successful
GLB load alongside the still-visible brown player ship.

V20.1 now routes all four current player ShipIds to the unchanged Kraken visual.
The ShipId itself is not replaced: it continues to control gameplay data, save
state, movement and combat. This is only the intended single-asset visual test.

The first V20.1 integration treated the visual and gameplay player as the same mutable Three.js object. It initially added a procedural `this.player` and later replaced that complete root asynchronously after `GLTFLoader.loadAsync()` resolved. Player reconciliation, map retention and the render loop also owned that root reference. The path had no stable visual attachment point and no post-attach scene-graph verification, so a fallback root could remain or become active again without a detectable failure.

The hidden 2D logic canvas was inspected and excluded: it is constrained to 1x1 px with zero opacity. The visible brown ship came from the Three.js player fallback.

## Fix

The gameplay transform now remains permanent:

```text
PlayerShipRoot
  PlayerShipVisualRoot
    ShipVisual_kraken-player-30k
      ImportedKrakenMesh
      HullWaterInteraction
```

Only `PlayerShipVisualRoot` is replaced. On successful Kraken load it is cleared before the imported visual is attached, so the fallback cannot remain as a sibling. Switching ship/deck state reuses the same stable gameplay root.

The loader now:

1. Resolves the asset URL from `document.baseURI`.
2. Fetches it and reports the concrete HTTP error on failure.
3. Verifies the binary `glTF` header.
4. Parses the exact ArrayBuffer with `GLTFLoader.parseAsync()`.
5. Attaches the configured Kraken visual.
6. Verifies imported mesh count, bounds, parent relationships and fallback absence.

The existing scale `48`, Y rotation `+PI/2`, waterline `+22.5`, wake offset and cannon hardpoints are unchanged. Movement, combat, hitboxes, HP, controls, camera, zoom, enemies, islands, UI and balancing are unchanged.

After loading, the template is registered for `sovereign`, `tempest`,
`ironclad` and `arcanum`, then attached to whichever ShipId is currently active.
Changing/reconciling the saved ShipId clones the same imported visual instead of
recreating a procedural player ship.

## Runtime Evidence

A browser runtime check used the same built-in GLTF loader and exact production asset path:

```json
{
  "status": "Kraken GLB loaded -> mesh attached -> fallback hidden",
  "httpStatus": 200,
  "bytes": 21394148,
  "meshes": 1,
  "fallbackPresent": false,
  "sceneGraph": {
    "playerRoot": "PlayerShipRoot",
    "visualRoot": "PlayerShipVisualRoot",
    "children": ["ImportedKrakenMesh"]
  },
  "bounds": [0.6832529306, 1.2843599916, 1.9988939166]
}
```

The shipped gameplay runtime publishes the latest proof as `window.__ABYSSAL_PLAYER_VISUAL__` and dispatches `abyssal:player-visual-status`. A successful attachment logs:

```text
[Abyssal][PlayerVisual] Kraken GLB loaded -> mesh attached -> fallback hidden
[Abyssal][PlayerVisual] Kraken assigned to active saved player ship
[Abyssal][PlayerVisual] Kraken follows gameplay PlayerShipRoot
```

The proof now also contains `activeShipId`, `playerWorldPosition` and
`visualBoundsCenter`. These values distinguish an incorrect ShipId route from a
mesh that is attached but spatially displaced.

Failure keeps the fallback and logs the HTTP/parse/scene-graph error explicitly.

### Real-device diagnostic revision

After a further real-device report, the GLB failure state was found to be
immediately overwritten by the subsequently loaded fallback state. The game now
keeps and displays the concrete Kraken error after fallback recovery. During
this V20.1 diagnostic revision the gameplay map shows one compact status panel:

- `KRAKEN WIRD GELADEN`
- `KRAKEN AKTIV`
- `KRAKEN-LADEFEHLER`
- `PLAYER-FALLBACK`

The panel includes active ShipId, imported mesh count, fallback presence and the
player/visual XZ positions. Asset requests use a V20.1 cache-busting URL,
`cache: no-store`, and try both the document-base and origin-root asset paths.
This prevents a stale failed request or a subpath deployment from silently
looking like a successful current build.

## Visibility Safeguards

- Imported nodes and meshes are forced visible.
- The Kraken hero mesh uses `frustumCulled = false` to exclude bad imported bounds as a visibility cause.
- The configured model scale, position, rotation and materials remain intact.
- The PlayerShipRoot continues receiving the existing gameplay position, heading, bobbing, wake and combat behavior.

## Verification

- TypeScript: passed
- ESLint: passed
- Full production build: passed
- Automated tests: 7/7 passed
- Artifact validation: passed
- Kraken GLB in build: 21,394,148 bytes
- Browser GLB request/parse/attach check: passed
- Runtime scene-graph proof: passed
- Fallback absence after attachment: passed

The available cloud browser has WebGL disabled at browser policy level, so it cannot produce a truthful integrated gameplay screenshot. No isolated GLB render was used as gameplay acceptance. Final visual gameplay confirmation therefore remains the real-device retest of this corrected build.
