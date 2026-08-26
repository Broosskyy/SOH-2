extends CharacterBody3D

@export var max_speed := 42.0
@export var acceleration := 30.0
@export var turn_speed := 1.45
@export var drag := 1.7

var forward_speed := 0.0
var touch_vector := Vector2.ZERO

func _physics_process(delta: float) -> void:
	# Navigation is strictly two-dimensional even though this is a 3D body.
	position.y = GameplayPlane.WATER_Y
	var steer := Input.get_axis("steerLeft", "steerRight")
	var thrust := Input.get_axis("moveBackward", "moveForward")
	if touch_vector.length() > 0.12:
		steer = touch_vector.x
		thrust = -touch_vector.y
	rotate_y(-steer * turn_speed * delta)
	forward_speed = move_toward(forward_speed, thrust * max_speed, acceleration * delta)
	if absf(thrust) < 0.05:
		forward_speed = move_toward(forward_speed, 0.0, drag * delta)
	velocity = -transform.basis.z * forward_speed
	velocity.y = 0.0
	move_and_slide()
	position.y = GameplayPlane.WATER_Y
	position.x = clampf(position.x, -1450.0, 1450.0)
	position.z = clampf(position.z, -1050.0, 1050.0)

func set_touch_vector(value: Vector2) -> void:
	touch_vector = value.limit_length(1.0)
