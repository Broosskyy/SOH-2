# V20.2.2 Mobile Gameplay Calibration

Targeted mobile gameplay control, navigation, camera, HUD and visual calibration pass. Not a rebuild.

## Scope

- Pinch-to-zoom with sensitivity setting
- Camera pan joystick with configurable speed
- Recenter camera on player ship (no teleport)
- Settings panel (camera speed, zoom sensitivity, graphics quality)
- Ship movement steering improvements + island detour + stuck recovery
- Combat HUD cluster layout (no overlap)
- Kraken screen presence calibration (scale 60, waterline 22, wake -62)
- Water variation + open-ocean prop density

## Verification

Run:

```bash
npm run typecheck
npm run test:architecture
node --test tests/ship-movement.test.mjs
npm run build
```

Preview on smartphone or LAN:

```bash
npm run preview:web
```

Manual visual verification on a real device is required for final acceptance (Kraken size, HUD, pinch zoom feel, navigation feel).

## Kraken values (V20.2.2)

| Parameter | Value |
|-----------|-------|
| Scale | 60 |
| MODEL_YAW_OFFSET | π/2 |
| Waterline offset | 22 |
| Wake origin | forward -62 |

## Camera

| Setting | Value |
|---------|-------|
| minZoom | 0.55 |
| maxZoom | 1.38 |
| default zoom | 1.0 |
| Pan speeds | slow 520 / normal 760 / fast 1080 |
| Zoom sensitivity | low 0.82 / normal 1 / high 1.22 |
