# ADR-002: Fixed-oblique 2.5D naval camera

- Status: Accepted
- Date: 2026-08-25

## Context

Full 3D assets and effects are required for visual quality, but a conventional
third-person or freely orbiting camera would reduce tactical readability and
change the established Abyssal Dominion gameplay.

## Decision

Every client renders a 3D world while gameplay remains on the X/Z water plane.
The camera follows from one controlled oblique world-space direction. Player
input may zoom but cannot orbit, enter first person or move vertically. Bosses
and special events may only change camera distance/overview. Camera shake is
bounded and visual.

## Consequences

- Web, Android and iOS retain the same tactical naval game.
- 3D models, lighting, water, fog and VFX can improve independently.
- Picking, AI range, combat and collision share 2D plane math.
- Godot scenes must not infer a third-person controller from their 3D nodes.
- Any future cinematic camera must return to the binding gameplay composition
  and must not alter player navigation.

## Rejected alternatives

- Free orbit camera: harms consistent encounter readability.
- Behind-ship chase camera: changes the game into a ship simulator.
- First-person mode: incompatible with tactical target and hazard overview.
- Separate simplified mobile gameplay: fragments balance and cross-platform
  parity.
