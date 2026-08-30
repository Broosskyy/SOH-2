import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("G0.3.3 build marker and version (historical)", async () => {
  const project = await read("godot/project.godot");
  const overlay = await read("godot/scripts/debug/debug_overlay.gd");
  const capture = await read("godot/scripts/debug/qa_capture.gd");
  assert.match(project, /config\/version="0\.[0-9]+\.[0-9]+"/);
  assert.match(overlay, /BUILD: G0\./);
  assert.match(capture, /G0\./);
  assert.match(capture, /artifacts\/godot-g0\./);
});

test("HudLayout semantic sizing contract", async () => {
  const layout = await read("godot/scripts/ui/hud_layout.gd");
  const floating = await read("godot/scripts/ui/floating_status_hud.gd");
  assert.match(layout, /enum Semantic/);
  assert.match(layout, /FLOATING_PLAYER/);
  assert.match(layout, /semantic_scale/);
  assert.match(floating, /Semantic\.FLOATING_PLAYER/);
  assert.doesNotMatch(floating, /PanelContainer/);
});

test("floating player HUD compact bounds", async () => {
  const floating = await read("godot/scripts/ui/floating_status_hud.gd");
  assert.match(floating, /floating_width/);
  assert.match(floating, /logical\.y \* \(0\.00/);
  assert.match(floating, /compact := true/);
});

test("world scale profile canonical relationships", async () => {
  const profile = await read("godot/scripts/world/world_scale_profile.gd");
  const factory = await read("godot/scripts/region/aster_region_factory.gd");
  assert.match(profile, /island_visual_scale/);
  assert.match(profile, /NPC_VISUAL_ROOT_SCALE/);
  assert.match(profile, /gameplay_spawn_corridor/);
  assert.match(factory, /WorldScaleProfile\.island_visual_scale/);
  assert.match(factory, /MockupCompositionProfile|WorldScaleProfile\.gameplay_spawn_corridor/);
});

test("NPC floating label with HP bar", async () => {
  const label = await read("godot/scripts/ui/world_label.gd");
  const service = await read("godot/scripts/ui/world_label_service.gd");
  const npc = await read("godot/scripts/npc/npc_ship.gd");
  assert.match(label, /configure_npc/);
  assert.match(label, /update_hp/);
  assert.match(service, /register_npc_anchor/);
  assert.match(npc, /register_npc_anchor/);
});

test("world props and composition data", async () => {
  const factory = await read("godot/scripts/region/aster_region_factory.gd");
  const runtime = await read("godot/scripts/region/region_runtime.gd");
  const props = await read("godot/scripts/world/world_prop_builder.gd");
  assert.match(factory, /_world_props/);
  assert.match(runtime, /_spawn_world_props/);
  assert.match(runtime, /_apply_player_spawn/);
  assert.match(props, /PropKind\.BUOY/);
  assert.match(props, /PropKind\.WRECK/);
});

test("target presentation and combat layout placeholders", async () => {
  const root = await read("godot/scripts/ui/gameplay_presentation_root.gd");
  assert.match(root, /_target/);
  assert.match(root, /CombatCluster/);
  assert.match(root, /disabled = true/);
  assert.match(root, /TargetingSystem/);
});

test("island asset status classification", async () => {
  const profile = await read("godot/scripts/islands/island_presentation_profile.gd");
  const manifest = await read("godot/data/island_asset_manifest.json");
  assert.match(profile, /enum AssetStatus/);
  assert.match(profile, /PROCEDURAL_FALLBACK/);
  assert.match(manifest, /"asset_status"/);
});

test("single mobile control owner", async () => {
  const mobile = await read("godot/scripts/input/mobile_controls.gd");
  assert.match(mobile, /KAMERA/);
  assert.doesNotMatch(mobile, /FEUER/);
});

test("diagnostic overlay gated and build marker", async () => {
  const overlay = await read("godot/scripts/debug/debug_overlay.gd");
  assert.match(overlay, /MobileWebDiagnostics\.query_flag\("diag"\)/);
  assert.match(overlay, /G0\.(6|5|4|3\.3)-/);
});

test("G0.3.3 documentation set exists", async () => {
  const docs = [
    "docs/godot-migration/G0.3.3_VISUAL_INVENTORY.md",
    "docs/godot-migration/G0.3.3_WEB_PARITY.md",
    "docs/godot-migration/G0.3.3_TARGET_PARITY.md",
    "docs/godot-migration/G0.3.3_WORLD_SCALE.md",
    "docs/godot-migration/G0.3.3_WORLD_COMPOSITION.md",
    "docs/godot-migration/G0.3.3_HUD_RECOVERY.md",
    "docs/godot-migration/G0.3.3_ASSET_TRANSITION.md",
    "docs/godot-migration/G0.3.3_REPORT.md",
  ];
  for (const doc of docs) {
    const content = await read(doc);
    assert.ok(content.length > 100, `${doc} should be populated`);
  }
});
