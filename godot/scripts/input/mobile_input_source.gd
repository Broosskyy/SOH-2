class_name MobileInputSource
extends InputSource

@export var joystick_path: NodePath

var _joystick: VirtualJoystick

func _ready() -> void:
	if joystick_path != NodePath():
		_joystick = get_node(joystick_path) as VirtualJoystick

func _physics_process(_delta: float) -> void:
	command.reset()
	if _joystick != null:
		var vec := _joystick.output_vector()
		command.throttle = clampf(-vec.y, -1.0, 1.0)
		command.steer = clampf(vec.x, -1.0, 1.0)
	_emit_command()
