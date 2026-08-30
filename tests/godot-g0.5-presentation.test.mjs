import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("G0.5 build marker and version", async () => {
  const project = await read("godot/project.godot");
  const layout = await read("godot/scripts/ui/presentation_layout.gd");
  const overlay = await read("godot/scripts/debug/debug_overlay.gd");
  assert.match(project, /config\/version="0\.[56]\.[0-8]"/);
  assert.match(layout, /G0\.(5|6)-/);
  assert.match(overlay, /G0\.(5|6)-/);
});

test("single presentation root — GameplayHUDV2 active in scene", async () => {
  const world = await read("godot/scenes/world/World.tscn");
  const hud = await read("godot/scripts/ui/v2/gameplay_hud_v2.gd");
  const legacy = await read("godot/scripts/ui/gameplay_presentation_root.gd");
  assert.match(world, /GameplayHUDV2/);
  assert.match(world, /gameplay_hud_v2\.gd/);
  assert.doesNotMatch(world, /gameplay_presentation_root\.gd/);
  assert.match(hud, /class_name GameplayHUDV2/);
  assert.match(legacy, /LEGACY/);
});

test("presentation layout uses anchored zones not full-screen containers", async () => {
  const layout = await read("godot/scripts/ui/presentation_layout.gd");
  const root = await read("godot/scripts/ui/gameplay_presentation_root.gd");
  assert.match(layout, /enum Zone/);
  assert.match(layout, /zone_rect/);
  assert.match(root, /PresentationLayout\.Zone/);
  assert.match(root, /ProfileZone/);
  assert.match(root, /fill_parent_zone/);
  assert.doesNotMatch(root, /safe\.size\.x - margin/);
});

test("top status EXP RUMPF SCHUTZ with numeric values", async () => {
  const status = await read("godot/scripts/ui/v2/widgets/status_block.gd");
  const floating = await read("godot/scripts/ui/floating_status_hud.gd");
  assert.match(status, /EXP/);
  assert.match(status, /RUMPF/);
  assert.match(status, /SCHUTZ/);
  assert.doesNotMatch(floating, /233\.000/);
});

test("top nav mission minimap zoom chat consumables combat present", async () => {
  const hud = await read("godot/scripts/ui/v2/gameplay_hud_v2.gd");
  assert.match(hud, /NavigationBlockV2/);
  assert.match(hud, /MissionBlockV2/);
  assert.match(hud, /Minimap/);
  assert.match(hud, /ZoomBlockV2/);
  assert.match(hud, /ChatBlockV2/);
  assert.match(hud, /ConsumablesBlockV2/);
  assert.match(hud, /CombatBlockV2/);
});

test("region selector absent and fullscreen action present", async () => {
  const hud = await read("godot/scripts/ui/v2/gameplay_hud_v2.gd");
  assert.doesNotMatch(hud, /CARIBBEAN SEA/);
  assert.match(hud, /_toggle_fullscreen/);
});

test("legacy gameplay HUD deprecated not scene owner", async () => {
  const legacy = await read("godot/scripts/ui/gameplay_hud.gd");
  assert.match(legacy, /DEPRECATED G0\.4/);
  assert.match(legacy, /GameplayPresentationRoot/);
});

test("Kraken and mobile web shadow fix preserved", async () => {
  const kraken = await read("godot/data/kraken_presentation_profile.tres");
  const player = await read("godot/scripts/ships/player_ship.gd");
  assert.match(kraken, /visual_scale = 52\.0/);
  assert.match(player, /KrakenModel/);
});

test("diagnostics gated and G0.5 docs exist", async () => {
  const telemetry = await read("godot/scripts/debug/mobile_web_boot_telemetry.gd");
  const inventory = await read("docs/godot-migration/G0.5_WEB_PRESENTATION_INVENTORY.md");
  const parity = await read("docs/godot-migration/G0.5_WEB_TO_GODOT_PARITY.md");
  const master = await read("docs/godot-migration/G0.5_MASTER_PARITY.md");
  assert.match(telemetry, /query_flag\("diag"\)/);
  assert.ok(inventory.includes("GameplayPresentationRoot"));
  assert.ok(parity.includes("No silent omissions"));
  assert.ok(master.includes("NOT_HARDWARE_VERIFIED"));
});
