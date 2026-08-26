# Godot Cross-Platform Migration

## Migration strategy

V16 avoids a big-bang rewrite. The React/Three.js game remains the functional
reference while Godot receives one vertical slice at a time. A feature is only
marked MIGRATED after behavior, balancing, save effects and input have been
tested in Godot.

## V16 Godot baseline

The `godot/` directory is an actual Godot 4 project and contains:

- main and world scenes;
- a controllable `CharacterBody3D` player ship;
- fixed-oblique following `Camera3D` with bounded zoom, boss/event overview and
  camera-shake hooks;
- binding X/Z gameplay-plane utility and enforced ship water height;
- ocean surface and lighting;
- desktop keyboard/mouse InputMap;
- mobile touch/virtual-joystick foundation and combat buttons;
- platform detection and safe-area access;
- LOW/MEDIUM/HIGH/ULTRA quality manager;
- game-state singleton and engine-neutral catalog loader;
- save repository contract and local `user://` implementation;
- Web, Android and iOS export preset foundations;
- GLB/LOD asset folder conventions.

This is PREPARED plus a minimal playable movement slice. It is not a completed
port of V15 combat, enemies, missions, UI or progression.

The 3D scene does not authorize third-person gameplay. ADR-002 and
`GAMEPLAY_CAMERA_CONTRACT.md` are binding for every future migration slice.

## Port sequence

1. Make `catalog.v1.json` the only balancing source and add schema checks.
2. Port destination navigation and island collision.
3. Port target selection, cannon/harpoon combat and projectiles.
4. Port NPC/monster state machines, loot and respawn.
5. Port HUD, map, missions, port, shipyard, cauldron and event panels.
6. Port Save V4 completely and add Web-to-Godot save import.
7. Replace placeholders with optimized GLB LOD assets.
8. Validate Godot Web, Android and iOS exports on target devices.

## Definition of done per feature

A feature is MIGRATED only when its Godot implementation uses shared data,
supports applicable desktop/touch actions, preserves intended V15 outcomes,
persists where applicable and passes parser/runtime acceptance tests.

Android export requires Godot Android templates and the Android SDK. iOS export
requires macOS, Xcode and Apple signing. Godot Web is a separate client build;
the currently deployed Web game still uses Three.js.
