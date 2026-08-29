# V20.3.2 Feature Migration Matrix

This supersedes V15 status reporting for the current Godot migration target.
G0.2 evidence is based on `134b4b4`, Godot 4.7.2 and GL Compatibility.

| Feature | Status | G0.2 evidence / gap |
| --- | --- | --- |
| Movement | MIGRATED | Desktop WASD direct steer; mobile planar destination travel. |
| Turning | MIGRATED | Continuous Y rotation; gameplay forward is `-Z`. |
| Camera | MIGRATED | Perspective Naval production lock: FOV 35, height 560, back 360, lateral -58, target `(0,12,-52)`. |
| Zoom | MIGRATED | Production range 0.55–1.38; wheel/actions and mobile pinch semantics. |
| Kraken Player Ship | MIGRATED | Source GLB presentation locked at scale 52, yaw 180, waterline 20.5 and wake stern local `+Z` 58. |
| Kraken Optimization | PARTIAL | Source profiled; importer generation enabled but no explicit LOD files. Status `LOD=STRATEGY`; Blender/`gltfpack` unavailable. |
| World Composition | PARTIAL | Authored WebP presentation over retained proxy world geometry. |
| Player Nameplate | MIGRATED | Screen-space projected HUD; north/south clearance corrected to anchor 68/gap 10. |
| HP | MIGRATED | Catalog-backed player bar foundation. |
| Shield | MIGRATED | Catalog-backed player bar foundation. |
| Combat | NOT MIGRATED | Input actions prepared only. |
| NPC Ships | PREPARED | Reusable compact floating-HUD architecture; no NPC actor. |
| Monsters | NOT MIGRATED | Assets/catalog only. |
| Maps | NOT MIGRATED | Test region only. |
| Islands | PARTIAL | Tropical/storm/abyss authored WebP presentations; small/medium scenes retain proxy landmasses and are not final real 3D assets. |
| Ports | PARTIAL | Proxy harbor POI only; no authored harbor GLB exists. |
| Missions | NOT MIGRATED | Catalog only. |
| Progression | NOT MIGRATED | Catalog/save foundation only. |
| Economy | NOT MIGRATED | Catalog only. |
| Save | PREPARED | Portable repository and fresh-save model; no full migration. |
| HUD | PARTIAL | Floating player status/debug overlay and shared safe areas; complete game HUD absent. |
| Touch Input | PARTIAL | Final semantics: tap destination, left camera-pan joystick, pinch zoom. Basic planar navigation only; physical hardware validation pending. |
| Desktop Input | MIGRATED | WASD/arrows/zoom/fire/abilities preserved. |
| Quality Profiles | MIGRATED | LOW/MEDIUM/HIGH/ULTRA and platform recommendations. |
| Debug | MIGRATED | Metrics, visual toggles, camera/quality cycling and 8-way heading. |
| Web Export | MIGRATED | Fresh 58,596,400-byte export; desktop WebGL2 runtime and non-black captures pass at three aspect ratios. LOW Mobile Web remains over 35 MiB. |
| Mobile Web | PARTIAL | Three touch-emulated sizes boot with WebGL2 and five touch points; hardware NOT TESTED. Black live-runtime captures are `CAPTURE_UNRELIABLE`. |
| Android Export | PARTIAL | 48,688,433-byte APK exported; hardware NOT TESTED because no physical device or `adb` is available. |
| iOS | PREPARED | Hardware NOT TESTED; required host unavailable. |
| Automated Tests | MIGRATED | 84 Node tests pass; TypeScript, focused ESLint and Godot editor/runtime validation pass. |

Status vocabulary: MIGRATED, PARTIAL, PREPARED, NOT MIGRATED, NOT APPLICABLE.
