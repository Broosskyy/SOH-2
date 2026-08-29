import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("G0.2 locks Perspective Naval to the V20.3.2 camera contract", async () => {
  const camera = await read("godot/scripts/camera/camera_controller.gd");
  const profile = await read("godot/data/kraken_presentation_profile.tres");
  assert.match(camera, /"fov": 35\.0/);
  assert.match(camera, /"height": 560\.0/);
  assert.match(camera, /"back": 360\.0/);
  assert.match(camera, /"lateral": -58\.0/);
  assert.match(camera, /min_zoom := 0\.55/);
  assert.match(camera, /max_zoom := 1\.38/);
  assert.match(camera, /presentation_profile\.camera_profile/);
  assert.match(profile, /camera_profile = 0/);
});

test("Kraken presentation profile owns final visual, wake and HUD envelope", async () => {
  const profile = await read("godot/data/kraken_presentation_profile.tres");
  const controller = await read("godot/scripts/ships/player_ship.gd");
  assert.match(profile, /visual_scale = 52\.0/);
  assert.match(profile, /visual_yaw_degrees = 180\.0/);
  assert.match(profile, /waterline_offset = 20\.5/);
  assert.match(profile, /wake_stern_offset = 58\.0/);
  assert.match(profile, /ui_anchor_height = 68\.0/);
  assert.match(profile, /ui_safe_gap = 10\.0/);
  assert.match(controller, /wake_anchor\.position\.z = presentation_profile\.wake_stern_offset/);
});

test("mobile hybrid input separates destination navigation and camera pan", async () => {
  const source = await read("godot/scripts/input/player_input_source.gd");
  const mobile = await read("godot/scripts/input/mobile_controls.gd");
  const picker = await read("godot/scripts/input/world_pick_input.gd");
  const navigation = await read("godot/scripts/navigation/navigation_controller.gd");
  assert.match(source, /HYBRID_TAP_NAV/);
  assert.match(source, /NavigationController\.command_to_destination/);
  assert.match(mobile, /camera\.set_pan_input/);
  assert.match(mobile, /camera\.adjust_zoom/);
  assert.doesNotMatch(mobile, /set_touch_vector/);
  assert.match(picker, /project_ray_origin/);
  assert.match(picker, /GameplayPlane\.WATER_Y/);
  assert.match(navigation, /is_destination_blocked/);
});

test("HUD and controls share safe-area policy", async () => {
  const platform = await read("godot/scripts/platform/platform_service.gd");
  const metrics = await read("godot/scripts/ui/responsive_hud_metrics.gd");
  const mobile = await read("godot/scripts/input/mobile_controls.gd");
  assert.match(platform, /func safe_rect/);
  assert.match(platform, /func safe_margins/);
  assert.match(platform, /DisplayServer\.screen_get_size/);
  assert.match(platform, /display_to_viewport/);
  assert.match(metrics, /PlatformService\.safe_rect/);
  assert.match(mobile, /PlatformService\.safe_margins/);
});

test("G0.3 region uses proxy island geometry instead of authored WebP billboards", async () => {
  const world = await read("godot/scenes/world/World.tscn");
  const islandRoot = await read("godot/scripts/islands/island_root.gd");
  const factory = await read("godot/scripts/region/aster_region_factory.gd");
  for (const asset of [
    "storm-ruins-island-v1.webp",
    "tropical-port-island-v1.webp",
    "abyss-relic-island-v1.webp",
  ]) {
    assert.ok(
      (await stat(new URL(`../godot/assets/world/islands/${asset}`, import.meta.url))).size > 100_000,
      `${asset} remains a design reference asset`,
    );
  }
  assert.doesNotMatch(world, /AuthoredPresentation/);
  assert.doesNotMatch(world, /storm-ruins-island-v1\.webp/);
  assert.match(world, /RegionRuntime/);
  assert.match(islandRoot, /IslandVisualBuilder\.build_into/);
  assert.match(factory, /coral_crescent|glass_reef/);
  assert.match(factory, /fortress_harbor|harbor_aster/);
});

test("G0.2 QA covers aspects, quality tiers, headings and performance evidence", async () => {
  const capture = await read("godot/scripts/debug/qa_capture.gd");
  const overlay = await read("godot/scripts/debug/debug_overlay.gd");
  const quality = await read("godot/scripts/quality/quality_manager.gd");
  assert.match(capture, /1280x720/);
  assert.match(capture, /1920x1080/);
  assert.match(capture, /2400x1080/);
  assert.match(capture, /QA_QUALITIES := \["LOW", "HIGH"\]/);
  assert.match(capture, /artifacts\/godot-g0\./);
  assert.match(overlay, /BUILD: G0\./);
  assert.match(overlay, /REGION:/);
  assert.match(overlay, /INPUT MODE/);
  assert.match(overlay, /SAFE AREA/);
  assert.match(quality, /mesh_lod_threshold/);
  assert.match(quality, /apply_forced/);
});

test("Kraken LOD policy is explicit without inventing generated candidates", async () => {
  const policy = JSON.parse(await read("godot/data/kraken_lod_policy.json"));
  assert.equal(policy.status, "STRATEGY");
  assert.equal(policy.sourcePreserved, true);
  assert.equal(policy.godotImporterGeneratesInternalLods, true);
  assert.deepEqual(policy.levels[1].targetTriangles, [12000, 18000]);
  assert.deepEqual(policy.levels[2].targetTriangles, [4000, 8000]);
  assert.equal(policy.candidateGeneration["availableInG0.2Environment"], false);
});

test("quality manager disables directional light shadows when LOW profile turns atlas off", async () => {
  const quality = await read("godot/scripts/quality/quality_manager.gd");
  const world = await read("godot/scripts/world/world.gd");
  assert.match(quality, /apply_directional_shadows/);
  assert.match(quality, /directional_lights/);
  assert.match(world, /directional_lights/);
  const worldScene = await read("godot/scenes/world/World.tscn");
  assert.match(world, /fog_enabled = false/);
  assert.match(worldScene, /fog_enabled = true/);
});

test("mobile web diagnostics expose boot telemetry and isolation controls", async () => {
  const diagnostics = await read("godot/scripts/debug/mobile_web_diagnostics.gd");
  const telemetry = await read("godot/scripts/debug/mobile_web_boot_telemetry.gd");
  const primitive = await read("godot/scenes/debug/MobileWebPrimitive.tscn");
  assert.match(diagnostics, /boot_mode\(\) == "primitive"/);
  assert.match(diagnostics, /hide_kraken/);
  assert.match(telemetry, /RENDER READY/);
  assert.match(primitive, /MobileWebPrimitive/);
});

test("G0.2 keeps a documented conservative export policy", async () => {
  const exports = await read("godot/export_presets.cfg");
  const optimization = await read("docs/godot-migration/G0.2_KRAKEN_OPTIMIZATION.md");
  assert.match(exports, /name="Web"[\s\S]*?export_filter="all_resources"/);
  assert.match(optimization, /all_resources/);
  assert.match(optimization, /generated include manifest/);
});

test("world navigation owns primary pointer input without target-action collision", async () => {
  const project = await read("godot/project.godot");
  const picker = await read("godot/scripts/input/world_pick_input.gd");
  assert.match(project, /selectTarget=\{\s*"deadzone": 0\.2,\s*"events": \[\]\s*\}/);
  assert.match(picker, /MOUSE_BUTTON_LEFT/);
  assert.match(picker, /_handle_pick/);
  assert.match(picker, /input_source\.set_destination/);
});
