extends Node

const NPC_SCENE := preload("res://scenes/ships/NpcShip.tscn")

@export var npc_container_path: NodePath

var _container: Node

func _ready() -> void:
	_container = get_node(npc_container_path)

func spawn_groups(groups: Array[NpcSpawnGroup], _boundaries: Array) -> Array[Node]:
	var spawned: Array[Node] = []
	for group in groups:
		if group == null or group.npc_definition == null:
			continue
		for index in group.count:
			var npc := NPC_SCENE.instantiate() as NpcShip
			npc.name = "%s_%02d" % [group.group_id, index + 1]
			npc.identity = _identity_for(group.npc_definition, npc.name)
			npc.presentation_profile = _presentation_for(group.npc_definition)
			npc.configure_npc(
				group.npc_definition,
				group.behaviour_override if group.behaviour_override != null else group.npc_definition.behaviour,
				_spawn_position(group, index)
			)
			_container.add_child(npc)
			spawned.append(npc)
	return spawned

func _identity_for(definition: NpcDefinition, runtime_id: String) -> UnitIdentity:
	var identity := UnitIdentity.new()
	identity.unit_id = runtime_id
	identity.unit_type = "npc_ship"
	identity.display_name = definition.display_name
	identity.faction = definition.faction
	return identity

func _presentation_for(definition: NpcDefinition) -> ShipPresentationProfile:
	var profile := ShipPresentationProfile.new()
	profile.visual_scale = 18.0 if definition.faction == UnitFaction.Allegiance.FRIENDLY else 20.0
	profile.visual_yaw_degrees = 180.0
	profile.waterline_offset = 6.0
	profile.ui_anchor_height = 24.0
	profile.ui_safe_gap = 8.0
	profile.half_length = 22.0
	profile.half_width = 8.0
	return profile

func _spawn_position(group: NpcSpawnGroup, index: int) -> Vector3:
	var angle := (TAU / maxf(1, group.count)) * index
	var offset := Vector3(cos(angle), 0.0, sin(angle)) * group.spawn_radius
	return GameplayPlane.flatten(group.spawn_center + offset)
