# V16 Change Log

## V16.1 binding 2.5D camera update

- Added one shared fixed-oblique camera policy for the Web renderer.
- Web boss selection and the Abyss event map widen overview without changing
  the viewing angle; important impacts may trigger bounded visual shake.
- Added an explicit X/Z gameplay-plane helper to Godot and forced the player
  ship back to water height before and after physics movement.
- Replaced the Godot camera foundation with a fixed world-space follow rig,
  bounded zoom, boss/event overview hooks and bounded shake.
- Added machine-readable presentation rules to the shared catalog.
- Added ADR-002, a binding gameplay/camera contract and regression tests that
  reject orbit/third-person drift.

## Web client — IMPLEMENTED

- V15 gameplay, maps, ships, combat, shop, shipyard, cauldron, missions,
  progression, event and responsive landscape HUD preserved.
- `app/page.tsx` made readable and reduced in responsibility through extracted
  runtime state, math, combat calculations, economy pricing, mission rewards,
  logical input, quality and save modules.
- Input now resolves logical actions before gameplay handlers. Desktop and
  touch controls operate on the same realtime state.
- LOW/MEDIUM/HIGH/ULTRA plus AUTO quality selection added to the inventory.
- Three.js uses the selected render scale, shadow budget, water tessellation,
  view distance and device recommendation.
- Shipyard art uses optimized Next Image delivery.
- Save schema advanced to V4 while preserving V2/V3 migration, IndexedDB,
  import, export and reset.

## Shared contract — PREPARED

- `shared/game-data/catalog.v1.json` contains the engine-neutral migration
  contract for ships, weapons, entities, maps, missions, loot, economy,
  progression, events and asset slots.
- `npm run sync:game-data` deterministically copies the catalog into Godot.
- Rendering nodes, React objects and Three.js objects are absent from the
  balancing contract.

## Godot client — PREPARED / minimal slice MIGRATED

- Valid Godot 4 project structure, main scene and world scene created.
- Minimal ocean, procedural placeholder ship, X/Z CharacterBody3D movement and
  fixed-oblique follow camera created.
- Matching InputMap, mobile virtual-joystick foundation, touch combat buttons,
  platform detection and safe-area access created.
- Quality manager, GameState autoload and local save repository contract added.
- Web, Android and iOS export presets and GLB/LOD asset folders added.

## Explicitly not completed

- V15 combat, AI, missions, map travel, port/shipyard UI and progression are not
  yet fully running in Godot.
- Android/iOS export presets do not equal signed store-ready builds.
- Production GLB assets, native device QA, cloud save and multiplayer remain
  open.
