import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("M0 main scene is Boot", async () => {
  const project = await read("godot/project.godot");
  assert.match(project, /run\/main_scene="res:\/\/scenes\/boot\/Boot\.tscn"/);
  assert.match(project, /config\/version="0\.0\.0"/);
});

test("M0 scenes exist", async () => {
  for (const scene of [
    "godot/scenes/boot/Boot.tscn",
    "godot/scenes/game/Game.tscn",
    "godot/scenes/player/PlayerShip.tscn",
    "godot/scenes/ui/MinimalDebugHUD.tscn",
  ]) {
    const src = await read(scene);
    assert.ok(src.includes("[gd_scene"), scene);
  }
});

test("Kraken asset dependency exists", async () => {
  const ship = await read("godot/scenes/player/PlayerShip.tscn");
  assert.match(ship, /Kraken_ship_player_30k\.glb/);
  const presentation = await read("godot/scripts/player/kraken_presentation.gd");
  assert.match(presentation, /VISUAL_SCALE := 52\.0/);
  assert.match(presentation, /WATERLINE_OFFSET := 20\.5/);
});

test("PlayerShipController X/Z movement only", async () => {
  const controller = await read("godot/scripts/player/player_ship_controller.gd");
  assert.match(controller, /class_name PlayerShipController/);
  assert.match(controller, /pos\.y = 0\.0/);
  assert.doesNotMatch(controller, /velocity\.y/);
});

test("continuous yaw steering", async () => {
  const controller = await read("godot/scripts/player/player_ship_controller.gd");
  assert.match(controller, /heading_degrees \+= _command\.steer/);
  assert.doesNotMatch(controller, /snapped|8-direction|eight_direction/i);
});

test("desktop and mobile share PlayerCommand", async () => {
  const desktop = await read("godot/scripts/input/desktop_input_source.gd");
  const mobile = await read("godot/scripts/input/mobile_input_source.gd");
  const command = await read("godot/scripts/player/player_command.gd");
  assert.match(command, /class_name PlayerCommand/);
  assert.match(desktop, /extends InputSource/);
  assert.match(mobile, /extends InputSource/);
});

test("legacy HUD not referenced by M0 project", async () => {
  const project = await read("godot/project.godot");
  const boot = await read("godot/scenes/boot/Boot.tscn");
  const game = await read("godot/scenes/game/Game.tscn");
  assert.doesNotMatch(project, /GameplayPresentationRoot|GameplayHUDV2|WebViewportContract|RuntimeQaMarker/);
  assert.doesNotMatch(boot, /World\.tscn|gameplay_presentation|gameplay_hud_v2/i);
  assert.doesNotMatch(game, /GameplayHUD|presentation_root|HudV2Layout/i);
});

test("no browser API in player gameplay code", async () => {
  const files = [
    "godot/scripts/player/player_ship.gd",
    "godot/scripts/player/player_ship_controller.gd",
    "godot/scripts/camera/naval_camera_rig.gd",
    "godot/scripts/game/game_world.gd",
  ];
  for (const file of files) {
    const src = await read(file);
    assert.doesNotMatch(src, /JavaScriptBridge|visualViewport|devicePixelRatio|WebViewportContract/);
  }
});

test("Android landscape and export presets", async () => {
  const project = await read("godot/project.godot");
  const presets = await read("godot/export_presets.cfg");
  assert.match(project, /window\/handheld\/orientation=1/);
  assert.match(presets, /name="Android"/);
  assert.match(presets, /AbyssalDominion-M0-debug\.apk/);
  assert.match(presets, /name="Web"/);
});

test("build marker", async () => {
  const info = await read("godot/scripts/core/build_info.gd");
  assert.match(info, /M0-CLEAN-NATIVE-FOUNDATION/);
});

test("minimal debug HUD only", async () => {
  const hud = await read("godot/scripts/ui/minimal_debug_hud.gd");
  assert.match(hud, /BuildInfo\.label/);
  assert.doesNotMatch(hud, /HudV2Layout|ResponsiveHudLayoutSolver|GameplayHUDV2/);
});
