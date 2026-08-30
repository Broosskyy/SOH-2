import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("G0.5.3 build marker and version", async () => {
  const project = await read("godot/project.godot");
  const metrics = await read("godot/scripts/ui/responsive_hud_metrics.gd");
  const contract = await read("godot/scripts/platform/web_viewport_contract.gd");
  assert.match(project, /config\/version="0\.5\.3"/);
  assert.match(metrics, /G0\.5\.3-WEB-CANVAS-RECOVERY/);
  assert.match(contract, /presentation_resized/);
});

test("web viewport contract assets exist", async () => {
  const js = await read("godot/export/web-viewport-contract.js");
  const shell = await read("godot/export/web_shell.html");
  const preset = await read("godot/export_presets.cfg");
  const exportScript = await read("scripts/godot-web-export.mjs");
  assert.match(js, /ensureCanvasFill/);
  assert.match(js, /visualViewport/);
  assert.match(shell, /width: 100%/);
  assert.match(exportScript, /patchWebExportArtifacts/);
  assert.match(preset, /canvas_resize_policy=2/);
});

test("no fixed canvas CSS pixel sizes", async () => {
  const shell = await read("godot/export/web_shell.html");
  const js = await read("godot/export/web-viewport-contract.js");
  const exportScript = await read("scripts/godot-web-export.mjs");
  for (const source of [shell, js, exportScript]) {
    assert.doesNotMatch(source, /width:\s*1920px/);
    assert.doesNotMatch(source, /height:\s*1080px/);
    assert.doesNotMatch(source, /width:\s*1280px/);
    assert.doesNotMatch(source, /height:\s*720px/);
  }
});

test("browser content viewport uses visual viewport", async () => {
  const metrics = await read("godot/scripts/ui/responsive_hud_metrics.gd");
  assert.match(metrics, /browser_content_viewport/);
  assert.match(metrics, /visualViewport/);
  assert.match(metrics, /apply_web_presentation_sync/);
});

test("QA diagnostics include canvas chain", async () => {
  const metrics = await read("godot/scripts/ui/responsive_hud_metrics.gd");
  for (const key of [
    "INNER:",
    "VISUAL:",
    "CLIENT:",
    "CONTAINER:",
    "CANVAS_CSS:",
    "CANVAS_BUFFER:",
    "GODOT_WINDOW:",
    "GODOT_VIEWPORT:",
    "HUD_VIEWPORT:",
    "CANVAS_COVERAGE_X:",
    "CANVAS_COVERAGE_Y:",
  ]) {
    assert.match(metrics, new RegExp(key.replace(":", "\\:")));
  }
});

test("WebViewportContract autoload and resize hooks", async () => {
  const project = await read("godot/project.godot");
  const contract = await read("godot/scripts/platform/web_viewport_contract.gd");
  const contractJs = await read("godot/export/web-viewport-contract.js");
  const root = await read("godot/scripts/ui/gameplay_presentation_root.gd");
  assert.match(project, /WebViewportContract/);
  assert.match(contract, /presentation_resized/);
  assert.match(contract, /_check_viewport/);
  assert.match(root, /WebViewportContract\.presentation_resized/);
});

test("export patch copies viewport contract", async () => {
  const exportScript = await read("scripts/godot-web-export.mjs");
  assert.match(exportScript, /patchWebExportArtifacts/);
  assert.match(exportScript, /web-viewport-contract\.js/);
});

test("canvas QA script exists", async () => {
  const qa = await read("scripts/godot-web-canvas-qa.mjs");
  assert.match(qa, /CANVAS_COVERAGE/);
  assert.match(qa, /915/);
});

test("G0.5.3 documentation exists", async () => {
  const doc = await read("docs/godot-migration/G0.5.3_MOBILE_WEB_CANVAS_RECOVERY.md");
  assert.ok(doc.includes("ROOT CAUSE"));
  assert.ok(doc.includes("fill 100%"));
});
