class_name PlayerInputSource
extends Node

@export var player_path := NodePath("..")
@export var region_runtime_path: NodePath

@onready var player: PlayerShip = get_node(player_path)
@onready var region_runtime: Node = get_node_or_null(region_runtime_path)

var _command := PlayerCommand.new()
var _destination := Vector3.ZERO
var _has_destination := false
var _blocked_notice := ""

func _physics_process(_delta: float) -> void:
	var desktop_steering := Input.get_axis("steerLeft", "steerRight")
	var desktop_thrust := Input.get_axis("moveBackward", "moveForward")
	if absf(desktop_steering) > 0.05 or absf(desktop_thrust) > 0.05:
		cancel_navigation()
		_command.steering = desktop_steering
		_command.thrust = desktop_thrust
	elif _has_destination:
		var navigation := NavigationController.command_to_destination(
			player.global_position,
			player.global_basis,
			_destination,
			_navigation_boundaries()
		)
		if navigation.rejected:
			_blocked_notice = navigation.rejection_reason
			cancel_navigation()
		else:
			_blocked_notice = ""
			_command.steering = navigation.steering
			_command.thrust = navigation.thrust
			if not navigation.has_destination:
				cancel_navigation()
	else:
		_command.steering = 0.0
		_command.thrust = 0.0
	_command.has_destination = _has_destination
	_command.destination_point = _destination
	_command.primary_fire = Input.is_action_pressed("primaryFire")
	_command.harpoon_fire = Input.is_action_pressed("harpoonFire")
	for index in _command.abilities.size():
		_command.abilities[index] = Input.is_action_pressed("ability%d" % (index + 1))
	player.apply_command(_command)

func set_destination(value: Vector3) -> void:
	_destination = GameplayPlane.flatten(value)
	_has_destination = true

func cancel_navigation() -> void:
	_has_destination = false

func destination_active() -> bool:
	return _has_destination

func navigation_blocked_reason() -> String:
	return _blocked_notice

func input_mode_name() -> String:
	return "HYBRID_TAP_NAV"

func _navigation_boundaries() -> Array:
	if region_runtime != null and region_runtime.has_method("navigation_boundaries"):
		return region_runtime.call("navigation_boundaries")
	return []
