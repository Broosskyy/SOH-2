# M0 — Clean Native Foundation

## Why this restart happened

The G0.x migration accumulated Web-first presentation layers, responsive HUD solvers, containment passes, and deferred UI reflow chains. Real Samsung hardware still failed visual acceptance. M0 establishes a **clean native-first Godot foundation** without deleting Git history.

## Platform priority

1. Android (primary hardware gate)
2. iOS / iPadOS
3. Windows / macOS / Linux
4. Web (preview / remote review only)

Native runtime quality has priority over browser-specific workarounds.

## Mobile orientation

**Landscape only** for gameplay. No portrait gameplay UI in M0.

## Architecture

```
Boot.tscn → Game.tscn
  ├── World (Ocean, Sun, PlayerShip)
  ├── NavalCameraRig
  └── MinimalDebugHUD
```

Input flow:

```
DesktopInputSource / MobileInputSource → PlayerCommand → PlayerShipController
```

## Preserved assets

- `godot/assets/ships/player/kraken/Kraken_ship_player_30k.glb` (source unmodified)
- Kraken presentation reference: scale 52, waterline 20.5, forward +Z

## Intentionally excluded (M0)

Full HUD, quests, combat, NPCs, islands, chat, minimap, progression, Web viewport contract, legacy G0.x HUD systems.

## Android hardware acceptance

Status: **READY_FOR_REAL_ANDROID_M0_TEST**

`HARDWARE_PASS` requires real APK install and manual verification on Android hardware.

## Web preview

Secondary target. Build marker: `M0-CLEAN-NATIVE-FOUNDATION`

Serve via existing HTTPS tooling on port 8062 when available.
