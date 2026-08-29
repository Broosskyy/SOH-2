import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("G0.5.1 metrics superseded by G0.5.2 responsive authority (historical)", async () => {
  const metrics = await read("godot/scripts/ui/responsive_hud_metrics.gd");
  const layout = await read("godot/scripts/ui/presentation_layout.gd");
  assert.match(metrics, /class_name ResponsiveHudMetrics/);
  assert.match(layout, /ResponsiveHudMetrics\./);
  assert.doesNotMatch(metrics, /css_to_render/);
});

test("no double scaling — identity semantic scale", async () => {
  const hud = await read("godot/scripts/ui/hud_layout.gd");
  assert.match(hud, /return 1\.0/);
});

test("touch sizing uses native viewport min touch", async () => {
  const metrics = await read("godot/scripts/ui/responsive_hud_metrics.gd");
  const hud = await read("godot/scripts/ui/hud_layout.gd");
  assert.match(metrics, /min_touch_px/);
  assert.match(hud, /ResponsiveHudMetrics\.min_touch_px/);
});

test("QA overlay uses responsive audit lines", async () => {
  const marker = await read("godot/scripts/debug/runtime_qa_marker.gd");
  assert.match(marker, /ResponsiveHudMetrics\.audit_lines/);
  assert.match(marker, /anchor_left = 1\.0/);
});
