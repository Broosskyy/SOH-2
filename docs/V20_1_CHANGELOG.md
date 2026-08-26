# Abyssal Dominion V20.1 Changelog

## Added

- Exact Meshy `Kraken_ship_player_30k.glb` as the primary Sovereign player visual.
- Reusable `ShipVisualDefinition` data for asset path, orientation, scale, waterline, wake, cannon hardpoints and shadow behavior.
- Non-destructive Meshy material tuning for stylized PBR rendering.
- Local development visual debug markers via `?shipDebug=1`.
- Mirrored Web/Godot Kraken asset manifests and asset copies.
- Automated V20.1 asset, configuration, fallback and packaging checks.

## Changed

- Player wake now originates from the configured stern attachment.
- Player muzzle flashes use visual port/starboard hardpoints.
- Bugfix: player gameplay transform and visual representation now use separate stable roots.
- Bugfix: successful Kraken attachment clears the previous fallback visual and verifies the resulting scene graph.
- GLB loading now logs concrete request, parse and attachment failures and exposes runtime proof through `window.__ABYSSAL_PLAYER_VISUAL__`.
- Bugfix: the Kraken test visual is now assigned to every current player ShipId, so persisted `tempest`, `ironclad` and `arcanum` selections no longer restore a procedural player visual.
- Runtime proof now reports the active ShipId, gameplay-root position and imported visual bounds center.
- Device-diagnostic revision: Kraken errors are no longer overwritten by fallback recovery, stale asset caches are bypassed, root/base asset paths are attempted, and the current loader/attachment state is shown directly on the gameplay map.

## Preserved

- Movement, steering, collision, combat, projectiles, damage, targeting, AI, missions, loot, progression, saves, travel, respawn, touch and zoom logic.
- V20 Sovereign GLB LOD set and procedural player ship as fallback visuals.

## Known Issues

- The 4096x4096 metallic-roughness PNG is expensive for mobile texture memory.
- Physical Android/iOS profiling and integrated WebGL screenshots remain required because the automated cloud browser disables WebGL.
- V20.1 intentionally uses no Kraken LOD switching.
