# Godot Performance Budgets

These are scene-level planning ceilings, not measured promises. LOW is the
mandatory optimization baseline.

| Category | LOW — Mobile Web | MEDIUM — Android/iOS | HIGH — Desktop Web | ULTRA — Desktop Native |
| --- | ---: | ---: | ---: | ---: |
| Frame time | ≤33.3 ms | ≤16.7 ms | ≤16.7 ms | ≤11.1 ms |
| Draw calls | ≤250 | ≤400 | ≤700 | ≤1,200 |
| Visible triangles | ≤500k | ≤1.0M | ≤2.0M | ≤4.0M |
| Visible ships | 8 | 15 | 25 | 40 |
| Visible islands | 4 | 6 | 10 | 16 |
| Active particles | 200 | 500 | 1,200 | 2,500 |
| Shadowed lights | 0 | 1 directional | 1 directional | 1 directional + 2 local |
| Dynamic lights | ≤1 | ≤2 | ≤4 | ≤8 |
| Texture memory | ≤128 MiB | ≤256 MiB | ≤512 MiB | ≤1 GiB |
| Loaded asset memory | ≤180 MiB | ≤350 MiB | ≤700 MiB | ≤1.5 GiB |
| Initial Web download | ≤35 MiB | N/A | ≤60 MiB | N/A |
| Runtime memory | ≤512 MiB | ≤768 MiB | ≤1 GiB | ≤2 GiB |

## G0.1 measurement

- Web build total: 55,878,544 bytes (53.29 MiB).
- WebAssembly runtime: 37,902,138 bytes (36.14 MiB).
- PCK: 17,593,900 bytes (16.78 MiB).
- Imported Kraken scene + textures: 17,467,686 bytes (16.66 MiB), about
  99.3% of the PCK.
- Source Kraken GLB: 21,394,148 bytes (20.40 MiB).
- Source texture dimensions: base color 2048²; metallic/roughness 4096².
- Estimated RGBA8 mipmapped texture memory: about 106.7 MiB before
  platform-specific GPU compression.
- Manifest geometry: 30,744 triangles, 53,674 vertices, one mesh/material/draw.

The LOW initial-download target is currently missed. The engine WASM is fixed
overhead for this export; Kraken LOD/texture work is required before Mobile Web
performance lock.

## Kraken LOD roadmap

- LOD0: current 30,744-triangle hero mesh for near/native desktop presentation.
- LOD1: target 12k–18k triangles, 2048² maximum textures, normal gameplay and
  mobile native.
- LOD2: target 4k–8k triangles, 1024² maximum textures, distant ships and
  Mobile Web.

LOD transitions must preserve bow/stern identity and all eight QA silhouettes.
No destructive source replacement is authorized without side-by-side captures.

## Texture strategy

Retain mipmaps. Evaluate ETC2/ASTC and Basis Universal per export target,
downsize the 4096² metallic/roughness texture, and consider channel repacking.
Keep the original GLB as source/rollback material until visual parity is proven.
