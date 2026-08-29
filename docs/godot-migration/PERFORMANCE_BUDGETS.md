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

## G0.2 final measurement

Baseline: `134b4b4`. The final Web export and runtime were regenerated after
the G0.2 implementation.

| Artifact | G0.1 | G0.2 current | Change |
| --- | ---: | ---: | ---: |
| Total Web export | 55,878,544 bytes | 58,596,400 bytes | +2,717,856 bytes |
| PCK | 17,593,900 bytes | 20,311,756 bytes | +2,717,856 bytes |
| WASM | 37,902,138 bytes | 37,902,138 bytes | 0 |
| Other | 382,506 bytes | 382,506 bytes | 0 |

The increase is due to authored world assets and code in the PCK. At 55.88 MiB,
the current total remains **OVER BUDGET** for the LOW Mobile Web 35 MiB initial
download target.

Using the prior ~17,467,686-byte imported-cache measurement, Kraken represents
approximately 86% of the current PCK. `all_resources` is retained for now
because dynamic catalog/filter selection can make export-time resource
stripping unsafe. Transition requires an inventory of dynamic resources,
explicit references or a generated include manifest, authored LODs and texture
variants, then PCK/runtime comparison before resource filtering is enabled.

Native capture-overlay samples reported about 37.8 MiB static memory, 30–60 FPS
and 30–74 draw calls across LOW/HIGH presentation scenes. These are Windows
capture-time observations, not Mobile Web hardware measurements. Desktop Web
rendered non-black at 1280×720, 1920×1080 and 2400×1080; physical mobile memory,
frame-time and thermal measurements remain unavailable.

## Kraken LOD roadmap

- LOD0: current 30,744-triangle hero mesh for near/native desktop presentation.
- LOD1: target 12k–18k triangles, 2048² maximum textures, normal gameplay and
  mobile native.
- LOD2: target 4k–8k triangles, 1024² maximum textures, distant ships and
  Mobile Web.

LOD transitions must preserve bow/stern identity and all eight QA silhouettes.
No destructive source replacement is authorized without side-by-side captures.

The Godot importer currently has `generate_lods = true`, but no explicit LOD
files exist. Blender and `gltfpack` were unavailable for G0.2, so the source is
preserved and current optimization status is **LOD=STRATEGY**, not complete.

## Texture strategy

Retain mipmaps. Evaluate ETC2/ASTC and Basis Universal per export target,
downsize the 4096² metallic/roughness texture, and consider channel repacking.
Keep the original GLB as source/rollback material until visual parity is proven.
