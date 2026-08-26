# Platform-neutral game data

`catalog.v1.json` is the engine-neutral migration contract for the current V15
balancing. It contains no Three.js objects, React state, Godot nodes, textures,
or scene references. Web keeps using the existing typed TypeScript catalog for
V16 stability; changes must be mirrored here until the JSON catalog becomes the
single generated source in the next migration slice.

Run `npm run sync:game-data` before packaging to copy the catalog into the
Godot project. Godot reads the exported copy from `res://data/catalog.v1.json`.

The catalog also carries the binding presentation contract: full 3D rendering,
X/Z naval gameplay, Y as a visual-only height axis and a fixed-oblique camera
without orbit, chase or first-person modes.
