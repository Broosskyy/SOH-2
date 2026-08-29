class_name AsterRegionFactory
extends RefCounted

## Azurwacht (aster_g03) — positions and radii recovered from V20.3.2 `gameData.ts` / `catalog.v1.json`.

static func create() -> RegionDefinition:
	var region := RegionDefinition.new()
	region.region_id = "aster_g03"
	region.display_name = "Azurwacht"
	region.world_bounds = Vector2(3000, 2200)
	region.player_spawn = Vector3.ZERO

	region.islands = [
		_island(
			"harbor_aster",
			"Hafen Aster",
			IslandPresentationProfile.SizeClass.LARGE,
			IslandPresentationProfile.ShapeClass.HARBOR,
			_catalog(410, 900),
			210,
			135,
			"tropical",
			62.0
		),
		_island(
			"glass_reef",
			"Glasriff",
			IslandPresentationProfile.SizeClass.MEDIUM,
			IslandPresentationProfile.ShapeClass.CRESCENT_COVE,
			_catalog(1200, 370),
			170,
			95,
			"tropical",
			52.0
		),
		_island(
			"sun_rest",
			"Sonnenruh",
			IslandPresentationProfile.SizeClass.LARGE,
			IslandPresentationProfile.ShapeClass.HUGE_TROPICAL,
			_catalog(2050, 1260),
			230,
			135,
			"jungle",
			58.0
		),
		_island(
			"watch_cliff",
			"Wachtklippe",
			IslandPresentationProfile.SizeClass.MEDIUM,
			IslandPresentationProfile.ShapeClass.TALL_CLIFF,
			_catalog(2580, 480),
			145,
			90,
			"rocky",
			54.0
		),
		_island(
			"reef_spire_a",
			"",
			IslandPresentationProfile.SizeClass.XS,
			IslandPresentationProfile.ShapeClass.MINI_ROCK_SPIRE,
			_catalog(860, 620),
			38,
			28,
			"rocky",
			22.0,
			false
		),
		_island(
			"reef_spire_b",
			"",
			IslandPresentationProfile.SizeClass.XS,
			IslandPresentationProfile.ShapeClass.MINI_ROCK_SPIRE,
			_catalog(1780, 980),
			42,
			30,
			"rocky",
			22.0,
			false
		),
		_island(
			"palm_islet",
			"",
			IslandPresentationProfile.SizeClass.SMALL,
			IslandPresentationProfile.ShapeClass.TINY_PALM_ISLET,
			_catalog(1320, 1120),
			58,
			44,
			"tropical",
			28.0,
			false
		),
	]

	region.harbors = [
		_harbor(
			"harbor_aster_port",
			"Hafen Aster",
			"harbor_aster",
			_catalog(410, 900) + Vector3(55, 0, 72)
		),
	]
	region.pois = [
		_poi("storm_beacon", "Sturmwacht", PoiDefinition.PoiType.LANDMARK, _catalog(1540, 650)),
		_poi("loot_crate_a", "Treibgut", PoiDefinition.PoiType.LOOT, _catalog(680, 480)),
		_poi("loot_crate_b", "Treibgut", PoiDefinition.PoiType.LOOT, _catalog(1920, 820)),
	]
	region.npc_spawn_groups = [
		_npc_group("hostile_raider_a", "raider", "Scherben-Plünderer", 1, UnitFaction.Allegiance.HOSTILE, _catalog(1050, 1040), Color(0.82, 0.24, 0.18)),
		_npc_group("hostile_scout", "scout", "Nox-Kundschafter", 2, UnitFaction.Allegiance.HOSTILE, _catalog(1540, 650), Color(0.72, 0.22, 0.2)),
		_npc_group("neutral_escort", "escort", "Kupfer-Eskorte", 3, UnitFaction.Allegiance.FRIENDLY, _catalog(2050, 550), Color(0.35, 0.78, 0.92)),
		_npc_group("hostile_raider_b", "raider", "Scherben-Plünderer", 1, UnitFaction.Allegiance.HOSTILE, _catalog(2450, 1450), Color(0.78, 0.2, 0.16)),
	]
	return region

static func _catalog(x: float, y: float) -> Vector3:
	return Vector3(x - 1500.0, 0.0, y - 1100.0)

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
	profile.visual_scale = 0.58
	profile.use_proxy_geometry = true
	profile.harbor_anchor = Vector3(0, 0, radius_z * 0.42) if shape_class == IslandPresentationProfile.ShapeClass.HARBOR else Vector3.ZERO
	return profile

static func _harbor(id: String, name: String, island_id: String, position: Vector3) -> HarborDefinition:
	var harbor := HarborDefinition.new()
	harbor.harbor_id = id
	harbor.display_name = name
	harbor.associated_island = island_id
	harbor.world_position = position
	harbor.port_exit_position = position + Vector3(95, 0, 55)
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
		color: Color
	) -> NpcSpawnGroup:
	var definition := NpcDefinition.new()
	definition.npc_id = group_id
	definition.display_name = display_name
	definition.catalog_kind = catalog_kind
	definition.level = level
	definition.faction = faction
	definition.max_health = 300.0 + level * 110.0
	definition.max_speed = 34.0 + level * 4.0
	definition.visual_color = color
	definition.behaviour = _patrol_profile(_patrol_ring(spawn_center, 120.0, 3))
	var group := NpcSpawnGroup.new()
	group.group_id = group_id
	group.npc_definition = definition
	group.spawn_center = spawn_center
	group.count = 1
	return group

static func _patrol_ring(center: Vector3, radius: float, count: int) -> Array[Vector3]:
	var points: Array[Vector3] = []
	for index in count:
		var angle := TAU * float(index) / float(count)
		points.append(center + Vector3(cos(angle) * radius, 0.0, sin(angle) * radius))
	return points

static func _patrol_profile(points: Array[Vector3]) -> NpcBehaviourProfile:
	var behaviour := NpcBehaviourProfile.new()
	behaviour.behaviour_id = "patrol"
	behaviour.mode = NpcBehaviourProfile.Mode.PATROL
	behaviour.patrol_points = points
	behaviour.detection_range = 520.0
	return behaviour
