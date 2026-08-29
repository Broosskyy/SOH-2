extends Node3D

const ISLAND_SCENE := preload("res://scenes/islands/IslandRoot.tscn")
const HARBOR_SCENE := preload("res://scenes/harbor/HarborRoot.tscn")
const NPC_SCENE := preload("res://scenes/ships/NpcShip.tscn")

@export var region_definition: RegionDefinition

var harbor_state := HarborState.new()
var islands: Array[IslandEntity] = []
var harbors: Array[Node3D] = []
var pois: Array[PoiDefinition] = []
var active_npcs: Array[Node] = []

@onready var island_container: Node3D = $IslandContainer
@onready var harbor_container: Node3D = $HarborContainer
@onready var npc_spawner: Node = $NpcSpawner

func _ready() -> void:
	pass

func load_from_definition(definition: RegionDefinition) -> void:
	region_definition = definition
	_build_region()

func region_id() -> String:
	return region_definition.region_id if region_definition != null else ""

func navigation_boundaries() -> Array:
	return islands

func island_count() -> int:
	return islands.size()

func poi_count() -> int:
	return pois.size()

func harbor_phase() -> String:
	return harbor_state.phase_name()

func npc_count() -> int:
	return active_npcs.size()

func neutral_npc_count() -> int:
	var total := 0
	for npc in active_npcs:
		if npc is ShipEntity and npc.faction() == UnitFaction.Allegiance.FRIENDLY:
			total += 1
	return total

func hostile_npc_count() -> int:
	var total := 0
	for npc in active_npcs:
		if npc is ShipEntity and npc.faction() == UnitFaction.Allegiance.HOSTILE:
			total += 1
	return total

func _build_region() -> void:
	for island_profile in region_definition.islands:
		var island := ISLAND_SCENE.instantiate() as IslandEntity
		island.profile = island_profile
		island.name = island_profile.island_id
		island.position = island_profile.world_position
		island_container.add_child(island)
		islands.append(island)
	for harbor_profile in region_definition.harbors:
		var harbor := HARBOR_SCENE.instantiate()
		harbor.name = harbor_profile.harbor_id
		harbor.position = harbor_profile.world_position
		harbor_container.add_child(harbor)
		if harbor.has_method("configure"):
			harbor.call("configure", harbor_profile, harbor_state)
		harbors.append(harbor)
	pois = region_definition.pois.duplicate()
	_register_poi_labels()
	_spawn_poi_markers()
	if npc_spawner != null and npc_spawner.has_method("spawn_groups"):
		active_npcs = npc_spawner.call("spawn_groups", region_definition.npc_spawn_groups, navigation_boundaries())

func _catalog_to_world(catalog_position: Vector3) -> Vector3:
	return Vector3(catalog_position.x - 1500.0, 0.0, catalog_position.z - 1100.0)

func _register_poi_labels() -> void:
	var service := get_tree().get_first_node_in_group("world_label_service") as Node
	if service == null:
		return
	for poi in pois:
		if poi == null:
			continue
		var anchor := Marker3D.new()
		anchor.position = poi.world_position + Vector3(0, 36, 0)
		add_child(anchor)
		service.call_deferred("register_anchor", poi.poi_id, anchor, poi.display_name, Color(0.88, 0.72, 0.95))

func _spawn_poi_markers() -> void:
	for poi in pois:
		if poi == null or poi.poi_type != PoiDefinition.PoiType.LOOT:
			continue
		var marker := MeshInstance3D.new()
		var mesh := BoxMesh.new()
		mesh.size = Vector3(6.0, 5.0, 6.0)
		marker.mesh = mesh
		marker.position = poi.world_position + Vector3(0, 2.5, 0)
		var material := StandardMaterial3D.new()
		material.albedo_color = Color(0.92, 0.72, 0.22)
		material.emission_enabled = true
		material.emission = Color(0.45, 0.92, 0.38)
		material.emission_energy_multiplier = 0.8
		marker.material_override = material
		add_child(marker)
