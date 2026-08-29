# V20.3.2 Feature Migration Matrix

This supersedes V15 status reporting for the current Godot migration target.

| Feature | Status | G0.1 evidence / gap |
| --- | --- | --- |
| Movement | MIGRATED | CharacterBody3D X/Z movement and fixed water Y. |
| Turning | MIGRATED | Continuous Y rotation; gameplay forward is `-Z`. |
| Camera | MIGRATED | Fixed world-space naval follow with three profiles. |
| Zoom | MIGRATED | Bounded wheel/action zoom. |
| Kraken Player Ship | MIGRATED | Exact GLB under `VisualRoot`; placeholder removed. |
| World Composition | PARTIAL | Macro-first proxy region/islands/POI. |
| Player Nameplate | MIGRATED | Screen-space projected HUD. |
| HP | MIGRATED | Catalog-backed player bar foundation. |
| Shield | MIGRATED | Catalog-backed player bar foundation. |
| Combat | NOT MIGRATED | Input actions prepared only. |
| NPC Ships | PREPARED | Reusable compact floating-HUD architecture; no NPC actor. |
| Monsters | NOT MIGRATED | Assets/catalog only. |
| Maps | NOT MIGRATED | Test region only. |
| Islands | PARTIAL | Two clean proxy islands; no production GLBs. |
| Ports | PARTIAL | Proxy harbor POI only. |
| Missions | NOT MIGRATED | Catalog only. |
| Progression | NOT MIGRATED | Catalog/save foundation only. |
| Economy | NOT MIGRATED | Catalog only. |
| Save | PREPARED | Portable repository and fresh-save model; no full migration. |
| HUD | PARTIAL | Floating player status and debug overlay; complete game HUD absent. |
| Touch Input | PARTIAL | Safe-area UI and command routing; real-device Web/native validation pending. |
| Desktop Input | MIGRATED | WASD/arrows/zoom/fire/abilities preserved. |
| Quality Profiles | MIGRATED | LOW/MEDIUM/HIGH/ULTRA and platform recommendations. |
| Debug | MIGRATED | Metrics, visual toggles, camera/quality cycling and 8-way heading. |
| Web Export | MIGRATED | 4.7.2 build and desktop browser boot proof. |
| Android Export | PARTIAL | Debug APK produced; device runtime pending. |

Status vocabulary: MIGRATED, PARTIAL, PREPARED, NOT MIGRATED, NOT APPLICABLE.
