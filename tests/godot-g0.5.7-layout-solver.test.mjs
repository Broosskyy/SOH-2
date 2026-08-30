import assert from "node:assert/strict";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import test from "node:test";
import {
  compositionSnapshot,
  consumablesOutsidePlayerSafe,
  detectProfile,
  feuerOnscreen,
  majorOverlap,
  phoneZoneRects,
  regionOverlapCount,
  solvePhoneLayout,
  validateSolution,
} from "../scripts/godot-phone-layout-model.mjs";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

const TEST_VIEWPORTS = [
  [754, 297],
  [755, 298],
  [800, 360],
  [915, 412],
  [932, 430],
  [1024, 600],
  [1280, 720],
  [1366, 768],
  [1920, 1080],
  [2560, 1440],
];

const PHONE_VIEWPORTS = TEST_VIEWPORTS.filter(([w, h]) => detectProfile(w, h) === "PHONE_LANDSCAPE");

test("G0.5.7 build marker and version (superseded by G0.5.8)", async () => {
  const project = await read("godot/project.godot");
  const layout = await read("godot/scripts/ui/presentation_layout.gd");
  const solver = await read("godot/scripts/ui/responsive_hud_layout_solver.gd");
  const exportScript = await read("scripts/godot-web-export.mjs");
  assert.match(project, /config\/version="0\.6\.0"/);
  assert.match(layout, /G0\.6-HUD-V2-CLEAN-REBUILD/);
  assert.match(solver, /G0\.5\.7-RESERVED-REGION-LAYOUT/);
  assert.match(exportScript, /G0\.6-HUD-V2-CLEAN-REBUILD/);
});

test("single layout authority delegates to ResponsiveHudLayoutSolver", async () => {
  const layout = await read("godot/scripts/ui/presentation_layout.gd");
  const root = await read("godot/scripts/ui/gameplay_presentation_root.gd");
  assert.match(layout, /ResponsiveHudLayoutSolver\.zone_rect/);
  assert.match(root, /PresentationLayout\.solve/);
  assert.doesNotMatch(layout, /_phone_zone_rect/);
});

test("responsive foundation unchanged", async () => {
  const metrics = await read("godot/scripts/ui/responsive_hud_metrics.gd");
  const contract = await read("godot/scripts/platform/web_viewport_contract.gd");
  assert.match(metrics, /logical_ui_viewport_size/);
  assert.match(metrics, /presentation_scale_uniform/);
  assert.match(contract, /presentation_resized/);
  assert.doesNotMatch(metrics, /MASTER_WIDTH|MASTER_HEIGHT/);
});

test("debug visuals gated behind qa/diag query flags", async () => {
  const root = await read("godot/scripts/ui/gameplay_presentation_root.gd");
  const qaMarker = await read("godot/scripts/debug/runtime_qa_marker.gd");
  const overlay = await read("godot/scripts/debug/debug_overlay.gd");
  assert.match(root, /MobileWebDiagnostics\.query_flag\("qa"\)/);
  assert.match(qaMarker, /query_flag\("qa"\)/);
  assert.match(overlay, /query_flag\("diag"\)/);
});

for (const [w, h] of PHONE_VIEWPORTS) {
  test(`phone reserved regions @${w}x${h}`, () => {
    const validation = validateSolution(w, h);
    assert.equal(validation.overlaps, 0, `region overlaps at ${w}x${h}`);
    assert.equal(validation.offscreen.length, 0, `offscreen regions at ${w}x${h}: ${validation.offscreen.join(",")}`);
    assert.ok(validation.feuerOnscreen, `FEUER/combat offscreen at ${w}x${h}`);
    assert.ok(validation.missionBelowTopBand, `mission overlaps top band at ${w}x${h}`);
    const zones = phoneZoneRects(w, h);
    assert.ok(consumablesOutsidePlayerSafe({ CONSUMABLES: zones.CONSUMABLES, PLAYER_SAFE: zones.CENTER_SAFE }));
  });
}

test("ultrawide phone landscape", () => {
  const snap = compositionSnapshot(932, 430);
  assert.equal(snap.regionOverlapCount, 0);
  assert.ok(snap.feuerOnscreen);
});

test("tablet and desktop profiles use solver", () => {
  assert.equal(detectProfile(1280, 720), "DESKTOP_TABLET");
  assert.equal(detectProfile(1920, 1080), "DESKTOP_TABLET");
  const zones = phoneZoneRects(1280, 720);
  assert.ok(zones.PROFILE.w > 0);
});

test("layout solver artifact", async () => {
  const snapshots = TEST_VIEWPORTS.map(([w, h]) => compositionSnapshot(w, h));
  await mkdir(new URL("../artifacts/godot-g0.5.7", import.meta.url), { recursive: true });
  await writeFile(
    new URL("../artifacts/godot-g0.5.7/layout-solver.json", import.meta.url),
    JSON.stringify({ build: "G0.5.7-RESERVED-REGION-LAYOUT", snapshots }, null, 2),
  );
  const phone754 = snapshots.find((s) => s.viewport.w === 754 && s.viewport.h === 297);
  assert.ok(phone754);
  assert.equal(phone754.regionOverlapCount, 0);
  assert.equal(phone754.offscreen.length, 0);
});

test("combat layout stays inside reserved region", async () => {
  const root = await read("godot/scripts/ui/gameplay_presentation_root.gd");
  const containment = await read("godot/scripts/ui/hud_region_containment.gd");
  assert.match(root, /layout_combat_cluster/);
  assert.match(root, /_finalize_layout/);
  assert.match(containment, /layout_combat_cluster/);
});

test("world label HUD avoidance uses solver regions", async () => {
  const service = await read("godot/scripts/ui/world_label_service.gd");
  assert.match(service, /ResponsiveHudLayoutSolver\.solve/);
  assert.match(service, /_should_hide_for_hud/);
});

test("fullscreen reflow hook remains on viewport contract", async () => {
  const root = await read("godot/scripts/ui/gameplay_presentation_root.gd");
  assert.match(root, /WebViewportContract\.presentation_resized/);
  assert.match(root, /WebViewportContract\.request_sync/);
});

test("nav overflow on phone uses priority strip", async () => {
  const root = await read("godot/scripts/ui/gameplay_presentation_root.gd");
  assert.match(root, /PHONE_NAV_PRIORITY/);
  assert.ok((await read("godot/scripts/ui/gameplay_presentation_root.gd")).includes("MENU"));
});

test("754x297 explicit overlap pairs", () => {
  const solution = solvePhoneLayout(754, 297);
  const pairs = [
    ["identity", "status"],
    ["identity", "mission"],
    ["identity", "nav"],
    ["status", "nav"],
    ["status", "mission"],
    ["nav", "minimap"],
    ["mission", "zoom"],
    ["zoom", "movement"],
    ["movement", "chat"],
    ["chat", "consumables"],
    ["consumables", "combat"],
    ["combat", "minimap"],
  ];
  for (const [a, b] of pairs) {
    assert.ok(!majorOverlap(solution[a], solution[b]), `${a} vs ${b}`);
  }
  assert.ok(feuerOnscreen(solution, { w: 754, h: 297 }));
});
