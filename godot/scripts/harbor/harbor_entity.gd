extends Node3D

@export var harbor_definition: HarborDefinition
var harbor_state: HarborState

@onready var approach_area: MeshInstance3D = $ApproachArea
@onready var interaction_area: MeshInstance3D = $InteractionArea
@onready var label_anchor: Marker3D = $LabelAnchor
@onready var visual_root: Node3D = $VisualRoot

func configure(definition: HarborDefinition, state: HarborState) -> void:
	harbor_definition = definition
	harbor_state = state
	add_to_group("harbors")
	HarborVisualBuilder.build_into(visual_root, harbor_definition)
	_register_label()

func _process(_delta: float) -> void:
	if harbor_definition == null or harbor_state == null:
		return
	var player := get_tree().get_first_node_in_group("player_ship") as Node3D
	if player == null:
		return
	var distance := player.global_position.distance_to(global_position)
	if distance <= harbor_definition.interaction_radius and Input.is_action_just_pressed("interact"):
		if harbor_state.is_in_port():
			_leave_port(player)
		else:
			_enter_port(player)
	elif distance <= harbor_definition.approach_radius:
		harbor_state.enter_approach(harbor_definition.harbor_id)
	elif harbor_state.active_harbor_id == harbor_definition.harbor_id and not harbor_state.is_in_port():
		harbor_state.leave_port()

func _enter_port(player: Node3D) -> void:
	harbor_state.enter_port(harbor_definition.harbor_id)
	var exit_position := harbor_definition.port_exit_position
	if exit_position == Vector3.ZERO:
		exit_position = global_position + Vector3(120, 0, 80)
	player.global_position = GameplayPlane.flatten(exit_position)

func _leave_port(player: Node3D) -> void:
	harbor_state.leave_port()
	player.global_position = GameplayPlane.flatten(global_position + Vector3(160, 0, 0))

func _register_label() -> void:
	var service := get_tree().get_first_node_in_group("world_label_service") as Node
	if service != null and harbor_definition != null:
		service.call("register_anchor", harbor_definition.harbor_id, label_anchor, harbor_definition.display_name, Color(0.95, 0.82, 0.45))
