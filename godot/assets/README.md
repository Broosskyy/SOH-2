# 3D asset pipeline

Production assets use glTF 2.0 / GLB. Keep source DCC files outside runtime
folders and export optimized runtime files into the category directories below.

- `ships/player`, `ships/enemy`
- `monsters`, `bosses`
- `world/islands`, `world/ports`, `world/ruins`, `world/rocks`, `world/wrecks`
- `props`, `loot`, `vfx`

Each gameplay asset can provide `lod0.glb`, `lod1.glb`, `lod2.glb` and optional
`lod3.glb`. Mobile import profiles should prefer compressed textures, merged
materials, instancing and reduced skin/bone counts.

