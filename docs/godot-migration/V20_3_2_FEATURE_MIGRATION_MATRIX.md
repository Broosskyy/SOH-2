# V20.3.2 Feature Migration Matrix

G0.3.1 evidence: Godot 4.7.2, GL Compatibility, build `0.3.1`.

| Feature | Status | G0.3.1 evidence / gap |
| --- | --- | --- |
| Movement | MIGRATED | Unchanged G0.3 navigation stack. |
| Camera / Zoom / Kraken lock | MIGRATED | Unchanged naval lock. |
| World Composition | PARTIAL | V20.3.2 Azurwacht positions; 7 islands + 4 NPC groups + loot POIs. |
| Islands | PARTIAL | `IslandVisualBuilder` temp silhouettes; shape/size contract; no visible debug slabs. |
| Ports / Harbors | PARTIAL | `HarborVisualBuilder` pier + structures. |
| NPC Ships | PARTIAL | `NpcShipVisualBuilder` + wake; catalog names/levels on labels. |
| HUD | PARTIAL | `GameplayHud` top/mission/action layout; combat disabled. |
| Minimap | PARTIAL | `Minimap` 2D player-centered chart. |
| Ocean / Wake | PARTIAL | Shader tonal water + `ShipWake` trails. |
| Combat / Missions / Economy logic | NOT MIGRATED | UI stubs or display-only. |
| Mobile Web hardware | PARTIAL | Group A slab issue addressed; **READY FOR RETEST**. |
| Automated Tests | MIGRATED | `godot-g0.3.1-presentation.test.mjs` added. |

Prior G0.3 rows remain valid where not superseded above.

Status vocabulary: MIGRATED, PARTIAL, PREPARED, NOT MIGRATED, DEFERRED, OBSOLETE.
