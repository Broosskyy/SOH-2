import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("G0.4 build marker and version (historical)", async () => {
  const report = await read("docs/godot-migration/G0.4_REPORT.md");
  const capture = await read("godot/scripts/debug/qa_capture.gd");
  assert.match(report, /G0\.4/);
  assert.match(capture, /G0\.5/);
});

test("mockup composition profile owns first-frame layout", async () => {
  const mockup = await read("godot/scripts/world/mockup_composition_profile.gd");
  const factory = await read("godot/scripts/region/aster_region_factory.gd");
  assert.match(mockup, /PLAYER_SPAWN/);
  assert.match(mockup, /DEFAULT_CAMERA_ZOOM/);
  assert.match(factory, /MockupCompositionProfile/);
  assert.match(factory, /Black Corsair/);
  assert.match(factory, /fortress_harbor/);
});

test("camera mockup default zoom without breaking naval lock", async () => {
  const camera = await read("godot/scripts/camera/camera_controller.gd");
  assert.match(camera, /initial_zoom := 0\.94/);
  assert.match(camera, /"fov": 35\.0/);
  assert.match(camera, /"height": 560\.0/);
});

test("mockup HUD hierarchy (legacy gameplay_hud.gd)", async () => {
  const hud = await read("godot/scripts/ui/gameplay_hud.gd");
  assert.match(hud, /DEPRECATED G0\.4/);
  assert.match(hud, /MockupCompositionProfile/);
});

test("circular minimap foundation", async () => {
  const minimap = await read("godot/scripts/ui/minimap.gd");
  assert.match(minimap, /map_radius := 680/);
  assert.match(minimap, /draw_circle/);
});

test("loot chest world props", async () => {
  const props = await read("godot/scripts/world/world_prop_builder.gd");
  const factory = await read("godot/scripts/region/aster_region_factory.gd");
  assert.match(props, /CHEST_GOLD/);
  assert.match(factory, /CHEST_GOLD/);
});

test("single mobile control owner", async () => {
  const mobile = await read("godot/scripts/input/mobile_controls.gd");
  assert.match(mobile, /KAMERA/);
  assert.doesNotMatch(mobile, /FEUER/);
});

test("G0.4 documentation exists", async () => {
  const report = await read("docs/godot-migration/G0.4_REPORT.md");
  const parity = await read("docs/godot-migration/G0.4_MOCKUP_PARITY.md");
  assert.ok(report.length > 100);
  assert.ok(parity.length > 100);
});
