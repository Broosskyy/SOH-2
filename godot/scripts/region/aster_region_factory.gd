class_name AsterRegionFactory
extends RefCounted

## Azurwacht — G0.4 mockup-first authored composition (Reference Group C).

static func create() -> RegionDefinition:
	var region := RegionDefinition.new()
	region.region_id = "aster_g03"
	region.display_name = "Azurwacht"
	region.world_bounds = Vector2(3000, 2200)
	region.player_spawn = MockupCompositionProfile.PLAYER_SPAWN

	region.islands = [
		_island(
			"fortress_harbor",
			"Hafen Aster",
			IslandPresentationProfile.SizeClass.LANDMARK,
			IslandPresentationProfile.ShapeClass.FORTRESS,
			MockupCompositionProfile.world_pos(460.0, -50.0),
			168.0,
			112.0,
			"rocky",
			68.0
		),
		_island(
			"palm_islet_sw",
			"",
			IslandPresentationProfile.SizeClass.SMALL,
			IslandPresentationProfile.ShapeClass.TINY_PALM_ISLET,
			MockupCompositionProfile.world_pos(-390.0, 330.0),
			62.0,
			48.0,
			"tropical",
			26.0,
			false
		),
		_island(
			"rock_spire_n",
			"",
			IslandPresentationProfile.SizeClass.XS,
			IslandPresentationProfile.ShapeClass.MINI_ROCK_SPIRE,
			MockupCompositionProfile.world_pos(25.0, -410.0),
			36.0,
			28.0,
			"rocky",
			20.0,
			false
		),
		_island(
			"coral_crescent",
			"Glasriff",
			IslandPresentationProfile.SizeClass.MEDIUM,
			IslandPresentationProfile.ShapeClass.CRESCENT_COVE,
			MockupCompositionProfile.world_pos(-200.0, -140.0),
			118.0,
			72.0,
			"tropical",
			44.0
		),
		_island(
			"beacon_islet",
			"",
			IslandPresentationProfile.SizeClass.XS,
			IslandPresentationProfile.ShapeClass.MINI_ROCK_SPIRE,
			MockupCompositionProfile.world_pos(210.0, -360.0),
			34.0,
			26.0,
			"rocky",
			18.0,
			false
		),
		_island(
			"distant_tropical",
			"Sonnenruh",
			IslandPresentationProfile.SizeClass.MEDIUM,
			IslandPresentationProfile.ShapeClass.HUGE_TROPICAL,
			MockupCompositionProfile.world_pos(-620.0, -520.0),
			145.0,
			88.0,
			"jungle",
			48.0
		),
	]

	region.harbors = [
		_harbor(
			"harbor_aster_port",
			"Hafen Aster",
			"fortress_harbor",
			MockupCompositionProfile.world_pos(420.0, 10.0)
		),
	]
	region.pois = [
		_poi("loot_chest_gold", "Schatzkiste", PoiDefinition.PoiType.LOOT, MockupCompositionProfile.world_pos(75.0, -72.0)),
		_poi("loot_chest_green", "Schatzkiste", PoiDefinition.PoiType.LOOT, MockupCompositionProfile.world_pos(-38.0, 92.0)),
		_poi("loot_chest_wood", "Schatzkiste", PoiDefinition.PoiType.LOOT, MockupCompositionProfile.world_pos(118.0, 48.0)),
		_poi("storm_beacon", "Sturmwacht", PoiDefinition.PoiType.LANDMARK, MockupCompositionProfile.world_pos(210.0, -360.0)),
		_poi("wreck_field", "Wrack", PoiDefinition.PoiType.LANDMARK, MockupCompositionProfile.world_pos(-520.0, 120.0)),
	]
	region.npc_spawn_groups = [
		_npc_group(
			"black_corsair",
			"raider",
			"Black Corsair",
			24,
			UnitFaction.Allegiance.HOSTILE,
			MockupCompositionProfile.world_pos(305.0, -255.0),
			Color(0.12, 0.1, 0.12),
			0.0
		),
		_npc_group(
			"shadow_reaper",
			"scout",
			"Shadow Reaper",
			23,
			UnitFaction.Allegiance.HOSTILE,
			MockupCompositionProfile.world_pos(-235.0, 195.0),
			Color(0.28, 0.12, 0.42),
			0.0
		),
		_npc_group(
			"red_corsair",
			"raider",
			"Red Corsair",
			24,
			UnitFaction.Allegiance.HOSTILE,
			MockupCompositionProfile.world_pos(335.0, 35.0),
			Color(0.78, 0.16, 0.12),
			0.0
		),
		_npc_group(
			"neutral_patrol",
			"escort",
			"Handelskonvoi",
			12,
			UnitFaction.Allegiance.FRIENDLY,
			MockupCompositionProfile.world_pos(-480.0, -280.0),
			Color(0.35, 0.78, 0.92),
			36.0
		),
	]
	region.set_meta("world_props", _world_props())
	return region

