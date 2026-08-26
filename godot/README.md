# Abyssal Dominion Godot client

This directory is the Godot 4.x cross-platform migration client. Open
`project.godot`, run `Main.tscn`, and use WASD/arrow keys to sail. Mouse wheel
zooms. On touch devices the mobile control layer activates automatically.

## Current status

- MIGRATED: X/Z ship movement, fixed-oblique follow camera, bounded zoom and
  quality manager.
- PREPARED: touch actions, save repository, platform detection, shared data,
  Web/Android/iOS export presets and GLB/LOD folders.
- NOT YET MIGRATED: complete V15 combat, AI, maps, UI, missions, economy and
  progression. See `../docs/V15_FEATURE_MIGRATION_MATRIX.md`.

Run `npm run sync:game-data` from the repository root after editing the shared
catalog. The generated `data/catalog.v1.json` is intentionally committed so a
fresh Godot checkout opens without a Node preparation step.

The camera is intentionally not an orbit or third-person chase controller.
`scripts/core/gameplay_plane.gd` and `scripts/camera/camera_controller.gd`
enforce the shared 2.5D contract described in
`../docs/GAMEPLAY_CAMERA_CONTRACT.md`.
