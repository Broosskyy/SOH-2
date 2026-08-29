class_name PlayerInputSource
extends Node

@export var player_path := NodePath("..")

@onready var player: PlayerShip = get_node(player_path)

var _touch_vector := Vector2.ZERO
var _command := PlayerCommand.new()

func _physics_process(_delta: float) -> void:
	_command.steering = Input.get_axis("steerLeft", "steerRight")
	_command.thrust = Input.get_axis("moveBackward", "moveForward")
	if _touch_vector.length() > 0.12:
		_command.steering = _touch_vector.x
		_command.thrust = -_touch_vector.y
	_command.primary_fire = Input.is_action_pressed("primaryFire")
	_command.harpoon_fire = Input.is_action_pressed("harpoonFire")
	for index in _command.abilities.size():
		_command.abilities[index] = Input.is_action_pressed("ability%d" % (index + 1))
	player.apply_command(_command)

func set_touch_vector(value: Vector2) -> void:
	_touch_vector = value.limit_length(1.0)
