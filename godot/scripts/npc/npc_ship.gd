class_name NpcShip
extends ShipEntity

@export var npc_definition: NpcDefinition
@export var behaviour_profile: NpcBehaviourProfile

var forward_speed := 0.0
var _patrol_index := 0
var _idle_timer := 0.0
var _player: Node3D

@onready var npc_controller: Node = $NpcController
@onready var visual_root_node: Node3D = $VisualRoot
@onready var wake: ShipWake = $VFXRoot/Wake

func _ready() -> void:
	_player = get_tree().get_first_node_in_group("player_ship") as Node3D
	if health != null and npc_definition != null:
		health.max_health = npc_definition.max_health
		health.current_health = npc_definition.max_health
	apply_presentation_profile()
	if npc_definition != null:
		NpcShipVisualBuilder.build_into(visual_root_node, npc_definition)
		visual_root.scale = Vector3.ONE * WorldScaleProfile.NPC_VISUAL_ROOT_SCALE
		visual_root.position.y = 2.5
		if ui_anchor != null:
			ui_anchor.position.y = WorldScaleProfile.NPC_UI_ANCHOR_Y
	if wake != null:
		wake.follow_target = self
	add_to_group("npc_ships")
	add_to_group("targetable_units")
	call_deferred("_register_world_label")

func configure_npc(
		definition: NpcDefinition,
		behaviour: NpcBehaviourProfile,
		spawn_position: Vector3
	) -> void:
	npc_definition = definition
	behaviour_profile = behaviour
	position = GameplayPlane.flatten(spawn_position)
	set_heading_degrees(randi_range(0, 359))

func _physics_process(delta: float) -> void:
	position.y = GameplayPlane.WATER_Y
	if behaviour_profile == null or npc_definition == null:
		return
	match behaviour_profile.mode:
		NpcBehaviourProfile.Mode.IDLE:
			_idle(delta)
		NpcBehaviourProfile.Mode.PATROL:
			_patrol(delta)
		_:
			_idle(delta)
	velocity = -transform.basis.z * forward_speed
	velocity.y = 0.0
	move_and_slide()
	position.y = GameplayPlane.WATER_Y

func _idle(delta: float) -> void:
	forward_speed = move_toward(forward_speed, 0.0, npc_definition.max_speed * delta)
	_idle_timer += delta
	if _idle_timer >= behaviour_profile.idle_duration:
		_idle_timer = 0.0
		if behaviour_profile.patrol_points.size() > 0:
			behaviour_profile.mode = NpcBehaviourProfile.Mode.PATROL

func _patrol(delta: float) -> void:
	if behaviour_profile.patrol_points.is_empty():
		_idle(delta)
		return
	var target := behaviour_profile.patrol_points[_patrol_index]
	var nav := NavalNavigation.command_to_destination(global_position, global_basis, target)
	rotate_y(-nav.x * npc_definition.turn_speed * delta)
	forward_speed = move_toward(
		forward_speed,
		nav.y * npc_definition.max_speed * behaviour_profile.patrol_speed,
		npc_definition.max_speed * delta
	)
	if nav.y <= 0.05:
		_patrol_index = (_patrol_index + 1) % behaviour_profile.patrol_points.size()
	if _player != null and behaviour_profile.detection_range > 0.0:
		var distance := global_position.distance_to(_player.global_position)
		if distance <= behaviour_profile.detection_range:
			pass

func level_label() -> String:
	return "LV %d" % npc_definition.level if npc_definition != null else ""

func _register_world_label() -> void:
	var service := get_tree().get_first_node_in_group("world_label_service") as Node
	if service == null or identity == null or npc_definition == null:
		return
	var hostile := faction() == UnitFaction.Allegiance.HOSTILE
	var color := Color(1.0, 0.45, 0.32) if hostile else Color(0.45, 0.86, 1.0)
	var label_text := "%s  LV %d" % [display_name(), npc_definition.level]
	service.call("register_npc_anchor", unit_id(), ui_anchor, label_text, color, npc_definition.max_health)

const NavalNavigation = preload("res://scripts/navigation/naval_navigation.gd")
