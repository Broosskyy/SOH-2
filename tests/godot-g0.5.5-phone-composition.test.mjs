import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  centralObstruction,
  detectProfile,
  insideViewport,
  majorOverlap,
  phoneZoneRects,
} from "../scripts/godot-phone-layout-model.mjs";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

const PHONE_VIEWPORTS = [
  [755, 298],
  [915, 412],
  [932, 430],
];

test("G0.5.5 build marker and version (superseded by G0.5.8)", async () => {
  const project = await read("godot/project.godot");
  const layout = await read("godot/scripts/ui/presentation_layout.gd");
  assert.match(project, /config\/version="0\.6\.0"/);
  assert.match(layout, /G0\.6-HUD-V2-CLEAN-REBUILD/);
});

test("phone landscape uses separate occupancy constants", async () => {
  const profile = await read("godot/scripts/ui/hud_layout_profile.gd");
  assert.match(profile, /PHONE_RATIO_PROFILE_W/);
  assert.match(profile, /PHONE_RATIO_MISSION_H/);
  assert.match(profile, /static func is_phone/);
});

test("desktop and phone layout paths are split", async () => {
  const solver = await read("godot/scripts/ui/responsive_hud_layout_solver.gd");
  assert.match(solver, /_solve_phone/);
  assert.match(solver, /_solve_desktop/);
});

test("responsive architecture preserved", async () => {
  const metrics = await read("godot/scripts/ui/responsive_hud_metrics.gd");
  const root = await read("godot/scripts/ui/gameplay_presentation_root.gd");
  assert.match(metrics, /logical_ui_viewport_size/);
  assert.match(metrics, /presentation_scale_uniform/);
  assert.match(root, /_apply_presentation_transform/);
  assert.doesNotMatch(root, /css_to_render/);
});

test("HUD uses ASCII-safe labels instead of unsupported unicode glyphs", async () => {
  const root = await read("godot/scripts/ui/gameplay_presentation_root.gd");
  assert.match(root, /FEUER/);
  assert.doesNotMatch(root, /🔥/);
  assert.doesNotMatch(root, /⛵/);
  assert.doesNotMatch(root, /🛢/);
  assert.match(root, /OIL/);
});

test("font tiers exist for phone landscape", async () => {
  const hudLayout = await read("godot/scripts/ui/hud_layout.gd");
  assert.match(hudLayout, /Semantic\.FLOATING_NPC/);
  assert.match(hudLayout, /is_mobile_landscape\(viewport\)/);
});

test("QA zone metrics and central safe area", async () => {
  const metrics = await read("godot/scripts/ui/responsive_hud_metrics.gd");
  for (const key of ["PROFILE_RECT", "CENTRAL_SAFE_AREA", "PHONE_PROFILE", "zone_audit_lines"]) {
    assert.match(metrics, new RegExp(key));
  }
});

for (const [w, h] of PHONE_VIEWPORTS) {
  test(`phone zones avoid major overlap at ${w}x${h}`, () => {
    assert.equal(detectProfile(w, h), "PHONE_LANDSCAPE");
    const zones = phoneZoneRects(w, h);
    assert.equal(majorOverlap(zones.PROFILE, zones.MISSION), false);
    assert.equal(majorOverlap(zones.PROFILE, zones.STATUS), false);
    assert.equal(majorOverlap(zones.STATUS, zones.NAV), false);
    assert.equal(majorOverlap(zones.NAV, zones.MINIMAP), false);
    assert.equal(majorOverlap(zones.MISSION, zones.CHAT), false);
    assert.equal(majorOverlap(zones.CONSUMABLES, zones.COMBAT), false);
    assert.equal(insideViewport(zones.COMBAT, w, h, 2), true);
    assert.equal(insideViewport(zones.CHAT, w, h, 2), true);
    assert.equal(insideViewport(zones.MINIMAP, w, h, 2), true);
    assert.ok(centralObstruction(zones) <= 1, `central obstruction count ${centralObstruction(zones)}`);
  });
}

test("G0.5.5 documentation exists", async () => {
  const doc = await read("docs/godot-migration/G0.5.5_PHONE_LANDSCAPE_COMPOSITION.md");
  assert.ok(doc.includes("PHONE_LANDSCAPE"));
  assert.ok(doc.includes("occupancy"));
});
