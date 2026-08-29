# V20.3.2 Feature Migration Matrix

G0.3 evidence: Godot 4.7.2, GL Compatibility, build `0.3.0`.

| Feature | Status | G0.3 evidence / gap |
| --- | --- | --- |
| Movement | MIGRATED | Desktop WASD; mobile tap destination via `NavigationController`. |
| Turning | MIGRATED | Continuous Y rotation; gameplay forward `-Z`. |
| Camera | MIGRATED | Perspective Naval lock preserved (FOV 35, height 560, back 360, lateral -58). |
| Zoom | MIGRATED | 0.55–1.38; wheel + pinch. |
| Kraken Player Ship | MIGRATED | `ShipPresentationProfile` + `PlayerShip` → `ShipEntity`. |
| Kraken Optimization | PARTIAL | Importer LOD strategy; no external LOD files. |
| World Composition | PARTIAL | Data-driven `aster_g03` region; macro-first layout. |
| Player Nameplate | MIGRATED | Floating HUD anchor 68 / gap 10. |
| HP | PARTIAL | `HealthComponent`; no combat damage loop. |
| Shield | MIGRATED | Catalog-backed HUD presentation. |
| Combat | NOT MIGRATED | Weapon anchors + `ObjectPool` prepared only. |
| NPC Ships | PARTIAL | `NpcShip` + spawner; patrol + detection; no combat AI. |
| Monsters | NOT MIGRATED | Catalog only. |
| Maps / Regions | PARTIAL | `RegionDefinition` + `RegionRuntime`; one playable region. |
| Islands | PARTIAL | Proxy geometry SMALL/MEDIUM/LANDMARK; WebP removed from production. |
| Ports / Harbors | PARTIAL | `HarborState` approach/enter/leave foundation. |
| POIs | PARTIAL | Definitions + world labels. |
| Missions | NOT MIGRATED | Catalog only. |
| Progression | NOT MIGRATED | Save/catalog foundation. |
| Economy | NOT MIGRATED | Deferred. |
| Save | PREPARED | `LocalSaveRepository`. |
| HUD | PARTIAL | Player HUD + world labels + target reticle; harbor prompt minimal. |
| Touch Input | PARTIAL | Hybrid tap nav / camera pan / pinch; hardware retest pending. |
| Desktop Input | MIGRATED | WASD, target cycle, interact. |
| Quality Profiles | MIGRATED | LOW/MEDIUM/HIGH/ULTRA + shadow sync regression fix. |
| Debug | MIGRATED | G0.3 overlay metrics + QA capture paths. |
| Web Export | MIGRATED | Fresh 60,247,322-byte export; runtime QA PASS. |
| Mobile Web | PARTIAL | Emulation PASS; hardware READY FOR RETEST. |
| Android Export | PARTIAL | APK export available; device NOT TESTED. |
| iOS | PREPARED | Architecture ready; no Apple toolchain verification. |
| Automated Tests | MIGRATED | G0.2 + G0.3 Godot contract tests + QA tools. |

Status vocabulary: MIGRATED, PARTIAL, PREPARED, NOT MIGRATED, DEFERRED, OBSOLETE.
