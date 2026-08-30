import assert from "node:assert/strict";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import test from "node:test";
import {
  centralObstruction,
  compositionSnapshot,
  consumablesOutsidePlayerSafe,
  contentOverlapCount,
  detectProfile,
  insideViewport,
  majorOverlap,
  phoneContentBounds,
  phoneZoneRects,
} from "../scripts/godot-phone-layout-model.mjs";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

const TEST_VIEWPORTS = [
  [754, 297],
  [755, 298],
  [915, 412],
  [932, 430],
  [1280, 720],
  [1366, 768],
  [1920, 1080],
  [2560, 1440],
];

const PHONE_VIEWPORTS = TEST_VIEWPORTS.filter(([w, h]) => detectProfile(w, h) === "PHONE_LANDSCAPE");
const ULTRAWIDE_PHONE = [932, 430];
const TABLET = [1280, 720];
const DESKTOP = [1920, 1080];

test("G0.5.6 build marker and version (superseded by G0.5.8)", async () => {
  const project = await read("godot/project.godot");
  const layout = await read("godot/scripts/ui/presentation_layout.gd");
  const profile = await read("godot/scripts/ui/hud_layout_profile.gd");
  assert.match(project, /config\/version="0\.5\.8"/);
  assert.match(layout, /G0\.5\.8-RUNTIME-CONTENT-CONTAINMENT/);
  assert.match(profile, /G0\.5\.8-RUNTIME-CONTENT-CONTAINMENT/);
});

test("master visual reference is not treated as fixed resolution", async () => {
  const doc = await read("docs/godot-migration/G0.5.6_MASTER_COMPOSITION_ANALYSIS.md");
  const responsive = await read("docs/godot-migration/G0.5.6_RESPONSIVE_COMPOSITION.md");
  assert.ok(doc.includes("RESOLUTION-INDEPENDENT"));
  assert.ok(responsive.includes("RESOLUTION-INDEPENDENT"));
  const metrics = await read("godot/scripts/ui/responsive_hud_metrics.gd");
  assert.match(metrics, /logical_ui_viewport_size/);
  assert.doesNotMatch(metrics, /MASTER_WIDTH|MASTER_HEIGHT|1920.*design/);
});

test("responsive foundation unchanged", async () => {
  const metrics = await read("godot/scripts/ui/responsive_hud_metrics.gd");
  const contract = await read("godot/scripts/platform/web_viewport_contract.gd");
  const root = await read("godot/scripts/ui/gameplay_presentation_root.gd");
  assert.match(metrics, /logical_ui_viewport_size/);
  assert.match(metrics, /presentation_scale_uniform/);
  assert.match(contract, /presentation_resized/);
  assert.match(root, /_apply_presentation_transform/);
  assert.doesNotMatch(root, /css_to_render/);
});

test("visible content bounds module exists", async () => {
  const bounds = await read("godot/scripts/ui/visible_content_bounds.gd");
  assert.match(bounds, /bounds_for/);
  assert.match(bounds, /major_overlap/);
  const metrics = await read("godot/scripts/ui/responsive_hud_metrics.gd");
  assert.match(metrics, /content_bounds_audit/);
  assert.match(metrics, /player_safe_area/);
  assert.match(metrics, /HudRegionContainment/);
});

test("HUD uses ASCII-safe labels", async () => {
  const root = await read("godot/scripts/ui/gameplay_presentation_root.gd");
  assert.match(root, /FEUER/);
  assert.doesNotMatch(root, /🔥/);
  assert.match(root, /OIL/);
});

test("phone nav uses priority entries", async () => {
  const root = await read("godot/scripts/ui/gameplay_presentation_root.gd");
  assert.match(root, /PHONE_NAV_PRIORITY/);
  assert.match(root, /SHIPS/);
  assert.match(root, /MENU/);
});

