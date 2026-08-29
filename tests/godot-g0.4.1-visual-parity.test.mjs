import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("G0.4.1 build marker and version", async () => {
  const project = await read("godot/project.godot");
  const profile = await read("godot/scripts/ui/hud_layout_profile.gd");
  const overlay = await read("godot/scripts/debug/debug_overlay.gd");
  assert.match(project, /config\/version="0\.4\.1"/);
  assert.match(profile, /G0\.4\.1-VISUAL-PARITY/);
  assert.match(overlay, /G0\.4\.1-VISUAL-PARITY/);
});

test("single gameplay HUD owner with semantic anchor zones", async () => {
  const hud = await read("godot/scripts/ui/gameplay_hud.gd");
  assert.match(hud, /gameplay_hud_root/);
  assert.match(hud, /_profile_zone/);
  assert.match(hud, /_status_zone/);
  assert.match(hud, /_consumables_row/);
  assert.match(hud, /_nav_row/);
  assert.match(hud, /_mission_panel/);
  assert.match(hud, /_chat_panel/);
  assert.match(hud, /_zoom_panel/);
  assert.match(hud, /_combat_cluster/);
  assert.match(hud, /_fullscreen_button/);
  assert.doesNotMatch(hud, /_bottom_dock/);
  assert.doesNotMatch(hud, /_region_label/);
  assert.doesNotMatch(hud, /_left_status/);
});

test("top status bars with numeric values only in top HUD", async () => {
  const hud = await read("godot/scripts/ui/gameplay_hud.gd");
  const floating = await read("godot/scripts/ui/floating_status_hud.gd");
  const mockup = await read("godot/scripts/world/mockup_composition_profile.gd");
  assert.match(hud, /_wrap_status_bar\("EXP"/);
  assert.match(hud, /_wrap_status_bar\("RUMPF"/);
  assert.match(hud, /_wrap_status_bar\("SCHUTZ"/);
  assert.match(hud, /_exp_value/);
  assert.match(hud, /_hull_value/);
  assert.match(hud, /_shield_value/);
  assert.match(mockup, /HUD_EXP_CURRENT/);
  assert.match(mockup, /HUD_RUMPF_CURRENT/);
  assert.match(mockup, /HUD_SCHUTZ_CURRENT/);
  assert.match(floating, /show_percentage = false/);
  assert.match(floating, /HUD_FLOATING_NAME/);
  assert.doesNotMatch(floating, /233\.000/);
});

test("region selector removed from normal gameplay HUD", async () => {
  const hud = await read("godot/scripts/ui/gameplay_hud.gd");
  const factory = await read("godot/scripts/region/aster_region_factory.gd");
  assert.doesNotMatch(hud, /CARIBBEAN SEA/);
  assert.doesNotMatch(hud, /HUD_REGION_LABEL/);
  assert.match(factory, /region_id = "aster_g03"/);
});

test("no giant full-screen HUD panel regression guards", async () => {
  const hud = await read("godot/scripts/ui/gameplay_hud.gd");
  const profile = await read("godot/scripts/ui/hud_layout_profile.gd");
  assert.match(hud, /_fit_control/);
  assert.match(hud, /_make_zone_panel/);
  assert.match(profile, /MAX_PANEL_COVERAGE/);
  assert.doesNotMatch(hud, /safe\.size\.x - margin \* 2\.0/);
});

test("responsive landscape and fullscreen action", async () => {
  const hud = await read("godot/scripts/ui/gameplay_hud.gd");
  const layout = await read("godot/scripts/ui/hud_layout.gd");
  const profile = await read("godot/scripts/ui/hud_layout_profile.gd");
  assert.match(hud, /_request_fullscreen/);
  assert.match(layout, /MOBILE_LANDSCAPE/);
  assert.match(profile, /MOBILE_LANDSCAPE/);
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
