import assert from "node:assert/strict";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import test from "node:test";
import {
  contentContainmentSnapshot,
  contentFitsRegion,
  detectProfile,
  estimateCombatContentSize,
  estimateIdentityContentSize,
  estimateStatusContentSize,
  feuerOnscreen,
  solvePhoneLayout,
  validateSolution,
} from "../scripts/godot-phone-layout-model.mjs";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

const TEST_VIEWPORTS = [
  [754, 297],
  [755, 298],
  [802, 384],
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

test("G0.5.8 build marker and version", async () => {
  const project = await read("godot/project.godot");
  const layout = await read("godot/scripts/ui/presentation_layout.gd");
  const containment = await read("godot/scripts/ui/hud_region_containment.gd");
  const exportScript = await read("scripts/godot-web-export.mjs");
  assert.match(project, /config\/version="0\.5\.8"/);
  assert.match(layout, /G0\.5\.8-RUNTIME-CONTENT-CONTAINMENT/);
  assert.match(containment, /G0\.5\.8-RUNTIME-CONTENT-CONTAINMENT/);
  assert.match(exportScript, /G0\.5\.8-RUNTIME-CONTENT-CONTAINMENT/);
});

test("responsive foundation unchanged", async () => {
  const metrics = await read("godot/scripts/ui/responsive_hud_metrics.gd");
  const contract = await read("godot/scripts/platform/web_viewport_contract.gd");
  const solver = await read("godot/scripts/ui/responsive_hud_layout_solver.gd");
  const root = await read("godot/scripts/ui/gameplay_presentation_root.gd");
  assert.match(metrics, /logical_ui_viewport_size/);
  assert.match(metrics, /presentation_scale_uniform/);
  assert.match(contract, /presentation_resized/);
  assert.match(root, /_apply_presentation_transform/);
  assert.doesNotMatch(root, /css_to_render/);
  assert.doesNotMatch(solver, /802|754|Samsung/);
});

test("final-frame validation phase exists", async () => {
  const root = await read("godot/scripts/ui/gameplay_presentation_root.gd");
  assert.match(root, /_finalize_layout/);
  assert.match(root, /HudRegionContainment/);
  assert.match(root, /get_containment_audit/);
});

test("compact status rows are single-line HBox", async () => {
  const root = await read("godot/scripts/ui/gameplay_presentation_root.gd");
  assert.match(root, /func _status_row\(title: String, bar: ProgressBar, value_var: String\) -> HBoxContainer/);
});

test("combat cluster uses contained layout helper", async () => {
  const root = await read("godot/scripts/ui/gameplay_presentation_root.gd");
  const containment = await read("godot/scripts/ui/hud_region_containment.gd");
  assert.match(root, /layout_combat_cluster/);
  assert.match(containment, /clamp_position_in_rect/);
  assert.doesNotMatch(root, /clip_contents = true/);
});

test("debug gated to qa/diag only", async () => {
  const qaMarker = await read("godot/scripts/debug/runtime_qa_marker.gd");
  const overlay = await read("godot/scripts/debug/debug_overlay.gd");
  const zone = await read("godot/scripts/ui/hud_zone.gd");
  assert.match(qaMarker, /query_flag\("qa"\)/);
  assert.match(overlay, /query_flag\("diag"\)/);
  assert.match(zone, /%s R/);
  assert.match(zone, /%s C/);
});

test("world label HUD avoidance uses all major regions", async () => {
  const service = await read("godot/scripts/ui/world_label_service.gd");
  for (const key of ["identity", "status", "nav", "minimap", "mission", "zoom", "movement", "chat", "consumables", "combat"]) {
    assert.match(service, new RegExp(`"${key}"`));
  }
});

for (const [w, h] of PHONE_VIEWPORTS) {
  test(`content containment @${w}x${h}`, () => {
    const snap = contentContainmentSnapshot(w, h);
    assert.equal(snap.overlapCount, 0, `region overlap @${w}x${h}`);
    assert.equal(snap.offscreenCount, 0, `offscreen @${w}x${h}`);
    assert.equal(snap.overflowCount, 0, `content overflow @${w}x${h}: ${snap.overflows.join(",")}`);
    assert.ok(snap.feuerOnscreen, `FEUER offscreen @${w}x${h}`);
    assert.ok(snap.missionBelowTopBand, `mission band @${w}x${h}`);
  });
}

test("802x384 Samsung hardware-like case", () => {
  const snap = contentContainmentSnapshot(802, 384);
  assert.equal(snap.viewport.profile, "PHONE_LANDSCAPE");
  assert.equal(snap.overflowCount, 0);
  assert.ok(contentFitsRegion(snap.identity.content, snap.identity.reserved));
  assert.ok(contentFitsRegion(snap.status.content, snap.status.reserved));
  assert.ok(contentFitsRegion(snap.combat.content, snap.combat.reserved));
  const s = solvePhoneLayout(802, 384);
  assert.ok(feuerOnscreen(s, { w: 802, h: 384 }));
});

test("combined minimum size regression estimates", () => {
  const s = solvePhoneLayout(802, 384);
  const statusContent = estimateStatusContentSize(s.status);
  const identityContent = estimateIdentityContentSize(s.identity);
  const combatContent = estimateCombatContentSize(s.combat);
  assert.ok(contentFitsRegion(statusContent, s.status));
  assert.ok(contentFitsRegion(identityContent, s.identity));
  assert.ok(contentFitsRegion(combatContent, s.combat));
});

test("runtime containment artifact", async () => {
  const snapshots = {};
  for (const [w, h] of TEST_VIEWPORTS) {
    snapshots[`${w}x${h}`] = contentContainmentSnapshot(w, h);
  }
  await mkdir(new URL("../artifacts/godot-g0.5.8", import.meta.url), { recursive: true });
  await writeFile(
    new URL("../artifacts/godot-g0.5.8/runtime-content-containment.json", import.meta.url),
    JSON.stringify({ build: "G0.5.8-RUNTIME-CONTENT-CONTAINMENT", snapshots }, null, 2),
  );
  assert.equal(snapshots["802x384"].overflowCount, 0);
});

test("ultrawide phone and tablet/desktop", () => {
  const ultra = validateSolution(932, 430);
  assert.equal(ultra.overlaps, 0);
  assert.equal(detectProfile(1280, 720), "DESKTOP_TABLET");
  assert.equal(detectProfile(1920, 1080), "DESKTOP_TABLET");
});