for (const [w, h] of PHONE_VIEWPORTS) {
  test(`phone top band non-overlap at ${w}x${h}`, () => {
    const zones = phoneZoneRects(w, h);
    assert.equal(majorOverlap(zones.PROFILE, zones.STATUS), false);
    assert.equal(majorOverlap(zones.PROFILE, zones.MISSION), false);
    assert.equal(majorOverlap(zones.STATUS, zones.MISSION), false);
    assert.equal(majorOverlap(zones.STATUS, zones.NAV), false);
    assert.equal(majorOverlap(zones.NAV, zones.MINIMAP), false);
  });

  test(`phone content bounds non-overlap at ${w}x${h}`, () => {
    const bounds = phoneContentBounds(w, h);
    assert.ok(contentOverlapCount(bounds) <= 1, `overlap count ${contentOverlapCount(bounds)}`);
    assert.equal(majorOverlap(bounds.PROFILE, bounds.STATUS), false);
    assert.equal(majorOverlap(bounds.STATUS, bounds.MISSION), false);
    assert.equal(majorOverlap(bounds.NAV, bounds.MINIMAP), false);
  });

  test(`phone placement at ${w}x${h}`, () => {
    const zones = phoneZoneRects(w, h);
    assert.equal(insideViewport(zones.COMBAT, w, h, 2), true);
    assert.equal(insideViewport(zones.CHAT, w, h, 2), true);
    assert.equal(insideViewport(zones.MINIMAP, w, h, 2), true);
    assert.equal(insideViewport(zones.MISSION, w, h, 2), true);
    assert.ok(centralObstruction(zones) <= 1);
    const bounds = phoneContentBounds(w, h);
    assert.equal(consumablesOutsidePlayerSafe(bounds), true);
  });
}

test("ultrawide phone uses horizontal space without vertical blow-up", () => {
  const zones = phoneZoneRects(932, 430);
  const narrow = phoneZoneRects(754, 297);
  const sameHeight = phoneZoneRects(915, 412);
  assert.ok(zones.NAV.w > narrow.NAV.w);
  assert.ok(zones.NAV.w >= sameHeight.NAV.w);
  assert.ok(Math.abs(zones.PROFILE.h - sameHeight.PROFILE.h) < 4);
});

test("tablet and desktop profiles", async () => {
  for (const [w, h] of [TABLET, DESKTOP]) {
    assert.equal(detectProfile(w, h), "DESKTOP_TABLET");
  }
  const layout = await read("godot/scripts/ui/presentation_layout.gd");
  assert.match(layout, /ResponsiveHudLayoutSolver/);
});

test("FEUER hierarchy preserved on phone", () => {
  const zones = phoneZoneRects(754, 297);
  assert.ok(zones.COMBAT.w > zones.CONSUMABLES.h);
  assert.ok(zones.MINIMAP.w > zones.CONSUMABLES.h);
});

test("world label edge safety and collision avoidance", async () => {
  const label = await read("godot/scripts/ui/world_label.gd");
  const service = await read("godot/scripts/ui/world_label_service.gd");
  assert.match(label, /clampf\(pos\.x/);
  assert.match(service, /_resolve_label_overlap/);
});

test("write master composition artifact", async () => {
  const snapshots = {};
  for (const [w, h] of TEST_VIEWPORTS) {
    snapshots[`${w}x${h}`] = compositionSnapshot(w, h);
  }
  await mkdir(new URL("../artifacts/godot-g0.5.6", import.meta.url), { recursive: true });
  await writeFile(
    new URL("../artifacts/godot-g0.5.6/master-composition.json", import.meta.url),
    JSON.stringify({ build: "G0.5.6-MASTER-RESPONSIVE-COMPOSITION", snapshots }, null, 2),
  );
  assert.ok(snapshots["754x297"].regionOverlapCount === 0 || snapshots["754x297"].overlapCount <= 1);
});

test("G0.5.6 documentation exists", async () => {
  const analysis = await read("docs/godot-migration/G0.5.6_MASTER_COMPOSITION_ANALYSIS.md");
  const responsive = await read("docs/godot-migration/G0.5.6_RESPONSIVE_COMPOSITION.md");
  assert.ok(analysis.includes("TOP LEFT"));
  assert.ok(responsive.includes("content bounds"));
});
