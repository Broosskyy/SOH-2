import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

function presentationScale(renderW, renderH, logicalW, logicalH) {
  const sx = renderW / logicalW;
  const sy = renderH / logicalH;
  const tolerance = 0.05;
  if (Math.abs(sx - sy) <= tolerance) return (sx + sy) * 0.5;
  return Math.min(sx, sy);
}

function detectProfile(w, h) {
  const short = Math.min(w, h);
  const long = Math.max(w, h);
  const aspect = long / Math.max(short, 1);
  const wide = w > h && aspect >= 1.55;
  if (wide && short <= 520) return "PHONE_LANDSCAPE";
  return "DESKTOP_TABLET";
}

test("G0.5.4 build marker and version", async () => {
  const project = await read("godot/project.godot");
  const metrics = await read("godot/scripts/ui/responsive_hud_metrics.gd");
  assert.match(project, /config\/version="0\.5\.4"/);
  assert.match(metrics, /G0\.5\.4-LOGICAL-UI/);
});

test("logical and render viewport sources are explicit", async () => {
  const metrics = await read("godot/scripts/ui/responsive_hud_metrics.gd");
  assert.match(metrics, /logical_ui_viewport_size/);
  assert.match(metrics, /render_viewport_size/);
  assert.match(metrics, /presentation_scale_uniform/);
  assert.match(metrics, /ui_viewport\(node.*logical_ui_viewport_size/s);
});

test("profile selection uses logical viewport not render buffer", async () => {
  const metrics = await read("godot/scripts/ui/responsive_hud_metrics.gd");
  assert.match(metrics, /profile_name\(logical\)/);
  assert.doesNotMatch(metrics, /profile_name\(render\)/);
});

test("755x298 logical classifies PHONE_LANDSCAPE even with high render", async () => {
  assert.equal(detectProfile(755, 298), "PHONE_LANDSCAPE");
  assert.equal(detectProfile(2123, 838), "DESKTOP_TABLET");
  const scale = presentationScale(2123, 838, 755, 298);
  assert.ok(scale > 2.7 && scale < 2.9);
  assert.equal(detectProfile(755, 298), "PHONE_LANDSCAPE");
});

test("915x412 logical classifies PHONE_LANDSCAPE", async () => {
  assert.equal(detectProfile(915, 412), "PHONE_LANDSCAPE");
});

test("presentation scale uses measured render/logical not DPR directly", async () => {
  const metrics = await read("godot/scripts/ui/responsive_hud_metrics.gd");
  assert.match(metrics, /render\.x \/ logical\.x/);
  assert.doesNotMatch(metrics, /device_pixel_ratio\(\).*\*/);
});

test("single root-level presentation transform", async () => {
  const root = await read("godot/scripts/ui/gameplay_presentation_root.gd");
  assert.match(root, /_apply_presentation_transform/);
  assert.match(root, /_root\.scale = Vector2\.ONE \* pscale/);
  assert.doesNotMatch(root, /device_pixel_ratio/);
});

test("no per-widget DPR scaling in HUD files", async () => {
  const files = [
    "godot/scripts/ui/presentation_layout.gd",
    "godot/scripts/ui/minimap.gd",
    "godot/scripts/ui/gameplay_presentation_root.gd",
  ];
  for (const file of files) {
    const source = await read(file);
    assert.doesNotMatch(source, /device_pixel_ratio/);
    assert.doesNotMatch(source, /css_to_render/);
  }
});

test("world labels and floating HUD use logical sizing with presentation scale", async () => {
  const worldLabel = await read("godot/scripts/ui/world_label.gd");
  const floating = await read("godot/scripts/ui/floating_status_hud.gd");
  assert.match(worldLabel, /logical_ui_viewport_size/);
  assert.match(worldLabel, /presentation_scale_uniform/);
  assert.match(floating, /logical_ui_viewport_size/);
  assert.match(floating, /presentation_scale_uniform/);
});

test("QA diagnostics show logical and render separation", async () => {
  const metrics = await read("godot/scripts/ui/responsive_hud_metrics.gd");
  for (const key of ["LOGICAL_UI:", "RENDER_VIEWPORT:", "PRESENTATION_SCALE:", "HUD_VIEWPORT:"]) {
    assert.match(metrics, new RegExp(key.replace(":", "\\:")));
  }
});

test("G0.5.3 canvas recovery preserved", async () => {
  const contract = await read("godot/scripts/platform/web_viewport_contract.gd");
  const exportScript = await read("scripts/godot-web-export.mjs");
  assert.match(contract, /install_web_canvas_contract/);
  assert.match(exportScript, /web-viewport-contract\.js/);
  assert.match(exportScript, /position: fixed/);
});

test("G0.5.4 documentation exists", async () => {
  const doc = await read("docs/godot-migration/G0.5.4_LOGICAL_UI_SPACE.md");
  assert.ok(doc.includes("logical"));
  assert.ok(doc.includes("render"));
});

test("presentation scale matrix", async () => {
  const cases = [
    { render: [1920, 1080], logical: [1920, 1080], expect: 1 },
    { render: [2123, 838], logical: [755, 298], expect: 2.8125 },
    { render: [2560, 1440], logical: [1280, 720], expect: 2 },
  ];
  for (const c of cases) {
    const scale = presentationScale(c.render[0], c.render[1], c.logical[0], c.logical[1]);
    assert.ok(Math.abs(scale - c.expect) < 0.1, `scale ${scale} vs ${c.expect}`);
  }
});
