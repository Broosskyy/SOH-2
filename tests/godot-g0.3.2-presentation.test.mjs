import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("G0.3.2 build marker and version (historical)", async () => {
  const report = await read("docs/godot-migration/G0.3.2_REPORT.md");
  const capture = await read("godot/scripts/debug/qa_capture.gd");
  assert.match(report, /G0\.3\.2/);
  assert.match(capture, /artifacts\/godot-g0\.3\.3/);
});

test("diagnostic overlay gated on diag query flag for Web", async () => {
  const overlay = await read("godot/scripts/debug/debug_overlay.gd");
  assert.match(overlay, /MobileWebDiagnostics\.query_flag\("diag"\)/);
  assert.match(overlay, /OS\.get_name\(\) != "Web"/);
});

test("island mesh validity — no center fan vertex", async () => {
  const builder = await read("godot/scripts/islands/island_visual_builder.gd");
  assert.match(builder, /_make_solid_island_mesh/);
  assert.match(builder, /generate_normals\(\)/);
  assert.doesNotMatch(builder, /center_top/);
  assert.doesNotMatch(builder, /_make_deformed_disc/);
  assert.match(builder, /ShapeClass\.LONG_SAND_SPIT/);
  assert.match(builder, /ShapeClass\.CRESCENT_COVE/);
  assert.match(builder, /ShapeClass\.HARBOR/);
});

test("HudLayout responsive scaling contract", async () => {
  const layout = await read("godot/scripts/ui/hud_layout.gd");
  const hud = await read("godot/scripts/ui/gameplay_hud.gd");
  const minimap = await read("godot/scripts/ui/minimap.gd");
  const floating = await read("godot/scripts/ui/floating_status_hud.gd");
  assert.match(layout, /class_name HudLayout/);
  assert.match(layout, /MIN_TOUCH_PX/);
  assert.match(layout, /semantic_scale/);
  assert.match(hud, /HudLayout\.semantic_scale/);
  assert.match(hud, /_nav_row\.visible = not mobile/);
  assert.match(hud, /_mobile_combat_cluster/);
  assert.match(minimap, /HudLayout\.semantic_scale/);
  assert.match(floating, /HudLayout\.semantic_scale/);
});

test("single mobile control owner — no combat buttons in mobile layer", async () => {
  const mobile = await read("godot/scripts/input/mobile_controls.gd");
  const hud = await read("godot/scripts/ui/gameplay_hud.gd");
  assert.match(mobile, /KAMERA/);
  assert.doesNotMatch(mobile, /FEUER/);
  assert.doesNotMatch(mobile, /Ability/);
  assert.doesNotMatch(mobile, /STEER/);
  assert.match(hud, /disabled = true/);
});

test("minimap marker rendering foundation", async () => {
  const minimap = await read("godot/scripts/ui/minimap.gd");
  assert.match(minimap, /class MinimapCanvas/);
  assert.match(minimap, /func _draw/);
  assert.match(minimap, /npc_ships/);
  assert.match(minimap, /island_entities/);
});

test("harbor visual readability", async () => {
  const harbor = await read("godot/scripts/harbor/harbor_visual_builder.gd");
  assert.match(harbor, /pier/);
  assert.match(harbor, /tower/);
  assert.match(harbor, /_build_coast_berm/);
});

test("island visual scale calibrated for composition", async () => {
  const factory = await read("godot/scripts/region/aster_region_factory.gd");
  assert.match(factory, /WorldScaleProfile\.island_visual_scale/);
});

test("Mobile Web shadow regression remains", async () => {
  const quality = await read("godot/scripts/quality/quality_manager.gd");
  const world = await read("godot/scripts/world/world.gd");
  assert.match(quality, /apply_directional_shadows/);
  assert.match(world, /apply_directional_shadows/);
});

test("TEMP_REFERENCE exclusion in production world", async () => {
  const world = await read("godot/scenes/world/World.tscn");
  assert.doesNotMatch(world, /TEMP_REFERENCE/);
});

test("G0.3.2 documentation set exists", async () => {
  const docs = [
    "docs/godot-migration/G0.3.2_REFERENCE_MAP.md",
    "docs/godot-migration/G0.3.2_HARDWARE_FAILURE_AUDIT.md",
    "docs/godot-migration/G0.3.2_CAMERA_SCALE_CALIBRATION.md",
    "docs/godot-migration/G0.3.2_WORLD_COMPOSITION.md",
    "docs/godot-migration/G0.3.2_MOBILE_HUD.md",
    "docs/godot-migration/G0.3.2_ISLAND_VISUAL_RECOVERY.md",
    "docs/godot-migration/G0.3.2_WEB_PARITY.md",
    "docs/godot-migration/G0.3.2_REPORT.md",
  ];
  for (const doc of docs) {
    const content = await read(doc);
    assert.ok(content.length > 100, `${doc} should be populated`);
  }
});
