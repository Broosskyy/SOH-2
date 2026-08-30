import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("boot telemetry gated to diag only on Web", async () => {
  const telemetry = await read("godot/scripts/debug/mobile_web_boot_telemetry.gd");
  assert.match(telemetry, /query_flag\("diag"\)/);
  assert.doesNotMatch(telemetry, /return PlatformService\.mobile/);
});

test("runtime QA marker gated to qa query flag", async () => {
  const qa = await read("godot/scripts/debug/runtime_qa_marker.gd");
  const project = await read("godot/project.godot");
  assert.match(qa, /query_flag\("qa"\)/);
  assert.match(project, /RuntimeQaMarker/);
  const profile = await read("godot/scripts/ui/hud_layout_profile.gd");
  assert.match(profile, /G0\.5\.[012345]-/);
});

test("single gameplay HUD owner with mobile landscape profile (legacy file)", async () => {
  const hud = await read("godot/scripts/ui/gameplay_hud.gd");
  const profile = await read("godot/scripts/ui/hud_layout_profile.gd");
  const layout = await read("godot/scripts/ui/hud_layout.gd");
  assert.match(hud, /gameplay_hud_root/);
  assert.match(profile, /MOBILE_LANDSCAPE/);
  assert.match(layout, /is_mobile_landscape/);
});

test("normalized control prominence (presentation root)", async () => {
  const root = await read("godot/scripts/ui/gameplay_presentation_root.gd");
  const minimap = await read("godot/scripts/ui/minimap.gd");
  assert.match(root, /CombatCluster/);
  assert.match(minimap, /fill_parent_zone|draw_circle/);
});

test("diagnostic overlay remains diag gated", async () => {
  const overlay = await read("godot/scripts/debug/debug_overlay.gd");
  assert.match(overlay, /query_flag\("diag"\)/);
  assert.match(overlay, /G0\.5\.[012345]-/);
});

test("runtime HUD audit docs exist", async () => {
  const audit = await read("docs/godot-migration/G0.4_RUNTIME_HUD_AUDIT.md");
  const measurements = await read("docs/godot-migration/G0.4_TARGET_LAYOUT_MEASUREMENTS.md");
  assert.ok(audit.includes("Root causes"));
  assert.ok(measurements.includes("RATIO_FIRE_D"));
});
