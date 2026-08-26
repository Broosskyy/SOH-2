# Abyssal Dominion 3D Asset Pipeline

## Canonical format and folders

Use glTF 2.0 binary (`.glb`). Source art may live in Blender, but runtime assets must be engine-neutral.

```text
assets/3d/
  ships/
  enemy-ships/
  bosses/
  monsters/
  islands/
  ports/
  rocks/
  reefs/
  wrecks/
  props/
  buildings/
  ruins/
  vfx/
  materials/
```

The browser publishes this tree below `public/assets/3d/`. Godot-ready copies live below `godot/assets/` until the engine migration is completed.

## Coordinates and naming

- Units: meters; `1.0` equals one meter.
- Up axis: `+Y`.
- Forward: `+X` (ship bow).
- Gameplay plane: `XZ`; waterline at local `Y=0`.
- Pivot: centered on the waterline near the center of buoyancy.
- Filenames and node names: lowercase kebab-case for files, descriptive modular node names such as `hull`, `deck`, `mast_1`, `sail_1`, `cannon_port_1`.
- Collision: separate simple convex meshes named `COL_*`; never use render LOD0 as mobile collision.

## Budgets

| Asset | LOD0 | LOD1 | LOD2 | Texture set |
|---|---:|---:|---:|---:|
| Hero/player ship | 35k–65k tris | 15k–28k | 4k–10k | max 2K |
| Enemy ship | 20k–40k | 9k–18k | 3k–7k | max 1K–2K |
| Boss/monster | 45k–80k | 20k–35k | 7k–14k | max 2K |
| Island module | 15k–35k | 7k–16k | 2k–6k | max 2K atlas |
| Small prop | 300–3k | 150–1.5k | 60–600 | 512–1K atlas |

LOD0, LOD1 and LOD2 are required for important assets. Baseline switch distances are 0, 700 and 1200 world units, multiplied by the active quality tier's LOD bias. Author silhouettes first; do not preserve invisible rigging or interior geometry in lower LODs.

## Materials

Use metallic/roughness PBR, baked AO, restrained normal intensity and few shared materials. Prefer packed ORM textures and atlases. Mobile defaults to 1K; only hero assets may use 2K. Avoid transmission, per-material shader hacks and baked Three.js behavior. The canonical numeric presets are in `stylized-naval-materials.v1.json`.

## Validation

1. Apply transforms and triangulate.
2. Confirm waterline pivot, +X bow and +Y up.
3. Check names, material count, texture dimensions and UVs.
4. Export GLB with embedded or approved relative textures.
5. Load in the browser GLTFLoader and Godot importer.
6. Inspect close, combat and tactical silhouettes.
7. Profile LOW and MEDIUM on a midrange mobile device.

The V20 generator `scripts/generate-v20-hero-ship.mjs` is reproducible proof of the pipeline and emits all three Sovereign Frigate LODs.
