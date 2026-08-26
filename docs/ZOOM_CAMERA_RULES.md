# Zoom and Camera Rules

The camera is a controlled fixed-oblique perspective camera. It never orbits and never becomes a third-person chase camera. The ship and all tactical interactions remain on the horizontal XZ water plane.

| Visual band | Approx. zoom | Purpose |
|---|---:|---|
| Tactical | 0.52–0.75 | map reading, approach and threat overview |
| Combat | 0.76–1.15 | default navigation and fighting |
| Close | 1.16–1.42 | ship, wake and material inspection |

These are presentation bands, not hard modes. Zoom is continuous and softly interpolated by the renderer.

## Input

- Desktop: mouse wheel and `+` / `-` actions.
- Touch/tablet: genuine two-pointer pinch distance.
- One-finger tap/click: select enemy or set a travel destination.
- Camera joystick: pans the map only; it does not steer the ship. Centering it returns focus to the player.

Pinch suppresses tap navigation until all gesture pointers are released. Browser-native page zoom/pan is disabled only on the game canvas.

## Readability

Player and enemy labels counter-scale within bounded limits. Selection and destination markers remain visible at tactical zoom. Close zoom may reveal richer effects; tactical zoom may reduce particles and model LOD but cannot hide hostile state or current target information.
