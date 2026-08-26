# V20 World Rendering Pass

V20 keeps the V19 simulation and replaces the most prototype-like presentation layers without a big-bang engine migration.

## Implemented

- The ocean is a lightweight animated Three.js mesh with multi-frequency vertex waves, procedural normal-like color breakup, crest light, glints and quality-dependent tessellation.
- Island positions and elliptical coast extents are passed to the ocean shader. Irregular turquoise shallows and a narrow foam transition now come from the water itself; gameplay colliders remain invisible.
- The previous broad solid shallow-water polygons and baked triangular ship wakes are removed.
- Islands retain their authored presentation art, but receive 3D perimeter rocks, local reef patches, shadows, harbor light and restrained modular prop clusters.
- Reusable 3D props cover rocks, reef rocks, buoys, crates, barrels, driftwood, wreckage, broken masts, piers and ruins.
- Player water interaction uses bow foam, stern foam, speed-driven opacity and sampled curved wake patches.
- Cannon shots receive flash, smoke, visible emissive projectiles and trails. Misses terminate in a water splash; confirmed hits retain hull/monster impact feedback.
- Camera zoom is continuous from close through combat to tactical. Camera angle remains fixed and camera pan remains separate from ship movement.
- Nameplates counter-scale within safe limits so tactical zoom preserves combat information.

## Deliberate constraints

The coastline shader uses eight island uniforms per map, matching the current content scale. It uses no screen-space reflection, refraction render target or expensive volumetric water. LOW quality reduces water segments and prop count. Gameplay positions remain on the XZ plane even while ships bob, pitch and roll visually.

## Compatibility

Combat, maps, missions, save/load, UI, camera joystick, touch navigation, enemy AI, monsters, events and progression remain in place. The generated GLBs contain no Three.js-only metadata and are mirrored into the Godot migration tree.

## Known visual limits

- Current island hero art remains sprite-based inside a 3D presentation shell. Fully modeled islands are a V21 content-production task.
- The generated Sovereign Frigate proves import, modular naming and LOD switching; it is a production-test asset, not final character art.
- Procedural water normals are shader-derived. Authored tileable normal textures may improve close zoom later, after device profiling.

## V21 recommendation

Create one production-quality vertical slice: final Sovereign Frigate, one modular tropical island/port kit and one enemy frigate, all authored from the V20 GLB/material rules. Validate silhouettes at the three zoom bands on midrange Android before expanding the asset catalog.
