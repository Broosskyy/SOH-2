# V20.2.4 — Gameplay Presentation & World Density

## Scope

Visual presentation pass on top of V20.2.3 fixes (island PlaneGeometry, player label, Kraken tuning).

## World density

- `worldPropDensity` per quality profile (LOW … ULTRA)
- `resolveWorldDensityCounts()` in `app/game/visuals/worldDensity.ts`
- Tiered island props, shoreline rings, open-ocean props (incl. lighthouse)
- Map area scaling for open-ocean placement

## NPC ships

- Procedural NPC hulls only (no enemy GLB pipeline yet)
- `SHIP_MAP_SCALE` 0.88, subtle hostile waterline ring, improved sail emissive
- `userData.proceduralShip` for debug

## Kraken

- Scale 64, fill/rim lights slightly stronger

## Water / islands

- Ocean shader: streak noise, deeper variation, controlled coast foam
- Island shallow disc under billboards, quality-scaled rock count

## HUD

- Visible `+` / `−` zoom controls (pinch unchanged)

## Debug

- `?visualDebug=1` on localhost → `window.__ABYSSAL_VISUAL_DEBUG__`
