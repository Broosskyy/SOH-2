class_name DesktopInputSource
extends InputSource

func _physics_process(_delta: float) -> void:
	command.reset()
	if Input.is_action_pressed("moveForward"):
		command.throttle += 1.0
	if Input.is_action_pressed("moveBackward"):
		command.throttle -= 0.55
	if Input.is_action_pressed("steerLeft"):
		command.steer -= 1.0
	if Input.is_action_pressed("steerRight"):
		command.steer += 1.0
	command.throttle = clampf(command.throttle, -1.0, 1.0)
	command.steer = clampf(command.steer, -1.0, 1.0)
	_emit_command()
