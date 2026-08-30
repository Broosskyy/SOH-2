import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("G0.5.2 responsive HUD foundation preserved", async () => {
  const metrics = await read("godot/scripts/ui/responsive_hud_metrics.gd");
  const layout = await read("godot/scripts/ui/presentation_layout.gd");
  assert.match(metrics, /static func ui_viewport/);
  assert.match(layout, /ResponsiveHudMetrics/);
});

test("one responsive viewport source", async () => {
  const metrics = await read("godot/scripts/ui/responsive_hud_metrics.gd");
  const root = await read("godot/scripts/ui/gameplay_presentation_root.gd");
  const layout = await read("godot/scripts/ui/presentation_layout.gd");
  assert.match(metrics, /static func ui_viewport/);
  assert.match(root, /ResponsiveHudMetrics\.ui_viewport/);
  assert.match(layout, /ResponsiveHudMetrics\./);
  assert.doesNotMatch(root, /css_to_render/);
});

test("no CSS to render positioning and no DPR multiplier", async () => {
  const metrics = await read("godot/scripts/ui/responsive_hud_metrics.gd");
  const layout = await read("godot/scripts/ui/presentation_layout.gd");
  const world = await read("godot/scripts/world/world.gd");
  assert.doesNotMatch(metrics, /css_to_render/);
  assert.doesNotMatch(layout, /css_to_render/);
  assert.doesNotMatch(metrics, /device_pixel_ratio\(\).*\*/);
  assert.doesNotMatch(world, /CONTENT_SCALE_MODE_VIEWPORT/);
});

test("GameplayPresentationRoot fills available rect without cumulative scale", async () => {
  const root = await read("godot/scripts/ui/gameplay_presentation_root.gd");
  assert.match(root, /PRESET_FULL_RECT/);
  assert.match(root, /scale = Vector2\.ONE/);
  assert.match(root, /ProfileZone/);
  assert.match(root, /CombatZone/);
  assert.match(root, /_last_viewport/);
  assert.doesNotMatch(root, /1920/);
});

test("phone landscape and desktop profile detection", async () => {
  const metrics = await read("godot/scripts/ui/responsive_hud_metrics.gd");
  assert.match(metrics, /PHONE_LANDSCAPE/);
  assert.match(metrics, /DESKTOP_TABLET/);
  assert.match(metrics, /PHONE_SHORT_EDGE_MAX/);
  assert.match(metrics, /detect_profile/);
});

test("required zones visible in layout definitions", async () => {
  const layout = await read("godot/scripts/ui/presentation_layout.gd");
  for (const zone of ["PROFILE", "STATUS", "NAV", "MISSION", "MINIMAP", "ZOOM", "CHAT", "CONSUMABLES", "COMBAT"]) {
    assert.match(layout, new RegExp(`Zone\\.${zone}`));
  }
  assert.match(layout, /Zone\.CURRENCY/);
  assert.doesNotMatch(layout, /CARIBBEAN SEA/);
});

test("floating player HUD has no numeric values", async () => {
  const floating = await read("godot/scripts/ui/floating_status_hud.gd");
  assert.doesNotMatch(floating, /233\.000/);
  assert.match(floating, /compact := true/);
});

test("resize idempotence and fullscreen relayout hooks", async () => {
  const root = await read("godot/scripts/ui/gameplay_presentation_root.gd");
  const world = await read("godot/scripts/world/world.gd");
  const contractJs = await read("godot/export/web-viewport-contract.js");
  assert.match(root, /size_changed\.connect/);
  assert.match(root, /if viewport == _last_viewport/);
  assert.match(contractJs, /fullscreenchange/);
  assert.match(world, /WebViewportContract/);
});

test("QA diagnostics gated and zone outlines", async () => {
  const marker = await read("godot/scripts/debug/runtime_qa_marker.gd");
  const zone = await read("godot/scripts/ui/hud_zone.gd");
  assert.match(marker, /query_flag\("qa"\)/);
  assert.match(marker, /ResponsiveHudMetrics\.audit_lines/);
  assert.match(zone, /set_qa_outline/);
});

test("G0.5.2 documentation exists", async () => {
  const doc = await read("docs/godot-migration/G0.5.2_NATIVE_RESPONSIVE_HUD.md");
  assert.ok(doc.includes("OLD MODEL"));
  assert.ok(doc.includes("NEW MODEL"));
  assert.ok(doc.includes("css_to_render"));
});
