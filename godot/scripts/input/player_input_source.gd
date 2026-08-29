class_name PlayerInputSource
extends Node

const NavalNavigationLogic = preload("res://scripts/navigation/naval_navigation.gd")

@export var player_path := NodePath("..")

@onready var player: PlayerShip = get_node(player_path)

var _command := PlayerCommand.new()
var _destination := Vector3.ZERO
var _has_destination := false

func _physics_process(_delta: float) -> void:
	var desktop_steering := Input.get_axis("steerLeft", "steerRight")
	var desktop_thrust := Input.get_axis("moveBackward", "moveForward")
	if absf(desktop_steering) > 0.05 or absf(desktop_thrust) > 0.05:
		cancel_navigation()
		_command.steering = desktop_steering
		_command.thrust = desktop_thrust
	elif _has_destination:
		var navigation: Vector2 = NavalNavigationLogic.command_to_destination(
			player.global_position,
			player.global_basis,
			_destination
		)
		_command.steering = navigation.x
		_command.thrust = navigation.y
		if navigation == Vector2.ZERO:
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

func input_mode_name() -> String:
	return "HYBRID_TAP_NAV"
