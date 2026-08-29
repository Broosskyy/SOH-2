import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("GameUnit composition and stable identity", async () => {
  const gameUnit = await read("godot/scripts/units/game_unit.gd");
  const identity = await read("godot/scripts/units/unit_identity.gd");
  assert.match(gameUnit, /class_name GameUnit/);
  assert.match(identity, /unit_id/);
  assert.match(identity, /unit_type/);
  assert.match(identity, /display_name/);
  assert.match(identity, /faction/);
});

test("ShipEntity and ShipPresentationProfile contracts", async () => {
  const ship = await read("godot/scripts/ships/ship_entity.gd");
  const profile = await read("godot/scripts/ships/ship_presentation_profile.gd");
  const player = await read("godot/scripts/ships/player_ship.gd");
  assert.match(ship, /class_name ShipEntity/);
  assert.match(ship, /HealthComponent/);
  assert.match(ship, /TargetableComponent/);
  assert.match(profile, /visual_scale/);
  assert.match(profile, /waterline_offset/);
  assert.match(profile, /ui_anchor_height/);
  assert.match(player, /extends ShipEntity/);
});

test("RegionDefinition and RegionRuntime data-driven world", async () => {
  const definition = await read("godot/scripts/region/region_definition.gd");
  const runtime = await read("godot/scripts/region/region_runtime.gd");
  const factory = await read("godot/scripts/region/aster_region_factory.gd");
  const world = await read("godot/scenes/world/World.tscn");
  assert.match(definition, /region_id/);
  assert.match(definition, /islands/);
  assert.match(definition, /harbors/);
  assert.match(definition, /npc_spawn_groups/);
  assert.match(runtime, /func region_id/);
  assert.match(runtime, /navigation_boundaries/);
  assert.match(factory, /neutral_escort/);
  assert.match(factory, /hostile_raider/);
  assert.match(world, /RegionRuntime/);
});

test("IslandEntity proxy gameplay geometry and navigation boundaries", async () => {
  const entity = await read("godot/scripts/islands/island_entity.gd");
  const profile = await read("godot/scripts/islands/island_presentation_profile.gd");
  const root = await read("godot/scripts/islands/island_root.gd");
  assert.match(entity, /blocks_point/);
  assert.match(entity, /gameplay_footprint/);
  assert.match(profile, /size_class/);
  assert.match(profile, /use_proxy_geometry/);
  assert.match(root, /_build_proxy_geometry/);
  assert.match(root, /navigation_boundaries/);
});

test("Harbor and POI domain foundations", async () => {
  const harborDef = await read("godot/scripts/harbor/harbor_definition.gd");
  const harborState = await read("godot/scripts/harbor/harbor_state.gd");
  const harborEntity = await read("godot/scripts/harbor/harbor_entity.gd");
  const poi = await read("godot/scripts/poi/poi_definition.gd");
  assert.match(harborDef, /approach_radius/);
  assert.match(harborState, /enter_port/);
  assert.match(harborState, /leave_port/);
  assert.match(harborEntity, /enter_approach/);
  assert.match(poi, /PoiType/);
});

test("NPC behaviour, spawn groups and spawner", async () => {
  const behaviour = await read("godot/scripts/npc/npc_behaviour_profile.gd");
  const group = await read("godot/scripts/npc/npc_spawn_group.gd");
  const spawner = await read("godot/scripts/npc/npc_spawner.gd");
  const npc = await read("godot/scripts/npc/npc_ship.gd");
  assert.match(behaviour, /Mode\.PATROL/);
  assert.match(behaviour, /detection_range/);
  assert.match(group, /spawn_center/);
  assert.match(spawner, /spawn_groups/);
  assert.match(npc, /extends ShipEntity/);
});

test("Health, targetable and targeting boundaries without combat", async () => {
  const health = await read("godot/scripts/units/health_component.gd");
  const targetable = await read("godot/scripts/units/targetable_component.gd");
  const targeting = await read("godot/scripts/combat/targeting_system.gd");
  const project = await read("godot/project.godot");
  assert.match(health, /health_changed/);
  assert.match(health, /died/);
  assert.match(targetable, /is_valid_target/);
  assert.match(targeting, /set_target/);
  assert.match(targeting, /clear_target/);
  assert.match(project, /TargetingSystem=/);
});

test("Navigation command separation and island blocking", async () => {
  const command = await read("godot/scripts/navigation/navigation_command.gd");
  const controller = await read("godot/scripts/navigation/navigation_controller.gd");
  const source = await read("godot/scripts/input/player_input_source.gd");
  assert.match(command, /rejected/);
  assert.match(controller, /is_destination_blocked/);
  assert.match(source, /NavigationController/);
  assert.doesNotMatch(source, /global_position\s*=/);
});

test("World labels and responsive viewport policy", async () => {
  const labels = await read("godot/scripts/ui/world_label_service.gd");
  const world = await read("godot/scripts/world/world.gd");
  assert.match(labels, /register_anchor/);
  assert.match(labels, /unproject_position|update_projection/);
  assert.match(world, /_apply_viewport_policy/);
  assert.match(world, /CONTENT_SCALE_ASPECT_EXPAND/);
});

test("QualityManager directional shadow regression remains", async () => {
  const quality = await read("godot/scripts/quality/quality_manager.gd");
  assert.match(quality, /apply_directional_shadows/);
  assert.match(quality, /shadow_enabled/);
});

test("TEMP_REFERENCE independence — production world has no required third-party island visuals", async () => {
  const world = await read("godot/scenes/world/World.tscn");
  const islandRoot = await read("godot/scripts/islands/island_root.gd");
  assert.doesNotMatch(world, /TEMP_REFERENCE/);
  assert.doesNotMatch(world, /\.webp/);
  assert.match(islandRoot, /use_proxy_geometry|_build_proxy_geometry/);
});

test("Web export resource policy unchanged", async () => {
  const exports = await read("godot/export_presets.cfg");
  assert.match(exports, /name="Web"[\s\S]*?export_filter="all_resources"/);
});

test("Pooling foundation exists for future combat visuals", async () => {
  const pool = await read("godot/scripts/pool/object_pool.gd");
  assert.match(pool, /func acquire/);
  assert.match(pool, /func release/);
});
