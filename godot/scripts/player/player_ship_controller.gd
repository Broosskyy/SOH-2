class_name PlayerShipController
extends Node

@export var max_speed := 28.0
@export var acceleration := 18.0
@export var deceleration := 22.0
@export var turn_speed_deg := 95.0
@export var reverse_speed_scale := 0.55

var heading_degrees := 0.0
var speed := 0.0
var velocity := Vector3.ZERO

var _command := PlayerCommand.new()
var _body: Node3D

func bind_body(body: Node3D) -> void:
	_body = body

func apply_command(command: PlayerCommand) -> void:
	_command = command.duplicate_command()

func physics_tick(delta: float) -> void:
	if _body == null:
		return
	heading_degrees += _command.steer * turn_speed_deg * delta
	var target_speed := _command.throttle * max_speed
	if target_speed < 0.0:
		target_speed *= reverse_speed_scale
	var rate := acceleration if absf(target_speed) > absf(speed) else deceleration
	speed = move_toward(speed, target_speed, rate * delta)
	var forward := forward_vector()
	velocity = forward * speed
	var pos := _body.global_position
	pos.x += velocity.x * delta
	pos.z += velocity.z * delta
	pos.y = 0.0
	_body.global_position = pos
	_body.rotation_degrees = Vector3(0.0, heading_degrees, 0.0)

func forward_vector() -> Vector3:
	var rad := deg_to_rad(heading_degrees)
	return Vector3(sin(rad), 0.0, cos(rad))
