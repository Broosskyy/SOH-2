# V20.3.2 Feature Migration Matrix

G0.3.2 evidence: Godot 4.7.2, GL Compatibility, build `0.3.2`.

| Feature | Status | G0.3.2 evidence / gap |
| --- | --- | --- |
| Movement | MIGRATED | Unchanged G0.3 navigation stack. |
| Camera / Zoom / Kraken lock | MIGRATED | Unchanged naval lock. |
| World Composition | PARTIAL | V20.3.2 Azurwacht positions; `visual_scale` 0.58 calibration. |
| Islands | PARTIAL | Solid mesh topology; shape variety; fan artifact fixed. |
| Ports / Harbors | PARTIAL | Coast berm + pier + warehouse + tower. |
| NPC Ships | PARTIAL | `NpcShipVisualBuilder` + wake; labels at gameplay distance. |
| HUD | PARTIAL | `HudLayout` responsive; mobile hides nav/combat stubs. |
| Minimap | PARTIAL | Responsive sizing; canvas marker draw. |
| Ocean / Wake | PARTIAL | Deeper shader tones + `ShipWake` trails. |
| Combat / Missions / Economy logic | NOT MIGRATED | UI stubs disabled; mission display-only. |
| Mobile Web hardware | PARTIAL | G0.3.1 issues addressed; **READY FOR G0.3.2 ACCEPTANCE**. |
| Automated Tests | MIGRATED | `godot-g0.3.2-presentation.test.mjs` added. |

Prior G0.3 / G0.3.1 rows remain valid where not superseded above.

Status vocabulary: MIGRATED, PARTIAL, PREPARED, NOT MIGRATED, DEFERRED, OBSOLETE.
