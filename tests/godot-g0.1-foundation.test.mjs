import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("G0.1 targets Godot 4.7 with GL Compatibility", async () => {
  const project = await read("godot/project.godot");
  assert.match(project, /PackedStringArray\("4\.7", "GL Compatibility"\)/);
  assert.match(project, /renderer\/rendering_method="gl_compatibility"/);
  assert.match(project, /config\/version="0\.[0-9]+\.[0-9]+"/);
});

test("Kraken is a visual-only child of the gameplay ship", async () => {
  const scene = await read("godot/scenes/ships/PlayerShip.tscn");
  const controller = await read("godot/scripts/ships/player_ship.gd");
  const profile = await read("godot/data/kraken_presentation_profile.tres");
  assert.match(scene, /Kraken_ship_player_30k\.glb/);
  assert.match(scene, /name="VisualRoot"/);
  assert.match(scene, /name="KrakenModel" parent="VisualRoot"/);
  assert.match(scene, /name="Collision" type="CollisionShape3D" parent="CollisionRoot"/);
  assert.doesNotMatch(scene, /name="(Hull|Bow|Mast|Sail)"/);
  const shipEntity = await read("godot/scripts/ships/ship_entity.gd");
  assert.match(controller, /velocity = -transform\.basis\.z \* forward_speed/);
  assert.match(controller, /position\.y = GameplayPlane\.WATER_Y/g);
  assert.match(shipEntity, /visual_root\.rotation_degrees\.y/);
  assert.match(profile, /visual_yaw_degrees = 180\.0/);
  assert.equal(
    (await stat(new URL("../godot/assets/ships/player/kraken/Kraken_ship_player_30k.glb", import.meta.url))).size,
    21394148,
  );
});

test("input source is separated from ship movement", async () => {
  const controller = await read("godot/scripts/ships/player_ship.gd");
  const source = await read("godot/scripts/input/player_input_source.gd");
  const mobile = await read("godot/scripts/input/mobile_controls.gd");
  assert.doesNotMatch(controller, /Input\./);
  assert.match(controller, /apply_command/);
  assert.match(source, /Input\.get_axis/);
  assert.match(source, /set_destination/);
  assert.doesNotMatch(mobile, /set_touch_vector/);
  assert.match(mobile, /camera\.set_pan_input/);
});

test("naval camera, floating HUD and eight-way QA are present", async () => {
  const camera = await read("godot/scripts/camera/camera_controller.gd");
  const hud = await read("godot/scripts/ui/floating_status_hud.gd");
  const debug = await read("godot/scripts/debug/debug_overlay.gd");
  assert.match(camera, /Perspective Naval/);
  assert.match(camera, /Low-FOV Perspective/);
  assert.match(camera, /Orthographic/);
  assert.doesNotMatch(camera, /orbit/i);
  assert.match(hud, /extends CanvasLayer/);
  assert.match(hud, /camera\.unproject_position/);
  assert.match(hud, /ui_safe_gap/);
  assert.match(debug, /0\.0, 45\.0, 90\.0, 135\.0, 180\.0, 225\.0, 270\.0, 315\.0/);
  assert.match(debug, /BUILD: G0\./);
});

test("test world and all Tier-1 export presets are configured", async () => {
  const world = await read("godot/scenes/world/World.tscn");
  const exports = await read("godot/export_presets.cfg");
  assert.match(world, /RegionRuntime/);
  assert.match(world, /IslandContainer/);
  assert.match(world, /HarborContainer/);
  assert.match(world, /GameplayPresentation|FloatingPlayerHUD/);
  for (const preset of ["Web", "Android", "iOS", "Windows"]) {
    assert.match(exports, new RegExp(`name="${preset}"`));
  }
});

test("Godot catalog remains byte-identical to shared source", async () => {
  assert.equal(
    await read("godot/data/catalog.v1.json"),
    await read("shared/game-data/catalog.v1.json"),
  );
});
