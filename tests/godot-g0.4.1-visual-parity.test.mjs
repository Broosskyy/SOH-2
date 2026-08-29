import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("G0.4.1 build marker and version (historical)", async () => {
  const doc = await read("docs/godot-migration/G0.4.1_MASTER_VISUAL_PARITY.md");
  const legacy = await read("godot/scripts/ui/gameplay_hud.gd");
  assert.ok(doc.includes("G0.4.1"));
  assert.match(legacy, /DEPRECATED G0\.4/);
});

test("single gameplay HUD owner with semantic anchor zones (legacy file)", async () => {
  const hud = await read("godot/scripts/ui/gameplay_hud.gd");
  assert.match(hud, /gameplay_hud_root/);
  assert.match(hud, /DEPRECATED G0\.4/);
});

test("top status bars with numeric values only in top HUD", async () => {
  const root = await read("godot/scripts/ui/gameplay_presentation_root.gd");
  const floating = await read("godot/scripts/ui/floating_status_hud.gd");
  const mockup = await read("godot/scripts/world/mockup_composition_profile.gd");
  assert.match(root, /_status_row\("EXP"/);
  assert.match(root, /_status_row\("RUMPF"/);
  assert.match(root, /_status_row\("SCHUTZ"/);
  assert.match(mockup, /HUD_EXP_CURRENT/);
  assert.match(floating, /show_percentage = false/);
  assert.doesNotMatch(floating, /233\.000/);
});

test("region selector removed from normal gameplay HUD", async () => {
  const root = await read("godot/scripts/ui/gameplay_presentation_root.gd");
  const factory = await read("godot/scripts/region/aster_region_factory.gd");
  assert.doesNotMatch(root, /CARIBBEAN SEA/);
  assert.match(factory, /region_id = "aster_g03"/);
});

test("no giant full-screen HUD panel regression guards", async () => {
  const root = await read("godot/scripts/ui/gameplay_presentation_root.gd");
  const layout = await read("godot/scripts/ui/presentation_layout.gd");
  assert.match(root, /_fit\(/);
  assert.match(layout, /zone_rect/);
  assert.doesNotMatch(root, /safe\.size\.x - margin/);
});

test("responsive landscape and fullscreen action", async () => {
  const root = await read("godot/scripts/ui/gameplay_presentation_root.gd");
  const layout = await read("godot/scripts/ui/presentation_layout.gd");
  assert.match(root, /_toggle_fullscreen/);
  assert.match(layout, /ui_scale/);
});

test("Kraken asset and camera lock preserved", async () => {
  const scale = await read("godot/scripts/world/world_scale_profile.gd");
  const camera = await read("godot/scripts/camera/camera_controller.gd");
  const manifest = await read("godot/data/kraken_presentation_profile.tres");
  assert.match(scale, /PLAYER_VISUAL_SCALE := 52\.0/);
  assert.match(manifest, /visual_scale = 52\.0/);
  assert.match(camera, /PERSPECTIVE_NAVAL/);
  assert.match(camera, /initial_zoom := 0\.94/);
});

test("diagnostic leak gating unchanged", async () => {
  const telemetry = await read("godot/scripts/debug/mobile_web_boot_telemetry.gd");
  const overlay = await read("godot/scripts/debug/debug_overlay.gd");
  const qa = await read("godot/scripts/debug/runtime_qa_marker.gd");
  assert.match(telemetry, /query_flag\("diag"\)/);
  assert.match(overlay, /query_flag\("diag"\)/);
  assert.match(qa, /query_flag\("qa"\)/);
});

test("G0.4.1 documentation exists", async () => {
  const doc = await read("docs/godot-migration/G0.4.1_MASTER_VISUAL_PARITY.md");
  assert.ok(doc.includes("MASTER_VISUAL_REFERENCE"));
  assert.ok(doc.includes("Delta Matrix"));
  assert.ok(doc.includes("READY_FOR_REAL_ANDROID_G0.4.1_ACCEPTANCE"));
});

test("parity matrix artifact exists", async () => {
  const matrix = await read("artifacts/godot-g0.4.1/parity-matrix.json");
  const parsed = JSON.parse(matrix);
  assert.ok(parsed.categories.viewport);
  assert.ok(parsed.categories.water);
  assert.ok(parsed.categories["region-selector"]);
});
