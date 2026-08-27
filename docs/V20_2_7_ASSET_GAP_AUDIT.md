# V20.2.7 Asset Gap Audit

| SYSTEM | CURRENT IMPLEMENTATION | QUALITY LIMIT | KEEP / IMPROVE / REPLACE | RECOMMENDED ASSET | PRIORITY |
|--------|------------------------|---------------|--------------------------|-------------------|----------|
| Kraken (player) | GLB `Kraken_ship_player_30k.glb`, tuned materials + fill/rim lights | Dark hull can merge with water at MID on mobile; silhouette depends on lighting | **KEEP** + improve lighting/scale | Existing GLB; optional emissive accent texture pass | P1 |
| NPC ships | Procedural faceted hull + deck + sails | Readable at distance but below mockup ship fidelity; limited silhouette variety | **IMPROVE** code first; **REPLACE** for hero NPC classes | 6-class GLB set: Small Raider, Brig, Frigate, Heavy Warship, Merchant, Elite/Boss | P0 |
| Islands | Billboard/plane art + shallow disc + foam ring | Good smear fix; limited 3D depth and shoreline interaction | **KEEP** short-term; **REPLACE** for landmark ports | Modular island kit (terrain/coast/rock/nature/structures) | P1 |
| Ports | Island plane + pier prop + buoys | Functional, not mockup-grade harbor density | **IMPROVE** composition + shoreline shader | Modular pier/dock/hut kit | P1 |
| Rocks | Procedural low-poly clusters | Adequate ambient filler | **KEEP** | Optional small rock GLB cluster set | P2 |
| Reefs | Flat disc meshes | Reads as tint patches only | **IMPROVE** shader mask + **REPLACE** selectively | Reef rock GLB clusters | P2 |
| Lighthouse | Procedural prop | Iconic but simple | **KEEP** | Dedicated lighthouse GLB | P2 |
| Piers | Procedural pier prop | Works for ports | **KEEP** | Pier module GLB | P2 |
| Wrecks | Procedural mast/hull fragments | Readable wreck beats, not hero wrecks | **KEEP** | Wreck fragment GLBs | P2 |
| Loot | Procedural chest mesh | Clear pickup, low poly | **KEEP** | Optional chest/crate GLBs | P2 |
| Monsters (serpent/leviathan) | Procedural tube/segment geometry | Boss-readable, not cinematic | **IMPROVE** materials/VFX; **REPLACE** later | Rigged sea monster GLB | P1 |
| Ambient props | Procedural crates/barrels/buoys/masts | Good density tier system | **KEEP** | Small prop GLB pack | P2 |
| Water | Custom shader (macro/mid/micro noise, fresnel, shoreline foam) | Strong stylized base; no FFT simulation needed | **IMPROVE** in shader | No new 3D asset required | P0 |

## Prioritized 3D Asset List

### P0

| Asset Name | Purpose | Approx Scale | Format | Animation | LOD | Material Notes |
|------------|---------|--------------|--------|-----------|-----|----------------|
| NPC Small Raider | Common hostile patrol | 18–24 m gameplay length | GLB | No | Yes (3) | Sail color variants, faction flags |
| NPC Brig | Mid-tier combat | 28–36 m | GLB | No | Yes | Warm wood + red sail accents |
| NPC Frigate | Standard warship | 40–52 m | GLB | No | Yes | Higher sail count, emissive windows |
| NPC Heavy Warship | Elite/boss hull | 56–72 m | GLB | No | Yes | Dark hull, gold trim |
| NPC Merchant | Neutral/cargo | 34–44 m | GLB | No | Yes | Bulky cargo deck, muted sails |
| NPC Elite Hull | Boss encounters | 64–80 m | GLB | Optional wake rig | Yes | Strong silhouette, emissive accents |

### P1

| Asset Name | Purpose | Approx Scale | Format | Animation | LOD | Material Notes |
|------------|---------|--------------|--------|-----------|-----|----------------|
| Island Terrain Modules | Composable landmass bases | 120–420 m | GLB | No | Yes | Tropical/storm/abyss palettes |
| Coast Modules | Beach/cliff transitions | 40–120 m | GLB | No | No | Shore foam mask compatible |
| Sea Serpent / Leviathan | World monster hero | 80–140 m | GLB | Swim idle + attack | Yes | Emissive eyes/tentacles |
| Pier / Dock Kit | Port landmarks | 30–90 m | GLB | No | No | Wood + rope detail |

### P2

| Asset Name | Purpose | Approx Scale | Format | Animation | LOD | Material Notes |
|------------|---------|--------------|--------|-----------|-----|----------------|
| Rock Cluster Set | Reef/shore dressing | 4–18 m | GLB | No | No | Shared atlas |
| Loot Chest / Crate | Pickups | 1–3 m | GLB | Optional lid | No | Emissive rarity variants |
| Wreck Fragments | Encounter dressing | 6–24 m | GLB | No | No | Weathered wood/metal |
| Lighthouse | Landmark prop | 24–40 m | GLB | Optional beacon | Yes | Emissive lantern |
