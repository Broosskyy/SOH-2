import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("G0.5.1 build marker and version", async () => {
  const project = await read("godot/project.godot");
  const metrics = await read("godot/scripts/ui/ui_metrics.gd");
  const layout = await read("godot/scripts/ui/presentation_layout.gd");
  assert.match(project, /config\/version="0\.5\.1"/);
  assert.match(metrics, /G0\.5\.1-MOBILE-WEB-UI-METRICS/);
  assert.match(layout, /G0\.5\.1-MOBILE-WEB-UI-METRICS/);
});

test("single authoritative ui metric source", async () => {
  const metrics = await read("godot/scripts/ui/ui_metrics.gd");
  const layout = await read("godot/scripts/ui/presentation_layout.gd");
  const root = await read("godot/scripts/ui/gameplay_presentation_root.gd");
  assert.match(metrics, /class_name UiMetrics/);
  assert.match(metrics, /effective_ui_scale/);
  assert.match(metrics, /css_to_render/);
  assert.match(layout, /UiMetrics\.effective_ui_scale/);
  assert.match(layout, /HudLayoutProfile\.RATIO_/);
  assert.doesNotMatch(root, /150\.0 \* scale/);
});

test("no double scaling — ui_scale is identity via UiMetrics", async () => {
  const layout = await read("godot/scripts/ui/presentation_layout.gd");
  const metrics = await read("godot/scripts/ui/ui_metrics.gd");
  assert.match(layout, /return UiMetrics\.effective_ui_scale\(viewport\)/);
  assert.match(metrics, /return 1\.0/);
  assert.doesNotMatch(layout, /short_edge \/ 607/);
});

test("mobile effective scale bounds use css_to_render touch floor", async () => {
  const metrics = await read("godot/scripts/ui/ui_metrics.gd");
  const hud = await read("godot/scripts/ui/hud_layout.gd");
  assert.match(metrics, /CSS_MIN_TOUCH_PX := 48\.0/);
  assert.match(metrics, /min_touch_render_px/);
  assert.match(hud, /UiMetrics\.min_touch_render_px/);
});

test("desktop scale bounds remain ratio-based", async () => {
  const profile = await read("godot/scripts/ui/hud_layout_profile.gd");
  const layout = await read("godot/scripts/ui/presentation_layout.gd");
  assert.match(profile, /RATIO_PROFILE_W/);
  assert.match(layout, /HudLayoutProfile\.length\(viewport, HudLayoutProfile\.RATIO_PROFILE_W/);
});

test("profile minimap fire nav occupancy hooks", async () => {
  const layout = await read("godot/scripts/ui/presentation_layout.gd");
  const root = await read("godot/scripts/ui/gameplay_presentation_root.gd");
  const minimap = await read("godot/scripts/ui/minimap.gd");
  assert.match(layout, /Zone\.TOP_LEFT/);
  assert.match(layout, /Zone\.MINIMAP/);
  assert.match(layout, /Zone\.BOTTOM_RIGHT/);
  assert.match(layout, /Zone\.TOP_NAV/);
  assert.match(root, /RATIO_FIRE_D/);
  assert.match(minimap, /apply_zone_rect/);
});

test("QA overlay safe placement and collapse", async () => {
  const marker = await read("godot/scripts/debug/runtime_qa_marker.gd");
  assert.match(marker, /anchor_left = 1\.0/);
  assert.match(marker, /anchor_top = 1\.0/);
  assert.match(marker, /HORIZONTAL_ALIGNMENT_RIGHT/);
  assert.match(marker, /_collapsed/);
  assert.match(marker, /UiMetrics\.audit_lines/);
  assert.doesNotMatch(marker, /position = Vector2\(8, 8\)/);
});

test("minimap content draw guards and zone layout", async () => {
  const minimap = await read("godot/scripts/ui/minimap.gd");
  assert.match(minimap, /size\.x < 8\.0/);
  assert.match(minimap, /_draw_islands/);
  assert.match(minimap, /_draw_npcs/);
  assert.match(minimap, /_resize_canvas/);
});

test("G0.5.1 documentation exists", async () => {
  const doc = await read("docs/godot-migration/G0.5.1_UI_METRICS_AUDIT.md");
  assert.ok(doc.includes("ROOT CAUSE"));
  assert.ok(doc.includes("DOUBLE SCALE"));
});
