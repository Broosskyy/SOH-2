# V20.3.2 Feature Migration Matrix

G0.3.3 evidence: Godot 4.7.2, GL Compatibility, build `0.3.3`.

| Feature | Status | G0.3.3 evidence / gap |
| --- | --- | --- |
| Movement | MIGRATED | Unchanged G0.3 navigation stack. |
| Camera / Zoom / Kraken lock | MIGRATED | Unchanged naval lock. |
| World Composition | PARTIAL | Spawn corridor, props, NPC lane. |
| Islands | PARTIAL | WorldScaleProfile; PROCEDURAL_FALLBACK policy. |
| Ports / Harbors | PARTIAL | Proxy + composition framing. |
| NPC Ships | PARTIAL | Patrol + HP world labels. |
| HUD | PARTIAL | Semantic sizing, target panel, combat placeholders. |
| Minimap | PARTIAL | Compass frame, harbors, region footer. |
| Target UI | PARTIAL | Presentation-only target card. |
| World props | PARTIAL | Buoy, wreck, barrel, beacon, crate. |
| Ocean / Wake | PARTIAL | Shader + ShipWake retained. |
| Combat logic | DEFERRED G0.4 | Disabled UI only. |
| Chat / Guild | NOT MIGRATED | Absent in B web source. |
| Mobile Web hardware | PARTIAL | **READY FOR G0.3.3 ACCEPTANCE**. |
| Automated Tests | MIGRATED | `godot-g0.3.3-presentation.test.mjs`. |

Status vocabulary: MIGRATED, PARTIAL, PREPARED, NOT MIGRATED, DEFERRED, OBSOLETE.