static func _world_props() -> Array:
	return [
		{"kind": WorldPropBuilder.PropKind.CHEST_GOLD, "position": MockupCompositionProfile.world_pos(75.0, -72.0), "seed": 1},
		{"kind": WorldPropBuilder.PropKind.CHEST_GREEN, "position": MockupCompositionProfile.world_pos(-38.0, 92.0), "seed": 2},
		{"kind": WorldPropBuilder.PropKind.CHEST_WOOD, "position": MockupCompositionProfile.world_pos(118.0, 48.0), "seed": 3},
		{"kind": WorldPropBuilder.PropKind.BUOY, "position": MockupCompositionProfile.world_pos(180.0, 160.0), "seed": 4},
		{"kind": WorldPropBuilder.PropKind.BUOY, "position": MockupCompositionProfile.world_pos(-120.0, 240.0), "seed": 5},
		{"kind": WorldPropBuilder.PropKind.WRECK, "position": MockupCompositionProfile.world_pos(-520.0, 120.0), "seed": 6},
		{"kind": WorldPropBuilder.PropKind.BEACON, "position": MockupCompositionProfile.world_pos(210.0, -360.0), "seed": 7},
	]

static func _island(
		id: String,
		name: String,
		size_class: IslandPresentationProfile.SizeClass,
		shape_class: IslandPresentationProfile.ShapeClass,
		position: Vector3,
		radius_x: float,
		radius_z: float,
		biome: String,
		label_height: float,
		show_label: bool = true
	) -> IslandPresentationProfile:
	var profile := IslandPresentationProfile.new()
	profile.island_id = id
	profile.display_name = name if show_label else ""
	profile.size_class = size_class
	profile.shape_class = shape_class
	profile.biome = biome
	profile.world_position = position
	profile.gameplay_radius_x = radius_x
	profile.gameplay_radius_z = radius_z
	profile.navigation_block_radius = maxf(radius_x, radius_z) * 0.92
	profile.world_label_height = label_height
	profile.visual_scale = WorldScaleProfile.island_visual_scale(size_class)
	profile.use_proxy_geometry = true
	profile.asset_status = IslandPresentationProfile.AssetStatus.PROCEDURAL_FALLBACK
	profile.harbor_anchor = Vector3(0, 0, radius_z * 0.42) if shape_class in [
		IslandPresentationProfile.ShapeClass.HARBOR,
		IslandPresentationProfile.ShapeClass.FORTRESS,
	] else Vector3.ZERO
	return profile

static func _harbor(id: String, name: String, island_id: String, position: Vector3) -> HarborDefinition:
	var harbor := HarborDefinition.new()
	harbor.harbor_id = id
	harbor.display_name = name
	harbor.associated_island = island_id
	harbor.world_position = position
	harbor.port_exit_position = position + Vector3(-85.0, 0.0, 40.0)
	return harbor

static func _poi(id: String, name: String, poi_type: PoiDefinition.PoiType, position: Vector3) -> PoiDefinition:
	var poi := PoiDefinition.new()
	poi.poi_id = id
	poi.display_name = name
	poi.poi_type = poi_type
	poi.world_position = position
	poi.associated_region = "aster_g03"
	return poi

static func _npc_group(
		group_id: String,
		catalog_kind: String,
		display_name: String,
		level: int,
		faction: UnitFaction.Allegiance,
		spawn_center: Vector3,
		color: Color,
		spawn_radius: float
	) -> NpcSpawnGroup:
	var definition := NpcDefinition.new()
	definition.npc_id = group_id
	definition.display_name = display_name
	definition.catalog_kind = catalog_kind
	definition.level = level
	definition.faction = faction
	definition.max_health = 8000.0 + level * 450.0
	definition.max_speed = 28.0 + level * 3.0
	definition.visual_color = color
	definition.behaviour = _patrol_profile(
		MockupCompositionProfile.patrol_ring(spawn_center, WorldScaleProfile.patrol_radius_for_npc(), 3)
	)
	var group := NpcSpawnGroup.new()
	group.group_id = group_id
	group.npc_definition = definition
	group.spawn_center = spawn_center
	group.spawn_radius = spawn_radius
	group.count = 1
	return group

static func _patrol_profile(points: Array[Vector3]) -> NpcBehaviourProfile:
	var behaviour := NpcBehaviourProfile.new()
	behaviour.behaviour_id = "patrol"
	behaviour.mode = NpcBehaviourProfile.Mode.PATROL
	behaviour.patrol_points = points
	behaviour.detection_range = 520.0
	behaviour.patrol_speed = 0.35
	return behaviour
