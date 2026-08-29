import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("G0.3.1 build marker and version (historical docs)", async () => {
  const report = await read("docs/godot-migration/G0.3.1_REPORT.md");
  const capture = await read("godot/scripts/debug/qa_capture.gd");
  assert.match(report, /G0\.3\.1/);
  assert.match(capture, /artifacts\/godot-g0\.3\.2/);
});

test("visual and collision separation — no production debug slabs", async () => {
  const root = await read("godot/scripts/islands/island_root.gd");
  const builder = await read("godot/scripts/islands/island_visual_builder.gd");
  assert.match(root, /IslandVisualBuilder\.build_into/);
  assert.match(root, /build_debug_footprint/);
  assert.match(root, /set_debug_bounds_visible/);
  assert.doesNotMatch(root, /CylinderMesh\.new\(\)/);
  assert.match(builder, /build_debug_footprint/);
  assert.doesNotMatch(builder, /SHADING_MODE_UNSHADED[\s\S]*visual_root/);
});

test("island profile shape and size metadata contract", async () => {
  const profile = await read("godot/scripts/islands/island_presentation_profile.gd");
  const factory = await read("godot/scripts/region/aster_region_factory.gd");
  assert.match(profile, /enum ShapeClass/);
  assert.match(profile, /shape_class/);
  assert.match(profile, /lod_policy/);
  assert.match(profile, /harbor_sockets|harbor_anchor/);
  assert.match(factory, /ShapeClass\.HARBOR/);
  assert.match(factory, /_catalog\(/);
});

test("island visual scale sanity uses gameplay footprint", async () => {
  const builder = await read("godot/scripts/islands/island_visual_builder.gd");
  const profile = await read("godot/scripts/islands/island_presentation_profile.gd");
  assert.match(builder, /gameplay_radius_x/);
  assert.match(builder, /visual_scale/);
  assert.match(profile, /footprint_radius/);
});

test("ship presentation profiles and NPC visual builder", async () => {
  const kraken = await read("godot/data/kraken_presentation_profile.tres");
  const manifest = await read("godot/assets/ships/kraken/manifest.json");
  const npcBuilder = await read("godot/scripts/ships/npc_ship_visual_builder.gd");
  const npc = await read("godot/scripts/npc/npc_ship.gd");
  assert.match(kraken, /visual_scale = 52\.0/);
  assert.match(kraken, /waterline_offset = 20\.5/);
  assert.match(manifest, /kraken_fury/);
  assert.match(npcBuilder, /class_name NpcShipVisualBuilder/);
  assert.match(npc, /NpcShipVisualBuilder\.build_into/);
});

test("minimap data mapping foundation", async () => {
  const minimap = await read("godot/scripts/ui/minimap.gd");
  const world = await read("godot/scenes/world/World.tscn");
  assert.match(minimap, /class_name Minimap/);
  assert.match(minimap, /map_data/);
  assert.match(minimap, /island_entities/);
  assert.match(minimap, /npc_ships/);
  assert.match(world, /GameplayHUD/);
  assert.match(world, /Minimap/);
});

test("HUD responsive contract", async () => {
  const hud = await read("godot/scripts/ui/gameplay_hud.gd");
  assert.match(hud, /class_name GameplayHud/);
  assert.match(hud, /PlatformService\.safe_rect/);
  assert.match(hud, /RUMPF/);
  assert.match(hud, /AKTIVE MISSION/);
  assert.match(hud, /disabled = true/);
});

test("label declutter policy", async () => {
  const labels = await read("godot/scripts/ui/world_label_service.gd");
  assert.match(labels, /DECLUTTER_DISTANCE/);
  assert.match(labels, /MAX_VISIBLE_DISTANCE/);
  assert.match(labels, /_overlaps_existing/);
});

test("Mobile Web shadow regression remains", async () => {
  const quality = await read("godot/scripts/quality/quality_manager.gd");
  const world = await read("godot/scripts/world/world.gd");
  assert.match(quality, /apply_directional_shadows/);
  assert.match(world, /apply_directional_shadows/);
});

test("TEMP_REFERENCE exclusion in production world", async () => {
  const world = await read("godot/scenes/world/World.tscn");
  const islandRoot = await read("godot/scripts/islands/island_root.gd");
  assert.doesNotMatch(world, /TEMP_REFERENCE/);
  assert.doesNotMatch(islandRoot, /TEMP_REFERENCE/);
});

test("V20.3.2 aster region content recovery", async () => {
  const factory = await read("godot/scripts/region/aster_region_factory.gd");
  assert.match(factory, /harbor_aster/);
  assert.match(factory, /glass_reef/);
  assert.match(factory, /sun_rest/);
  assert.match(factory, /watch_cliff/);
  assert.match(factory, /hostile_raider/);
  assert.match(factory, /neutral_escort/);
  assert.match(factory, /x - 1500\.0/);
});

test("G0.3.1 documentation set exists", async () => {
  const docs = [
    "docs/godot-migration/G0.3.1_REFERENCE_HIERARCHY.md",
    "docs/godot-migration/G0.3.1_V20_3_2_PRESENTATION_AUDIT.md",
    "docs/godot-migration/G0.3.1_TARGET_VISUAL_FOUNDATION.md",
    "docs/godot-migration/G0.3.1_ISLAND_ASSET_CONTRACT.md",
    "docs/godot-migration/G0.3.1_SHIP_ASSET_CONTRACT.md",
    "docs/godot-migration/G0.3.1_HUD_MINIMAP.md",
    "docs/godot-migration/G0.3.1_MOBILE_HARDWARE.md",
    "docs/godot-migration/G0.3.1_REPORT.md",
  ];
  for (const doc of docs) {
    const content = await read(doc);
    assert.ok(content.length > 100, `${doc} should be populated`);
  }
});
