# ADR-001: Godot 4 as the shared game client

- Status: Accepted
- Date: 2026-08-25

## Context

V15 is a functional Web game built with React and Three.js and cannot be
discarded. Native Android and iOS need better input, rendering, performance and
platform integration than a permanent thin Web wrapper provides.

## Decision

Godot 4.x becomes the target client for Godot Web, Android and iOS. The current
Web client remains operational during migration and acts as gameplay,
balancing, visual and regression reference. Shared engine-neutral JSON plus
versioned save contracts separate domain data from both engines.

Godot starts with GL Compatibility for broad Web/mobile support. Production 3D
assets use glTF 2.0/GLB with LOD0–LOD2 and optional LOD3.

Godot's 3D renderer does not change the game into a free third-person
experience. ADR-002 fixes navigation/combat to X/Z and the gameplay camera to a
controlled oblique perspective shared by Web, Android and iOS.

## Consequences

- Migration is reviewable feature by feature without losing V15.
- Two render clients exist during transition.
- Shared data must be synchronized and validated.
- Android and iOS are PREPARED, not shipped, until signed device tests pass.
- Multiplayer, accounts and cloud saves remain replaceable boundaries.

## Rejected alternatives

- Immediate rewrite: unacceptable regression risk.
- Permanent WebView wrapper: misses the native performance goal.
- Independent platform forks: fragments balancing and gameplay.
