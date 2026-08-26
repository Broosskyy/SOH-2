# V20.2 — Player Ship + Gameplay Visual Calibration

Runtime presentation pass for the existing `Kraken_ship_player_30k.glb` integration.
No geometry replacement, no gameplay physics changes.

## Final Kraken values

| Parameter | Value |
|-----------|-------|
| Asset | `Kraken_ship_player_30k.glb` |
| GLB local forward | +Z bow, +Y up |
| `MODEL_YAW_OFFSET` | `Math.PI / 2` (`KRAKEN_MODEL_YAW_OFFSET`) |
| Scale | `52` |
| Waterline offset | `20.5` |
| Wake origin offset | `{ forward: -58, lateral: 0 }` |

## White fan / wake

**Cause:** `HullWaterInteraction` additive foam tubes (bow fan + stern tubes) on the
player visual, combined with high-opacity stern `createWakePatch` samples.

**Fix:** Subtle stern-only hull foam for imported Kraken; no bow fan; reduced wake
patch opacity/width; player selection aura only visible while moving.

## Camera zoom bands

| Band | Zoom range | Purpose |
|------|------------|---------|
| OUT | 0.55–0.72 | Tactical overview |
| MID (master) | ~0.88–1.02 | Standard gameplay (default 0.96) |
| IN | 1.12–1.38 | Detail view |

## Debug overlay

Production builds hide `KRAKEN AKTIV` overlay. Local debug:
`?shipDebug=1` on localhost.
