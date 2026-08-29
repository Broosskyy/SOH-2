class_name AsterRegionFactory
extends RefCounted

static func create() -> RegionDefinition:
	var region := RegionDefinition.new()
	region.region_id = "aster_g03"
	region.display_name = "Azurwacht"
	region.world_bounds = Vector2(3000, 2200)
	region.player_spawn = Vector3.ZERO

	region.islands = [
		_island("glass_reef", "Glasriff", IslandPresentationProfile.SizeClass.SMALL, Vector3(390, 0, -190), 95, 72),
		_island("sun_rest", "Sonnenruh", IslandPresentationProfile.SizeClass.MEDIUM, Vector3(-430, 0, -285), 135, 98),
		_island("watch_cliff", "Wachtklippe", IslandPresentationProfile.SizeClass.LANDMARK, Vector3(820, 0, 520), 165, 120),
	]

	region.harbors = [_harbor("harbor_aster", "Hafen Aster", "sun_rest", Vector3(-312, 0, -161))]
	region.pois = [_poi("storm_beacon", "Sturmwacht", PoiDefinition.PoiType.LANDMARK, Vector3(180, 0, 360))]
	region.npc_spawn_groups = [_neutral_group(), _hostile_group()]
	return region

static func _island(
		id: String,
		name: String,
		size_class: IslandPresentationProfile.SizeClass,
		position: Vector3,
		radius_x: float,
		radius_z: float
	) -> IslandPresentationProfile:
	var profile := IslandPresentationProfile.new()
	profile.island_id = id
	profile.display_name = name
	profile.size_class = size_class
	profile.world_position = position
	profile.gameplay_radius_x = radius_x
	profile.gameplay_radius_z = radius_z
	profile.navigation_block_radius = radius_x * 0.92
	profile.world_label_height = 42.0 if size_class == IslandPresentationProfile.SizeClass.SMALL else 58.0
	profile.use_proxy_geometry = true
	return profile

static func _harbor(id: String, name: String, island_id: String, position: Vector3) -> HarborDefinition:
	var harbor := HarborDefinition.new()
	harbor.harbor_id = id
	harbor.display_name = name
	harbor.associated_island = island_id
	harbor.world_position = position
	harbor.port_exit_position = position + Vector3(90, 0, 45)
	return harbor

static func _poi(id: String, name: String, poi_type: PoiDefinition.PoiType, position: Vector3) -> PoiDefinition:
	var poi := PoiDefinition.new()
	poi.poi_id = id
	poi.display_name = name
	poi.poi_type = poi_type
	poi.world_position = position
	poi.associated_region = "aster_g03"
	return poi

static func _neutral_group() -> NpcSpawnGroup:
	var definition := NpcDefinition.new()
	definition.npc_id = "neutral_escort"
	definition.display_name = "Handelskonvoi"
	definition.catalog_kind = "escort"
	definition.faction = UnitFaction.Allegiance.FRIENDLY
	definition.max_health = 520.0
	definition.max_speed = 28.0
	definition.visual_color = Color(0.35, 0.78, 0.92)
	definition.behaviour = _patrol_profile([
		Vector3(180, 0, 220),
		Vector3(420, 0, 120),
		Vector3(260, 0, -40),
	])
	var group := NpcSpawnGroup.new()
	group.group_id = "neutral_escort"
	group.npc_definition = definition
	group.spawn_center = Vector3(220, 0, 140)
	group.count = 1
	return group

static func _hostile_group() -> NpcSpawnGroup:
	var definition := NpcDefinition.new()
	definition.npc_id = "hostile_raider"
	definition.display_name = "Scherben-Plünderer"
	definition.catalog_kind = "raider"
	definition.faction = UnitFaction.Allegiance.HOSTILE
	definition.max_health = 300.0
	definition.max_speed = 34.0
	definition.visual_color = Color(0.82, 0.24, 0.18)
	definition.behaviour = _patrol_profile([
		Vector3(-620, 0, -80),
		Vector3(-420, 0, -220),
		Vector3(-180, 0, -120),
	])
	var group := NpcSpawnGroup.new()
	group.group_id = "hostile_raider"
	group.npc_definition = definition
	group.spawn_center = Vector3(-520, 0, -120)
	group.count = 1
	return group

static func _patrol_profile(points: Array[Vector3]) -> NpcBehaviourProfile:
	var behaviour := NpcBehaviourProfile.new()
	behaviour.behaviour_id = "patrol"
	behaviour.mode = NpcBehaviourProfile.Mode.PATROL
	behaviour.patrol_points = points
	behaviour.detection_range = 520.0
	return behaviour
