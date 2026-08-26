# Abyssal Dominion – Cross-Platform Requirements

## Product statement

Abyssal Dominion is one landscape-first 2D/2.5D naval combat game with full 3D
rendering for Web, Android and iOS.
Gameplay rules, world definitions, progression, economy and save data use a
shared contract. Platform clients may adapt input, safe areas, graphics quality,
resolution, haptics and OS integration without forking game rules.

## Supported clients

| Client | V16 status | Rendering | Local save |
| --- | --- | --- | --- |
| Web | IMPLEMENTED | React HUD + Three.js world | IndexedDB repository |
| Godot Web | PREPARED | Godot 4 GL Compatibility | Godot local repository |
| Android | PREPARED | Godot 4 GL Compatibility | `user://profiles` |
| iOS | PREPARED | Godot 4 GL Compatibility | `user://profiles` |

## Shared gameplay contract

The canonical migration contract is `shared/game-data/catalog.v1.json`. It
covers ships, cannons, ammunition, harpoons, abilities, enemies, monsters,
bosses, maps, islands, missions, loot, decks, upgrades, economy, events and
progression. Engine objects, textures, React state and Godot nodes are forbidden
inside balancing definitions.

## Binding gameplay plane and camera

All navigation, collision, targeting, range and combat use the horizontal X/Z
water plane. Y remains a visual height axis. Every client uses the same
fixed-oblique perspective camera with bounded zoom, smooth follow, optional
boss/event overview and subtle bounded shake. Free orbit, first-person and
behind-ship third-person cameras are excluded. The complete acceptance contract
is `docs/GAMEPLAY_CAMERA_CONTRACT.md`.

## Logical input actions

Both clients expose the same actions: movement, steering, target selection,
target cycling, cannon fire, harpoon fire, three abilities, interaction,
navigation cancellation, zoom, map and shipyard. Web bindings live in
`app/game/input/actions.ts`; Godot bindings live in `godot/project.godot`.

## Mobile requirements

- Landscape-first at 16:9 through 21:9 and tablet ratios.
- UI respects OS safe areas, display cutouts and iPhone Dynamic Island.
- Primary fire and abilities remain thumb-reachable.
- Touch targets target at least 48 logical pixels.
- Virtual joystick produces the same steer/thrust actions as keyboard.
- Midrange devices target stable 30 FPS; high-end devices target 60 FPS.

## Quality profiles

LOW, MEDIUM, HIGH and ULTRA define render scale, shadows, particle budget,
water tessellation, reflection/post-processing capability, view distance, LOD,
effect complexity and texture quality. Web profiles are implemented in
`app/game/quality/qualityProfiles.ts`; matching Godot profiles are implemented
in `godot/scripts/quality/quality_manager.gd`.

## Save requirements

The save model is version 4 and independent of storage. V2 and V3 imports are
migrated without deleting player progress. Web uses `SaveGameRepository` backed
by IndexedDB. Godot has a corresponding repository contract and local JSON
implementation. Cloud synchronization remains a future adapter.
