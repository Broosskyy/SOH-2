# Abyssal Dominion Godot client

This directory is the Godot 4.7.2 Stable cross-platform migration client. Open
`project.godot`, run `Main.tscn`, and use WASD/arrow keys to sail. Mouse wheel
zooms. On touch devices, tap sets a destination, the left joystick pans the
camera and pinch controls zoom.

## Current status

- MIGRATED: X/Z ship movement, exact Kraken player visual, locked Perspective
  Naval camera, bounded zoom, floating player name/HP/shield, hybrid touch
  semantics, quality manager, debug overlay and Web/Windows export proof.
- PARTIAL/PREPARED: authored island WebP presentation over proxy landmasses,
  explicit Kraken LOD/texture strategy, save repository, shared data, Android
  export-only and iOS readiness.
- NOT YET MIGRATED: complete V20.3.2 combat, AI, maps, missions, economy and
  progression. See
  `../docs/godot-migration/V20_3_2_FEATURE_MIGRATION_MATRIX.md`.

Run `npm run sync:game-data` from the repository root after editing the shared
catalog. The generated `data/catalog.v1.json` is intentionally committed so a
fresh Godot checkout opens without a Node preparation step.

The camera is intentionally not an orbit or third-person chase controller.
`scripts/core/gameplay_plane.gd` and `scripts/camera/camera_controller.gd`
enforce the shared 2.5D contract described in
`../docs/GAMEPLAY_CAMERA_CONTRACT.md`.

Debug builds use F1–F10 for overlay, eight-way heading, camera/quality cycling,
presentation-anchor/forward/collision visualization, HUD/island bounds and
performance details.
