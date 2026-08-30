import assert from "node:assert/strict";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import test from "node:test";
import { auditHudV2Layout, detectProfile, solveHudV2Layout } from "../scripts/godot-hud-v2-layout-model.mjs";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

const PHONE_VIEWPORTS = [
  [754, 297],
  [755, 298],
  [802, 384],
  [800, 360],
  [915, 412],
  [932, 430],
];

const ALL_VIEWPORTS = [
  ...PHONE_VIEWPORTS,
  [1024, 600],
  [1280, 720],
  [1366, 768],
  [1920, 1080],
  [2560, 1440],
];

test("G0.6 build marker and version", async () => {
  const project = await read("godot/project.godot");
  const layout = await read("godot/scripts/ui/presentation_layout.gd");
  const hud = await read("godot/scripts/ui/v2/gameplay_hud_v2.gd");
  const v2layout = await read("godot/scripts/ui/v2/hud_v2_layout.gd");
  const exportScript = await read("scripts/godot-web-export.mjs");
  assert.match(project, /config\/version="0\.6\.0"/);
  assert.match(layout, /G0\.6-HUD-V2-CLEAN-REBUILD/);
  assert.match(hud, /class_name GameplayHUDV2/);
  assert.match(v2layout, /G0\.6-HUD-V2-CLEAN-REBUILD/);
  assert.match(exportScript, /G0\.6-HUD-V2-CLEAN-REBUILD/);
});

test("only HUD V2 active in World scene", async () => {
  const world = await read("godot/scenes/world/World.tscn");
  const legacy = await read("godot/scripts/ui/gameplay_presentation_root.gd");
  assert.match(world, /GameplayHUDV2/);
  assert.match(world, /gameplay_hud_v2\.gd/);
  assert.doesNotMatch(world, /gameplay_presentation_root\.gd/);
  assert.match(legacy, /LEGACY/);
  assert.match(legacy, /deprecated G0\.6/);
});

test("responsive foundation unchanged", async () => {
  const metrics = await read("godot/scripts/ui/responsive_hud_metrics.gd");
  const contract = await read("godot/scripts/platform/web_viewport_contract.gd");
  const hud = await read("godot/scripts/ui/v2/gameplay_hud_v2.gd");
  assert.match(metrics, /logical_ui_viewport_size/);
  assert.match(metrics, /presentation_scale_uniform/);
  assert.match(contract, /presentation_resized/);
  assert.match(hud, /logical_ui_viewport_size/);
  assert.match(hud, /_apply_presentation_transform/);
  assert.doesNotMatch(hud, /hud\.scale\s*=/);
});

test("layout authority is logical viewport via HudV2Layout", async () => {
  const hud = await read("godot/scripts/ui/v2/gameplay_hud_v2.gd");
  const v2layout = await read("godot/scripts/ui/v2/hud_v2_layout.gd");
  assert.match(hud, /HudV2Layout\.solve/);
  assert.doesNotMatch(v2layout, /DPR|presentation_scale/);
});

test("widget blocks exist", async () => {
  for (const widget of [
    "profile_block.gd",
    "status_block.gd",
    "navigation_block.gd",
    "minimap_block.gd",
    "mission_block.gd",
    "zoom_block.gd",
    "movement_block.gd",
    "chat_block.gd",
    "consumables_block.gd",
    "combat_block.gd",
  ]) {
    const src = await read(`godot/scripts/ui/v2/widgets/${widget}`);
    assert.ok(src.length > 40, widget);
  }
});

test("status uses compact horizontal rows", async () => {
  const status = await read("godot/scripts/ui/v2/widgets/status_block.gd");
  assert.match(status, /HBoxContainer/);
  assert.match(status, /EXP/);
  assert.match(status, /RUMPF/);
  assert.match(status, /SCHUTZ/);
});

test("phone nav priority set", async () => {
  const nav = await read("godot/scripts/ui/v2/widgets/navigation_block.gd");
  assert.match(nav, /PHONE_PRIMARY/);
  assert.match(nav, /SHIPS/);
  assert.match(nav, /MENU/);
});

test("debug gated to qa only", async () => {
  const hud = await read("godot/scripts/ui/v2/gameplay_hud_v2.gd");
  const qa = await read("godot/scripts/debug/runtime_qa_marker.gd");
  assert.match(hud, /query_flag\("qa"\)/);
  assert.match(qa, /HudV2Metrics/);
});

test("world labels use V2 layout rects when available", async () => {
  const service = await read("godot/scripts/ui/world_label_service.gd");
  assert.match(service, /get_layout_rects/);
});

for (const [w, h] of PHONE_VIEWPORTS) {
  test(`phone HUD V2 layout @${w}x${h}`, () => {
    const audit = auditHudV2Layout(w, h);
    assert.equal(audit.overlapCount, 0, `overlap @${w}x${h}: ${audit.overlaps.join(",")}`);
    assert.equal(audit.offscreenCount, 0, `offscreen @${w}x${h}: ${audit.offscreen.join(",")}`);
    assert.ok(audit.feuerOnscreen, `FEUER offscreen @${w}x${h}`);
    assert.ok(audit.missionBelowTopBand, `mission band @${w}x${h}`);
    const layout = audit.layout;
    assert.ok(layout.status.x > layout.profile.x, "status right of profile");
    assert.ok(layout.mission.y >= layout.top_band.y + layout.top_band.h - 1, "mission below top band");
    assert.ok(layout.chat.y + layout.chat.h <= layout.safe.y + layout.safe.h + 0.5, "chat in safe rect");
    assert.ok(layout.combat.x + layout.combat.w <= layout.safe.x + layout.safe.w + 0.5, "combat in safe rect");
  });
}

test("802x384 Samsung hardware-like acceptance", () => {
  const audit = auditHudV2Layout(802, 384);
  assert.equal(detectProfile(802, 384), "PHONE_LANDSCAPE");
  assert.equal(audit.overlapCount, 0);
  assert.equal(audit.offscreenCount, 0);
});

test("754x297 ultrawide phone acceptance", () => {
  const audit = auditHudV2Layout(754, 297);
  assert.equal(audit.overlapCount, 0);
  assert.equal(audit.offscreenCount, 0);
});

for (const [w, h] of ALL_VIEWPORTS.filter(([vw, vh]) => detectProfile(vw, vh) !== "PHONE_LANDSCAPE")) {
  test(`desktop/tablet HUD V2 @${w}x${h}`, () => {
    const audit = auditHudV2Layout(w, h);
    assert.equal(audit.overlapCount, 0);
    assert.equal(audit.offscreenCount, 0);
    assert.ok(audit.feuerOnscreen);
  });
}

test("write G0.6 layout artifact", async () => {
  const snapshots = {};
  for (const [w, h] of ALL_VIEWPORTS) {
    const audit = auditHudV2Layout(w, h);
    snapshots[`${w}x${h}`] = {
      viewport: { w, h, profile: detectProfile(w, h) },
      ...audit,
    };
  }
  await mkdir(new URL("../artifacts/godot-g0.6", import.meta.url), { recursive: true });
  await writeFile(
    new URL("../artifacts/godot-g0.6/hud-v2-layout.json", import.meta.url),
    JSON.stringify({ build: "G0.6-HUD-V2-CLEAN-REBUILD", snapshots }, null, 2),
    "utf8"
  );
});
